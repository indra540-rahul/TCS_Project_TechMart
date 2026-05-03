import Category from "../models/Category.js";
import Customer from "../models/Customer.js";
import InventoryLog from "../models/InventoryLog.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getCurrentYearRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return { start, end };
};

const buildFullMonthSeries = (rows = [], valueMapper) => {
  const rowMap = new Map(rows.map((row) => [Number(row._id), row]));

  return monthNames.map((month, index) => {
    const row = rowMap.get(index + 1);
    return {
      month,
      ...valueMapper(row)
    };
  });
};

const buildRealizedProfitPipeline = (matchStage = {}) => [
  { $match: matchStage },
  { $unwind: "$items" },
  {
    $lookup: {
      from: "products",
      localField: "items.product",
      foreignField: "_id",
      as: "productData"
    }
  },
  {
    $addFields: {
      itemCostPrice: { $ifNull: [{ $arrayElemAt: ["$productData.costPrice", 0] }, 0] }
    }
  }
];

const buildInventoryActivityFeed = ({ recentLogs = [], inventoryReport = [], recentOrders = [], auditTrail = [] }) => {
  const logEntries = recentLogs.map((log) => {
    if (log.action === "manual-update" && log.quantityChanged > 0) {
      return {
        id: `log-${log._id}`,
        variant: "restocked",
        title: `Restocked: ${log.product?.name || "Inventory item"}`,
        detail: `${Math.abs(log.quantityChanged)} units added to warehouse stock`,
        createdAt: log.createdAt
      };
    }

    if (log.action === "order-cancelled") {
      return {
        id: `log-${log._id}`,
        variant: "audit",
        title: `Audit Completed: ${log.product?.name || "Inventory item"}`,
        detail: `${Math.abs(log.quantityChanged)} units restored after order cancellation`,
        createdAt: log.createdAt
      };
    }

    return {
      id: `log-${log._id}`,
      variant: "transit",
      title: `In Transit: ${log.product?.name || "Inventory item"}`,
      detail: `${Math.abs(log.quantityChanged)} units allocated to outgoing orders`,
      createdAt: log.createdAt
    };
  });

  const lowStockEntries = inventoryReport
    .filter((item) => item.stock <= item.lowStockLimit)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 2)
    .map((item) => ({
      id: `low-${item._id}`,
      variant: "critical",
      title: `Critical Low: ${item.name}`,
      detail: `Only ${item.stock} units remaining in stock`,
      createdAt: new Date()
    }));

  const transitEntries = recentOrders
    .filter((order) => ["confirmed", "processing", "dispatch", "shipped"].includes(order.orderStatus))
    .slice(0, 2)
    .map((order) => ({
      id: `order-${order._id}`,
      variant: "transit",
      title: `In Transit: ${order.items?.[0]?.product?.name || "Order shipment"}`,
      detail: `Shipment for order #${order._id.toString().slice(-6)} is ${order.orderStatus}`,
      createdAt: order.createdAt
    }));

  const auditEntries = auditTrail
    .filter((log) => log.module === "inventory")
    .slice(0, 1)
    .map((log) => ({
      id: `audit-${log._id}`,
      variant: "audit",
      title: `Audit Completed: ${log.user?.name || "Warehouse team"}`,
      detail: log.details,
      createdAt: log.createdAt
    }));

  return [...logEntries, ...lowStockEntries, ...transitEntries, ...auditEntries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index)
    .slice(0, 4);
};

export const getDashboardSummary = async (req, res) => {
  try {
    const { start, end } = getCurrentYearRange();
    const paidOrderMatch = { paymentStatus: "paid", orderStatus: { $ne: "cancelled" } };
    const currentYearPaidMatch = { ...paidOrderMatch, createdAt: { $gte: start, $lt: end } };
    const [productCount, orderCount, customerCount, lowStockCount, pendingOrders, revenueAgg, totalProfitAgg, recentOrders, recentLogs, topProducts, inventoryReport] =
      await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Customer.countDocuments(),
        Product.countDocuments({ $expr: { $lte: ["$stock", "$lowStockLimit"] } }),
        Order.countDocuments({ orderStatus: { $in: ["pending", "confirmed", "processing"] } }),
        Order.aggregate([
          { $match: paidOrderMatch },
          { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]),
        Order.aggregate([
          ...buildRealizedProfitPipeline(paidOrderMatch),
          {
            $group: {
              _id: null,
              totalProfit: {
                $sum: {
                  $multiply: [
                    { $subtract: ["$items.price", "$itemCostPrice"] },
                    "$items.quantity"
                  ]
                }
              }
            }
          }
        ]),
        Order.find()
          .populate("customer", "name email")
          .populate("items.product", "name")
          .sort({ createdAt: -1 })
          .limit(5),
        InventoryLog.find().populate("product", "name").sort({ createdAt: -1 }).limit(8),
        Product.find().sort({ totalSold: -1 }).limit(5),
        Product.find().populate("category", "name")
      ]);

    const [monthlySalesRaw, monthlyProfitRaw] = await Promise.all([
      Order.aggregate([
        { $match: currentYearPaidMatch },
        { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
        { $sort: { "_id": 1 } }
      ]),
      Order.aggregate([
        ...buildRealizedProfitPipeline(currentYearPaidMatch),
        {
          $group: {
            _id: { $month: "$createdAt" },
            profit: {
              $sum: {
                $multiply: [
                  { $subtract: ["$items.price", "$itemCostPrice"] },
                  "$items.quantity"
                ]
              }
            }
          }
        },
        { $sort: { "_id": 1 } }
      ])
    ]);

    const statusData = await Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalProfit = Number((totalProfitAgg[0]?.totalProfit || 0).toFixed(2));
    const inventoryValue = inventoryReport.reduce((sum, item) => sum + item.price * item.stock, 0);
    const monthlySales = buildFullMonthSeries(monthlySalesRaw, (item) => ({
      revenue: Number(item?.revenue || 0),
      orders: Number(item?.orders || 0)
    }));
    const profitTrend = buildFullMonthSeries(monthlyProfitRaw, (item) => ({
      profit: Number((item?.profit || 0).toFixed(2))
    }));

    if (req.user.role === "manager") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaysOrders = await Order.countDocuments({ createdAt: { $gte: today } });
      const reorderNeeded = inventoryReport.filter((item) => item.stock <= item.lowStockLimit).length;
      const inventoryActivityFeed = buildInventoryActivityFeed({
        recentLogs,
        inventoryReport,
        recentOrders
      });

      return res.json({
        role: "manager",
        todaysOrders,
        pendingOrders,
        lowStockCount,
        reorderNeeded,
        recentOrders,
        recentInventoryActivities: recentLogs,
        inventoryActivityFeed,
        monthlySales,
        orderStatusData: statusData.map((item) => ({ status: item._id, count: item.count })),
        topProducts: topProducts.map((item) => ({ name: item.name, totalSold: item.totalSold }))
      });
    }

    const [managers, managerAudit, auditTrail, categoryPerformance] = await Promise.all([
      User.find({ role: "manager" }).select("name email"),
      AuditLog.aggregate([
        { $match: { role: "manager" } },
        { $group: { _id: "$user", activityCount: { $sum: 1 } } }
      ]),
      AuditLog.find().populate("user", "name").sort({ createdAt: -1 }).limit(8),
      Category.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products"
          }
        },
        {
          $project: {
            name: 1,
            totalSold: { $sum: "$products.totalSold" },
            stockValue: {
              $sum: {
                $map: {
                  input: "$products",
                  as: "product",
                  in: { $multiply: ["$$product.price", "$$product.stock"] }
                }
              }
            }
          }
        }
      ])
    ]);

    const managerActivityMap = managerAudit.reduce((acc, item) => {
      acc[String(item._id)] = item.activityCount;
      return acc;
    }, {});
    const inventoryActivityFeed = buildInventoryActivityFeed({
      recentLogs,
      inventoryReport,
      recentOrders,
      auditTrail
    });

    res.json({
      role: "admin",
      totalProducts: productCount,
      totalOrders: orderCount,
      totalCustomers: customerCount,
      totalRevenue,
      totalProfit,
      lowStockCount,
      pendingOrders,
      inventoryValue,
      recentOrders,
      recentInventoryActivities: recentLogs,
      inventoryActivityFeed,
      monthlySales,
      profitTrend,
      orderStatusData: statusData.map((item) => ({ status: item._id, count: item.count })),
      topProducts: topProducts.map((item) => ({ name: item.name, totalSold: item.totalSold })),
      categoryPerformance,
      managerPerformance: managers.map((manager) => ({
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        activityCount: managerActivityMap[String(manager._id)] || 0
      })),
      auditActivity: auditTrail
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard summary", error: error.message });
  }
};

export const getSalesReport = async (_req, res) => {
  try {
    const { start, end } = getCurrentYearRange();
    const monthly = await Order.aggregate([
      { $match: { paymentStatus: "paid", orderStatus: { $ne: "cancelled" }, createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(
      buildFullMonthSeries(monthly, (item) => ({
        revenue: Number(item?.revenue || 0),
        orders: Number(item?.orders || 0)
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sales report", error: error.message });
  }
};

export const getTopProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ totalSold: -1 }).limit(8).populate("category", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top products", error: error.message });
  }
};

export const getInventoryReport = async (_req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    const report = products.map((product) => ({
      _id: product._id,
      name: product.name,
      stock: product.stock,
      lowStockLimit: product.lowStockLimit,
      turnover: Number((product.totalSold / Math.max(product.stock + product.totalSold, 1)).toFixed(2)),
      category: product.category?.name || "Uncategorized"
    }));
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory report", error: error.message });
  }
};

export const getOrderStatusReport = async (_req, res) => {
  try {
    const data = await Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]);
    res.json(data.map((item) => ({ status: item._id, count: item.count })));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order status report", error: error.message });
  }
};

export const getCategoryPerformance = async (_req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products"
        }
      },
      {
        $project: {
          name: 1,
          productCount: { $size: "$products" },
          totalSold: { $sum: "$products.totalSold" },
          stockValue: {
            $sum: {
              $map: {
                input: "$products",
                as: "product",
                in: { $multiply: ["$$product.price", "$$product.stock"] }
              }
            }
          }
        }
      }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category performance", error: error.message });
  }
};

export const getProfitReport = async (_req, res) => {
  try {
    const { start, end } = getCurrentYearRange();
    const currentYearPaidMatch = {
      paymentStatus: "paid",
      orderStatus: { $ne: "cancelled" },
      createdAt: { $gte: start, $lt: end }
    };

    const [profitSummary, breakdown] = await Promise.all([
      Order.aggregate([
        ...buildRealizedProfitPipeline(currentYearPaidMatch),
        {
          $group: {
            _id: null,
            totalProfit: {
              $sum: {
                $multiply: [
                  { $subtract: ["$items.price", "$itemCostPrice"] },
                  "$items.quantity"
                ]
              }
            }
          }
        }
      ]),
      Order.aggregate([
        ...buildRealizedProfitPipeline(currentYearPaidMatch),
        {
          $group: {
            _id: "$items.product",
            name: { $first: { $ifNull: [{ $arrayElemAt: ["$productData.name", 0] }, "Unnamed product"] } },
            unitProfit: { $first: { $subtract: ["$items.price", "$itemCostPrice"] } },
            totalSold: { $sum: "$items.quantity" },
            totalProfit: {
              $sum: {
                $multiply: [
                  { $subtract: ["$items.price", "$itemCostPrice"] },
                  "$items.quantity"
                ]
              }
            }
          }
        },
        { $sort: { totalProfit: -1 } }
      ])
    ]);

    const totalProfit = Number((profitSummary[0]?.totalProfit || 0).toFixed(2));
    res.json({ totalProfit, breakdown });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profit report", error: error.message });
  }
};

export const exportReports = async (_req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "paid", orderStatus: { $ne: "cancelled" } })
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    const header = "OrderId,Customer,Amount,Status,Payment,CreatedAt";
    const rows = orders.map((order) =>
      [order._id, order.customer?.name || "Guest", order.totalAmount, order.orderStatus, order.paymentStatus, order.createdAt.toISOString()].join(",")
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=techmart-report.csv");
    res.send([header, ...rows].join("\n"));
  } catch (error) {
    res.status(500).json({ message: "Failed to export reports", error: error.message });
  }
};

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Customer from "../models/Customer.js";
import InventoryLog from "../models/InventoryLog.js";
import Notification from "../models/Notification.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

dotenv.config({ path: "./.env" });

const catalogBlueprint = [
  {
    category: "Laptops",
    itemType: "Laptop",
    description: "Business laptops, creator notebooks, and performance ultrabooks",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
    count: 10,
    brands: ["TechCore", "NovaBook", "Apex", "Zenith", "Orbit"],
    series: ["Pro", "Air", "Ultra", "Creator", "Max"],
    basePrice: 52999,
    priceStep: 5200,
    costFactor: 0.78,
    stockBase: 10,
    lowStockLimit: 4,
    attributes: (index) => ({
      RAM: `${8 + (index % 4) * 8}GB`,
      storage: `${256 + (index % 4) * 256}GB SSD`,
      warranty: index % 3 === 0 ? "2 years" : "1 year",
      connectivity: index % 2 === 0 ? "Wi-Fi 6E, Bluetooth 5.3" : "Wi-Fi 6, Bluetooth 5.2"
    })
  },
  {
    category: "Smartphones",
    itemType: "Smartphone",
    description: "5G smartphones with flagship cameras and fast displays",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
    count: 10,
    brands: ["Nova", "Pixelon", "Aster", "Quantum", "Pulse"],
    series: ["X", "Pro", "Ultra", "Lite", "Max"],
    basePrice: 18999,
    priceStep: 4300,
    costFactor: 0.8,
    stockBase: 16,
    lowStockLimit: 6,
    attributes: (index) => ({
      RAM: `${6 + (index % 4) * 2}GB`,
      storage: `${128 + (index % 3) * 128}GB`,
      warranty: "1 year",
      connectivity: index % 2 === 0 ? "5G, Wi-Fi 6, NFC" : "5G, Wi-Fi 5, NFC"
    })
  },
  {
    category: "Televisions",
    itemType: "Television",
    description: "Smart TVs, QLED displays, and entertainment screens",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80",
    count: 8,
    brands: ["Vision", "CineMax", "Lumina", "NovaView"],
    series: ["4K", "QLED", "OLED", "MiniLED"],
    basePrice: 28999,
    priceStep: 6900,
    costFactor: 0.79,
    stockBase: 8,
    lowStockLimit: 3,
    attributes: (index) => ({
      RAM: `${2 + (index % 2)}GB`,
      storage: `${16 + (index % 3) * 16}GB`,
      warranty: "2 years",
      connectivity: index % 2 === 0 ? "HDMI eARC, Wi-Fi, Bluetooth" : "HDMI ARC, Wi-Fi, Bluetooth"
    })
  },
  {
    category: "Audio",
    itemType: "Audio Device",
    description: "Headphones, earbuds, speakers, and personal audio gear",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    count: 8,
    brands: ["Sonic", "Wave", "Bassline", "EchoLab"],
    series: ["Studio", "Air", "Live", "Pulse"],
    basePrice: 2499,
    priceStep: 1600,
    costFactor: 0.74,
    stockBase: 18,
    lowStockLimit: 7,
    attributes: (index) => ({
      RAM: "NA",
      storage: "NA",
      warranty: index % 2 === 0 ? "1 year" : "6 months",
      connectivity: index % 2 === 0 ? "Bluetooth 5.3, USB-C" : "Bluetooth 5.2, AUX"
    })
  },
  {
    category: "Accessories",
    itemType: "Accessory",
    description: "Chargers, power banks, wearables, keyboards, and connectivity gear",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    count: 8,
    brands: ["Voltix", "Pulse", "LinkPro", "CoreGear"],
    series: ["Charge", "Active", "Sync", "Travel"],
    basePrice: 1499,
    priceStep: 900,
    costFactor: 0.7,
    stockBase: 24,
    lowStockLimit: 10,
    attributes: (index) => ({
      RAM: "NA",
      storage: "NA",
      warranty: index % 2 === 0 ? "1 year" : "6 months",
      connectivity: index % 3 === 0 ? "USB-C, USB-A" : "Bluetooth, USB-C"
    })
  },
  {
    category: "Gaming",
    itemType: "Gaming Gear",
    description: "Gaming monitors, controllers, keyboards, and streaming accessories",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
    count: 6,
    brands: ["Rift", "Arena", "Helix", "NovaPlay"],
    series: ["RGB", "Elite", "Strike", "GX"],
    basePrice: 3999,
    priceStep: 3100,
    costFactor: 0.76,
    stockBase: 12,
    lowStockLimit: 4,
    attributes: (index) => ({
      RAM: "NA",
      storage: "NA",
      warranty: "1 year",
      connectivity: index % 2 === 0 ? "USB-C, 2.4GHz, Bluetooth" : "USB-A, Wired"
    })
  },
  {
    category: "Cameras",
    itemType: "Camera",
    description: "Mirrorless cameras, action cams, and creator video gear",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    count: 5,
    brands: ["Luma", "FrameX", "Orbit", "CaptureOne"],
    series: ["Pro", "Mark", "Vision", "Creator"],
    basePrice: 35999,
    priceStep: 8200,
    costFactor: 0.81,
    stockBase: 7,
    lowStockLimit: 3,
    attributes: (index) => ({
      RAM: "NA",
      storage: `${32 + (index % 3) * 32}GB bundled`,
      warranty: "2 years",
      connectivity: index % 2 === 0 ? "Wi-Fi, Bluetooth, USB-C" : "Wi-Fi, HDMI, USB-C"
    })
  },
  {
    category: "Tablets",
    itemType: "Tablet",
    description: "Android tablets, productivity slates, and reading devices",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80",
    count: 5,
    brands: ["TabNova", "SlatePro", "OrbitPad", "VisionTab"],
    series: ["Air", "Pro", "Max", "Go"],
    basePrice: 16999,
    priceStep: 3700,
    costFactor: 0.79,
    stockBase: 11,
    lowStockLimit: 4,
    attributes: (index) => ({
      RAM: `${4 + (index % 3) * 4}GB`,
      storage: `${64 + (index % 3) * 64}GB`,
      warranty: "1 year",
      connectivity: index % 2 === 0 ? "Wi-Fi 6, Bluetooth 5.2" : "5G, Wi-Fi 6, Bluetooth 5.2"
    })
  }
];

const createProducts = (categoryMap) => {
  const products = [];

  for (const blueprint of catalogBlueprint) {
    for (let index = 0; index < blueprint.count; index += 1) {
      const brand = blueprint.brands[index % blueprint.brands.length];
      const series = blueprint.series[index % blueprint.series.length];
      const variantNumber = 10 + index;
      const price = blueprint.basePrice + index * blueprint.priceStep;
      const stock = blueprint.stockBase + ((index * 3) % 17);
      const totalSold = 12 + index * 9;

      products.push({
        name: `${brand} ${blueprint.itemType} ${series} ${variantNumber}`,
        description: `${blueprint.description}. Tuned for fast delivery, modern connectivity, and reliable everyday performance.`,
        category: categoryMap[blueprint.category],
        brand,
        sector: "electronics",
        price,
        costPrice: Math.round(price * blueprint.costFactor),
        stock,
        lowStockLimit: blueprint.lowStockLimit,
        totalSold,
        attributes: blueprint.attributes(index),
        image: blueprint.image,
        status: "active"
      });
    }
  }

  return products;
};

const buildOrderPayload = ({ customer, items, paymentMethod, paymentStatus, orderStatus, shippingAddress, shippingMethod = "standard", shippingCharge = 0, taxAmount = 0, codCharge = 0, paymentReference = "" }) => {
  const subtotalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    customer: customer._id,
    items,
    subtotalAmount,
    shippingCharge,
    taxAmount,
    codCharge,
    totalAmount: subtotalAmount + shippingCharge + taxAmount + codCharge,
    paymentMethod,
    paymentStatus,
    paymentReference,
    paymentProvider: paymentMethod === "razorpay" ? "razorpay" : "cash-on-delivery",
    orderStatus,
    shippingMethod,
    shippingAddress,
    customerSnapshot: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone
    }
  };
};

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Customer.deleteMany(),
      Order.deleteMany(),
      InventoryLog.deleteMany(),
      Notification.deleteMany(),
      Setting.deleteMany(),
      AuditLog.deleteMany()
    ]);

    const passwordAdmin = await bcrypt.hash("admin123", 10);
    const passwordManager = await bcrypt.hash("manager123", 10);
    const passwordCustomer = await bcrypt.hash("user123", 10);

    await User.insertMany([
      {
        name: "TechMart Admin",
        email: "admin@techmart.com",
        phone: "9876500001",
        password: passwordAdmin,
        role: "admin",
        avatar: "https://ui-avatars.com/api/?name=TechMart+Admin"
      },
      {
        name: "Operations Manager",
        email: "manager@techmart.com",
        phone: "9876500002",
        password: passwordManager,
        role: "manager",
        avatar: "https://ui-avatars.com/api/?name=Operations+Manager"
      }
    ]);

    const categories = await Category.insertMany(
      catalogBlueprint.map((item) => ({
        name: item.category,
        description: item.description
      }))
    );

    const categoryMap = Object.fromEntries(categories.map((item) => [item.name, item._id]));
    const products = await Product.insertMany(createProducts(categoryMap));

    const customers = await Customer.insertMany([
      {
        name: "Riya Sharma",
        email: "riya@example.com",
        phone: "9876543210",
        password: passwordCustomer,
        avatar: "https://ui-avatars.com/api/?name=Riya+Sharma&background=0f172a&color=ffffff",
        address: { line1: "221 Business Plaza", city: "Delhi", state: "Delhi", pincode: "110001", country: "India" }
      },
      {
        name: "Amit Verma",
        email: "amit@example.com",
        phone: "9123456780",
        password: passwordCustomer,
        avatar: "https://ui-avatars.com/api/?name=Amit+Verma&background=0f172a&color=ffffff",
        address: { line1: "44 Commerce Street", city: "Mumbai", state: "Maharashtra", pincode: "400001", country: "India" }
      },
      {
        name: "Sneha Kapoor",
        email: "sneha@example.com",
        phone: "9988776655",
        password: passwordCustomer,
        avatar: "https://ui-avatars.com/api/?name=Sneha+Kapoor&background=0f172a&color=ffffff",
        address: { line1: "90 Tech Park Road", city: "Bengaluru", state: "Karnataka", pincode: "560001", country: "India" }
      }
    ]);

    const [riya, amit, sneha] = customers;
    const laptops = products.filter((item) => item.category.toString() === categoryMap.Laptops.toString());
    const phones = products.filter((item) => item.category.toString() === categoryMap.Smartphones.toString());
    const televisions = products.filter((item) => item.category.toString() === categoryMap.Televisions.toString());
    const audio = products.filter((item) => item.category.toString() === categoryMap.Audio.toString());
    const accessories = products.filter((item) => item.category.toString() === categoryMap.Accessories.toString());
    const gaming = products.filter((item) => item.category.toString() === categoryMap.Gaming.toString());

    await Order.insertMany([
      buildOrderPayload({
        customer: riya,
        items: [
          { product: laptops[0]._id, quantity: 1, price: laptops[0].price, subtotal: laptops[0].price },
          { product: audio[1]._id, quantity: 1, price: audio[1].price, subtotal: audio[1].price }
        ],
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        orderStatus: "shipped",
        shippingCharge: 0,
        taxAmount: 5400,
        paymentReference: "pay_demo_1001",
        shippingAddress: riya.address
      }),
      buildOrderPayload({
        customer: amit,
        items: [
          { product: phones[2]._id, quantity: 1, price: phones[2].price, subtotal: phones[2].price },
          { product: accessories[0]._id, quantity: 1, price: accessories[0].price, subtotal: accessories[0].price }
        ],
        paymentMethod: "cod",
        paymentStatus: "pending",
        orderStatus: "processing",
        shippingCharge: 199,
        taxAmount: 4200,
        codCharge: 49,
        shippingAddress: amit.address
      }),
      buildOrderPayload({
        customer: sneha,
        items: [
          { product: televisions[1]._id, quantity: 1, price: televisions[1].price, subtotal: televisions[1].price },
          { product: gaming[2]._id, quantity: 1, price: gaming[2].price, subtotal: gaming[2].price }
        ],
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        orderStatus: "delivered",
        shippingMethod: "priority",
        shippingCharge: 1499,
        taxAmount: 7100,
        paymentReference: "pay_demo_1002",
        shippingAddress: sneha.address
      }),
      buildOrderPayload({
        customer: riya,
        items: [
          { product: phones[5]._id, quantity: 1, price: phones[5].price, subtotal: phones[5].price },
          { product: accessories[4]._id, quantity: 2, price: accessories[4].price, subtotal: accessories[4].price * 2 }
        ],
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        orderStatus: "confirmed",
        shippingCharge: 0,
        taxAmount: 3900,
        paymentReference: "pay_demo_1003",
        shippingAddress: riya.address
      })
    ]);

    await Notification.insertMany([
      {
        title: "Welcome to TechMart Pro",
        message: "Electronics seed data loaded successfully. Start managing your operations.",
        type: "system"
      },
      {
        title: "Low Stock Alert",
        message: `${audio[0].name} is approaching the low-stock threshold.`,
        type: "low-stock"
      },
      {
        title: "Catalog Ready",
        message: "The backend now contains 60 electronics products across TVs, laptops, mobiles, audio, gaming, and accessories.",
        type: "system"
      }
    ]);

    await Setting.create({
      storeName: "TechMart Pro",
      supportEmail: "support@techmart.com",
      supportPhone: "+91 99880 77665",
      gstNumber: "GSTIN-TECHMART-001",
      warehouseAddress: "Plot 18, Electronic City Hub, Bengaluru",
      currency: "INR",
      taxRate: 18,
      shippingFee: 199,
      highDiscountApprovalLimit: 20
    });

    console.log(`Seed data inserted successfully with ${products.length} electronics products`);
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();

import { AlertTriangle, CheckCheck, PackagePlus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import api from "../services/api";

const COLORS = ["#4f46e5", "#7c3aed", "#06b6d4", "#f97316", "#ef4444"];

const formatInventoryActivity = (activity) => {
  const variantMap = {
    restocked: {
      icon: PackagePlus,
      iconClass: "bg-emerald-50 text-emerald-500"
    },
    critical: {
      icon: AlertTriangle,
      iconClass: "bg-rose-50 text-rose-500"
    },
    transit: {
      icon: Truck,
      iconClass: "bg-blue-50 text-blue-500"
    },
    audit: {
      icon: CheckCheck,
      iconClass: "bg-violet-50 text-violet-500"
    }
  };

  return {
    title: activity.title,
    detail: activity.detail,
    ...(variantMap[activity.variant] || variantMap.transit)
  };
};

const formatTimeAgo = (timestamp) => {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours} HOUR${diffHours > 1 ? "S" : ""} AGO`;
  }

  if (diffHours < 48) {
    return "YESTERDAY";
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} DAYS AGO`;
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.get("/reports/dashboard-summary");
      setSummary(data);
    };

    fetchData();
  }, []);

  return (
    <>
      {summary?.role === "admin" ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Total Revenue" value={`Rs. ${(summary?.totalRevenue || 0).toLocaleString()}`} subtitle="Gross paid revenue" />
            <StatCard title="Total Profit" value={`Rs. ${(summary?.totalProfit || 0).toLocaleString()}`} subtitle="Realized paid-order profit" accent="from-emerald-500 to-teal-500" />
            <StatCard title="Total Orders" value={summary?.totalOrders || 0} subtitle="All order records" accent="from-cyan-500 to-blue-500" />
            <StatCard title="Total Products" value={summary?.totalProducts || 0} subtitle="Published electronics catalog" accent="from-violet-500 to-fuchsia-500" />
            <StatCard title="Total Customers" value={summary?.totalCustomers || 0} subtitle="Reach across buyers" accent="from-amber-500 to-orange-500" />
            <StatCard title="Inventory Value" value={`Rs. ${(summary?.inventoryValue || 0).toLocaleString()}`} subtitle="Current inventory stock value" accent="from-rose-500 to-pink-500" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Revenue Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary?.monthlySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-5">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Profit Trend</h3>
                  <p className="mt-1 text-sm text-slate-500">Monthly profit performance across the year</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Year {currentYear}</span>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={summary?.profitTrend || []} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis hide />
                    <Tooltip formatter={(value) => [`Rs. ${Math.round(value || 0).toLocaleString()}`, "Profit"]} />
                    <ReferenceLine y={summary?.profitTrend?.[0]?.profit || 0} stroke="#1d4ed8" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#1d4ed8"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#1d4ed8", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#1d4ed8" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Category Performance</h3>
              <div className="space-y-3">
                {summary?.categoryPerformance?.map((item) => (
                  <div key={item._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.totalSold} total units sold</p>
                      </div>
                      <p className="font-bold text-indigo-600">Rs. {Math.round(item.stockValue).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Manager Performance</h3>
              <div className="space-y-3">
                {summary?.managerPerformance?.map((manager) => (
                  <div key={manager._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="font-semibold text-slate-900">{manager.name}</p>
                    <p className="text-sm text-slate-500">{manager.email}</p>
                    <p className="mt-2 text-sm font-semibold text-emerald-600">{manager.activityCount} tracked activities</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Top Selling Products</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary?.topProducts || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalSold" fill="#7c3aed" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="text-lg font-bold text-slate-900">Inventory Activity</h3>
              <p className="mt-1 text-sm text-slate-500">Live stock movement from recent backend inventory logs</p>
              <div className="mt-5 space-y-4">
                {(summary?.inventoryActivityFeed || []).map((activityItem) => {
                  const activity = formatInventoryActivity(activityItem);
                  const Icon = activity.icon;

                  return (
                    <div key={activityItem.id} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4">
                      <span className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-full ${activity.iconClass}`}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold leading-6 text-slate-900">{activity.title}</p>
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {activity.detail}
                        </p>
                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {formatTimeAgo(activityItem.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 text-center">
                <Link to="/inventory" className="text-sm font-semibold text-blue-700 transition hover:text-blue-800">
                  View All Logs
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 glass-card overflow-hidden rounded-[1.75rem] p-0">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">Recent Orders</h3>
                <p className="mt-1 text-sm text-slate-500">Manage your latest customer transactions</p>
              </div>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_45%,#3b82f6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(37,99,235,0.28)]"
              >
                View All Orders
              </Link>
            </div>

            <div className="table-wrap px-6 py-4">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <tr className="border-b border-slate-100">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Products</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(summary?.recentOrders || []).map((order) => (
                    <tr key={order._id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-5 font-bold text-blue-700">#ORD-{order._id.slice(-4).toUpperCase()}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600">
                            {(order.customer?.name || "G").slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{order.customer?.name || "Guest Customer"}</p>
                            <p className="text-sm text-slate-400">{order.customer?.email || "No email available"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-slate-700">
                        {order.items?.map((item) => item.product?.name || "Item").filter(Boolean).slice(0, 2).join(", ") || "No items"}
                      </td>
                      <td className="py-5 font-semibold text-slate-900">Rs. {Number(order.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${order.orderStatus === "delivered"
                              ? "bg-emerald-50 text-emerald-600"
                              : order.orderStatus === "processing"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <Link to="/orders" className="text-lg font-bold tracking-[0.2em] text-slate-400 transition hover:text-slate-700">
                          ...
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Today's Orders" value={summary?.todaysOrders || 0} subtitle="Orders placed today" />
            <StatCard title="Pending Orders" value={summary?.pendingOrders || 0} subtitle="Need operational action" accent="from-cyan-500 to-blue-500" />
            <StatCard title="Low Stock Products" value={summary?.lowStockCount || 0} subtitle="Urgent stock review" accent="from-amber-500 to-orange-500" />
            <StatCard title="Need Reorder" value={summary?.reorderNeeded || 0} subtitle="Suggested replenishment" accent="from-rose-500 to-pink-500" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Basic Sales Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summary?.monthlySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-5 text-lg font-bold text-slate-900">Order Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={summary?.orderStatusData || []} dataKey="count" nameKey="status" outerRadius={110} label>
                      {(summary?.orderStatusData || []).map((entry, index) => (
                        <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Recent Orders</h3>
              <div className="space-y-3">
                {summary?.recentOrders?.map((order) => (
                  <div key={order._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">#{order._id.slice(-6)} - {order.customer?.name}</p>
                        <p className="text-sm capitalize text-slate-500">{order.orderStatus}</p>
                      </div>
                      <p className="font-bold text-indigo-600">Rs. {order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-5">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Inventory Updates</h3>
              <div className="space-y-3">
                {summary?.recentInventoryActivities?.map((log) => (
                  <div key={log._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="font-semibold text-slate-900">{log.product?.name}</p>
                    <p className="text-sm capitalize text-slate-500">
                      {log.action} | {log.previousStock} to {log.newStock}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;

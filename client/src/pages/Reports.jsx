import { CircleDollarSign, Download, FileText, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const CATEGORY_COLORS = ["#1d4ed8", "#6366f1", "#8b5cf6", "#f97316", "#cbd5e1"];

const Reports = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [profit, setProfit] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchReports = async () => {
      const baseCalls = [
        api.get("/reports/sales"),
        api.get("/reports/top-products"),
        api.get("/reports/inventory"),
        api.get("/reports/category-performance")
      ];

      const results = await Promise.all(user?.role === "admin" ? [...baseCalls, api.get("/reports/profit")] : baseCalls);
      setSales(results[0].data);
      setTopProducts(results[1].data);
      setInventory(results[2].data);
      setCategoryPerformance(results[3].data);
      if (user?.role === "admin") {
        setProfit(results[4].data);
      }
    };

    if (user?.role) {
      fetchReports();
    }
  }, [user?.role]);

  const totalSales = useMemo(
    () => sales.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0),
    [sales]
  );

  const roi = useMemo(() => {
    const totalProfit = Number(profit?.totalProfit) || 0;
    const totalCost = totalSales - totalProfit;

    if (totalCost <= 0) {
      return 0;
    }

    return (totalProfit / totalCost) * 100;
  }, [profit?.totalProfit, totalSales]);

  const categoryMix = useMemo(
    () =>
      categoryPerformance
        .map((item) => ({
          name: item.name,
          value: Number(item.totalSold) || Number(item.stockValue) || 0
        }))
        .filter((item) => item.value > 0),
    [categoryPerformance]
  );

  const handleCsvExport = async () => {
    try {
      const response = await api.get("/reports/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "techmart-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV export downloaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "CSV export failed");
    }
  };

  const handlePdfExport = () => {
    const reportMarkup = reportRef.current?.innerHTML;

    if (!reportMarkup) {
      toast.error("Report content is not ready yet");
      return;
    }

    const pdfWindow = window.open("", "_blank", "width=1200,height=900");

    if (!pdfWindow) {
      toast.error("Enable pop-ups to export PDF");
      return;
    }

    pdfWindow.document.write(`
      <html>
        <head>
          <title>TechMart Report</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 24px; }
            h2, h3, p { margin: 0; }
            .glass-card, .rounded-2xl { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; }
            .grid { display: grid; gap: 24px; }
            .space-y-3 > * + * { margin-top: 12px; }
            .p-4 { padding: 16px; }
            .p-5 { padding: 20px; }
            .mb-4, .mb-5 { margin-bottom: 16px; }
            svg { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h2 style="margin-bottom: 20px;">TechMart Reports</h2>
          ${reportMarkup}
        </body>
      </html>
    `);
    pdfWindow.document.close();
    pdfWindow.focus();
    pdfWindow.print();
    toast.success("PDF export opened in print view");
  };

  const adminMetrics = [
    {
      label: "Total Sales",
      value: `Rs. ${Math.round(totalSales).toLocaleString()}`,
      change: "+12.5%",
      icon: CircleDollarSign,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      chipClass: "bg-emerald-50 text-emerald-600"
    },
    {
      label: "Net Profit",
      value: `Rs. ${Math.round(profit?.totalProfit || 0).toLocaleString()}`,
      change: "+8.2%",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      chipClass: "bg-emerald-50 text-emerald-600"
    },
    {
      label: "Return on Investment",
      value: `${roi.toFixed(1)}%`,
      change: "Static",
      icon: FileText,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
      chipClass: "bg-slate-100 text-slate-500"
    }
  ];

  return (
    <>
      {user?.role === "admin" && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={handleCsvExport}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={handlePdfExport}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      )}

      <div ref={reportRef} className="space-y-6">
        {user?.role === "admin" && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {adminMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div key={metric.label} className="glass-card rounded-[1.75rem] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.iconBg}`}>
                      <Icon size={18} className={metric.iconColor} />
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${metric.chipClass}`}>{metric.change}</span>
                  </div>
                  <p className="mt-5 text-sm font-medium text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{metric.value}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">{user?.role === "admin" ? "Sales Revenue Trends" : "Basic Sales Trend"}</h3>
              {user?.role === "admin" && <p className="text-sm text-slate-400">Current year view</p>}
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {user?.role === "admin" ? (
                  <AreaChart data={sales}>
                    <defs>
                      <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`Rs. ${Math.round(value || 0).toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={3} fill="url(#salesFill)" />
                  </AreaChart>
                ) : (
                  <LineChart data={sales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <h3 className="mb-5 text-lg font-bold text-slate-900">{user?.role === "admin" ? "Category Mix" : "Top Products"}</h3>
            <div className="h-80">
              {user?.role === "admin" ? (
                <div className="grid h-full gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryMix}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                      >
                        {categoryMix.map((entry, index) => (
                          <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${Math.round(value || 0).toLocaleString()} units`, "Share"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {categoryMix.map((item, index) => (
                      <div key={item.name} className="rounded-2xl border border-slate-100 bg-white p-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-sm text-slate-500">{Math.round(item.value).toLocaleString()} units</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalSold" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="glass-card rounded-[1.75rem] p-5">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Inventory Turnover</h3>
            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Turnover</p>
                      <p className="text-lg font-bold text-cyan-600">{item.turnover}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <h3 className="mb-4 text-lg font-bold text-slate-900">{user?.role === "admin" ? "Category Performance" : "Stock Status Overview"}</h3>
            <div className="space-y-3">
              {categoryPerformance.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      {"productCount" in item && <p className="text-sm text-slate-500">{item.productCount} products</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">{item.totalSold} sold</p>
                      <p className="text-sm text-slate-500">Stock value Rs. {Math.round(item.stockValue).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;

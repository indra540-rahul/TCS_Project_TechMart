import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const routeLabels = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/products/new": "Add Product",
  "/orders": "Orders",
  "/customers": "Customers",
  "/inventory": "Inventory",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/categories": "Categories",
  "/user-management": "User Management",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings"
};

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("/notifications");
        if (mounted) {
          setNotifications(data);
        }
      } catch (_error) {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const pageTitle = routeLabels[location.pathname] || (location.pathname.startsWith("/products/") ? "Edit Product" : "Workspace");

  const handleQuickSearch = (event) => {
    event.preventDefault();
    const value = quickSearch.trim();

    if (!value) {
      navigate("/products");
      toast("Enter a product name or brand to search.");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <header className="glass-card sticky top-4 z-30 relative mb-6 overflow-hidden rounded-[1.9rem] border border-white/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.9),transparent)]" />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="mt-1 rounded-2xl border border-slate-200 bg-white/80 p-2 text-slate-600 shadow-sm lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">{pageTitle}</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Welcome, {user?.name?.split(" ")[0]}</h2>
            <p className="text-sm text-slate-500">Track performance, keep operations moving, and resolve issues before they spread.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center">
          <form onSubmit={handleQuickSearch} className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/85 px-3 py-2 shadow-sm">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              value={quickSearch}
              onChange={(event) => setQuickSearch(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700"
              placeholder="Quick product search..."
              aria-label="Quick product search"
            />
            <button type="submit" className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Search
            </button>
          </form>

          <Link to="/notifications" className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 shadow-[0_16px_30px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 hover:shadow-[0_20px_34px_rgba(244,63,94,0.18)]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

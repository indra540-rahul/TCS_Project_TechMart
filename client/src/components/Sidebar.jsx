import {
  BarChart3,
  Bell,
  ClipboardList,
  LayoutDashboard,
  PanelLeftClose,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserCog,
  Users,
  Warehouse
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const links =
    user?.role === "admin"
      ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/products", label: "Products", icon: Package },
        { to: "/categories", label: "Categories", icon: Package },
        { to: "/orders", label: "Orders", icon: ShoppingCart },
        { to: "/customers", label: "Customers", icon: Users },
        { to: "/inventory", label: "Inventory", icon: Warehouse },
        { to: "/reports", label: "Reports", icon: BarChart3 },
        { to: "/notifications", label: "Notifications", icon: Bell },
        { to: "/user-management", label: "User Management", icon: UserCog },
        { to: "/audit-logs", label: "Audit Logs", icon: ClipboardList },
        { to: "/settings", label: "Settings", icon: Settings }
      ]
      : [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/products", label: "Products", icon: Package },
        { to: "/orders", label: "Orders", icon: ShoppingCart },
        { to: "/customers", label: "Customers", icon: Users },
        { to: "/inventory", label: "Inventory", icon: Warehouse },
        { to: "/reports", label: "Basic Reports", icon: BarChart3 },
        { to: "/notifications", label: "Notifications", icon: Bell }
      ];

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm transition lg:hidden ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={onClose}
      />

      <aside
        className={`glass-card fixed inset-y-0 left-0 z-50 flex w-[min(88vw,20rem)] flex-col border-r border-white/60 px-5 py-5 transition duration-300 lg:left-4 lg:top-4 lg:bottom-4 lg:h-auto lg:w-[20rem] lg:translate-x-0 lg:rounded-[2rem] lg:px-6 lg:py-8 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <img
              src="/logo-techmart-pro.png"
              alt="TechMart Pro"
              className="h-12 w-auto rounded-2xl"
            />
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Dashboard</h1>
            {/* <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">
              Inventory, orders, customer flow, and admin control in one responsive workspace.
            </p> */}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white/80 p-2 text-slate-500 lg:hidden"
            aria-label="Close menu"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        <nav className="custom-scroll flex-1 space-y-2 overflow-y-auto pr-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive
                    ? "bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_40%,#22d3ee_100%)] !text-white shadow-[0_20px_35px_rgba(8,47,73,0.24)]"
                    : "text-slate-600 hover:bg-white/90 hover:text-cyan-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-2xl shadow-sm transition ${isActive
                        ? "bg-white text-black"   // 👈 icon stays black
                        : "bg-white/70 text-black group-hover:bg-cyan-50"
                        }`}
                    >
                      <Icon size={18} />
                    </span>

                    <span className={`${isActive ? "text-white" : ""}`}>
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-5 w-full rounded-[2.2rem] bg-[radial-gradient(circle_at_top_left,#0f1b53_0%,#05081d_45%,#040616_100%)] px-7 py-5 text-white shadow-[0_20px_40px_rgba(6,10,34,0.32)] ring-1 ring-white/8">

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cyan-300">
            <ShieldCheck size={13} />
            {user?.role === "admin" ? "Full Access" : "Operational Access"}
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-300">Signed in as</p>

            <p className="mt-1 text-xl font-black tracking-tight text-white leading-tight">
              {user?.name}
            </p>

            <p className="mt-1 text-xs font-semibold capitalize tracking-[0.08em] text-slate-400">
              {user?.role}
            </p>
          </div>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;

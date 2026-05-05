import {
  ChevronDown,
  Grid2x2,
  LifeBuoy,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCircle2,
  ClipboardList,
  X,
  Home,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useCart } from "../hooks/useCart";

const PublicNavbar = ({ cartCount: cartCountProp }) => {
  const { cartCount: liveCartCount } = useCart();
  const { customer, logoutCustomer } = useCustomerAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = cartCountProp ?? liveCartCount;

  return (
    <header className="sticky top-0 z-50 -mx-4 border-b border-white/10 bg-[linear-gradient(135deg,#006ECD_0%,#00FFA6_40%,#5FFBF1_100%)] text-white backdrop-blur-xl sm:-mx-6 lg:-mx-8">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="ml-2 flex items-center gap-3 sm:ml-3">
          <img
            src="/logo-techmart-pro.png"
            alt="TechMart Pro"
            className="h-10 w-auto rounded-2xl sm:h-11"
          />
        </Link>

        <nav className="hidden items-center rounded-full border border-slate-200 bg-slate-50/80 p-1 text-sm font-bold text-slate-600 lg:flex">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/browse/categories" icon={Grid2x2} label="Categories" />
          <NavItem to="/contact" icon={Phone} label="Contact" />
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative flex h-12 items-center gap-2 rounded-xl bg-[linear-gradient(115deg,#18CAFF,#00A7FF)] px-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Cart</span>

            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.0 text-[11px] font-black leading-none text-white ring-1 ring-white shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {customer ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-3 pr-4 text-white backdrop-blur-md shadow-md transition hover:bg-white/20 hover:-translate-y-0.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#060496,#00D3FF)] text-sm font-black text-white">
                  {customer.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="hidden md:block text-left">
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Account
                  </span>
                  <span className="block max-w-[130px] truncate text-sm font-black text-slate-600">
                    {customer.name}
                  </span>
                </span>

                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition ${
                    profileOpen ? "rotate-180 text-blue-700" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-200 text-white shadow-[0_28px_70px_rgba(0,0,0,0.6)]">
                  <div className="bg-[linear-gradient(135deg,#006ECD_0%,#00FFA6_40%,#5FFBF1_100%)] p-5 text-white">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white-200">
                      Signed In
                    </p>
                    <p className="mt-2 text-xl font-black">{customer.name}</p>
                    <p className="mt-1 truncate text-sm text-gray-600">
                      {customer.email}
                    </p>
                  </div>

                  <div className="p-2 text-blue-400">
                    <AccountNavItem
                      to="/account?tab=orders"
                      icon={ClipboardList}
                      label="Order History"
                      onClick={() => setProfileOpen(false)}
                    />
                    <AccountNavItem
                      to="/account?tab=tracking"
                      icon={Truck}
                      label="Track Order"
                      onClick={() => setProfileOpen(false)}
                    />
                    <AccountNavItem
                      to="/help-center"
                      icon={LifeBuoy}
                      label="Help Center"
                      onClick={() => setProfileOpen(false)}
                    />
                  
                    <AccountNavItem
                      to="/account?tab=profile"
                      icon={ShieldCheck}
                      label="Profile Settings"
                      onClick={() => setProfileOpen(false)}
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logoutCustomer();
                      }}
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-12 items-center rounded-2xl border border-blue-300 bg-blue-400 px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-600 hover:text-blue-700 md:flex"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="grid gap-2">
            <MobileNavItem
              to="/"
              icon={Home}
              label="Home"
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/browse/categories"
              icon={Grid2x2}
              label="Categories"
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavItem
              to="/contact"
              icon={Phone}
              label="Contact"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

const NavItem = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition hover:bg-white hover:text-blue-700 hover:shadow-sm"
  >
    <Icon size={15} />
    {label}
  </Link>
);

const MobileNavItem = ({ to, icon: Icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"
  >
    <Icon size={17} className="text-blue-700" />
    {label}
  </Link>
);

const AccountNavItem = ({ to, icon: Icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
  >
    <Icon size={16} className="text-blue-700" />
    {label}
  </Link>
);

export default PublicNavbar;

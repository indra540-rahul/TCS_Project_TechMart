import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Camera,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  Leaf,
  Radar,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
  Watch
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import PublicProductCard from "../components/PublicProductCard";
import { useCart } from "../hooks/useCart";
import api from "../services/api";

const categoryIcons = {
  laptops: Laptop,
  smartphones: Smartphone,
  accessories: Watch,
  audio: Headphones,
  gaming: Gamepad2,
  photography: Camera
};

const defaultCategoryTiles = [
  { key: "Laptops", label: "Computers", icon: Laptop },
  { key: "Smartphones", label: "Phones", icon: Smartphone },
  { key: "Accessories", label: "Wearables", icon: Watch },
  { key: "Audio", label: "Audio", icon: Headphones }
];

const Shop = () => {
  const navigate = useNavigate();
  const { cartCount, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories")
        ]);

        setProducts(productRes.data.filter((item) => item.status === "active"));
        setCategories(categoryRes.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load store data");
      }
    };

    fetchStoreData();
  }, []);

  const categoryTiles = useMemo(() => {
    const dynamicTiles = categories.map((category) => ({
      key: category.name,
      label: category.name,
      icon: categoryIcons[category.name.toLowerCase()] || Headphones
    }));

    return dynamicTiles.length ? dynamicTiles : defaultCategoryTiles;
  }, [categories]);

  const featuredCategoryProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products.slice(0, 6);
    }

    return products
      .filter((item) => item.category?.name === activeCategory)
      .slice(0, 6);
  }, [activeCategory, products]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
    navigate("/cart");
  };

  return (
    <div className="page-shell min-h-screen">
      <PublicNavbar cartCount={cartCount} />

      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(24,202,255,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(29,78,216,0.16),transparent_24%),linear-gradient(180deg,#f4faff_0%,#eef6ff_100%)] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="inline-flex rounded-full border border-cyan-200 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">
              Live Commerce Grid
            </p>

            <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl">
              A storefront that feels like an active electronics command center.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Browse real backend products, watch category demand move in real time,
              and turn every cart into a trackable order without leaving the customer flow.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/browse/categories"
                className="rounded-2xl bg-[linear-gradient(115deg,#18CAFF,#00A7FF)] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Browse Catalog
              </Link>

              <Link
                to="/contact"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
              >
                Contact Team
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              <SignalCard icon={Cpu} label="Catalog Sync" value={`${products.length || 60}+`} />
              <SignalCard icon={Radar} label="Live Categories" value={`${categories.length || 8}`} />
              <SignalCard icon={Zap} label="Fast Checkout" value="Razorpay + COD" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-[8%] top-[8%] h-40 rounded-full bg-cyan-300/30 blur-3xl" />
            <div className="relative rounded-[2.2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(7,19,45,0.96),rgba(14,58,138,0.92)_52%,rgba(8,145,178,0.88))] p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-100">
                        Demand Pulse
                      </p>
                      <h2 className="mt-2 text-2xl font-black">Customer Energy Map</h2>
                    </div>
                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-200">
                      Live
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      { label: "Laptops", percent: "94%", width: "w-[94%]", tone: "from-cyan-300 to-sky-400" },
                      { label: "Smartphones", percent: "88%", width: "w-[88%]", tone: "from-blue-300 to-indigo-400" },
                      { label: "Audio", percent: "76%", width: "w-[76%]", tone: "from-emerald-300 to-cyan-400" }
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-100">
                          <span>{item.label}</span>
                          <span>{item.percent}</span>
                        </div>
                        <div className="h-3 rounded-full bg-white/10">
                          <div className={`h-3 rounded-full bg-gradient-to-r ${item.tone} ${item.width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/20 text-cyan-100">
                        <Activity size={20} />
                      </span>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                          Conversion Route
                        </p>
                        <p className="mt-1 text-lg font-black text-white">Browse {"->"} Cart {"->"} Pay {"->"} Track</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                      Category Radar
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {categoryTiles.slice(0, 4).map((tile) => {
                        const Icon = tile.icon;

                        return (
                          <div key={tile.key} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                            <Icon size={18} className="text-cyan-100" />
                            <p className="mt-3 text-sm font-black text-white">{tile.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Shop by Category</h2>
              <p className="mt-2 text-sm text-slate-500">
                Switch categories and preview live items from the backend.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${activeCategory === "All" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
              >
                All
              </button>

              {categoryTiles.map((tile) => {
                const Icon = tile.icon;
                const active = activeCategory === tile.key;

                return (
                  <button
                    key={tile.key}
                    type="button"
                    onClick={() => setActiveCategory(tile.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}
                  >
                    <Icon size={15} />
                    {tile.label}
                  </button>
                );
              })}
            </div>
          </div>

          {featuredCategoryProducts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featuredCategoryProducts.map((product) => (
                <PublicProductCard
                  key={product._id}
                  product={product}
                  badge={product.stock <= product.lowStockLimit ? "Low Stock" : ""}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
              No products are available in this category yet.
            </div>
          )}

          <Link
            to="/browse/categories"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(115deg,#18CAFF,#00A7FF)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Explore Full Catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="bg-[#eef4ff] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={BadgeCheck} title="Live Inventory" description="Products shown on the storefront now reflect the backend catalog and active stock." />
            <InfoCard
              icon={Truck}
              title="Connected Orders"
              description="Checkout, admin order management, and tracking all use the same order records."
              blue
            />
            <InfoCard
              icon={Headphones}
              title="Customer Workspace"
              description="Signed-in shoppers can monitor order updates from their account after checkout."
              dark
            />
            <InfoCard icon={ShieldCheck} title="Secure Payment Flow" description="Razorpay or COD selection is handled before order confirmation." />
          </div>

          <div className="flex items-center">
            <div>
              <h2 className="text-sm font-black text-slate-950">
                Engineered Trust for the Modern Enterprise.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
                TechMart Pro now connects storefront browsing, cart, checkout,
                admin order workflows, and customer tracking into one continuous system.
              </p>

              <div className="mt-8 space-y-6">
                <TrustPoint
                  icon={BadgeCheck}
                  title="Backend-Driven Storefront"
                  text="Products, categories, and stock-aware order creation now stay aligned across the app."
                />
                <TrustPoint
                  icon={Leaf}
                  title="Faster Customer Follow-Up"
                  text="Customers can see the same updated order status that admins manage in the dashboard."
                />
              </div>

              <Link
                to="/contact"
                className="mt-8 inline-flex rounded-lg bg-[#829fff] px-7 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

const InfoCard = ({ icon: Icon, title, description, blue, dark }) => (
  <div
    className={`rounded-xl p-7 shadow-sm ${
      dark
        ? "bg-[#082fb0] text-white shadow-xl"
        : blue
          ? "bg-blue-100 text-slate-950"
          : "bg-white text-slate-950"
    }`}
  >
    <Icon size={24} className={dark ? "text-white" : "text-[#082fb0]"} />
    <h3 className="mt-7 text-sm font-black">{title}</h3>
    {description && (
      <p className={`mt-3 text-xs leading-5 ${dark ? "text-blue-100" : "text-slate-600"}`}>
        {description}
      </p>
    )}
  </div>
);

const TrustPoint = ({ icon: Icon, title, text }) => (
  <div className="flex gap-4">
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
      <Icon size={18} />
    </span>
    <div>
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
    </div>
  </div>
);

const SignalCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-[1.35rem] border border-white/70 bg-white/85 px-4 py-4 shadow-sm backdrop-blur-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
      <Icon size={18} />
    </div>
    <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
  </div>
);

export default Shop;

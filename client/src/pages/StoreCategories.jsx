import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Gamepad2,
  Headphones,
  Laptop,
  Smartphone,
  Watch
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import PublicProductCard from "../components/PublicProductCard";
import { useCart } from "../hooks/useCart";
import api from "../services/api";

const ITEMS_PER_PAGE = 9;

const iconMap = {
  laptop: Laptop,
  computer: Laptop,
  phone: Smartphone,
  mobile: Smartphone,
  wearable: Watch,
  watch: Watch,
  audio: Headphones,
  headphone: Headphones,
  gaming: Gamepad2,
  game: Gamepad2,
  camera: Camera,
  photo: Camera
};

const findCategoryIcon = (name = "") => {
  const lowerName = name.toLowerCase();
  const matchKey = Object.keys(iconMap).find((key) => lowerName.includes(key));
  return matchKey ? iconMap[matchKey] : Headphones;
};

const StoreCategories = () => {
  const navigate = useNavigate();
  const { cartCount, addToCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("Best Match");
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories")
        ]);

        setProducts(productRes.data.filter((item) => item.status === "active"));
        setCategories(categoryRes.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const categoryCards = useMemo(
    () => [
      {
        _id: "all",
        name: "All Categories",
        description: "Browse the complete live product catalog from the backend.",
        productCount: products.length,
        icon: Headphones
      },
      ...categories.map((category) => ({
        ...category,
        description: `${category.productCount || 0} live products available in this category.`,
        icon: findCategoryIcon(category.name)
      }))
    ],
    [categories, products.length]
  );

  const activeCategory = categoryCards.find((category) => category._id === activeCategoryId) || categoryCards[0];

  const filteredProducts = useMemo(() => {
    const scopedProducts =
      activeCategoryId === "all"
        ? products
        : products.filter((product) => String(product.category?._id) === String(activeCategoryId));

    const sortedProducts = [...scopedProducts];

    if (sortBy === "Price: Low to High") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price: High to Low") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Newest") {
      sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      sortedProducts.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
    }

    return sortedProducts;
  }, [activeCategoryId, products, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const pageProducts = filteredProducts.slice(currentPage * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  const handleCategoryChange = (categoryId) => {
    setActiveCategoryId(categoryId);
    setCurrentPage(0);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
    navigate("/cart");
  };

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar cartCount={cartCount} />

        <section className="mt-8 rounded-[2rem] border border-white/60 bg-white/85 px-5 py-6 shadow-[0_24px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Electronics Categories</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Browse live products by category
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This catalog is now loaded from the backend, so the items you add here use real product records and can move cleanly through cart, checkout, orders, and tracking.
              </p>
            </div>

            <button
              onClick={() => handleCategoryChange("all")}
              className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white"
            >
              Browse All Products
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryCards.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategoryId === category._id;

              return (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`rounded-[1.5rem] border px-4 py-5 text-left transition ${
                    isActive ? "border-blue-200 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-blue-100 hover:bg-slate-50"
                  }`}
                >
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full ${isActive ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700"}`}>
                    <Icon size={20} />
                  </span>
                  <p className="mt-4 text-base font-bold text-slate-950">{category.name}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{category.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-950">{activeCategory?.name}</h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {activeCategory?.productCount || filteredProducts.length} products connected to the backend.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden text-xs font-medium text-slate-600 sm:block">
                Showing {filteredProducts.length ? currentPage * ITEMS_PER_PAGE + 1 : 0}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} items.
              </p>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
              >
                <option>Best Match</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              Loading products...
            </div>
          ) : !pageProducts.length ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
              No products found for this category.
            </div>
          ) : (
            <>
              <main className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {pageProducts.map((product) => (
                  <PublicProductCard
                    key={product._id}
                    product={product}
                    badge={product.totalSold > 20 ? "Best Seller" : product.stock <= product.lowStockLimit ? "Low Stock" : ""}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </main>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
                  disabled={currentPage === 0}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
                  Page {currentPage + 1} of {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages - 1, page + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}
        </section>

        <PublicFooter />
      </div>
    </div>
  );
};

export default StoreCategories;

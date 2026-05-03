import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import ProductTable from "../components/ProductTable";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Products = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sector: searchParams.get("sector") || "electronics",
    status: searchParams.get("status") || ""
  });

  const fetchProducts = async (activeFilters = filters) => {
    const params = Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value));
    const [{ data }, categoryRes] = await Promise.all([api.get("/products", { params }), api.get("/categories")]);
    setProducts(data);
    setCategories(categoryRes.data);
  };

  useEffect(() => {
    const nextFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      sector: searchParams.get("sector") || "electronics",
      status: searchParams.get("status") || ""
    };

    setFilters(nextFilters);
    fetchProducts(nextFilters);
  }, [searchParams]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const applyFilters = () => {
    const nextParams = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "", sector: "electronics", status: "" });
    setSearchParams({});
  };

  return (
    <>
      <div className="glass-card rounded-[1.75rem] p-6">
        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div className="max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Catalog workspace</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Product Management</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Refine the electronics catalog by search, category, and status, then jump straight into edits or product creation.</p>
          </div>

          <div className="flex-1 rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-4">
            <div className="grid gap-3 xl:grid-cols-4">
              <input
                placeholder="Search by product name"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyFilters();
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
              <select
                value={filters.category}
                onChange={(event) => setFilters({ ...filters, category: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                value="Electronics"
                readOnly
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
              />
              <select
                value={filters.status}
                onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={applyFilters} className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
                Apply Filters
              </button>
              <button onClick={clearFilters} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600">
                Clear
              </button>
              <Link
                to="/products/new"
                className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_40%,#22d3ee_100%)] px-5 py-3 font-semibold text-white shadow-[0_20px_35px_rgba(8,47,73,0.24)]"
              >
                <Plus size={16} />
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ProductTable products={products} onDelete={handleDelete} canDelete={user?.role === "admin"} />
      </div>
    </>
  );
};

export default Products;

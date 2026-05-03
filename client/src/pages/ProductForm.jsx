import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const sectorTemplates = {
  electronics: { RAM: "", storage: "", warranty: "", connectivity: "" }
};

const ProductForm = ({ initialValues, isEdit = false, productId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(
    initialValues || {
      name: "",
      description: "",
      category: "",
      brand: "",
      sector: "electronics",
      price: "",
      costPrice: "",
      unit: "piece",
      stock: "",
      lowStockLimit: "",
      expiryDate: "",
      image: "",
      status: "active",
      attributes: sectorTemplates.electronics
    }
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await api.get("/categories");
      setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        lowStockLimit: Number(form.lowStockLimit),
        expiryDate: form.expiryDate || undefined
      };

      if (user?.role === "admin") {
        payload.costPrice = Number(form.costPrice || 0);
      } else {
        delete payload.costPrice;
      }

      if (isEdit) {
        await api.put(`/products/${productId}`, payload);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully");
      }

      navigate("/products");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save product");
    }
  };

  const fieldRows = [
    ["name", "Product Name"],
    ["brand", "Brand"],
    ["price", "Price"],
    ["costPrice", "Cost Price"],
    ["stock", "Current Stock"],
    ["lowStockLimit", "Low Stock Limit"],
    ["image", "Image URL"]
  ].filter(([key]) => user?.role === "admin" || key !== "costPrice");

  return (
    <>
      <div className="glass-card rounded-[1.75rem] p-6">
        <h3 className="text-2xl font-bold text-slate-900">{isEdit ? "Edit Product" : "Add New Product"}</h3>
        <p className="mt-2 text-sm text-slate-500">Configure product details, stock thresholds, and electronics-specific metadata.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          {fieldRows.map(([key, label]) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
              <input
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
          ))}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Sector</label>
            <input
              value="electronics"
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Unit</label>
            <select
              value={form.unit}
              onChange={(event) => setForm({ ...form, unit: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              {["piece", "kg", "gram", "liter", "pack"].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate ? form.expiryDate.slice(0, 10) : ""}
              onChange={(event) => setForm({ ...form, expiryDate: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
          </div>

          <div className="md:col-span-2">
            <h4 className="text-lg font-bold text-slate-900">Sector Attributes</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {Object.keys(form.attributes || {}).map((key) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 capitalize">{key}</label>
                  <input
                    value={form.attributes[key]}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        attributes: { ...form.attributes, [key]: event.target.value }
                      })
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white">
              {isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductForm;

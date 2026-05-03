import { useEffect, useState } from "react";
import { FolderKanban, Layers3, PencilLine, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", status: "active" });
  const [editingId, setEditingId] = useState("");

  const fetchCategories = async () => {
    const { data } = await api.get("/categories");
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/categories", form);
        toast.success("Category added");
      }
      setForm({ name: "", description: "", status: "active" });
      setEditingId("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save category");
    }
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="glass-card rounded-[1.75rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Catalog structure</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{editingId ? "Edit Category" : "Add Category"}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Keep your catalog organized with clear category names, descriptions, and active status controls.</p>
          <div className="mt-5 space-y-4">
            <input
              placeholder="Category name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              rows="4"
            />
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_40%,#22d3ee_100%)] px-5 py-3 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.24)]">
                {editingId ? "Update Category" : "Create Category"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId("");
                    setForm({ name: "", description: "", status: "active" });
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-600"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div className="glass-card rounded-[1.75rem] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Library overview</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Category Library</h3>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-900">{categories.length}</span> categories in use
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {categories.map((category) => (
              <div key={category._id} className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                        <FolderKanban size={20} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{category.name}</p>
                        <p className="text-sm text-slate-500">{category.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        <Layers3 size={14} />
                        {category.productCount} products
                      </span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${category.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {category.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(category._id);
                        setForm({
                          name: category.name,
                          description: category.description,
                          status: category.status
                        });
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-700"
                    >
                      <PencilLine size={15} />
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await api.delete(`/categories/${category._id}`);
                        toast.success("Category deleted");
                        fetchCategories();
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categories;

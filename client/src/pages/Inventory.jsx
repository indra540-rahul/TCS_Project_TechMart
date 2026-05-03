import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InventoryAlert from "../components/InventoryAlert";
import api from "../services/api";

const Inventory = () => {
  const [logs, setLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [stockForm, setStockForm] = useState({ productId: "", stock: "", note: "" });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, productsRes, suggestionRes] = await Promise.all([
        api.get("/inventory/logs"),
        api.get("/products"),
        api.get("/inventory/reorder-suggestions")
      ]);
      setLogs(logsRes.data);
      setProducts(productsRes.data);
      setSuggestions(suggestionRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStock = async (event) => {
    event.preventDefault();
    try {
      await api.put(`/inventory/${stockForm.productId}/stock`, {
        stock: stockForm.stock,
        note: stockForm.note
      });
      toast.success("Stock updated");
      setStockForm({ productId: "", stock: "", note: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update stock");
    }
  };

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={handleUpdateStock} className="glass-card rounded-[1.75rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Inventory controls</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Manual Stock Update</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Adjust live stock levels with an operational note so your inventory timeline stays clear and auditable.</p>
          <div className="mt-5 space-y-4">
            <select
              value={stockForm.productId}
              onChange={(event) => setStockForm({ ...stockForm, productId: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              placeholder="New stock value"
              value={stockForm.stock}
              onChange={(event) => setStockForm({ ...stockForm, stock: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            <textarea
              rows="3"
              placeholder="Note"
              value={stockForm.note}
              onChange={(event) => setStockForm({ ...stockForm, note: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3"
            />
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Use this for manual corrections, supplier receipts, and urgent stock reconciliation notes.
            </div>
            <button className="rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_40%,#22d3ee_100%)] px-5 py-3 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.24)]">
              Update Stock
            </button>
          </div>
        </form>

        <InventoryAlert suggestions={suggestions} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[1.75rem] p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Stock Overview</h3>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">
                      {product.category?.name} | Demand: {product.predictedDemand}
                    </p>
                  </div>
                  <p className={`text-xl font-bold ${product.stock <= product.lowStockLimit ? "text-rose-600" : "text-emerald-600"}`}>
                    {product.stock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[1.75rem] p-5">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Inventory Logs</h3>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-500">Loading inventory activity...</div>
          ) : logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6">
              <p className="text-sm font-semibold text-slate-700">No inventory logs yet</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Stock changes will appear here after a manual update, reorder adjustment, or other inventory activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log._id} className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="font-semibold text-slate-900">{log.product?.name || "Unknown product"}</p>
                  <p className="text-sm capitalize text-slate-600">
                    {log.action} | {log.previousStock} to {log.newStock} | Change: {log.quantityChanged}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Inventory;

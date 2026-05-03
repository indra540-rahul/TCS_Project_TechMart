import { Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";

const statusClass = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-600"
};

const demandClass = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700"
};

const ProductTable = ({ products, onDelete, canDelete = false }) => (
  <div className="glass-card rounded-[1.75rem] p-5">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold text-slate-900">Product Catalog</h3>
      <p className="text-sm text-slate-500">{products.length} items</p>
    </div>
    <div className="table-wrap">
      <table className="min-w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr className="border-b border-slate-200">
            <th className="pb-3">Product</th>
            <th className="pb-3">Category</th>
            <th className="pb-3">Price</th>
            <th className="pb-3">Stock</th>
            <th className="pb-3">Demand</th>
            <th className="pb-3">Status</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b border-slate-100">
              <td className="py-4">
                <div className="font-semibold text-slate-900">{product.name}</div>
                <div className="text-xs text-slate-500">{product.brand || product.sector}</div>
              </td>
              <td className="py-4">{product.category?.name || "Uncategorized"}</td>
              <td className="py-4">Rs. {product.price.toLocaleString()}</td>
              <td className={`py-4 font-semibold ${product.stock <= product.lowStockLimit ? "text-rose-600" : "text-slate-700"}`}>
                {product.stock}
              </td>
              <td className="py-4">
                <span className={`status-pill ${demandClass[product.predictedDemand] || demandClass.Low}`}>
                  {product.predictedDemand || "Low"}
                </span>
              </td>
              <td className="py-4">
                <span className={`status-pill ${statusClass[product.status] || statusClass.active}`}>{product.status}</span>
              </td>
              <td className="py-4">
                <div className="flex justify-end gap-2">
                  <Link to={`/products/${product._id}/edit`} className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Edit size={16} />
                  </Link>
                  {canDelete && (
                    <button onClick={() => onDelete(product._id)} className="rounded-xl bg-rose-100 p-2 text-rose-700">
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ProductTable;

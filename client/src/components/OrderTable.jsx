import { Eye, Trash } from "lucide-react";

const paymentClass = {
  paid: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-rose-100 text-rose-700"
};

const statusClass = {
  pending: "bg-slate-100 text-slate-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  processing: "bg-indigo-100 text-indigo-700",
  dispatch: "bg-sky-100 text-sky-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700"
};

const OrderTable = ({ orders, onStatusChange, onCancel, onDelete, onView, canCancel = false, canDelete = false, statusOptions = [] }) => {
  return (
    <div className="glass-card rounded-[1.75rem] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Order Management</h3>
        <p className="text-sm text-slate-500">{orders.length} orders</p>
      </div>
      <div className="table-wrap">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="pb-3">Order ID</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Created</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-slate-100">
                <td className="py-4 font-semibold text-slate-900">#{order._id.slice(-6)}</td>
                <td className="py-4">{order.customer?.name || "Guest Customer"}</td>
                <td className="py-4">Rs. {order.totalAmount.toLocaleString()}</td>
                <td className="py-4">
                  <span className={`status-pill capitalize ${paymentClass[order.paymentStatus] || paymentClass.pending}`}>{order.paymentStatus}</span>
                </td>
                <td className="py-4">
                  {statusOptions.length && order.orderStatus !== "cancelled" ? (
                    <div className="flex items-center gap-3">
                      <span className={`status-pill capitalize ${statusClass[order.orderStatus] || statusClass.pending}`}>{order.orderStatus}</span>
                      <select
                        value={order.orderStatus}
                        onChange={(event) => onStatusChange(order._id, event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 capitalize"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className={`status-pill capitalize ${statusClass[order.orderStatus] || statusClass.pending}`}>{order.orderStatus}</span>
                  )}
                </td>
                <td className="py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onView(order)} className="rounded-xl bg-indigo-100 p-2 text-indigo-700" title="View order details">
                      <Eye size={16} />
                    </button>
                    {canCancel && order.orderStatus !== "cancelled" && (
                      <button onClick={() => onCancel(order._id)} className="rounded-xl bg-rose-100 px-3 py-2 font-semibold text-rose-700">
                        Cancel
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => onDelete(order._id)} className="rounded-xl bg-slate-900 p-2 text-white">
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
};

export default OrderTable;

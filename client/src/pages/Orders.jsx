import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Clock3, PackageCheck, TrendingUp, X } from "lucide-react";
import toast from "react-hot-toast";
import OrderTable from "../components/OrderTable";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const orderSnapshotCards = [
  {
    key: "dailyRevenue",
    title: "Daily Revenue",
    tone: "text-blue-600",
    iconBg: "bg-blue-50",
    chipClass: "bg-emerald-50 text-emerald-600",
    icon: TrendingUp
  },
  {
    key: "pendingShipments",
    title: "Pending Shipments",
    tone: "text-amber-500",
    iconBg: "bg-amber-50",
    chipClass: "bg-amber-50 text-amber-600",
    icon: Clock3
  },
  {
    key: "completedToday",
    title: "Completed Today",
    tone: "text-emerald-600",
    iconBg: "bg-emerald-50",
    chipClass: "bg-emerald-50 text-emerald-600",
    icon: CheckCheck
  },
  {
    key: "refundRequests",
    title: "Refund Requests",
    tone: "text-rose-500",
    iconBg: "bg-rose-50",
    chipClass: "bg-rose-50 text-rose-500",
    icon: X
  }
];

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    const { data } = await api.get("/orders");
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status");
    }
  };

  const onCancel = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel order");
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete order");
    }
  };

  const orderSnapshot = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrders = orders.filter((order) => new Date(order.createdAt) >= today);
    const dailyRevenue = todaysOrders
      .filter((order) => order.paymentStatus === "paid" && order.orderStatus !== "cancelled")
      .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
    const pendingShipments = orders.filter((order) => ["confirmed", "processing", "dispatch", "shipped"].includes(order.orderStatus)).length;
    const completedToday = todaysOrders.filter((order) => order.orderStatus === "delivered").length;
    const refundRequests = orders.filter((order) => order.orderStatus === "cancelled").length;

    return {
      dailyRevenue: {
        value: `Rs. ${Math.round(dailyRevenue).toLocaleString()}`,
        chip: "+12.5%"
      },
      pendingShipments: {
        value: pendingShipments,
        chip: `${pendingShipments} active`
      },
      completedToday: {
        value: completedToday,
        chip: todaysOrders.length ? `${Math.round((completedToday / todaysOrders.length) * 100)}% rate` : "0% rate"
      },
      refundRequests: {
        value: refundRequests,
        chip: refundRequests ? `-${Math.min(refundRequests * 0.7, 9.9).toFixed(1)}%` : "0.0%"
      }
    };
  }, [orders]);

  return (
    <>
      <OrderTable
        orders={orders}
        onStatusChange={onStatusChange}
        onCancel={onCancel}
        onDelete={onDelete}
        onView={setSelectedOrder}
        canCancel={user?.role === "admin"}
        canDelete={user?.role === "admin"}
        statusOptions={user?.role === "admin" ? ["pending", "confirmed", "processing", "dispatch", "shipped", "delivered"] : ["pending", "processing", "shipped", "delivered"]}
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {orderSnapshotCards.map((card) => {
          const Icon = card.icon;
          const snapshot = orderSnapshot[card.key];

          return (
            <div key={card.key} className="glass-card rounded-[1.6rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg}`}>
                  <Icon size={18} className={card.tone} />
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.chipClass}`}>{snapshot.chip}</span>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">{card.title}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{snapshot.value}</p>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <div className="glass-card mt-6 rounded-[1.75rem] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Order details</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Order #{selectedOrder._id.slice(-6)}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedOrder.customer?.name || "Guest Customer"} | {selectedOrder.customer?.email || "No email"} | {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600"
            >
              <X size={16} />
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
              <h4 className="text-lg font-bold text-slate-900">Purchased Items</h4>
              <div className="mt-4 space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={`${selectedOrder._id}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                        <PackageCheck size={18} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{item.product?.name || "Removed product"}</p>
                        <p className="text-sm text-slate-500">Qty {item.quantity} | Unit Rs. {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">Rs. {item.subtotal.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
                <h4 className="text-lg font-bold text-slate-900">Summary</h4>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Customer</span>
                    <span className="font-semibold text-slate-900">{selectedOrder.customer?.name || "Guest"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="font-semibold capitalize text-cyan-700">{selectedOrder.orderStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Payment</span>
                    <span className="font-semibold capitalize text-emerald-700">{selectedOrder.paymentStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span className="font-semibold text-slate-900">{selectedOrder.items?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span>Total amount</span>
                    <span className="text-lg font-bold text-slate-950">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5">
                <h4 className="text-lg font-bold text-slate-900">Shipping Address</h4>
                <div className="mt-4 text-sm leading-6 text-slate-600">
                  <p>{selectedOrder.shippingAddress?.line1 || "No line 1 provided"}</p>
                  <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                  <p>{selectedOrder.shippingAddress?.pincode}, {selectedOrder.shippingAddress?.country}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;

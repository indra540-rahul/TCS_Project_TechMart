import { CheckCheck, Home, PackageCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import api from "../services/api";

const timeline = [
  { key: "pending", label: "Order Placed", icon: PackageCheck },
  { key: "confirmed", label: "Processed", icon: CheckCheck },
  { key: "processing", label: "In Transit", icon: Truck },
  { key: "dispatch", label: "Out for Delivery", icon: Truck },
  { key: "shipped", label: "Shipment Locked", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home }
];

const formatMoney = (value = 0) => `Rs. ${Number(value || 0).toLocaleString()}`;

const formatTimelineMeta = (order, stepKey, active) => {
  const createdAt = new Date(order.createdAt);
  if (!active) {
    if (stepKey === "dispatch") {
      return `Expected ${new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }

    if (stepKey === "delivered") {
      return "Pending arrival";
    }

    return "Waiting";
  }

  const offsets = {
    pending: 0,
    confirmed: 3,
    processing: 18,
    dispatch: 36,
    shipped: 48,
    delivered: 72
  };

  const stepTime = new Date(createdAt.getTime() + (offsets[stepKey] || 0) * 60 * 60 * 1000);
  return stepTime.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStepBadge = (stepKey, orderStatus) => {
  if (orderStatus === "cancelled") {
    return "";
  }

  const currentIndex = timeline.findIndex((step) => step.key === orderStatus);
  const stepIndex = timeline.findIndex((step) => step.key === stepKey);

  if (stepIndex < currentIndex) {
    return "Completed";
  }

  if (stepIndex === currentIndex) {
    return "Currently Here";
  }

  return "";
};

const TrackingTimeline = ({ order }) => {
  const currentIndex = timeline.findIndex((step) => step.key === order.orderStatus);

  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-sm">
      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
        {timeline.map((step, index) => {
          const Icon = step.icon;
          const active = order.orderStatus !== "cancelled" && index <= currentIndex;
          const current = order.orderStatus !== "cancelled" && index === currentIndex;
          const badge = getStepBadge(step.key, order.orderStatus);

          return (
            <div key={step.key} className="relative text-center">
              {index !== timeline.length - 1 && (
                <div className={`absolute left-1/2 top-5 hidden h-[3px] w-full -translate-y-1/2 xl:block ${index < currentIndex ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}

              <div className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-full border-4 ${active ? (current ? "border-blue-200 bg-blue-600 text-white shadow-[0_16px_28px_rgba(37,99,235,0.25)]" : "border-emerald-200 bg-emerald-500 text-white") : "border-slate-200 bg-white text-slate-300"}`}>
                <Icon size={18} />
              </div>

              <p className={`mt-4 text-sm font-black ${active ? "text-slate-950" : "text-slate-300"}`}>
                {step.label}
              </p>
              <p className={`mt-1 text-xs ${active ? "text-slate-500" : "text-slate-300"}`}>
                {formatTimelineMeta(order, step.key, active)}
              </p>

              {badge && (
                <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${current ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (targetId = orderId) => {
    const trimmedId = targetId.trim();
    if (!trimmedId) {
      toast.error("Enter your full order ID");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${trimmedId}`);
      setOrder(data);
    } catch (error) {
      setOrder(null);
      toast.error(error.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("id")) {
      handleSearch(searchParams.get("id"));
    }
  }, [searchParams]);

  const orderHighlights = useMemo(() => {
    if (!order) {
      return [];
    }

    return [
      { label: "Payment", value: `${order.paymentStatus} via ${order.paymentMethod}` },
      { label: "Total", value: formatMoney(order.totalAmount) },
      { label: "Shipping", value: order.shippingMethod || "standard" }
    ];
  }, [order]);

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar />
        <div className="mt-8 rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <h1 className="text-3xl font-black text-slate-900">Track Your Order</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter the full order ID generated after checkout to view live backend order updates.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder="Enter full order ID"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3"
            />
            <button
              onClick={() => handleSearch()}
              className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white"
            >
              {loading ? "Tracking..." : "Track Order"}
            </button>
          </div>

          {order && (
            <div className="mt-8 space-y-6">
              <div className="rounded-[1.8rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_28%),linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#38bdf8_100%)] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Live Shipment Status</p>
                <h2 className="mt-3 text-2xl font-black">Order #{order._id.slice(-6).toUpperCase()}</h2>
                <p className="mt-2 text-sm text-blue-100">
                  Current status: <span className="font-bold capitalize text-white">{order.orderStatus}</span>
                </p>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {orderHighlights.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm">
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-100">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {order.orderStatus === "cancelled" ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <p className="font-semibold text-rose-700">This order was cancelled.</p>
                  <p className="mt-1 text-sm text-rose-600">
                    If you need help, contact support with order ID {order._id}.
                  </p>
                </div>
              ) : (
                <TrackingTimeline order={order} />
              )}

              <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-2xl border border-slate-100 bg-white p-5">
                  <h3 className="text-lg font-bold text-slate-900">Items</h3>
                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.product?._id || `${item.quantity}-${item.price}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4">
                        <div>
                          <p className="text-slate-700">{item.product?.name || "Product"}</p>
                          <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-slate-900">{formatMoney(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-5">
                  <h3 className="text-lg font-bold text-slate-900">Shipping Address</h3>
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                    <p>{order.shippingAddress?.line1 || "No line 1 provided"}</p>
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    <p>{order.shippingAddress?.pincode}, {order.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <PublicFooter />
      </div>
    </div>
  );
};

export default TrackOrder;

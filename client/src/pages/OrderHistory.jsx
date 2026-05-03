import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import api from "../services/api";

const OrderHistory = () => {
  const [email, setEmail] = useState(localStorage.getItem("techmart_last_email") || "");
  const [orders, setOrders] = useState([]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/orders/history", { params: { email } });
      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch order history");
    }
  };

  useEffect(() => {
    if (email) {
      fetchHistory();
    }
  }, []);

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar />
        <div className="mt-8 glass-card rounded-[2rem] p-8">
          <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter customer email" className="flex-1 rounded-2xl border border-slate-200 px-4 py-3" />
            <button onClick={fetchHistory} className="rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white">
              View Orders
            </button>
          </div>
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">#{order._id.slice(-6)}</p>
                    <p className="text-sm capitalize text-slate-500">{order.orderStatus} | Payment {order.paymentStatus}</p>
                  </div>
                  <Link to={`/track-order?id=${order._id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                    Track
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.product?._id || item._id} className="flex items-center justify-between text-sm text-slate-600">
                      <span>{item.product?.name}</span>
                      <span>Qty {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!orders.length && <p className="text-sm text-slate-500">No orders found yet for this email.</p>}
          </div>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
};

export default OrderHistory;

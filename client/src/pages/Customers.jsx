import { ChevronDown, ChevronUp, PackageCheck, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState("");

  const fetchCustomers = async () => {
    const { data } = await api.get("/customers", { params: search ? { search } : {} });
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <>
      <div className="glass-card rounded-[1.75rem] p-6">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Customer intelligence</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Customer Records</h3>
            <p className="text-sm text-slate-500">
              {user?.role === "admin"
                ? "Review customer profiles, spending behavior, and their latest order history in one professional workspace."
                : "View customer details, recent purchases, and operational order context without leaving the dashboard."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Search customers"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  fetchCustomers();
                }
              }}
              className="min-w-[16rem] rounded-2xl border border-slate-200 bg-white px-4 py-3"
            />
            <button onClick={fetchCustomers} className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white">
              Search
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-slate-200/80 bg-white/70 px-4 py-3">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{customers.length}</span> customer records
          </p>
          <p className="text-sm text-slate-500">Expand a customer card to review their most recent orders and purchased items.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {customers.map((customer) => (
            <div key={customer._id} className="rounded-[1.6rem] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-bold text-slate-900">{customer.name}</p>
                  <p className="text-sm text-slate-500">{customer.email}</p>
                  <p className="text-sm text-slate-500">{customer.phone || "No phone added"}</p>
                  <p className="mt-3 text-sm text-slate-600">
                    {customer.address?.city}, {customer.address?.state} - {customer.address?.pincode}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 md:min-w-[15rem]">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Orders</p>
                    <p className="mt-2 text-2xl font-bold text-cyan-700">{customer.orderCount}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Total spent</p>
                    <p className="mt-2 text-lg font-bold text-emerald-700">Rs. {customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setExpandedCustomerId(expandedCustomerId === customer._id ? "" : customer._id)}
                  className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-cyan-700" />
                    Recent Order History
                  </span>
                  {expandedCustomerId === customer._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {expandedCustomerId === customer._id && (
                  <div className="mt-4 space-y-3">
                    {customer.recentOrders?.length ? (
                      customer.recentOrders.map((order) => (
                        <div key={order._id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">Order #{order._id.slice(-6)}</p>
                              <p className="text-sm text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString()} | {order.itemCount} items
                              </p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="font-semibold text-cyan-700 capitalize">{order.orderStatus}</p>
                              <p className="text-sm capitalize text-slate-500">Payment: {order.paymentStatus}</p>
                              <p className="mt-1 font-semibold text-slate-900">Rs. {order.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {order.items.map((item, index) => (
                              <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                                <div className="flex min-w-0 items-center gap-2">
                                  <PackageCheck size={15} className="shrink-0 text-cyan-700" />
                                  <span className="truncate text-sm font-medium text-slate-700">{item.productName}</span>
                                </div>
                                <div className="text-right text-sm text-slate-500">
                                  Qty {item.quantity} | Rs. {item.subtotal.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                        No orders found for this customer yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Customers;

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCheck,
  Home,
  MessageCircle,
  Package,
  PackageCheck,
  Search,
  Truck,
  UserCircle2
} from "lucide-react";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useCart } from "../hooks/useCart";
import customerApi from "../services/customerApi";

const tabs = [
  { key: "profile", label: "Profile", icon: UserCircle2 },
  { key: "orders", label: "Order History", icon: Package },
  { key: "tracking", label: "Track Orders", icon: Truck },
  { key: "help", label: "Help Center", icon: MessageCircle }
];

const timeline = [
  { key: "pending", label: "Order Placed", icon: PackageCheck },
  { key: "confirmed", label: "Processed", icon: CheckCheck },
  { key: "processing", label: "In Transit", icon: Truck },
  { key: "dispatch", label: "Out for Delivery", icon: Truck },
  { key: "shipped", label: "Shipment Locked", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home }
];

const getStatusStyle = (status = "") => {
  const value = status.toLowerCase();

  if (value.includes("deliver")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (value.includes("ship") || value.includes("dispatch")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (value.includes("process") || value.includes("confirm")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (value.includes("cancel")) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  return "bg-slate-100 text-slate-700 border-slate-200";
};

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

const CustomerAccount = () => {
  const { cartCount } = useCart();
  const { customer, updateCustomer } = useCustomerAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    address: {
      line1: customer?.address?.line1 || "",
      city: customer?.address?.city || "",
      state: customer?.address?.state || "",
      pincode: customer?.address?.pincode || "",
      country: customer?.address?.country || "India"
    },
    currentPassword: "",
    password: ""
  });

  const activeTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    setProfileForm({
      name: customer?.name || "",
      phone: customer?.phone || "",
      address: {
        line1: customer?.address?.line1 || "",
        city: customer?.address?.city || "",
        state: customer?.address?.state || "",
        pincode: customer?.address?.pincode || "",
        country: customer?.address?.country || "India"
      },
      currentPassword: "",
      password: ""
    });
  }, [customer]);

  useEffect(() => {
    const shouldLoadOrders = activeTab === "orders" || activeTab === "tracking";
    if (!shouldLoadOrders) {
      return;
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const { data } = await customerApi.get("/customers/me/orders");
        setOrders(data);
        if (!selectedOrderId && data[0]?._id) {
          setSelectedOrderId(data[0]._id);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load your orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const firstItem = order.items?.[0]?.product?.name?.toLowerCase() || "";
      return (
        order._id.toLowerCase().includes(query) ||
        order.orderStatus?.toLowerCase().includes(query) ||
        firstItem.includes(query)
      );
    });
  }, [orders, searchTerm]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedOrderId) || filteredOrders[0] || null,
    [orders, filteredOrders, selectedOrderId]
  );

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      await updateCustomer(profileForm);
      setProfileForm((current) => ({
        ...current,
        currentPassword: "",
        password: ""
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar cartCount={cartCount} />

        <section className="mt-8 rounded-[2rem] border border-white/60 bg-white/90 px-6 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                Customer Workspace
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Manage your profile, orders, and tracking in one place
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Signed in as {customer?.name}. Update delivery details, review order
                history, and follow shipment progress from one dashboard.
              </p>
            </div>

            <div className="rounded-[1.6rem] bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                Account Email
              </p>
              <p className="mt-2 text-base font-bold">{customer?.email}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    if (tab.key === "help") {
                      window.location.href = "/help-center";
                    } else {
                      setSearchParams({ tab: tab.key });
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-700 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === "profile" && (
          <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
              <aside className="rounded-[1.6rem] bg-[linear-gradient(135deg,#07132d_0%,#0f2c8e_44%,#1d4ed8_100%)] p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Your Profile
                </p>
                <div className="mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl font-black">
                  {(customer?.name || "U").charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-5 text-2xl font-black">{customer?.name}</h2>
                <p className="mt-1 text-sm text-sky-100">{customer?.email}</p>
                <p className="mt-5 text-sm leading-7 text-sky-100/90">
                  Keep your shipping details current so checkout stays fast and your
                  order tracking remains accurate.
                </p>
              </aside>

              <form onSubmit={handleProfileSave} className="grid gap-5 md:grid-cols-2">
                <ProfileField label="Full Name">
                  <input
                    value={profileForm.name}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, name: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="Phone Number">
                  <input
                    value={profileForm.phone}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="Address Line 1" full>
                  <input
                    value={profileForm.address.line1}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        address: { ...current.address, line1: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="City">
                  <input
                    value={profileForm.address.city}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        address: { ...current.address, city: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="State">
                  <input
                    value={profileForm.address.state}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        address: { ...current.address, state: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="Pincode">
                  <input
                    value={profileForm.address.pincode}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        address: { ...current.address, pincode: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="Country">
                  <input
                    value={profileForm.address.country}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        address: { ...current.address, country: event.target.value }
                      }))
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="Current Password">
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(event) =>
                      setProfileForm((current) => ({
                        ...current,
                        currentPassword: event.target.value
                      }))
                    }
                    placeholder="Only if changing password"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <ProfileField label="New Password">
                  <input
                    type="password"
                    value={profileForm.password}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Minimum 6 characters"
                    className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </ProfileField>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="rounded-2xl bg-[linear-gradient(90deg,#07132d_0%,#163fbd_50%,#2563eb_100%)] px-6 py-3 font-semibold text-white shadow-[0_18px_36px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {savingProfile ? "Saving..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section className="mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-black tracking-tight text-slate-950">
                  Order History
                </h2>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Every order here is loaded from your account on the backend.
                </p>
              </div>

              <div className="grid min-w-[240px] grid-cols-2 gap-3">
                <StatBadge label="Total Orders" value={orders.length} />
                <StatBadge
                  label="In Transit"
                  value={
                    orders.filter((order) =>
                      ["confirmed", "processing", "dispatch", "shipped"].includes(order.orderStatus)
                    ).length
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-300 bg-white px-4 py-4 shadow-sm">
              <label className="mb-2 block text-[10px] font-black text-slate-800">
                Search Orders
              </label>
              <div className="flex h-[42px] items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
                <Search size={16} className="text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by order ID, status, or product name"
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {loadingOrders && (
                <p className="rounded-xl border border-slate-300 bg-white px-5 py-5 text-sm text-slate-500">
                  Loading orders...
                </p>
              )}

              {!loadingOrders && !filteredOrders.length && (
                <p className="rounded-xl border border-slate-300 bg-white px-5 py-5 text-sm text-slate-500">
                  You have not placed any orders yet.
                </p>
              )}

              {!loadingOrders &&
                filteredOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const product = firstItem?.product;

                  return (
                    <article
                      key={order._id}
                      className="flex flex-col gap-4 rounded-xl border border-slate-300 bg-white px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-[60px] w-[60px] overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
                          {product?.image ? (
                            <img
                              src={product.image}
                              alt={product?.name || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-900 text-[10px] font-bold text-white">
                              ITEM
                            </div>
                          )}
                        </div>

                        <div className="grid gap-1">
                          <p className="text-sm font-black text-slate-950">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(order.createdAt).toLocaleDateString()} | {formatMoney(order.totalAmount)}
                          </p>
                          <p className="text-sm text-slate-500">
                            Payment {order.paymentStatus} via {order.paymentMethod || "cod"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-black capitalize ${getStatusStyle(order.orderStatus)}`}
                        >
                          {order.orderStatus}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderId(order._id);
                            setSearchParams({ tab: "tracking" });
                          }}
                          className="rounded-md bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                        >
                          Track Order
                        </button>

                        <Link
                          to={`/track-order?id=${order._id}`}
                          className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
                        >
                          Public Tracking
                        </Link>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        )}

        {activeTab === "tracking" && (
          <section className="mt-8">
            {loadingOrders ? (
              <p className="rounded-xl border border-slate-300 bg-white px-5 py-5 text-sm text-slate-500">
                Loading tracking details...
              </p>
            ) : !orders.length ? (
              <p className="rounded-xl border border-slate-300 bg-white px-5 py-5 text-sm text-slate-500">
                You do not have any orders to track yet.
              </p>
            ) : (
              <>
                <div className="mb-5 grid gap-3 md:grid-cols-3">
                  {orders.map((order) => (
                    <button
                      key={order._id}
                      type="button"
                      onClick={() => setSelectedOrderId(order._id)}
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        selectedOrder?._id === order._id
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="text-sm font-black text-slate-950">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()} | {formatMoney(order.totalAmount)}
                      </p>
                      <span className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-black capitalize ${getStatusStyle(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedOrder && (
                  <>
                    <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-black text-slate-950">
                            Track Order #{selectedOrder._id.slice(-6).toUpperCase()}
                          </h3>
                          <p className="mt-2 text-sm text-slate-500">
                            Payment {selectedOrder.paymentStatus} via {selectedOrder.paymentMethod} | Total {formatMoney(selectedOrder.totalAmount)}
                          </p>
                        </div>

                        <Link
                          to={`/track-order?id=${selectedOrder._id}`}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                        >
                          Open Public Tracking Page
                        </Link>
                      </div>

                      <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-5">
                        <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
                          {timeline.map((step, index) => {
                            const Icon = step.icon;
                            const orderIndex = timeline.findIndex((item) => item.key === selectedOrder.orderStatus);
                            const active = selectedOrder.orderStatus !== "cancelled" && index <= orderIndex;
                            const current = selectedOrder.orderStatus !== "cancelled" && index === orderIndex;
                            const badge = getStepBadge(step.key, selectedOrder.orderStatus);

                            return (
                              <div key={step.key} className="relative text-center">
                                {index !== timeline.length - 1 && (
                                  <div className={`absolute left-1/2 top-5 hidden h-[3px] w-full -translate-y-1/2 xl:block ${index < orderIndex ? "bg-emerald-300" : "bg-slate-200"}`} />
                                )}

                                <div className={`relative mx-auto flex h-11 w-11 items-center justify-center rounded-full border-4 ${active ? (current ? "border-blue-200 bg-blue-600 text-white shadow-[0_16px_28px_rgba(37,99,235,0.25)]" : "border-emerald-200 bg-emerald-500 text-white") : "border-slate-200 bg-white text-slate-300"}`}>
                                  <Icon size={18} />
                                </div>

                                <p className={`mt-4 text-sm font-black ${active ? "text-slate-950" : "text-slate-300"}`}>
                                  {step.label}
                                </p>
                                <p className={`mt-1 text-xs ${active ? "text-slate-500" : "text-slate-300"}`}>
                                  {formatTimelineMeta(selectedOrder, step.key, active)}
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
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-black text-slate-950">Order Summary</h3>
                          <p className="text-xs font-semibold text-slate-500">
                            {selectedOrder.items?.length || 0} Items
                          </p>
                        </div>

                        <div className="mt-5 space-y-4">
                          {selectedOrder.items?.map((item) => (
                            <div
                              key={item.product?._id || `${selectedOrder._id}-${item.quantity}-${item.price}`}
                              className="flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                                  {item.product?.image ? (
                                    <img
                                      src={item.product.image}
                                      alt={item.product?.name || "Product"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-[10px] text-white">
                                      ITEM
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm font-black text-slate-950">
                                    {item.product?.name || "Product"}
                                  </p>
                                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                                    Qty {item.quantity} | Unit {formatMoney(item.price)}
                                  </p>
                                </div>
                              </div>

                              <p className="text-sm font-black text-slate-950">
                                {formatMoney(item.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-lg font-black text-slate-950">Delivery Details</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                          <div className="flex items-center justify-between">
                            <span>Status</span>
                            <span className="font-semibold capitalize text-slate-900">
                              {selectedOrder.orderStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Payment</span>
                            <span className="font-semibold capitalize text-slate-900">
                              {selectedOrder.paymentStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Shipping</span>
                            <span className="font-semibold capitalize text-slate-900">
                              {selectedOrder.shippingMethod || "standard"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                          <p>{selectedOrder.shippingAddress?.line1 || "No line 1 provided"}</p>
                          <p>
                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                          </p>
                          <p>
                            {selectedOrder.shippingAddress?.pincode}, {selectedOrder.shippingAddress?.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </section>
        )}

        <PublicFooter />
      </div>
    </div>
  );
};

const ProfileField = ({ label, children, full = false }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

const StatBadge = ({ label, value }) => (
  <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-xl font-black text-blue-900">{value}</p>
  </div>
);

export default CustomerAccount;

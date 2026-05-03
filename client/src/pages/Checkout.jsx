import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  IndianRupee,
  Lock,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wallet,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useCart } from "../hooks/useCart";
import api from "../services/api";

const shippingOptions = [
  {
    id: "standard",
    label: "Standard Performance",
    description: "Estimated delivery: 3-5 business days",
    price: 0
  },
  {
    id: "priority",
    label: "Enterprise Priority",
    description: "Guaranteed delivery: 1-2 business days",
    price: 1499
  }
];

const paymentOptions = [
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Pay now with UPI, card, netbanking, or wallet",
    charge: 0,
    icon: CreditCard
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    charge: 49,
    icon: Wallet
  }
];

const initialCardForm = {
  name: "",
  contact: "",
  email: ""
};
const objectIdPattern = /^[a-f\d]{24}$/i;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, clearCart, removeFromCart } = useCart();
  const { customer: signedInCustomer } = useCustomerAuth();

  const [promoCode, setPromoCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(import.meta.env.VITE_RAZORPAY_KEY_ID || "");
  const [customer, setCustomer] = useState({
    firstName: signedInCustomer?.name?.split(" ").slice(0, -1).join(" ") || signedInCustomer?.name?.split(" ")[0] || "",
    lastName: signedInCustomer?.name?.split(" ").slice(1).join(" ") || "",
    email: signedInCustomer?.email || "",
    phone: signedInCustomer?.phone || "",
    address: {
      line1: signedInCustomer?.address?.line1 || "",
      city: signedInCustomer?.address?.city || "",
      state: signedInCustomer?.address?.state || "",
      pincode: signedInCustomer?.address?.pincode || "",
      country: signedInCustomer?.address?.country || "India"
    }
  });
  const [cardForm, setCardForm] = useState({
    ...initialCardForm,
    name: signedInCustomer?.name || "",
    contact: signedInCustomer?.phone || "",
    email: signedInCustomer?.email || ""
  });

  const selectedShipping =
    shippingOptions.find((option) => option.id === shippingMethod) ||
    shippingOptions[0];
  const selectedPayment =
    paymentOptions.find((option) => option.id === paymentMethod) ||
    paymentOptions[0];

  const shippingCost = selectedShipping.price;
  const estimatedTaxes = Math.round(cartTotal * 0.08);
  const codCharge = paymentMethod === "cod" ? selectedPayment.charge : 0;
  const grandTotal = cartTotal + shippingCost + estimatedTaxes + codCharge;

  const orderItems = useMemo(
    () =>
      cart.map((item) => ({
        product: item._id,
        quantity: item.quantity
      })),
    [cart]
  );

  useEffect(() => {
    if (!signedInCustomer) {
      return;
    }

    setCustomer({
      firstName:
        signedInCustomer.name?.split(" ").slice(0, -1).join(" ") ||
        signedInCustomer.name?.split(" ")[0] ||
        "",
      lastName: signedInCustomer.name?.split(" ").slice(1).join(" ") || "",
      email: signedInCustomer.email || "",
      phone: signedInCustomer.phone || "",
      address: {
        line1: signedInCustomer.address?.line1 || "",
        city: signedInCustomer.address?.city || "",
        state: signedInCustomer.address?.state || "",
        pincode: signedInCustomer.address?.pincode || "",
        country: signedInCustomer.address?.country || "India"
      }
    });

    setCardForm({
      ...initialCardForm,
      name: signedInCustomer.name || "",
      contact: signedInCustomer.phone || "",
      email: signedInCustomer.email || ""
    });
  }, [signedInCustomer]);

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      setRazorpayReady(Boolean(window.Razorpay));
      return undefined;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(Boolean(window.Razorpay));
    script.onerror = () => setRazorpayReady(false);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    const fetchRazorpayConfig = async () => {
      try {
        const { data } = await api.get("/payments/razorpay/config");
        if (data?.key) {
          setRazorpayKey(data.key);
        }
      } catch (_error) {
        // Keep the client env fallback if backend config is unavailable.
      }
    };

    fetchRazorpayConfig();
  }, []);

  const invalidCartItems = useMemo(
    () => cart.filter((item) => !objectIdPattern.test(String(item._id || ""))),
    [cart]
  );

  const purgeInvalidCartItems = () => {
    invalidCartItems.forEach((item) => removeFromCart(item._id));
  };

  const validateShipping = () => {
    if (!cart.length) {
      toast.error("Cart is empty");
      return false;
    }

    if (invalidCartItems.length) {
      purgeInvalidCartItems();
      toast.error("Old demo products were removed from your cart. Please add the latest products again.");
      return false;
    }

    if (
      !customer.firstName ||
      !customer.lastName ||
      !customer.email ||
      !customer.phone ||
      !customer.address.line1 ||
      !customer.address.city ||
      !customer.address.state ||
      !customer.address.pincode
    ) {
      toast.error("Please complete shipping details");
      return false;
    }

    return true;
  };

  const buildOrderPayload = ({ method, paymentState = "pending", reference = "", provider = "" }) => ({
    customer: signedInCustomer?._id,
    customerInfo: {
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    },
    items: orderItems,
    paymentMethod: method,
    paymentStatus: paymentState,
    paymentReference: reference,
    paymentProvider: provider,
    shippingMethod,
    shippingCharge: shippingCost,
    taxAmount: estimatedTaxes,
    codCharge: method === "cod" ? selectedPayment.charge : 0,
    shippingAddress: customer.address
  });

  const submitOrder = async (payload) => {
    try {
      const { data } = await api.post("/orders", payload);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create order");
    }
  };

  const completeSuccessfulOrder = (order, successMessage = "Order confirmed") => {
    clearCart();
    localStorage.setItem("techmart_last_email", customer.email);
    setPaymentModalOpen(false);
    toast.success(`${successMessage}. ID: ${order._id.slice(-6)}`);
    navigate(signedInCustomer ? "/account?tab=orders" : `/track-order?id=${order._id}`);
  };

  const handleContinueToPayment = () => {
    if (!validateShipping()) {
      return;
    }

    setPaymentModalOpen(true);
  };

  const handleCodOrder = async () => {
    setPlacingOrder(true);

    try {
      const order = await submitOrder(
        buildOrderPayload({
          method: "cod",
          paymentState: "pending",
          reference: `COD-${Date.now()}`,
          provider: "cash-on-delivery"
        })
      );

      completeSuccessfulOrder(order, "Cash on delivery order confirmed");
    } catch (error) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleRazorpayOrder = async () => {
    if (!cardForm.name || !cardForm.contact || !cardForm.email) {
      toast.error("Please complete the payment contact details");
      return;
    }

    if (!razorpayReady || !razorpayKey || !window.Razorpay) {
      toast.error("Razorpay test mode is not configured yet. Add your test key in both .env files and restart the app.");
      return;
    }

    setPlacingOrder(true);

    try {
      const orderPayload = buildOrderPayload({
        method: "razorpay",
        paymentState: "paid",
        provider: "razorpay"
      });

      const { data: razorpayOrder } = await api.post("/payments/razorpay/order", {
        amount: grandTotal,
        receipt: `techmart_${Date.now()}`,
        notes: {
          customerEmail: customer.email,
          customerPhone: customer.phone
        }
      });

      const razorpayInstance = new window.Razorpay({
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "TechMart Pro",
        description: "Electronics order payment",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const { data } = await api.post("/payments/razorpay/verify", {
              ...response,
              orderPayload
            });

            completeSuccessfulOrder(data.order, "Payment verified and order confirmed");
          } catch (error) {
            toast.error(error.response?.data?.message || "Payment verification failed");
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: cardForm.name,
          email: cardForm.email,
          contact: cardForm.contact
        },
        theme: {
          color: "#0d38b8"
        },
        modal: {
          ondismiss: () => {
            setPlacingOrder(false);
            toast("Payment window closed", { icon: "i" });
          }
        }
      });

      razorpayInstance.open();
    } catch (error) {
      setPlacingOrder(false);
      toast.error(error.response?.data?.message || error.message || "Unable to start Razorpay payment");
    }
  };

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar cartCount={cartCount} />

        {invalidCartItems.length > 0 && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Some old demo items in your cart are no longer valid after the catalog update.
            <button
              type="button"
              onClick={purgeInvalidCartItems}
              className="ml-3 rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white"
            >
              Remove invalid items
            </button>
          </div>
        )}

        {!cart.length ? (
          <div className="mt-8 rounded-[1.4rem] bg-white p-8 text-center shadow-sm">
            <PackageCheck size={40} className="mx-auto text-slate-300" />
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              No items ready for checkout
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Add products to the cart first, then return here to complete the order.
            </p>
            <Link
              to="/browse/categories"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
            >
              Browse Categories
            </Link>
          </div>
        ) : (
          <section className="mt-7">
            <div className="mb-8 grid grid-cols-3 items-center gap-4">
              {[
                { label: "Shipping", icon: Truck, active: true },
                { label: "Payment", icon: CreditCard, active: paymentModalOpen },
                { label: "Review", icon: ShieldCheck, active: paymentModalOpen }
              ].map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.label} className="relative flex flex-col items-center">
                    <span
                      className={`z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                        step.active ? "bg-[#0d38b8] text-white" : "bg-white text-[#0d38b8]"
                      }`}
                    >
                      <Icon size={15} />
                    </span>

                    {index < 2 && (
                      <span className="absolute left-1/2 top-4 h-px w-full bg-[#183ab5]/40" />
                    )}

                    <p className="mt-2 text-[11px] font-bold text-slate-900">
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.25fr_0.85fr]">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black tracking-tight text-slate-950">
                  Shipping Information
                </h1>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Field label="First Name">
                    <input
                      placeholder="John"
                      value={customer.firstName}
                      onChange={(event) =>
                        setCustomer({ ...customer, firstName: event.target.value })
                      }
                      className="checkout-input"
                    />
                  </Field>

                  <Field label="Last Name">
                    <input
                      placeholder="Doe"
                      value={customer.lastName}
                      onChange={(event) =>
                        setCustomer({ ...customer, lastName: event.target.value })
                      }
                      className="checkout-input"
                    />
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Address Line 1">
                    <div className="rounded-md border border-slate-200 p-1">
                      <input
                        placeholder="123 Performance Avenue"
                        value={customer.address.line1}
                        onChange={(event) =>
                          setCustomer({
                            ...customer,
                            address: {
                              ...customer.address,
                              line1: event.target.value
                            }
                          })
                        }
                        className="checkout-input"
                      />
                    </div>
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_0.9fr]">
                  <Field label="City">
                    <input
                      placeholder="Bengaluru"
                      value={customer.address.city}
                      onChange={(event) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address, city: event.target.value }
                        })
                      }
                      className="checkout-input"
                    />
                  </Field>

                  <Field label="State / Province">
                    <input
                      placeholder="Karnataka"
                      value={customer.address.state}
                      onChange={(event) =>
                        setCustomer({
                          ...customer,
                          address: { ...customer.address, state: event.target.value }
                        })
                      }
                      className="checkout-input"
                    />
                  </Field>

                  <Field label="Zip Code">
                    <input
                      placeholder="560001"
                      value={customer.address.pincode}
                      onChange={(event) =>
                        setCustomer({
                          ...customer,
                          address: {
                            ...customer.address,
                            pincode: event.target.value
                          }
                        })
                      }
                      className="checkout-input"
                    />
                  </Field>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Field label="Email">
                    <input
                      placeholder="john@enterprise.com"
                      value={customer.email}
                      onChange={(event) =>
                        setCustomer({ ...customer, email: event.target.value })
                      }
                      className="checkout-input"
                    />
                  </Field>

                  <Field label="Phone Number">
                    <input
                      placeholder="+91 99880 77665"
                      value={customer.phone}
                      onChange={(event) =>
                        setCustomer({ ...customer, phone: event.target.value })
                      }
                      className="checkout-input"
                    />
                  </Field>
                </div>

                <div className="mt-7">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-900">
                    Shipping Method
                  </p>

                  <div className="mt-4 space-y-3">
                    {shippingOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setShippingMethod(option.id)}
                        className={`w-full rounded-lg border px-4 py-4 text-left transition ${
                          shippingMethod === option.id
                            ? "border-[#0d38b8] bg-[#f5f7ff]"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-1 h-4 w-4 rounded-full border ${
                                shippingMethod === option.id
                                  ? "border-[#0d38b8] bg-[#0d38b8] shadow-[inset_0_0_0_4px_white]"
                                  : "border-slate-300 bg-white"
                              }`}
                            />
                            <div>
                              <p className="text-sm font-black text-slate-950">
                                {option.label}
                              </p>
                              <p className="mt-1 text-xs font-medium text-slate-500">
                                {option.description}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm font-black text-slate-950">
                            {option.price === 0
                              ? "FREE"
                              : `Rs. ${option.price.toLocaleString()}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex justify-end">
                  <button
                    onClick={handleContinueToPayment}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0d2fa8] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(13,47,168,0.25)] transition hover:-translate-y-0.5"
                  >
                    Continue to Payment
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              <aside className="overflow-hidden rounded-xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                <div className="bg-[#163fbd] px-5 py-3 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Lock size={14} />
                      <p className="text-[11px] font-black uppercase tracking-[0.18em]">
                        Secure Checkout
                      </p>
                    </div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold">
                      256-BIT SSL
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-black tracking-tight text-slate-950">
                      Order Summary
                    </h2>
                    <Link to="/cart" className="text-xs font-bold text-[#0d38b8]">
                      Edit Bag
                    </Link>
                  </div>

                  <div className="mt-6 space-y-5">
                    {cart.map((item) => (
                      <div key={item._id} className="flex items-start gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-black text-slate-950">
                                {item.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.category?.name || item.sector || "Product"}
                              </p>
                              <p className="text-xs text-slate-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-black text-slate-950">
                              Rs. {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 space-y-4 text-sm">
                    <SummaryRow label="Subtotal" value={`Rs. ${cartTotal.toLocaleString()}`} />
                    <SummaryRow
                      label="Shipping"
                      value={
                        shippingCost === 0
                          ? "Free"
                          : `Rs. ${shippingCost.toLocaleString()}`
                      }
                      green={shippingCost === 0}
                    />
                    <SummaryRow
                      label="Estimated Taxes"
                      value={`Rs. ${estimatedTaxes.toLocaleString()}`}
                    />
                    {codCharge > 0 && (
                      <SummaryRow
                        label="COD Charge"
                        value={`Rs. ${codCharge.toLocaleString()}`}
                      />
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xl font-black tracking-tight text-slate-950">
                      Total
                    </span>
                    <span className="text-2xl font-black tracking-tight text-[#0d38b8]">
                      Rs. {grandTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <input
                      value={promoCode}
                      onChange={(event) => setPromoCode(event.target.value)}
                      placeholder="Promo Code"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0d38b8]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          promoCode
                            ? `Promo "${promoCode}" checked`
                            : "Enter a promo code first"
                        )
                      }
                      className="rounded-lg border border-[#0d38b8] bg-white px-4 py-3 text-sm font-bold text-[#0d38b8]"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <InfoBadge icon={BadgeCheck} text="1 Year Warranty" />
                    <InfoBadge icon={MapPin} text="30 Day Returns" />
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {paymentModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4 py-6">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.8rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.34)]">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">
                    Payment Options
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Confirm how you want to pay
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Choose Razorpay for instant confirmation or cash on delivery with a minimal handling charge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="rounded-2xl border border-slate-200 p-3 text-slate-500 transition hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="space-y-3">
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      const active = paymentMethod === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPaymentMethod(option.id)}
                          className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                            active ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                                <Icon size={18} />
                              </span>
                              <div>
                                <p className="text-sm font-black text-slate-950">
                                  {option.label}
                                </p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            <p className="text-sm font-black text-slate-950">
                              {option.charge ? `+ Rs. ${option.charge}` : "No extra fee"}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {paymentMethod === "razorpay" && (
                    <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-[#072654] px-3 py-2 text-sm font-black text-white">
                          Razorpay
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          Secure UPI, cards, netbanking, and wallets
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Field label="Payer Name">
                          <input
                            value={cardForm.name}
                            onChange={(event) =>
                              setCardForm((current) => ({ ...current, name: event.target.value }))
                            }
                            placeholder="Name on payment"
                            className="checkout-input"
                          />
                        </Field>

                        <Field label="Mobile Number">
                          <input
                            value={cardForm.contact}
                            onChange={(event) =>
                              setCardForm((current) => ({ ...current, contact: event.target.value }))
                            }
                            placeholder="+91 98765 43210"
                            className="checkout-input"
                          />
                        </Field>
                      </div>

                      <div className="mt-4">
                        <Field label="Email">
                          <input
                            value={cardForm.email}
                            onChange={(event) =>
                              setCardForm((current) => ({ ...current, email: event.target.value }))
                            }
                            placeholder="payment@example.com"
                            className="checkout-input"
                          />
                        </Field>
                      </div>

                      <p className="mt-4 text-xs leading-6 text-slate-500">
                        {razorpayReady && razorpayKey
                          ? "Your browser is ready to launch the Razorpay test-mode payment window."
                          : "Razorpay test keys are not configured yet. Add them in server/.env and client/.env, then restart both apps."}
                      </p>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
                      <p className="text-sm font-black text-slate-950">Cash on Delivery selected</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        A minimal COD handling charge of Rs. {selectedPayment.charge} will be added. Your order will be confirmed now and the payment status will switch to paid when delivery is completed.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-black text-slate-950">Review Payment</h3>
                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <SummaryRow label="Subtotal" value={`Rs. ${cartTotal.toLocaleString()}`} />
                    <SummaryRow label="Shipping" value={shippingCost ? `Rs. ${shippingCost.toLocaleString()}` : "Free"} green={!shippingCost} />
                    <SummaryRow label="Taxes" value={`Rs. ${estimatedTaxes.toLocaleString()}`} />
                    <SummaryRow label="Payment Method" value={selectedPayment.label} />
                    {paymentMethod === "cod" && (
                      <SummaryRow label="COD Charge" value={`Rs. ${selectedPayment.charge.toLocaleString()}`} />
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl bg-white px-4 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-600">Grand Total</span>
                      <span className="text-2xl font-black text-[#0d38b8]">
                        Rs. {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={paymentMethod === "cod" ? handleCodOrder : handleRazorpayOrder}
                    disabled={placingOrder}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#07132d_0%,#163fbd_50%,#2563eb_100%)] px-4 py-3.5 font-semibold text-white shadow-[0_18px_30px_rgba(37,99,235,0.2)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {paymentMethod === "cod" ? <Truck size={16} /> : <IndianRupee size={16} />}
                    {placingOrder
                      ? "Confirming order..."
                      : paymentMethod === "cod"
                        ? "Confirm Cash on Delivery"
                        : "Pay Securely"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Back to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <PublicFooter />
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-2 block text-[11px] font-black text-slate-950">
      {label}
    </label>
    {children}
  </div>
);

const SummaryRow = ({ label, value, green = false }) => (
  <div className="flex items-center justify-between text-slate-600">
    <span>{label}</span>
    <span className={green ? "font-semibold text-emerald-600" : "text-slate-950"}>
      {value}
    </span>
  </div>
);

const InfoBadge = ({ icon: Icon, text }) => (
  <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
      <Icon size={13} className="text-[#0d38b8]" />
      {text}
    </div>
  </div>
);

export default Checkout;

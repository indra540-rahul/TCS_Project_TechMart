import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import { useCart } from "../hooks/useCart";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (productId, nextQuantity) => {
    updateQuantity(productId, nextQuantity);
  };

  const handleRemove = (productId, name) => {
    removeFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar cartCount={cartCount} />

        <section className="mt-8">
          <div className="mb-7 rounded-[1.8rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.28),transparent_30%),linear-gradient(135deg,#ffffff_0%,#eff6ff_45%,#e0f2fe_100%)] px-6 py-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:px-8">
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <p className="text-xs font-black uppercase tracking-[0.34em] text-blue-700">
        Shopping Cart
      </p>

      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        Review Your Bag
      </h1>

      <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
        Update quantities, remove products, or continue to secure checkout.
      </p>
    </div>

    <span className="rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
      {cartCount} items
    </span>
  </div>
</div>

          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.6rem] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6">
              {!cart.length ? (
                <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <ShoppingBag size={42} className="mx-auto text-slate-300" />
                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    Your cart is empty
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Browse categories and add products before checkout.
                  </p>

                  <Link
                    to="/browse/categories"
                    className="mt-6 inline-flex rounded-xl bg-slate-400 px-5 py-3 text-slate-100 text-sm font-bold transition hover:-translate-y-0.5"
                  >
                    Browse Categories
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <article
                      key={item._id}
                      className="group rounded-[1.3rem] border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-28 w-28 rounded-2xl object-cover ring-1 ring-slate-100"
                          />

                          <div className="min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                              {item.category?.name || item.sector || "Product"}
                            </p>

                            <h3 className="mt-2 text-lg font-black leading-6 text-slate-950">
                              {item.name}
                            </h3>

                            <p className="mt-2 text-sm font-medium text-slate-500">
                              Rs. {Number(item.price || 0).toLocaleString()} each
                            </p>

                            <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 md:justify-end">
                          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-700"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-10 text-center text-sm font-black text-slate-950">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white hover:text-blue-700"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <p className="min-w-32 text-right text-xl font-black text-slate-950">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </p>

                          <button
                            onClick={() => handleRemove(item._id, item.name)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                            aria-label="Remove item"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="h-fit overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
              <div className="bg-[linear-gradient(90deg,#0f2c8e_0%,#1d4ed8_100%)] px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">
                    Secure Summary
                  </p>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-black tracking-tight text-slate-950">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <Row label="Items" value={cartCount} />
                  <Row label="Subtotal" value={`Rs. ${cartTotal.toLocaleString()}`} />
                  <Row label="Delivery" value="Calculated at checkout" muted />
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="font-bold text-slate-700">Estimated Total</span>
                  <span className="text-3xl font-black text-blue-700">
                    Rs. {cartTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={!cart.length}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#020617_0%,#0f172a_35%,#1d4ed8_100%)] px-4 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>

                <Link
                  to="/browse/categories"
                  className="mt-3 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Keep Shopping
                </Link>

                <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-xs font-semibold leading-5 text-blue-700">
                  Your cart is saved locally, so items remain available while browsing.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
};

const Row = ({ label, value, muted = false }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={muted ? "font-semibold text-slate-500" : "font-bold text-slate-950"}>
      {value}
    </span>
  </div>
);

export default Cart;

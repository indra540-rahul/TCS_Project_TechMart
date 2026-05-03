import {
  ArrowLeftRight,
  ArrowRight,
  Box,
  Code2,
  CreditCard,
  Inbox,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  Truck,
  UserCircle
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import { useCustomerAuth } from "../context/CustomerAuthContext";

const helpSections = [
  {
    title: "Orders",
    description: "Track shipments, review order history, and monitor delivery progress.",
    icon: Inbox,
    color: "blue",
    actionLabel: "Open Orders",
    keywords: ["orders", "tracking", "shipment", "delivery", "history"]
  },
  {
    title: "Returns",
    description: "Start a return or exchange request for eligible electronics orders.",
    icon: ArrowLeftRight,
    color: "orange",
    actionLabel: "Request Return",
    keywords: ["returns", "exchange", "refund", "replace"]
  },
  {
    title: "Account",
    description: "Manage login access, profile details, security, and saved addresses.",
    icon: UserCircle,
    color: "purple",
    actionLabel: "Manage Account",
    keywords: ["account", "profile", "login", "password", "security"]
  },
  {
    title: "Payments",
    description: "Get help with Razorpay test payments, COD, invoices, and charge issues.",
    icon: CreditCard,
    color: "emerald",
    actionLabel: "Payment Support",
    keywords: ["payments", "razorpay", "cod", "invoice", "charge"]
  },
  {
    title: "Technical",
    description: "Troubleshoot checkout, customer workspace, order tracking, and support flows.",
    icon: Code2,
    color: "slate",
    actionLabel: "Troubleshooting",
    keywords: ["technical", "api", "bug", "issue", "checkout", "frontend", "backend"]
  }
];

const helpArticles = [
  {
    title: "Track an order after checkout",
    description: "Use the customer account tracking tab or public tracking page with your full order ID.",
    section: "Orders",
    cta: "/track-order"
  },
  {
    title: "View your order history",
    description: "Signed-in customers can see their complete order list from the account workspace.",
    section: "Orders",
    cta: "/account?tab=orders"
  },
  {
    title: "Request help for returns or exchanges",
    description: "Open the contact flow with a return-focused subject so support can follow up faster.",
    section: "Returns",
    cta: "/contact?subject=Returns%20%26%20Exchanges"
  },
  {
    title: "Reset your customer password",
    description: "Use the shopper recovery flow on the login page to receive a code by email or phone.",
    section: "Account",
    cta: "/login"
  },
  {
    title: "Understand Razorpay and COD payment options",
    description: "Checkout supports Razorpay test mode and cash on delivery with a minimal charge.",
    section: "Payments",
    cta: "/checkout"
  },
  {
    title: "Report a technical issue",
    description: "Open a support ticket for frontend, backend, tracking, or payment problems.",
    section: "Technical",
    cta: "/contact?subject=Technical%20Support"
  }
];

const statusItems = [
  { label: "Payments", value: "Operational", tone: "bg-emerald-100 text-emerald-700" },
  { label: "Tracking", value: "Live", tone: "bg-blue-100 text-blue-700" },
  { label: "Customer Support", value: "Available", tone: "bg-violet-100 text-violet-700" }
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const { customer } = useCustomerAuth();
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return helpSections;
    }

    return helpSections.filter((section) =>
      [section.title, section.description, ...section.keywords].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search]);

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return helpArticles;
    }

    return helpArticles.filter((article) =>
      [article.title, article.description, article.section].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [search]);

  const openSection = (sectionTitle) => {
    if (sectionTitle === "Orders") {
      navigate(customer ? "/account?tab=orders" : "/order-history");
      return;
    }

    if (sectionTitle === "Returns") {
      navigate("/contact?subject=Returns%20%26%20Exchanges");
      return;
    }

    if (sectionTitle === "Account") {
      navigate(customer ? "/account?tab=profile" : "/login");
      return;
    }

    if (sectionTitle === "Payments") {
      navigate("/contact?subject=Payment%20Support");
      return;
    }

    navigate("/contact?subject=Technical%20Support");
  };

  return (
    <div className="page-shell min-h-screen bg-[#f4f7ff]">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar />

        <section className="mt-8 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#07359b_0%,#0f4bcf_55%,#2dd4bf_100%)] px-6 pb-20 pt-10 text-center text-white shadow-[0_22px_50px_rgba(15,23,42,0.16)]">
          <h1 className="text-[34px] font-black tracking-tight">
            How can we help?
          </h1>

          <div className="mx-auto mt-7 flex h-[56px] max-w-[620px] items-center gap-3 rounded-xl bg-white px-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for orders, returns, account, payments, or technical help..."
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <p className="mt-6 text-xs text-blue-100">
            Popular:
            <button type="button" onClick={() => setSearch("Reset password")} className="ml-3 font-bold text-white">
              Reset password
            </button>
            <button type="button" onClick={() => setSearch("Track order")} className="ml-3 font-bold text-white">
              Track order
            </button>
            <button type="button" onClick={() => setSearch("Razorpay")} className="ml-3 font-bold text-white">
              Razorpay
            </button>
          </p>
        </section>

        <section className="-mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {filteredSections.map((section) => (
            <HelpCard
              key={section.title}
              icon={section.icon}
              title={section.title}
              desc={section.description}
              color={section.color}
              actionLabel={section.actionLabel}
              onClick={() => openSection(section.title)}
            />
          ))}
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-[0.8fr_2.2fr]">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              System Status
            </p>
            <div className="mt-5 space-y-3">
              {statusItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${item.tone}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid items-center gap-8 md:grid-cols-[1.35fr_0.85fr]">
              <div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-black text-red-500">
                  Enterprise Support
                </span>

                <h2 className="mt-4 text-[28px] font-black text-slate-950">
                  Fast paths for real support actions
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
                  Open your order history, request return help, fix account access,
                  or move straight into payment support without dead-end buttons.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={customer ? "/account?tab=orders" : "/order-history"}
                    className="rounded-xl bg-[#06339b] px-6 py-3 text-sm font-bold text-white"
                  >
                    Open Orders
                  </Link>
                  <Link
                    to="/contact?subject=Technical%20Support"
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700"
                  >
                    Open Support Ticket
                  </Link>
                </div>
              </div>

              <div className="h-[210px] overflow-hidden rounded-[1.5rem] border border-slate-300 bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=900&auto=format&fit=crop"
                  alt="Support dashboard"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[1.8rem] border border-slate-200 bg-[#eef4ff] px-6 py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[26px] font-black text-slate-950">
                Suggested Articles
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Search-aware help links that route into working parts of the app.
              </p>
            </div>
            {!!search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-sm font-semibold text-blue-700"
              >
                Clear search
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <Link
                key={article.title}
                to={article.cta}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_36px_rgba(37,99,235,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                      {article.section}
                    </p>
                    <h3 className="mt-3 text-lg font-black text-slate-950">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {article.description}
                    </p>
                  </div>
                  <ArrowRight size={18} className="text-slate-400 transition group-hover:text-blue-700" />
                </div>
              </Link>
            ))}
          </div>

          {!filteredArticles.length && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
              No help articles matched your search yet. Try broader keywords like
              `order`, `payment`, `account`, or `return`.
            </div>
          )}
        </section>

        <section className="mt-8 rounded-[1.8rem] border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-[26px] font-black text-slate-950">
            Still need help?
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Reach the support team through routes that already work in the app.
          </p>

          <div className="mx-auto mt-10 grid max-w-[760px] gap-8 md:grid-cols-2">
            <ContactCard
              icon={MessageSquare}
              title="Live Chat Request"
              desc="Start a support conversation through our contact flow. Average first reply:"
              highlight="within 2 business hours"
              button="Start Support Request"
              filled
              to="/contact?subject=Live%20Chat%20Request"
            />

            <ContactCard
              icon={Mail}
              title="Email Support"
              desc="Open a prefilled technical ticket and our team will respond within"
              highlight="24 business hours"
              button="Open Ticket"
              to="/contact?subject=Technical%20Support"
            />
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
};

const HelpCard = ({ icon: Icon, title, desc, actionLabel, color = "blue", onClick }) => {
  const iconBg =
    color === "orange"
      ? "bg-orange-100 text-orange-600"
      : color === "purple"
        ? "bg-violet-100 text-violet-600"
        : color === "emerald"
          ? "bg-emerald-100 text-emerald-700"
          : color === "slate"
            ? "bg-slate-100 text-slate-700"
            : "bg-blue-100 text-blue-700";

  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[220px] rounded-[1.6rem] border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)]"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={22} />
        </span>
        <ArrowRight size={18} className="text-slate-400" />
      </div>

      <h3 className="mt-8 text-[24px] font-black text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>
      <p className="mt-5 text-sm font-bold text-blue-700">{actionLabel}</p>
    </button>
  );
};

const ContactCard = ({ icon: Icon, title, desc, highlight, button, filled, to }) => (
  <Link
    to={to}
    className="rounded-xl border border-slate-200 bg-white px-9 py-8 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.08)]"
  >
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
      <Icon size={26} />
    </span>

    <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
    <p className="mt-3 text-xs leading-5 text-slate-500">
      {desc} <br />
      <span className="font-black text-blue-700">{highlight}</span>
    </p>

    <span
      className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-md text-sm font-bold ${
        filled
          ? "bg-[#06339b] text-white"
          : "border-2 border-indigo-500 bg-white text-indigo-600"
      }`}
    >
      {button}
    </span>
  </Link>
);

export default HelpCenter;

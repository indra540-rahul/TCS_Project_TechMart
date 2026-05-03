import { ArrowUpRight, BriefcaseBusiness, Globe2, Headset, Mail, MapPinned, PhoneCall, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import api from "../services/api";

const supportCards = [
  {
    title: "Sales",
    description: "Expert guidance for high-volume commerce strategies.",
    cta: "Talk to Sales",
    icon: BriefcaseBusiness
  },
  {
    title: "Support",
    description: "24/7 technical assistance for your operations.",
    cta: "Get Help",
    icon: Headset
  },
  {
    title: "Partners",
    description: "Join our ecosystem of innovators and developers.",
    cta: "Join Us",
    icon: Globe2
  }
];

const offices = [
  {
    region: "North America",
    city: "San Francisco",
    address: ["123 Tech Plaza, Suite 500", "California, CA 94105"]
  },
  {
    region: "Europe",
    city: "London",
    address: ["88 Innovation Way, Canary Wharf", "London, E14 5HQ"]
  }
];

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: searchParams.get("subject") || "General Inquiry",
    message: ""
  });

  useEffect(() => {
    const nextSubject = searchParams.get("subject");
    if (!nextSubject) {
      return;
    }

    setForm((current) => ({
      ...current,
      subject: nextSubject
    }));
  }, [searchParams]);

  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar />

        <section className="mt-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">Support Network</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Global Support Hub</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Whether you are scaling an enterprise or starting a shop, our global team is ready to engineer your success.
              Reach out through our specialized channels or visit our hubs.
            </p>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                {supportCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article key={card.title} className="glass-card rounded-[1.6rem] p-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon size={18} />
                      </span>
                      <h2 className="mt-5 text-xl font-bold text-slate-950">{card.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{card.description}</p>
                      <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                        {card.cta}
                        <ArrowUpRight size={15} />
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="glass-card rounded-[1.9rem] p-5">
                <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <iframe
                    title="TechMart Location Map"
                    src="https://www.google.com/maps?q=Bengaluru%20Warehouse&output=embed"
                    className="h-[420px] w-full"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {offices.map((office) => (
                    <div key={office.region}>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {office.region}
                      </p>
                      <h3 className="mt-3 text-lg font-bold text-slate-950">
                        {office.city}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                        {office.address.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="glass-card rounded-[1.9rem] p-6 sm:p-7">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Send a Message</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                A more premium intake flow for business conversations, support escalations,
                and partnership requests.
              </p>
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await api.post("/notifications/contact", form);
                    toast.success("Message submitted successfully");
                    setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
                  } catch (error) {
                    toast.error(error.response?.data?.message || "Unable to submit your message");
                  }
                }}
                className="mt-6 space-y-4"
              >
                <div className="group">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="John Doe"
                    className="contact-input"
                  />
                </div>
                <div className="group">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Work Email</label>
                  <input
                    value={form.email}
                    onChange={(event) => setForm({ ...form, email: event.target.value })}
                    placeholder="john@enterprise.com"
                    className="contact-input"
                  />
                </div>
                <div className="group">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(event) => setForm({ ...form, subject: event.target.value })}
                    className="contact-input"
                  >
                    <option>General Inquiry</option>
                    <option>Sales Question</option>
                    <option>Technical Support</option>
                    <option>Partner Request</option>
                    <option>Returns & Exchanges</option>
                    <option>Payment Support</option>
                    <option>Live Chat Request</option>
                  </select>
                </div>
                <div className="group">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea
                    rows="6"
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    placeholder="How can we help you achieve your goals?"
                    className="contact-input min-h-[160px] resize-none"
                  />
                </div>

                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#0f2c8e_0%,#1d4ed8_100%)] px-5 py-3.5 font-semibold text-white shadow-[0_18px_30px_rgba(29,78,216,0.22)] transition hover:-translate-y-0.5">
                  <SendHorizontal size={16} />
                  Send Message
                </button>
              </form>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-sm font-semibold text-slate-900">Connect with us</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    { icon: PhoneCall, text: "+91 99880 77665" },
                    { icon: Mail, text: "support@techmart.com" },
                    { icon: MapPinned, text: "Bengaluru Warehouse" }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                        <Icon size={15} className="text-blue-700" />
                        {item.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <PublicFooter />
      </div>
    </div>
  );
};

export default Contact;

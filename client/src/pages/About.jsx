import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";

const About = () => {
  return (
    <div className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-0 sm:px-6">
        <PublicNavbar />
        <section className="mt-8 grid gap-8 rounded-[2rem] bg-slate-950 px-8 py-14 text-white lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">About TechMart Pro</p>
            <h1 className="mt-4 text-4xl font-bold">An electronics business backed by a serious admin system.</h1>
            <p className="mt-5 text-slate-300">
              TechMart Pro is built around premium devices and accessories, with a strong operations backbone for inventory, order fulfilment, analytics, alerts, and role-based business control.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              "Premium electronics and accessories",
              "Fast fulfilment with stock-aware ordering",
              "Order tracking and customer history",
              "Admin-led business intelligence"
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>
        <PublicFooter />
      </div>
    </div>
  );
};

export default About;

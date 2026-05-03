import { Headphones, Mail, MapPin, PhoneCall } from "lucide-react";

const PublicFooter = () => {
  return (
    <footer className="relative left-1/2 right-1/2 mt-12 mb-[-2rem] w-screen -translate-x-1/2 border-t border-slate-800 bg-[linear-gradient(135deg,#006ECD_0%,#00FFA6_40%,#5FFBF1_100%)] text-white">
      <div className="grid w-full gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center bg-[linear-gradient(135deg,#1d4ed8,#06b6d4)] text-white">
              <Headphones size={21} />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">
                TechMart Pro
              </p>
              <p className="text-lg font-black text-white">Electronics Store</p>
            </div>
          </div>

          <h3 className="mt-6 max-w-md text-2xl font-black leading-tight tracking-tight">
            Reliable electronics. Strong admin operations.
          </h3>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
            Built for modern electronics shopping, fast checkout, smart cart flow,
            and smooth customer experience.
          </p>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
            Customer Support
          </p>

          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <p className="flex items-center gap-3">
              <Mail size={16} className="text-blue-600" />
              support@techmart.com
            </p>

            <p className="flex items-center gap-3">
              <PhoneCall size={16} className="text-blue-600" />
              +91 99880 77665
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">
            Warehouse
          </p>

          <p className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-700">
            <MapPin size={16} className="mt-1 text-blue-600" />
            Plot 18, Electronic City Hub, Bengaluru
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="flex w-full flex-col gap-3 px-4 py-5 text-xs font-medium text-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; 2026 TechMart Pro. All rights reserved.</p>
          <p>Secure shopping | Fast delivery | Reliable support</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

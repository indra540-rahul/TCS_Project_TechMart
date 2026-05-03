import { useEffect, useState } from "react";
import { BadgePercent, Building2, FileCog, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";

const Settings = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await api.get("/settings");
      setSettings(data);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await api.put("/settings", settings);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save settings");
    }
  };

  if (!settings) {
    return <div className="glass-card flex min-h-[16rem] items-center justify-center rounded-[1.75rem] p-6 text-slate-600">Loading settings...</div>;
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card rounded-[1.75rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Business configuration</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Business Settings</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Manage store identity, support channels, finance defaults, and fulfillment rules from one admin-only settings surface.</p>
          <div className="mt-5 grid gap-4">
            {[
              ["storeName", "Store Name"],
              ["supportEmail", "Support Email"],
              ["supportPhone", "Support Phone"],
              ["gstNumber", "GST Number"],
              ["warehouseAddress", "Warehouse Address"],
              ["currency", "Currency"],
              ["taxRate", "Tax Rate"],
              ["shippingFee", "Shipping Fee"],
              ["highDiscountApprovalLimit", "High Discount Approval Limit"]
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
                <input
                  value={settings[key]}
                  onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                />
              </div>
            ))}
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["allowGuestCheckout", "Allow Guest Checkout"],
                ["lowStockNotificationEnabled", "Low Stock Notifications"]
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })}
                  />
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            <button onClick={handleSave} className="rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_40%,#22d3ee_100%)] px-5 py-3 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.24)]">
              Save Settings
            </button>
          </div>
        </div>

        <div className="glass-card rounded-[1.75rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Governance</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Admin Control Center</h3>
          <div className="mt-5 space-y-4">
            {[
              {
                icon: Building2,
                title: "Store Identity",
                body: `Store branding, support contacts, GST, and warehouse details define how TechMart Pro appears across operations and customer communication.`
              },
              {
                icon: BadgePercent,
                title: "Approval Safeguards",
                body: `Discount requests above ${settings.highDiscountApprovalLimit || 0} require stricter admin review, reducing margin leakage and untracked approvals.`
              },
              {
                icon: Truck,
                title: "Fulfillment Rules",
                body: `Shipping fee, guest checkout policy, and low-stock alerts influence checkout flow, order quality, and replenishment responsiveness.`
              },
              {
                icon: FileCog,
                title: "Audit Visibility",
                body: "Settings changes, user provisioning, inventory adjustments, and order workflow actions remain traceable through the audit log."
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.4rem] border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck size={16} />
                Admin-only module
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Managers are intentionally excluded from this section so sensitive configuration stays under direct admin governance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;

import { Search, ShieldCheck, UserCog, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", avatar: "", status: "active" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchUsers = async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await api.post("/users/create-manager", form);
      toast.success("Manager account created");
      setForm({ name: "", email: "", phone: "", password: "", avatar: "", status: "active" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create manager");
    }
  };

  const handleStatusUpdate = async (userId, nextStatus) => {
    try {
      await api.put(`/users/${userId}/status`, { status: nextStatus });
      toast.success(`User marked as ${nextStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update user status");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const totalManagers = users.filter((user) => user.role === "manager").length;
  const totalAdmins = users.filter((user) => user.role === "admin").length;
  const activeUsers = users.filter((user) => user.status === "active").length;

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Users", value: users.length, icon: Users, tone: "bg-cyan-100 text-cyan-700" },
          { label: "Managers", value: totalManagers, icon: UserCog, tone: "bg-indigo-100 text-indigo-700" },
          { label: "Active Accounts", value: activeUsers, icon: ShieldCheck, tone: "bg-emerald-100 text-emerald-700" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-card rounded-[1.5rem] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
                </div>
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}>
                  <Icon size={22} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form onSubmit={handleCreate} className="glass-card rounded-[1.75rem] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Admin provisioning</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Create Manager Account</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Provision manager access with the right starting status so operations can begin without sharing admin credentials.</p>
          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
              <input
                placeholder="Operations Manager"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Work Email</label>
              <input
                type="email"
                placeholder="manager@techmart.com"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
              <input
                placeholder="9876500003"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Temporary Password</label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Avatar URL</label>
              <input
                placeholder="https://example.com/avatar.png"
                value={form.avatar}
                onChange={(event) => setForm({ ...form, avatar: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </div>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Managers can operate products, orders, inventory, reports, and notifications. Sensitive admin-only controls remain restricted.
            </div>
            <button className="rounded-2xl bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_40%,#22d3ee_100%)] px-5 py-3 font-semibold text-white shadow-[0_20px_35px_rgba(37,99,235,0.24)]">
              Create Manager
            </button>
          </div>
        </form>

        <div className="glass-card rounded-[1.75rem] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Access directory</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">System Users</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search users"
                  className="bg-transparent text-sm"
                />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-base font-bold text-cyan-700">
                        {(user.name || "U")
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        {user.phone && <p className="text-sm text-slate-400">{user.phone}</p>}
                      </div>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Created {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-col gap-3 md:items-end">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${user.role === "admin" ? "bg-slate-900 text-white" : "bg-indigo-100 text-indigo-700"}`}>
                        {user.role}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Status</span>
                      <select
                        value={user.status}
                        onChange={(event) => handleStatusUpdate(user._id, event.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!filteredUsers.length && (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-500">
                No users matched the current filters.
              </div>
            )}
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Role coverage</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{totalAdmins}</span> admin accounts retain governance, settings, and audit access.
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{totalManagers}</span> manager accounts handle day-to-day operations without elevated control.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserManagement;

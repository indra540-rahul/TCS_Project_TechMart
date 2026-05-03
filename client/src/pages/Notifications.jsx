import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const { data } = await api.get("/notifications");
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <>
      <div className="glass-card rounded-[1.75rem] p-5">
        <h3 className="mb-5 text-lg font-bold text-slate-900">Notifications</h3>
        <div className="space-y-4">
          {notifications.map((item) => (
            <div key={item._id} className={`rounded-2xl border p-4 ${item.isRead ? "border-slate-100 bg-white" : "border-indigo-200 bg-indigo-50"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.message}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">{item.type}</p>
                </div>
                <div className="flex gap-2">
                  {!item.isRead && (
                    <button
                      onClick={async () => {
                        await api.put(`/notifications/${item._id}/read`);
                        toast.success("Notification marked as read");
                        fetchNotifications();
                      }}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Mark Read
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <button
                      onClick={async () => {
                        await api.delete(`/notifications/${item._id}`);
                        toast.success("Notification removed");
                        fetchNotifications();
                      }}
                      className="rounded-xl bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Notifications;

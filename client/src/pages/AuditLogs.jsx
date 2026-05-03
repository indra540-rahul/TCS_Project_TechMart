import { useEffect, useState } from "react";
import api from "../services/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await api.get("/audit-logs");
      setLogs(data);
    };
    fetchLogs();
  }, []);

  return (
    <>
      <div className="glass-card rounded-[1.75rem] p-6">
        <h3 className="text-xl font-bold text-slate-900">Audit Logs</h3>
        <div className="mt-5 space-y-4">
          {logs.map((log) => (
            <div key={log._id} className="rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{log.action}</p>
                  <p className="text-sm text-slate-500">
                    {log.user?.name || "System"} | {log.role} | {log.module}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{log.details}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AuditLogs;

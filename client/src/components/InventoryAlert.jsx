const InventoryAlert = ({ suggestions }) => (
  <div className="glass-card rounded-[1.75rem] p-5">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">Procurement cues</p>
        <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Smart Reorder Suggestions</h3>
      </div>
      <p className="text-sm text-slate-500">{suggestions.length} recommendations</p>
    </div>

    <div className="space-y-3">
      {suggestions.map((item) => (
        <div key={item._id} className="rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(135deg,#fff8e6,#fffdf7)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.predictedDemand === "High" ? "bg-rose-100 text-rose-700" : item.predictedDemand === "Medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {item.predictedDemand} demand
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Stock {item.stock} | Threshold {item.lowStockLimit} | Avg sold {Number(item.averageSoldQuantity || 0).toFixed(1)}
              </p>
              <p className="mt-3 text-sm leading-6 text-amber-900">{item.reason}</p>
            </div>
            <div className="rounded-2xl bg-white/90 px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Recommended Qty</p>
              <p className="mt-1 text-3xl font-black text-amber-800">{item.recommendedReorderQty}</p>
            </div>
          </div>
        </div>
      ))}

      {!suggestions.length && <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">No reorder suggestions right now.</p>}
    </div>
  </div>
);

export default InventoryAlert;

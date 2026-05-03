const StatCard = ({ title, value, subtitle, accent = "from-indigo-600 to-violet-500" }) => {
  return (
    <div className="glass-card rounded-[1.75rem] p-5">
      <div className={`mb-4 h-2 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
};

export default StatCard;

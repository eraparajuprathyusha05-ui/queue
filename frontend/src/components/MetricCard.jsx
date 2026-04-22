const accentStyles = {
  cyan: "from-cyan-400/30 to-cyan-500/5 border-cyan-300/20 text-cyan-100",
  amber: "from-amber-400/30 to-amber-500/5 border-amber-300/20 text-amber-100",
  emerald: "from-emerald-400/30 to-emerald-500/5 border-emerald-300/20 text-emerald-100",
  rose: "from-rose-400/30 to-rose-500/5 border-rose-300/20 text-rose-100",
};

function MetricCard({ accent = "cyan", label, suffix = "", value }) {
  return (
    <div
      className={`rounded-3xl border bg-gradient-to-br p-5 shadow-lg ${accentStyles[accent]}`}
    >
      <p className="font-body text-sm text-slate-300">{label}</p>
      <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-white">
        {value}
        <span className="text-lg text-slate-300">{suffix}</span>
      </p>
    </div>
  );
}

export default MetricCard;

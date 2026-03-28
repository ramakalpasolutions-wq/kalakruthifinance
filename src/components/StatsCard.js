export default function StatsCard({ title, amount, icon, variant, subtitle, isNumber = false }) {
  const variants = {
    primary: 'bg-white border-l-4 border-l-indigo-500',
    success: 'bg-white border-l-4 border-l-emerald-500',
    danger: 'bg-white border-l-4 border-l-rose-500',
    warning: 'bg-white border-l-4 border-l-amber-500',
    info: 'bg-white border-l-4 border-l-sky-500',
    neutral: 'bg-white border-l-4 border-l-slate-500'
  }

  const iconBg = {
    primary: 'bg-indigo-50 text-indigo-600',
    success: 'bg-emerald-50 text-emerald-600',
    danger: 'bg-rose-50 text-rose-600',
    warning: 'bg-amber-50 text-amber-600',
    info: 'bg-sky-50 text-sky-600',
    neutral: 'bg-slate-50 text-slate-600'
  }

  const amountColor = {
    primary: 'text-indigo-600',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
    warning: 'text-amber-600',
    info: 'text-sky-600',
    neutral: 'text-slate-600'
  }

  return (
    <div className={`${variants[variant]} rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className={`text-2xl text-black font-bold mt-2 ${amountColor[variant]}`}>
            {isNumber ? amount : `₹${(amount || 0).toLocaleString()}`}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg[variant]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}
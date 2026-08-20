import { Lock } from 'lucide-react'

const badgeStyles = {
  admitted: 'bg-blue-100 text-blue-700',
  stable: 'bg-emerald-100 text-emerald-800',
  discharged: 'bg-slate-100 text-slate-600',
  critical: 'bg-red-100 text-red-800',
  active: 'bg-emerald-100 text-emerald-800',
  blocked: 'bg-red-100 text-red-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  error: 'bg-red-100 text-red-800',
}

export function Badge({ tone = 'discharged', children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${badgeStyles[tone] || badgeStyles.discharged}`}>
      {children}
    </span>
  )
}

export function EncBadge({ size = "md" }) {
  if (size === "sm") {
    return (
      <span className="inline-flex items-center gap-0.5 bg-emerald-600 text-white px-1.5 py-[1px] rounded-full text-[9.5px] font-semibold">
        <Lock size={9} />
        AES-256
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
      <Lock size={11} />
      AES-256
    </span>
  );
}

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-colors'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200',
    teal: 'bg-teal-500 text-white hover:bg-teal-600',
  }
  const sizes = { sm: 'px-3 py-1.5 text-[13px]', md: 'px-4 py-2 text-sm' }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Card({ className = "", children, ...rest }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
export function Progress({ value, className = '', color = '#2563eb' }) {
  return (
    <div className={`w-full h-1.5 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}
export function Toggle({ on, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-[42px] h-6 rounded-full relative transition-colors flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span
        className="absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform"
        style={{ left: 3, transform: on ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  )
}
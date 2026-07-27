import { useNavigate } from 'react-router-dom'
import {
  ShieldX, SearchX, ServerCrash, ArrowLeft, Home, Search,
  ShieldAlert, AlertTriangle, RefreshCw, LifeBuoy,
} from 'lucide-react'
import { hospital } from '../lib/mockData'

const variants = {
  403: {
    icon: ShieldX,
    iconBg: 'linear-gradient(135deg, #FEE2E2, #FECACA)',
    iconColor: '#DC2626',
    shadow: 'rgba(239,68,68,.12)',
    codeColor: '#EF4444',
    title: 'Access Forbidden',
    desc: 'You do not have permission to access this resource. This incident has been logged.',
    note: { bg: '#FEE2E2', border: '#FECACA', color: '#991B1B', icon: ShieldAlert, iconColor: '#DC2626', text: 'Access attempt recorded · Ref: SEC-20260714-9841 · Contact your system administrator if you believe this is an error.' },
    actions: ['back', 'dashboard'],
  },
  404: {
    icon: SearchX,
    iconBg: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
    iconColor: '#2563EB',
    shadow: 'rgba(37,99,235,.1)',
    codeColor: '#2563EB',
    title: 'Page Not Found',
    desc: 'The patient record or page you are looking for does not exist or may have been moved.',
    actions: ['back', 'dashboard', 'search'],
  },
  500: {
    icon: ServerCrash,
    iconBg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    iconColor: '#D97706',
    shadow: 'rgba(217,119,6,.12)',
    codeColor: '#D97706',
    title: 'Internal Server Error',
    desc: 'Something went wrong on our end. Our team has been automatically notified and is investigating the issue.',
    note: { bg: '#FEF3C7', border: '#FDE68A', color: '#92400E', icon: AlertTriangle, iconColor: '#D97706', text: 'Incident ID: INC-20260714-0042 · All patient data is safe. Services auto-recovering. Est. resolution: <5 minutes.' },
    actions: ['retry', 'dashboard', 'support'],
  },
}

export default function ErrorPage({ code }) {
  const navigate = useNavigate()
  const v = variants[code]

  const actionMap = {
    back: { icon: ArrowLeft, label: 'Go Back', onClick: () => navigate(-1), primary: false },
    dashboard: { icon: Home, label: 'Return to Dashboard', onClick: () => navigate('/dashboard'), primary: true },
    search: { icon: Search, label: 'Search Records', onClick: () => navigate('/records'), primary: false },
    retry: { icon: RefreshCw, label: 'Retry', onClick: () => window.location.reload(), primary: false },
    support: { icon: LifeBuoy, label: 'Contact Support', onClick: () => navigate('/settings'), primary: false },
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
      <div
        className="w-[120px] h-[120px] rounded-[28px] flex items-center justify-center mb-7"
        style={{ background: v.iconBg, boxShadow: `0 16px 48px ${v.shadow}` }}
      >
        <v.icon size={56} style={{ color: v.iconColor }} />
      </div>
      <div className="font-display text-7xl font-extrabold leading-none mb-3" style={{ color: v.codeColor }}>{code}</div>
      <div className="font-display text-2xl font-bold text-slate-800 mb-2.5">{v.title}</div>
      <p className="text-[15px] text-slate-500 leading-relaxed max-w-[420px]" style={{ marginBottom: v.note ? 10 : 28 }}>{v.desc}</p>

      {v.note && (
        <div
          className="rounded-[10px] flex gap-2.5 items-start text-left max-w-[420px] mb-7"
          style={{ background: v.note.bg, border: `1px solid ${v.note.border}`, padding: '12px 20px' }}
        >
          <v.note.icon size={16} style={{ color: v.note.iconColor }} className="flex-shrink-0 mt-0.5" />
          <div className="text-[13px]" style={{ color: v.note.color }}>{v.note.text}</div>
        </div>
      )}

      <div className="flex gap-3">
        {v.actions.map((key) => {
          const a = actionMap[key]
          return (
            <button
              key={key}
              onClick={a.onClick}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
                a.primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <a.icon size={16} />
              {a.label}
            </button>
          )
        })}
      </div>

      <div className="mt-8 text-xs text-slate-300">MedVault v1.0.0 · {hospital}</div>
    </div>
  )
}
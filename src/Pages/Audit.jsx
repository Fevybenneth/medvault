import { useState, useMemo } from 'react'
import {
  Calendar, Download, ShieldCheck, LogIn, AlertTriangle, Key,
  Search, UserPlus, Eye, UploadCloud, Database,
} from 'lucide-react'
import { auditLogs } from '../lib/mockData'
import { Badge, Card } from '../components/ui'
import { useToast } from '../components/Toast'

const actionIcons = {
  'Patient Admitted': { icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
  'Record Viewed': { icon: Eye, bg: 'bg-violet-50', color: 'text-violet-600' },
  'Failed Login (x3)': { icon: LogIn, bg: 'bg-red-50', color: 'text-red-600' },
  'Record Uploaded': { icon: UploadCloud, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  'Permission Changed': { icon: Key, bg: 'bg-amber-50', color: 'text-amber-600' },
  'Daily Backup': { icon: Database, bg: 'bg-sky-50', color: 'text-sky-600' },
}

const roleBadgeStyle = {
  doctor: 'bg-blue-100 text-blue-700',
  admin: 'bg-violet-100 text-violet-800',
  failed: 'bg-red-100 text-red-800',
  system: 'bg-sky-100 text-sky-700',
}

const statusTone = { Success: 'success', Blocked: 'failed', Review: 'warning' }

const filters = ['All Events', 'Login', 'Record Access', 'Upload', 'Failed']

function matchesFilter(log, filter) {
  if (filter === 'All Events') return true
  if (filter === 'Login') return log.action.toLowerCase().includes('login')
  if (filter === 'Record Access') return log.action === 'Record Viewed'
  if (filter === 'Upload') return log.action === 'Record Uploaded'
  if (filter === 'Failed') return log.status === 'Blocked'
  return true
}

function downloadCSV(rows) {
  const header = 'Timestamp,User,Role,Action,Target,IP,Status\n'
  const body = rows.map((r) => `${r.time},${r.user},${r.role},${r.action},${r.target},${r.ip},${r.status}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medvault_audit_logs.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Audit() {
  const showToast = useToast()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Events')
  const [dateFrom, setDateFrom] = useState('2026-07-08')
  const [dateTo, setDateTo] = useState('2026-07-14')

  const filtered = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        !search ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase())
      const logDate = log.time.split(' ')[0]
      const inRange = (!dateFrom || logDate >= dateFrom) && (!dateTo || logDate <= dateTo)
      return matchesSearch && matchesFilter(log, activeFilter) && inRange
    })
  }, [search, activeFilter, dateFrom, dateTo])

  const metrics = [
    { icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', badge: 'Excellent', badgeTone: 'bg-emerald-100 text-emerald-800', value: '94', label: 'Security Score' },
    { icon: LogIn, bg: 'bg-blue-50', color: 'text-blue-600', badge: 'Normal', badgeTone: 'bg-blue-100 text-blue-700', value: '2,841', label: 'Login Events' },
    { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', badge: 'Review', badgeTone: 'bg-red-100 text-red-800', value: String(auditLogs.filter((l) => l.status === 'Blocked').length), valueColor: 'text-red-600', label: 'Failed Logins' },
    { icon: Download, bg: 'bg-violet-50', color: 'text-violet-600', badge: '↑ 8%', badgeTone: 'bg-violet-100 text-violet-800', value: '892', label: 'Record Downloads' },
    { icon: Key, bg: 'bg-amber-50', color: 'text-amber-600', badge: '2 Active', badgeTone: 'bg-amber-100 text-amber-800', value: '2', label: 'Privilege Escalations' },
  ]

  const handleLast7Days = () => {
    setDateFrom('2026-07-08')
    setDateTo('2026-07-14')
    showToast('Showing last 7 days of activity')
  }

  const handleSecurityReport = () => {
    showToast('Generating security report from current audit data...')
    setTimeout(() => window.print(), 400)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time activity monitoring · {filtered.length} of {auditLogs.length} events shown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleLast7Days} className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50">
            <Calendar size={14} />Last 7 Days
          </button>
          <button onClick={() => downloadCSV(filtered)} className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50">
            <Download size={14} />Export Logs
          </button>
          <button onClick={handleSecurityReport} className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white flex items-center gap-1.5 hover:bg-blue-700">
            <ShieldCheck size={14} />Security Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4">
            <div className="flex items-start justify-between mb-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.bg}`}>
                <m.icon size={18} className={m.color} />
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${m.badgeTone}`}>{m.badge}</span>
            </div>
            <div className={`text-2xl font-display font-bold ${m.valueColor || 'text-slate-800'}`}>{m.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-[260px] flex-1">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, or patient..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${
                activeFilter === f
                  ? f === 'Failed' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-600 text-white'
                  : 'border border-slate-200 text-slate-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5" />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Timestamp', 'User', 'Role', 'Action', 'Patient / Resource', 'IP Address', 'Status'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-sm text-slate-400 py-10">No events match your search, filter, or date range.</td>
                </tr>
              )}
              {filtered.map((log, i) => {
                const a = actionIcons[log.action] || actionIcons['Record Viewed']
                const isFailed = log.status === 'Blocked'
                return (
                  <tr key={i} className={`border-b border-slate-100 last:border-0 ${isFailed ? 'bg-red-50/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{log.time}</td>
                    <td className="px-4 py-3">
                      <div className="text-[13.5px] font-medium text-slate-800">{log.user}</div>
                      <div className="text-[11.5px] text-slate-400">{log.dept}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${roleBadgeStyle[log.roleType]}`}>{log.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`rounded-md flex items-center justify-center ${a.bg}`} style={{ width: 22, height: 22 }}>
                          <a.icon size={12} className={a.color} />
                        </div>
                        <span className={`text-[13px] whitespace-nowrap ${isFailed ? 'text-red-800 font-medium' : 'text-slate-700'}`}>{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-500 whitespace-nowrap">
                      {log.target !== '—' ? <span className="text-blue-600 cursor-pointer">{log.target}</span> : '—'}
                    </td>
                    <td className={`px-4 py-3 text-xs font-mono whitespace-nowrap ${isFailed ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{log.ip}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[log.status]}>{log.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100" style={{ padding: '14px 18px' }}>
          <div className="text-[13px] text-slate-500">Showing 1–{filtered.length} of {filtered.length} events logged</div>
          <div className="flex gap-1.5 items-center">
            <button className="min-w-[30px] h-7 rounded-md bg-blue-600 text-white text-xs">1</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
import { useState, useMemo, useEffect } from 'react'
import {
  Calendar, Download, ShieldCheck, LogIn, LogOut, AlertTriangle, Key,
  Search, UserPlus, Eye, UploadCloud, UserCog, ShieldAlert, Loader2, FileWarning,
} from 'lucide-react'
import { api } from '../lib/api'
import { Badge, Card } from '../components/ui'
import { useToast } from '../components/Toast'

// These are the exact action label strings the backend contract
// (dts302_api_contract, MedVault Group 4) documents as stored/returned.
const actionIcons = {
  'Login Success': { icon: LogIn, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  'Login Failed': { icon: LogIn, bg: 'bg-red-50', color: 'text-red-600' },
  'Account Locked': { icon: ShieldAlert, bg: 'bg-red-50', color: 'text-red-600' },
  'Account Unlocked': { icon: Key, bg: 'bg-amber-50', color: 'text-amber-600' },
  'Record Viewed': { icon: Eye, bg: 'bg-violet-50', color: 'text-violet-600' },
  'Record Uploaded': { icon: UploadCloud, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  'Permission Denied': { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600' },
  'User Created': { icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
  'User Updated': { icon: UserCog, bg: 'bg-blue-50', color: 'text-blue-600' },
  'Role Changed': { icon: Key, bg: 'bg-amber-50', color: 'text-amber-600' },
  'Patient Created': { icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
  'Duplicate Patient Warning': { icon: FileWarning, bg: 'bg-amber-50', color: 'text-amber-600' },
  'Audit Logs Viewed': { icon: Eye, bg: 'bg-slate-100', color: 'text-slate-600' },
  'Audit Report Viewed': { icon: Eye, bg: 'bg-slate-100', color: 'text-slate-600' },
}

const roleBadgeStyle = {
  doctor: 'bg-blue-100 text-blue-700',
  admin: 'bg-violet-100 text-violet-800',
  nurse: 'bg-pink-100 text-pink-900',
  lab_technician: 'bg-amber-100 text-amber-800',
  records_officer: 'bg-teal-100 text-teal-800',
  auditor: 'bg-slate-200 text-slate-700',
}

// Real status values per the contract: Success, Failed, Blocked, Error, Review
const statusTone = { Success: 'success', Failed: 'critical', Blocked: 'blocked', Error: 'error', Review: 'warning' }

const filters = ['All Events', 'Login', 'Record Access', 'Upload', 'Failed']

function matchesFilter(log, filter) {
  if (filter === 'All Events') return true
  if (filter === 'Login') return log.action.startsWith('Login') || log.action.startsWith('Account')
  if (filter === 'Record Access') return log.action === 'Record Viewed'
  if (filter === 'Upload') return log.action === 'Record Uploaded'
  if (filter === 'Failed') return log.status === 'Blocked' || log.status === 'Failed'
  return true
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ts
  }
}

function downloadCSV(rows) {
  const header = 'Timestamp,User,Role,Action,Record,IP,Status\n'
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
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    api
      .getAuditLogs()
      .then((data) => {
        if (cancelled) return
        const mapped = (data || []).map((l) => ({
          id: l.id,
          user: l.user_name,
          role: l.role_at_time,
          roleType: (l.role_at_time || '').toLowerCase().replace(/\s+/g, '_'),
          action: l.action,
          target: l.record_id || '—',
          ip: l.ip_address,
          status: l.status,
          time: formatTimestamp(l.timestamp),
          rawTime: l.timestamp,
        }))
        setLogs(mapped)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof TypeError) {
          setLoadError('Could not reach the server — it may be waking up, try refreshing shortly')
        } else {
          setLoadError(err.message || 'Could not load audit logs')
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !search ||
        (log.user || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
        (log.target || '').toLowerCase().includes(search.toLowerCase())
      const logDate = (log.rawTime || '').slice(0, 10)
      const inRange = (!dateFrom || logDate >= dateFrom) && (!dateTo || logDate <= dateTo)
      return matchesSearch && matchesFilter(log, activeFilter) && inRange
    })
  }, [logs, search, activeFilter, dateFrom, dateTo])

  // Metrics derived from what we actually fetched — no fabricated numbers.
  const failedLogins = logs.filter((l) => l.action === 'Login Failed').length
  const uploads = logs.filter((l) => l.action === 'Record Uploaded').length
  const views = logs.filter((l) => l.action === 'Record Viewed').length

  const metrics = [
    { icon: LogIn, bg: 'bg-blue-50', color: 'text-blue-600', value: String(logs.filter((l) => l.action === 'Login Success').length), label: 'Successful Logins' },
    { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', value: String(failedLogins), valueColor: failedLogins > 0 ? 'text-red-600' : undefined, label: 'Failed Logins' },
    { icon: UploadCloud, bg: 'bg-emerald-50', color: 'text-emerald-600', value: String(uploads), label: 'Records Uploaded' },
    { icon: Eye, bg: 'bg-violet-50', color: 'text-violet-600', value: String(views), label: 'Records Viewed' },
  ]

  const handleSecurityReport = () => {
    showToast('Generating security report from current audit data...')
    setTimeout(() => window.print(), 400)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {logs.length} events shown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadCSV(filtered)} className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50">
            <Download size={14} />Export Logs
          </button>
          <button onClick={handleSecurityReport} className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white flex items-center gap-1.5 hover:bg-blue-700">
            <ShieldCheck size={14} />Security Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${m.bg}`}>
              <m.icon size={18} className={m.color} />
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
            placeholder="Search by user, action, or record..."
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
                {['Timestamp', 'User', 'Role', 'Action', 'Record', 'IP Address', 'Status'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center text-sm text-slate-400 py-10"><Loader2 size={18} className="animate-spin inline-block mr-2" />Loading audit logs...</td></tr>
              )}
              {!loading && loadError && (
                <tr><td colSpan={7} className="text-center text-sm text-red-500 py-10">{loadError}</td></tr>
              )}
              {!loading && !loadError && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-sm text-slate-400 py-10">No events match your search, filter, or date range.</td></tr>
              )}
              {!loading && !loadError && filtered.map((log) => {
                const a = actionIcons[log.action] || actionIcons['Record Viewed']
                const isFailed = log.status === 'Blocked' || log.status === 'Failed'
                return (
                  <tr key={log.id} className={`border-b border-slate-100 last:border-0 ${isFailed ? 'bg-red-50/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">{log.time}</td>
                    <td className="px-4 py-3">
                      <div className="text-[13.5px] font-medium text-slate-800">{log.user}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${roleBadgeStyle[log.roleType] || 'bg-slate-100 text-slate-600'}`}>{log.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`rounded-md flex items-center justify-center ${a.bg}`} style={{ width: 22, height: 22 }}>
                          <a.icon size={12} className={a.color} />
                        </div>
                        <span className={`text-[13px] whitespace-nowrap ${isFailed ? 'text-red-800 font-medium' : 'text-slate-700'}`}>{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-500 whitespace-nowrap font-mono">{log.target}</td>
                    <td className={`px-4 py-3 text-xs font-mono whitespace-nowrap ${isFailed ? 'text-red-600 font-medium' : 'text-slate-500'}`}>{log.ip}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone[log.status] || 'discharged'}>{log.status}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100" style={{ padding: '14px 18px' }}>
          <div className="text-[13px] text-slate-500">Showing 1–{filtered.length} of {filtered.length} events logged</div>
        </div>
      </Card>
    </div>
  )
}
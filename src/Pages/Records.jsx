import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Download, UploadCloud, SlidersHorizontal,
  ScanLine, FlaskConical, FileText, Image, HeartPulse, Eye, Share2, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react'
import { api } from '../lib/api'
import { Card, EncBadge } from '../components/ui'
import { useToast } from '../components/Toast'

// Icon/category mapping for the 6 real record_type values from the backend
// contract (dts302_api_contract, MedVault Group 4).
const typeIcons = {
  'Lab Report': { icon: FlaskConical, bg: 'bg-blue-50', color: 'text-blue-600', category: 'Lab Reports' },
  Imaging: { icon: ScanLine, bg: 'bg-violet-50', color: 'text-violet-600', category: 'Imaging' },
  Prescription: { icon: HeartPulse, bg: 'bg-pink-50', color: 'text-pink-700', category: 'Prescriptions' },
  'Discharge Summary': { icon: FileText, bg: 'bg-emerald-50', color: 'text-emerald-600', category: 'Discharge' },
  Vitals: { icon: HeartPulse, bg: 'bg-amber-50', color: 'text-amber-600', category: 'Vitals' },
  'Clinical Notes': { icon: FileText, bg: 'bg-slate-100', color: 'text-slate-600', category: 'Clinical Notes' },
}

const filterTypes = ['All Types', 'Lab Reports', 'Imaging', 'Prescriptions', 'Discharge', 'Vitals', 'Clinical Notes']

function formatBytes(bytes) {
  if (!bytes) return '—'
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`
}

function formatDate(timestamp) {
  if (!timestamp) return '—'
  try {
    return new Date(timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return timestamp
  }
}

function downloadCSV(rows) {
  const header = 'Record ID,Patient,Type,Uploaded By,Department,Date,Size\n'
  const body = rows.map((r) => `${r.id},${r.patient},${r.type},${r.doctor},${r.dept},${r.date},${r.size}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medvault_records.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Records() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Types')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError('')
    api
      .getRecords()
      .then((data) => {
        if (cancelled) return
        // Map the backend's field names to what this page renders.
        // Note: the contract's GET /records response has no patient_id per
        // record (only patient_name), so linking a row to a patient profile
        // isn't possible yet — worth asking him to add patient_id here.
        const mapped = (data?.records || []).map((r) => ({
          id: r.id,
          patient: r.patient_name,
          patientId: r.patient_id || null,
          type: r.record_type,
          doctor: r.uploaded_by_name,
          dept: r.department || '—',
          date: formatDate(r.created_at),
          size: formatBytes(r.file_size),
        }))
        setRecords(mapped)
        setTotalRecords(data?.total || 0);
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof TypeError) {
          setLoadError('Could not reach the server — it may be waking up, try refreshing shortly')
        } else {
          setLoadError(err.message || 'Could not load records')
        }
      })
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        !search ||
        (r.patient || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.type || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.doctor || '').toLowerCase().includes(search.toLowerCase())
      const category = typeIcons[r.type]?.category
      const matchesFilter = activeFilter === 'All Types' || category === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [records, search, activeFilter])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Medical Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totalRecords} records · All encrypted with AES-256</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <EncBadge className="text-xs" />
          <button
            onClick={() => downloadCSV(filtered)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Download size={14} />Bulk Download
          </button>
          <button
            onClick={() => navigate('/upload')}
            className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white flex items-center gap-1.5 hover:bg-blue-700"
          >
            <UploadCloud size={14} />Upload Record
          </button>
        </div>
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by patient, type, or doctor..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterTypes.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${activeFilter === f ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap items-center">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5"
          />
          <button
            onClick={() => showToast('Advanced filters coming soon — use search and type filters above for now', 'info')}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
          >
            <SlidersHorizontal size={14} />Filters
          </button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 w-10">
                  <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                </th>
                {['Record ID', 'Patient', 'Record Type', 'Uploaded By', 'Department', 'Date', 'Size', 'Security', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center text-sm text-slate-400 py-10">
                    <Loader2 size={18} className="animate-spin inline-block mr-2" />
                    Loading records...
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td colSpan={9} className="text-center text-sm text-red-500 py-10">{loadError}</td>
                </tr>
              )}
              {!loading && !loadError && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-sm text-slate-400 py-10">No records match your search or filter.</td>
                </tr>
              )}
              {!loading && !loadError && filtered.map((r) => {
                const t = typeIcons[r.type] || typeIcons['Clinical Notes']
                return (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{r.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-[13.5px] font-medium text-slate-800">{r.patient}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${t.bg}`}>
                          <t.icon size={13} className={t.color} />
                        </div>
                        <span className="text-[13.5px] text-slate-700 whitespace-nowrap">{r.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{r.doctor}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{r.dept}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{r.size}</td>
                    <td className="px-4 py-3">
                      <EncBadge />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          disabled={!r.patientId}
                          title={r.patientId ? 'View patient' : 'Patient link not available from this list yet'}
                          onClick={() => r.patientId && navigate(`/patients/${r.patientId}`)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => showToast(`Downloading ${r.id}... file will decrypt after authentication`, 'info')}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Download size={12} />
                        </button>
                        <button
                          onClick={() => showToast(`Share link for ${r.id} — logged in audit trail`, 'info')}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Share2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100" style={{ padding: '14px 18px' }}>
          <div className="text-[13px] text-slate-500">Showing 1–{filtered.length} of {filtered.length} records</div>
          <div className="flex gap-1.5 items-center">
            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500">
              <ChevronLeft size={14} />
            </button>
            <button className="min-w-[30px] h-7 rounded-md bg-blue-600 text-white text-xs">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
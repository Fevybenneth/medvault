import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Download, UserPlus, Edit2, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { Card } from '../components/ui'
import { useToast } from '../components/Toast'

// Real GET /patients route confirmed in the updated backend contract
// (dts302_api_contract v3) — this now fetches genuinely real data. The
// real Patient model has no blood_group, department, or status field,
// so this page no longer shows those (they were mock/UI-only concepts).

function downloadCSV(rows) {
  const header = 'Hospital ID,Name,Age,Gender,Phone,Assigned Doctor\n'
  const body = rows.map((p) => `${p.hospital_id},${p.first_name} ${p.last_name},${p.age},${p.gender || ''},${p.phone || ''},${p.assigned_doctor_id || ''}`).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medvault_patients.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Patients() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [search, setSearch] = useState('')

  const [patientsList, setPatientsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadPatients = (searchTerm = '') => {
    setLoading(true)
    setLoadError('')
    api
      .getPatients({ search: searchTerm || undefined })
      .then((data) => setPatientsList(data?.patients || []))
      .catch((err) => {
        if (err instanceof TypeError) {
          setLoadError('Could not reach the server — it may be waking up, try refreshing shortly')
        } else {
          setLoadError(err.message || 'Could not load patients')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadPatients() }, [])

  // Search is server-side per the contract (fuzzy match on first_name,
  // last_name, national_id) — debounce so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => loadPatients(search), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Patient Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{patientsList.length} patients</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadCSV(patientsList)} className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50">
            <Download size={14} />Export CSV
          </button>
          <button onClick={() => navigate('/patients/new')} className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white flex items-center gap-1.5 hover:bg-blue-700">
            <UserPlus size={14} />Add Patient
          </button>
        </div>
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or national ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
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
                {['Hospital ID', 'Patient Name', 'Age', 'Phone', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="text-center text-sm text-slate-400 py-10"><Loader2 size={18} className="animate-spin inline-block mr-2" />Loading patients...</td></tr>
              )}
              {!loading && loadError && (
                <tr><td colSpan={6} className="text-center text-sm text-red-500 py-10">{loadError}</td></tr>
              )}
              {!loading && !loadError && patientsList.length === 0 && (
                <tr><td colSpan={6} className="text-center text-sm text-slate-400 py-10">No patients found{search ? ' matching your search' : ''}.</td></tr>
              )}
              {!loading && !loadError && patientsList.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12.5px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.hospital_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://i.pravatar.cc/64?u=${p.id}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="text-sm font-medium text-slate-800">{p.first_name} {p.last_name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{p.age}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{p.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link to={`/patients/${p.id}`}>
                        <button className="text-xs px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100">View</button>
                      </Link>
                      <button
                        onClick={() => showToast('Use the View page to edit this patient', 'info')}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => navigate('/records')}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                      >
                        <FileText size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100" style={{ padding: '14px 18px' }}>
          <div className="text-[13px] text-slate-500">Showing 1–{patientsList.length} of {patientsList.length} patients</div>
          <div className="flex gap-1.5 items-center">
            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500"><ChevronLeft size={14} /></button>
            <button className="min-w-[30px] h-7 rounded-md bg-blue-600 text-white text-xs">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500"><ChevronRight size={14} /></button>
          </div>
        </div>
      </Card>
    </div>
  )
}
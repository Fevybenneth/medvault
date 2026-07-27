import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Download, UserPlus, Edit2, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { patients } from '../lib/mockData'
import { Badge, Card } from '../components/ui'
import { useToast } from '../components/Toast'

const statusTone = { Admitted: 'admitted', Stable: 'stable', Discharged: 'discharged', Critical: 'critical' }
const bloodTone = { 'O+': 'critical', 'O-': 'critical', 'A+': 'admitted', 'A-': 'admitted', 'B+': 'stable', 'B-': 'stable', 'AB+': 'discharged', 'AB-': 'discharged' }
const statusFilters = ['All', 'Admitted', 'Discharged', 'Critical', 'Outpatient']
const departments = [...new Set(patients.map((p) => p.dept))]
const bloodGroups = [...new Set(patients.map((p) => p.blood))]

function downloadCSV(rows) {
  const header = 'Patient ID,Name,Email,Age,Gender,Blood,Doctor,Department,Status\n'
  const body = rows.map((p) => `${p.id},${p.name},${p.email},${p.age},${p.gender},${p.blood},${p.doctor},${p.dept},${p.status}`).join('\n')
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
  const [statusFilter, setStatusFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [bloodFilter, setBloodFilter] = useState('All Blood Groups')

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.dept.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter
      const matchesDept = deptFilter === 'All Departments' || p.dept === deptFilter
      const matchesBlood = bloodFilter === 'All Blood Groups' || p.blood === bloodFilter
      return matchesSearch && matchesStatus && matchesDept && matchesBlood
    })
  }, [search, statusFilter, deptFilter, bloodFilter])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Patient Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {patients.length} patients · {patients.filter((p) => p.status === 'Admitted').length} admitted today
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => downloadCSV(filtered)} className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50">
            <Download size={14} />Export CSV
          </button>
          <button onClick={() => showToast('Advanced filters coming soon — use the filter bar below for now', 'info')} className="text-xs px-3 py-1.5 rounded-md bg-teal-500 text-white flex items-center gap-1.5 hover:bg-teal-600">
            <Search size={14} />Filters
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
            placeholder="Search patients by name, ID, or department..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${statusFilter === f ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
            <option>All Departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={bloodFilter} onChange={(e) => setBloodFilter(e.target.value)} className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5">
            <option>All Blood Groups</option>
            {bloodGroups.map((b) => <option key={b}>{b}</option>)}
          </select>
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
                {['Patient ID', 'Patient Name', 'Age/Gender', 'Blood Group', 'Assigned Doctor', 'Department', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-sm text-slate-400 py-10">No patients match your filters.</td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12.5px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://i.pravatar.cc/64?u=${p.email}`}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="text-sm font-medium text-slate-800">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{p.age}{p.gender}</td>
                  <td className="px-4 py-3">
                    <Badge tone={bloodTone[p.blood]}>{p.blood}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{p.doctor}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{p.dept}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Link to={`/patients/${p.id}`}>
                        <button className="text-xs px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100">View</button>
                      </Link>
                      <button
                        onClick={() => showToast(`Edit form for ${p.name} — coming soon`, 'info')}
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
          <div className="text-[13px] text-slate-500">Showing 1–{filtered.length} of {filtered.length} patients</div>
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
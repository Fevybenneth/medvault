import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar, Download, Plus, Users, FileText, Stethoscope, Building2, Cloud, ShieldCheck,
  UserPlus, UploadCloud, FlaskConical, Pill, BarChart2, FilePlus, AlertTriangle, UserCheck,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, LabelList } from 'recharts'
import { admissionsByMonth, hospital } from '../lib/mockData'
import { Card, Button, Progress } from '../components/ui'
import { useToast } from '../components/Toast'

const kpis = [
  { label: 'Total Patients', value: '1,284', badge: '↑ 3.4%', badgeTone: 'bg-emerald-100 text-emerald-800', icon: Users, bg: 'bg-blue-50', color: 'text-blue-600' },
  { label: 'Medical Records', value: '5,394', badge: '↑ 8.1%', badgeTone: 'bg-emerald-100 text-emerald-800', icon: FileText, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Active Doctors', value: '38', badge: 'Stable', badgeTone: 'bg-slate-100 text-slate-500', icon: Stethoscope, bg: 'bg-sky-50', color: 'text-sky-600' },
  { label: 'Departments', value: '9', badge: '1 New', badgeTone: 'bg-amber-100 text-amber-800', icon: Building2, bg: 'bg-amber-50', color: 'text-amber-600' },
  { label: 'of 2 TB used', value: '640 GB', badge: '32%', badgeTone: 'bg-violet-100 text-violet-800', icon: Cloud, bg: 'bg-violet-50', color: 'text-violet-600', progress: 32, progressColor: '#7c3aed' },
  { label: 'Security Score', value: '94/100', badge: 'Excellent', badgeTone: 'bg-emerald-100 text-emerald-800', icon: ShieldCheck, bg: 'bg-emerald-50', color: 'text-emerald-600', progress: 94, progressColor: '#059669' },
]

const storageData = [
  { name: 'Lab Reports', value: 210, color: '#2563eb' },
  { name: 'Imaging', value: 280, color: '#14b8a6' },
  { name: 'Documents', value: 150, color: '#7c3aed' },
]

const deptOccupancy = [
  { dept: 'ICU', value: 91, color: '#ef4444' },
  { dept: 'Emergency', value: 82, color: '#f59e0b' },
  { dept: 'Cardiology', value: 78, color: '#2563eb' },
  { dept: 'Neurology', value: 70, color: '#3b82f6' },
  { dept: 'Ortho', value: 63, color: '#60a5fa' },
  { dept: 'Paeds', value: 68, color: '#14b8a6' },
]

const recentActivity = [
  { icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600', text: 'New patient admitted — Chidinma Okoro', sub: 'Cardiology Ward · Dr. Nwachukwu', time: '2 min ago' },
  { icon: FilePlus, bg: 'bg-emerald-50', color: 'text-emerald-600', text: 'Medical record uploaded for Obinna Eze', sub: 'MRI Scan · ICU · Encrypted', time: '14 min ago' },
  { icon: FlaskConical, bg: 'bg-amber-50', color: 'text-amber-600', text: 'Lab results ready — Tunde Adewale', sub: 'Blood panel · Neurology · Ref: LAB-2847', time: '38 min ago' },
  { icon: AlertTriangle, bg: 'bg-red-50', color: 'text-red-600', text: 'Critical alert — Obinna Eze', sub: 'O2 saturation below threshold · ICU Bed 4', time: '1 hr ago' },
  { icon: UserCheck, bg: 'bg-violet-50', color: 'text-violet-600', text: 'Patient discharged — Aisha Bello', sub: 'Orthopaedics · Dr. Ibrahim Yusuf · Ref: #PT-003', time: '2 hr ago' },
]

const quickActions = [
  { icon: UserPlus, label: 'Register New Patient', primary: true, to: '/patients/new' },
  { icon: UploadCloud, label: 'Upload Medical Record', to: '/upload' },
  { icon: FlaskConical, label: 'Order Lab Test', to: null },
  { icon: Pill, label: 'Prescribe Medication', to: null },
  { icon: BarChart2, label: 'Generate Report', to: '/reports' },
]

const systemStatus = [
  { label: 'API Services', status: 'Operational', color: '#10b981' },
  { label: 'Cloud Storage', status: 'Operational', color: '#10b981' },
  { label: 'SMS Gateway', status: 'Degraded', color: '#f59e0b' },
  { label: 'Backup Service', status: 'Operational', color: '#10b981' },
]

function downloadCSV() {
  const header = 'Month,Admissions\n'
  const rows = admissionsByMonth.map((d) => `${d.month},${d.value}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'medvault_dashboard_export.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [now, setNow] = useState(new Date())
  const [monthMenuOpen, setMonthMenuOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('Jul')

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{dateStr} · {timeStr} · {hospital}</p>
        </div>
        <div className="flex gap-2 items-center relative flex-wrap">
          <div className="relative">
            <Button size="sm" onClick={() => setMonthMenuOpen(!monthMenuOpen)}>
              <Calendar size={14} />{selectedMonth} 2026
            </Button>
            {monthMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMonthMenuOpen(false)} />
                <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-lg shadow-lg z-20" style={{ width: 140, padding: 6 }}>
                  {admissionsByMonth.map((d) => (
                    <button
                      key={d.month}
                      onClick={() => { setSelectedMonth(d.month); setMonthMenuOpen(false); showToast(`Viewing data through ${d.month} 2026`) }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${selectedMonth === d.month ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {d.month} 2026
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Button size="sm" onClick={downloadCSV}><Download size={14} />Export</Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/patients/new')}><Plus size={14} />New Patient</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-5">
        {kpis.map((k) => (
          <Card key={k.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.bg}`}>
                <k.icon size={18} className={k.color} />
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${k.badgeTone}`}>{k.badge}</span>
            </div>
            <div className="text-2xl font-display font-bold text-slate-800">{k.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{k.label}</div>
            {k.progress && <Progress value={k.progress} className="mt-2" color={k.progressColor} />}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-3.5 mb-3.5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Monthly Admissions</h3>
              <p className="text-xs text-slate-400 mt-0.5">January – July 2026</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => showToast('Showing last 6 months')} className="text-[11px] px-2.5 py-1 rounded-md border border-slate-200 text-slate-600">6M</button>
              <button onClick={() => showToast('Showing last 12 months')} className="text-[11px] px-2.5 py-1 rounded-md bg-blue-600 text-white">1Y</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={admissionsByMonth}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {admissionsByMonth.map((d) => (
                    <Cell key={d.month} fill={d.month === selectedMonth ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Storage Usage</h3>
          <p className="text-xs text-slate-400 mb-3">By record type</p>
          <div style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={storageData} dataKey="value" innerRadius={45} outerRadius={62} paddingAngle={2}>
                  {storageData.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2.5">
            {storageData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </div>
                <span className="font-semibold text-slate-800">{s.value} GB</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Dept. Occupancy</h3>
          <p className="text-xs text-slate-400 mb-3">Current bed utilisation</p>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={deptOccupancy} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                  {deptOccupancy.map((d, i) => <Cell key={i} fill={d.color} />)}
                  <LabelList dataKey="value" position="right" formatter={(v) => `${v}%`} style={{ fontSize: 11, fill: '#64748b' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3.5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
            <button onClick={() => navigate('/audit')} className="text-xs px-2.5 py-1 rounded-md border border-slate-200 text-slate-600">View All</button>
          </div>
          <div className="flex flex-col">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-slate-100 last:border-0" style={{ padding: '10px 0' }}>
                <div className={`rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`} style={{ width: 34, height: 34 }}>
                  <item.icon size={16} className={item.color} />
                </div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium text-slate-800">{item.text}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.sub}</div>
                </div>
                <div className="text-[11.5px] text-slate-400 whitespace-nowrap">{item.time}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card style={{ padding: 18 }}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {quickActions.map((a) => (
                <Button
                  key={a.label}
                  variant={a.primary ? 'primary' : 'secondary'}
                  className="justify-start w-full"
                  onClick={() => (a.to ? navigate(a.to) : showToast(`${a.label} — module not built yet`, 'info'))}
                >
                  <a.icon size={15} />
                  {a.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 18 }}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3.5">System Status</h3>
            <div className="flex flex-col gap-2.5">
              {systemStatus.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="text-[13px] text-slate-500 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: s.color }}>{s.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
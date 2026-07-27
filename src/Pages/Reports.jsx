import { useState } from 'react'
import {
  Calendar, Download, Share2, TrendingUp, TrendingDown, Star,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
} from 'recharts'
import { admissionsByMonth } from '../lib/mockData'
import { Card, Progress } from '../components/ui'
import { useToast } from '../components/Toast'

const trendData = admissionsByMonth.map((d, i) => ({
  month: d.month,
  y2026: d.value,
  y2025: [760, 820, 800, 980, 930, 1040, 1100][i],
}))

const diagnosisData = [
  { name: 'Cardiovascular', value: 312, color: '#2563eb' },
  { name: 'Respiratory', value: 248, color: '#14b8a6' },
  { name: 'Neurological', value: 189, color: '#7c3aed' },
  { name: 'Orthopaedic', value: 142, color: '#f59e0b' },
]

const deptAdmissions = [
  { dept: 'ICU', value: 268 },
  { dept: 'Cardiology', value: 312 },
  { dept: 'Emergency', value: 248 },
  { dept: 'Neurology', value: 189 },
  { dept: 'Ortho', value: 142 },
  { dept: 'Pharmacy', value: 94 },
]

const storage = [
  { label: 'Lab Reports', used: '210 GB', total: '500 GB', pct: 42, color: '#2563eb' },
  { label: 'Medical Imaging', used: '280 GB', total: '1 TB', pct: 28, color: '#14b8a6' },
  { label: 'Documents', used: '150 GB', total: '500 GB', pct: 30, color: '#7c3aed' },
]

export default function Reports() {
  const showToast = useToast()
  const [selectedMonth, setSelectedMonth] = useState('Jul')
  const [monthMenuOpen, setMonthMenuOpen] = useState(false)

  const handleExportPDF = () => {
    showToast('Preparing PDF — opening print dialog, choose "Save as PDF"')
    setTimeout(() => window.print(), 400)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reports?month=${selectedMonth}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'MedVault Report', text: `Hospital performance report — ${selectedMonth} 2026`, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Report link copied to clipboard')
      }
    } catch {
      showToast('Share cancelled', 'info')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Hospital performance · {selectedMonth} 2026</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap relative">
          <div className="relative">
            <button
              onClick={() => setMonthMenuOpen(!monthMenuOpen)}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5"
            >
              <Calendar size={14} />{selectedMonth} 2026
            </button>
            {monthMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMonthMenuOpen(false)} />
                <div className="absolute right-0 top-9 bg-white border border-slate-200 rounded-lg shadow-lg z-20" style={{ width: 140, padding: 6 }}>
                  {admissionsByMonth.map((d) => (
                    <button
                      key={d.month}
                      onClick={() => { setSelectedMonth(d.month); setMonthMenuOpen(false); showToast(`Report updated for ${d.month} 2026`) }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${selectedMonth === d.month ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {d.month} 2026
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={handleExportPDF} className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5">
            <Download size={14} />Export PDF
          </button>
          <button onClick={handleShare} className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white flex items-center gap-1.5">
            <Share2 size={14} />Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Total Admissions</div>
          <div className="font-display text-[28px] font-bold text-slate-800">1,284</div>
          <div className="text-[12.5px] text-emerald-600 mt-0.5 flex items-center gap-1"><TrendingUp size={13} />+12.4% vs last month</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Avg. Length of Stay</div>
          <div className="font-display text-[28px] font-bold text-slate-800">4.2<span className="text-base font-normal text-slate-500">days</span></div>
          <div className="text-[12.5px] text-emerald-600 mt-0.5 flex items-center gap-1"><TrendingDown size={13} />−0.8 days vs last month</div>
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Bed Occupancy Rate</div>
          <div className="font-display text-[28px] font-bold text-slate-800">84<span className="text-base font-normal text-slate-500">%</span></div>
          <Progress value={84} className="mt-2" color="#2563eb" />
        </Card>
        <Card className="p-5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Patient Satisfaction</div>
          <div className="font-display text-[28px] font-bold text-slate-800">4.7<span className="text-base font-normal text-slate-500">/5.0</span></div>
          <div className="text-[12.5px] text-emerald-600 mt-0.5 flex items-center gap-1"><Star size={13} />+0.2 vs Q2 2026</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3.5 mb-3.5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Patient Admissions Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Jan – Jul 2026 · Monthly comparison</p>
            </div>
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600" />2026</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" />2025</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="y2025" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="y2026" stroke="#2563eb" strokeWidth={2.5} dot={(props) => {
                  const isSelected = props.payload.month === selectedMonth
                  return <circle cx={props.cx} cy={props.cy} r={isSelected ? 6 : 4} fill={isSelected ? '#1d4ed8' : '#2563eb'} />
                }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Diagnosis Distribution</h3>
          <p className="text-xs text-slate-400 mb-3">Top conditions this month</p>
          <div style={{ width: '100%', height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={diagnosisData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={2}>
                  {diagnosisData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {diagnosisData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </div>
                <span className="font-semibold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-0.5">Dept. Admission Breakdown</h3>
          <p className="text-xs text-slate-400 mb-3">{selectedMonth} 2026 — by department</p>
          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer>
              <BarChart data={deptAdmissions} layout="vertical" margin={{ left: 8, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14} fill="#2563eb">
                  {deptAdmissions.map((_, i) => <Cell key={i} fillOpacity={1 - i * 0.1} />)}
                </Bar>
                <Tooltip />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Storage Analytics</h3>
          <div className="flex flex-col gap-3">
            {storage.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[13px] mb-1.5">
                  <span className="text-slate-500">{s.label}</span>
                  <span className="font-semibold text-slate-800">{s.used} / {s.total}</span>
                </div>
                <Progress value={s.pct} color={s.color} />
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between mt-4" style={{ padding: 12 }}>
            <div>
              <div className="text-[13px] font-semibold text-slate-800">Total Used</div>
              <div className="text-xs text-slate-500 mt-0.5">640 GB of 2 TB allocated</div>
            </div>
            <div className="font-display text-xl font-bold text-blue-600">32%</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
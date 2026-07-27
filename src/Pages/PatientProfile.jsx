import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronRight, Edit2, UploadCloud, Heart, Activity, Thermometer,
  AlertCircle, AlertTriangle, UserPlus, FileText, FlaskConical, Pill, ScanLine, Stethoscope,
} from 'lucide-react'
import { patients } from '../lib/mockData'
import { Badge, Button, Card } from '../components/ui'

const tabs = ['Overview', 'Medical Records', 'History', 'Medications', 'Allergies', 'Lab Results']

const conditions = [
  { icon: Heart, bg: 'bg-red-50', color: 'text-red-600', label: 'Hypertension — Stage 2', tone: 'critical', status: 'Active' },
  { icon: Activity, bg: 'bg-amber-50', color: 'text-amber-600', label: 'Atrial Fibrillation', tone: 'warning', status: 'Monitoring' },
  { icon: Thermometer, bg: 'bg-blue-50', color: 'text-blue-600', label: 'Type 2 Diabetes Mellitus', tone: 'stable', status: 'Controlled' },
]

const allergies = [
  { icon: AlertCircle, label: 'Penicillin', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-600' },
  { icon: AlertTriangle, label: 'Latex', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-600' },
  { icon: AlertTriangle, label: 'Sulphonamides', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-600' },
]

const medications = [
  { name: 'Metoprolol Succinate', detail: '50mg · Once daily', status: 'Active' },
  { name: 'Amlodipine', detail: '5mg · Once daily · With food', status: 'Active' },
  { name: 'Warfarin', detail: '3mg · Once daily · Evening', status: 'Review Due' },
]

const timeline = [
  { icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600', title: 'Admitted — Cardiology', sub: '12 Jul 2026 · 09:42 AM · Emergency admission via A&E' },
  { icon: FileText, bg: 'bg-emerald-50', color: 'text-emerald-600', title: 'ECG & Echocardiogram', sub: '12 Jul 2026 · 11:15 AM · Atrial fibrillation confirmed' },
  { icon: FlaskConical, bg: 'bg-amber-50', color: 'text-amber-600', title: 'Blood Panel — Full Workup', sub: '12 Jul 2026 · 1:00 PM · Results: Ref LAB-2841' },
  { icon: Pill, bg: 'bg-red-50', color: 'text-red-600', title: 'Medication adjusted', sub: '13 Jul 2026 · 08:30 AM · Warfarin 3mg initiated' },
  { icon: ScanLine, bg: 'bg-violet-50', color: 'text-violet-600', title: 'Cardiac MRI', sub: '13 Jul 2026 · 2:45 PM · Ref: IMG-0748 · Encrypted' },
  { icon: Stethoscope, bg: 'bg-sky-50', color: 'text-sky-600', title: 'Ward Round', sub: '14 Jul 2026 · 08:00 AM · Condition stable, continue monitoring' },
]

const statusTone = { Admitted: 'admitted', Stable: 'stable', Discharged: 'discharged', Critical: 'critical' }
const conditionTone = { critical: 'critical', warning: 'warning', stable: 'stable' }

export default function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Overview')
  const patient = patients.find((p) => p.id === id) || patients[0]

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Link to="/patients" className="text-blue-600">Patients</Link>
        <ChevronRight size={13} />
        <span className="text-slate-700">{patient.name}</span>
        <span className="text-slate-300">— {patient.id}</span>
      </div>

      <Card className="p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-[88px] h-[88px] rounded-full bg-blue-100 text-blue-700 border-[3px] border-slate-200 flex items-center justify-center text-2xl font-semibold">
              {patient.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="absolute bottom-0.5 right-0.5 bg-emerald-500 rounded-full border-[2.5px] border-white" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-display text-[22px] font-bold text-slate-800">{patient.name}</h1>
                <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                  <span className="text-[13px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{patient.id}</span>
                  <Badge tone={statusTone[patient.status]}>{patient.status}</Badge>
                  <Badge tone="admitted">{patient.dept}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm"><Edit2 size={14} />Edit</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/upload')}>
                  <UploadCloud size={14} />Upload Record
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4.5" style={{ marginTop: 18 }}>
              {[
                ['Date of Birth', '12 Mar 1992'],
                ['Age / Gender', `${patient.age} yrs · ${patient.gender === 'F' ? 'Female' : 'Male'}`],
                ['Blood Group', patient.blood],
                ['Assigned Doctor', patient.doctor],
                ['Admitted', '12 Jul 2026'],
                ['NHIS Number', '234 567 8901'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
                  <div className={`text-[13.5px] font-medium ${label === 'Blood Group' ? 'text-red-500 font-bold' : 'text-slate-800'}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex border-b border-slate-200 px-5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-[2.5px] -mb-px transition-colors ${
                activeTab === tab ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Current Conditions</h3>
              <div className="flex flex-col gap-2 mb-5">
                {conditions.map((c) => (
                  <div key={c.label} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${c.bg}`}>
                        <c.icon size={14} className={c.color} />
                      </div>
                      <span className="text-[13.5px] font-medium text-slate-800">{c.label}</span>
                    </div>
                    <Badge tone={conditionTone[c.tone]}>{c.status}</Badge>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Allergies</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {allergies.map((a) => (
                  <div key={a.label} className={`flex items-center gap-1.5 ${a.bg} border ${a.border} rounded-lg px-3 py-1.5`}>
                    <a.icon size={14} className={a.iconColor} />
                    <span className={`text-[13px] font-medium ${a.text}`}>{a.label}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Current Medications</h3>
              <div className="flex flex-col gap-2">
                {medications.map((m) => (
                  <div key={m.name} className="grid items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5" style={{ gridTemplateColumns: '1fr auto auto' }}>
                    <div>
                      <div className="text-[13.5px] font-medium text-slate-800">{m.name}</div>
                      <div className="text-[11.5px] text-slate-400 mt-0.5">{m.detail}</div>
                    </div>
                    <Badge tone={m.status === 'Active' ? 'active' : 'warning'}>{m.status}</Badge>
                    <Button size="sm">Details</Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Medical Timeline</h3>
              <div className="relative pl-0">
                <div className="absolute left-[14px] top-2.5 bottom-0 w-px bg-slate-200" />
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-3 relative pb-5">
                    <div className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${t.bg}`}>
                      <t.icon size={14} className={t.color} />
                    </div>
                    <div className="pt-1">
                      <div className="text-[13.5px] font-semibold text-slate-800">{t.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{t.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 text-sm">{activeTab} — coming soon</div>
        )}
      </Card>
    </div>
  )
}

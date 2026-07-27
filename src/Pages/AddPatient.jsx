import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Calendar, Droplet, Stethoscope, Building2 } from 'lucide-react'
import { Card } from '../components/ui'
import { useToast } from '../components/Toast'

export default function AddPatient() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [form, setForm] = useState({ name: '', email: '', age: '', gender: 'F', blood: 'O+', doctor: '', dept: 'Cardiology' })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    showToast(`${form.name || 'New patient'} registered successfully`)
    navigate('/patients')
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-slate-800">Register New Patient</h1>
        <p className="text-sm text-slate-500 mt-0.5">Add a new patient record to MedVault</p>
      </div>

      <Card className="p-6" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Ngozi Adeyemi"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="patient@mail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update('age', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Group</label>
              <div className="relative">
                <Droplet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.blood}
                  onChange={(e) => update('blood', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.dept}
                  onChange={(e) => update('dept', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>Cardiology</option><option>Neurology</option><option>ICU</option>
                  <option>Orthopaedics</option><option>Paediatrics</option><option>Emergency</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Doctor</label>
            <div className="relative">
              <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.doctor}
                onChange={(e) => update('doctor', e.target.value)}
                placeholder="Dr. ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700">
              Register Patient
            </button>
            <button type="button" onClick={() => navigate('/patients')} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
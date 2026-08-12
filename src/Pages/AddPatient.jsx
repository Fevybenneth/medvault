import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Calendar, Phone, MapPin, Fingerprint, Stethoscope, Mail, Lock } from 'lucide-react'
import { Card } from '../components/ui'
import { useToast } from '../components/Toast'
import { api } from '../lib/api'

// Fields here mirror POST /patients from the backend contract
// (dts302_api_contract v3, MedVault Group 4). Blood group / department were
// dropped since the backend doesn't accept them for patient creation.
export default function AddPatient() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'F',
    phone: '',
    address: '',
    nationalId: '',
    assignedDoctorId: '',
    portalEmail: '',
    portalPassword: '',
  })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Backend rule: portal_email and portal_password must be provided together,
    // or not at all — one without the other silently skips account creation.
    if ((form.portalEmail && !form.portalPassword) || (!form.portalEmail && form.portalPassword)) {
      showToast('Provide both a portal email and password, or leave both blank', 'info')
      return
    }

    // Shape matches POST /records/patients request body
    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      age: Number(form.age),
      gender: form.gender || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      national_id: form.nationalId || undefined,
      assigned_doctor_id: form.assignedDoctorId ? Number(form.assignedDoctorId) : undefined,
      ...(form.portalEmail && form.portalPassword
        ? { portal_email: form.portalEmail, portal_password: form.portalPassword }
        : {}),
    }

    setSubmitting(true)
    try {
      await api.createPatient(payload)
      // No more local caching needed — GET /patients is a real route now,
      // so the Patients page will just fetch this patient properly.
      showToast(`${form.firstName || 'New patient'} ${form.lastName || ''} registered successfully`.trim())
      navigate('/patients')
    } catch (err) {
      if (err instanceof TypeError) {
        showToast('Could not reach the server — it may be waking up, try again shortly', 'info')
      } else {
        showToast(err.message || 'Could not register patient — please try again', 'info')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-slate-800">Register New Patient</h1>
        <p className="text-sm text-slate-500 mt-0.5">Add a new patient record to MedVault</p>
      </div>

      <Card className="p-6" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  placeholder="Ngozi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  placeholder="Adeyemi"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="number"
                  min="0"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+234 803 000 0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">National ID</label>
              <div className="relative">
                <Fingerprint size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.nationalId}
                  onChange={(e) => update('nationalId', e.target.value)}
                  placeholder="Optional, must be unique"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Address</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Optional"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Doctor (User ID)</label>
            <div className="relative">
              <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={form.assignedDoctorId}
                onChange={(e) => update('assignedDoctorId', e.target.value)}
                placeholder="Optional — numeric staff id"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-1">
            <p className="text-xs font-semibold text-slate-700 mb-3">Portal Access (optional)</p>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Portal Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.portalEmail}
                    onChange={(e) => update('portalEmail', e.target.value)}
                    placeholder="patient@mail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Portal Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={form.portalPassword}
                    onChange={(e) => update('portalPassword', e.target.value)}
                    placeholder="Required if email is set"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Both fields required together, or leave both blank to add portal access later.</p>
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Registering...' : 'Register Patient'}
            </button>
            <button type="button" onClick={() => navigate('/patients')} disabled={submitting} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
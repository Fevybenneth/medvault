import { useState, useEffect } from 'react'
import {
  Search, Download, Shield, UserPlus, Users as UsersIcon, Stethoscope, ShieldCheck, UserX,
  Edit2, ChevronLeft, ChevronRight, Loader2, X, Lock, Mail,
} from 'lucide-react'
import { api } from '../lib/api'
import { Badge, Button, Card } from '../components/ui'
import { useToast } from '../components/Toast'

// Roles per POST /auth/users contract. "patient" is explicitly rejected by
// that route — patient accounts only ever come from the patient routes.
const ROLES = ['doctor', 'nurse', 'lab_technician', 'records_officer', 'auditor', 'admin']

const roleBadgeStyle = {
  doctor: 'bg-blue-100 text-blue-700',
  admin: 'bg-violet-100 text-violet-800',
  nurse: 'bg-pink-100 text-pink-900',
  lab_technician: 'bg-amber-100 text-amber-800',
  records_officer: 'bg-teal-100 text-teal-800',
  auditor: 'bg-slate-200 text-slate-700',
}

const roleLabel = {
  doctor: 'Doctor',
  admin: 'Admin',
  nurse: 'Nurse',
  lab_technician: 'Lab Technician',
  records_officer: 'Records Officer',
  auditor: 'Auditor',
}

function formatDate(timestamp) {
  if (!timestamp) return '—'
  try {
    return new Date(timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return timestamp
  }
}

function CreateUserModal({ onClose, onCreated }) {
  const showToast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'doctor', department: '', licenseNumber: '',
  })
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.createUser({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.department || undefined,
        license_number: form.licenseNumber || undefined,
      })
      showToast(`${form.firstName} ${form.lastName} created as ${roleLabel[form.role]}`)
      onCreated()
      onClose()
    } catch (err) {
      if (err instanceof TypeError) {
        showToast('Could not reach the server — it may be waking up, try again shortly', 'info')
      } else {
        showToast(err.message || 'Could not create account — please try again', 'info')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full p-6" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-slate-800">Create Staff Account</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
              <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
              <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input required type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500">
              {ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
              <input value={form.department} onChange={(e) => update('department', e.target.value)} placeholder="Optional" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">License Number</label>
              <input value={form.licenseNumber} onChange={(e) => update('licenseNumber', e.target.value)} placeholder="Optional" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-60">
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}

function EditUserModal({ user, onClose, onUpdated }) {
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    role: user.roleType,
    department: user.dept === "—" ? "" : user.dept,
    license_number: user.license || "",
  });
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateUser(user.id, form);
      showToast(`${user.name} updated`);
      onUpdated();
      onClose();
    } catch (err) {
      showToast(err.message || "Could not update user", "info");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full p-6 max-h-[85vh] overflow-y-auto"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-slate-800">
            Edit {user.name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Department
            </label>
            <input
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              License Number
            </label>
            <input
              value={form.license_number}
              onChange={(e) => update("license_number", e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function Users() {
  const showToast = useToast()
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null);

  const [staff, setStaff] = useState([])
  const [totalStaff, setTotalStaff] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadStaff = () => {
    setLoading(true)
    setLoadError('')
    api
      .getUsers()
      .then((data) => {
        const mapped = (data?.users || []).map((u) => ({
          id: u.id,
          name: `${u.first_name} ${u.last_name}`,
          email: u.email,
          roleType: u.role,
          role: roleLabel[u.role] || u.role,
          dept: u.department || '—',
          joined: formatDate(u.created_at),
          status: u.is_locked ? 'Locked' : u.is_active ? 'Active' : 'Inactive',
        }))
        setStaff(mapped)
        setTotalStaff(data?.total || 0);
      })
      .catch((err) => {
        if (err instanceof TypeError) {
          setLoadError('Could not reach the server — it may be waking up, try refreshing shortly')
        } else {
          setLoadError(err.message || 'Could not load staff accounts')
        }
      })
      .finally(() => setLoading(false))
  }

  const toggleSuspend = async (user) => {
    const suspending = user.status !== "Inactive";
    if (
      !window.confirm(`${suspending ? "Suspend" : "Reactivate"} ${user.name}?`)
    )
      return;
    try {
      await api.updateUser(user.id, { is_active: suspending ? false : true });
      showToast(`${user.name} ${suspending ? "suspended" : "reactivated"}`);
      loadStaff();
    } catch (err) {
      showToast(err.message || "Could not update user", "info");
    }
  };

  const unlockUser = async (user) => {
    try {
      await api.updateUser(user.id, { is_locked: false });
      showToast(`${user.name} unlocked`);
      loadStaff();
    } catch (err) {
      showToast(err.message || "Could not unlock user", "info");
    }
  };

  useEffect(() => { loadStaff() }, [])

  const filtered = staff.filter((s) => roleFilter === 'All Roles' || s.role === roleFilter)
  const doctors = staff.filter((s) => s.roleType === 'doctor').length
  const admins = staff.filter((s) => s.roleType === 'admin').length
  const inactive = staff.filter((s) => s.status !== 'Active').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {totalStaff} staff accounts
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => showToast("Export coming soon", "info")}
          >
            <Download size={14} />
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreate(true)}
          >
            <UserPlus size={14} />
            Create User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <UsersIcon size={18} className="text-blue-600" />
          </div>
          <div>
            <div className="text-[22px] font-display font-bold text-slate-800">
              {totalStaff}
            </div>
            <div className="text-xs text-slate-500">Total Staff</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <Stethoscope size={18} className="text-blue-700" />
          </div>
          <div>
            <div className="text-[22px] font-display font-bold text-slate-800">
              {doctors}
            </div>
            <div className="text-xs text-slate-500">Doctors</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
            <ShieldCheck size={18} className="text-violet-700" />
          </div>
          <div>
            <div className="text-[22px] font-display font-bold text-slate-800">
              {admins}
            </div>
            <div className="text-xs text-slate-500">Administrators</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
            <UserX size={18} className="text-red-600" />
          </div>
          <div>
            <div className="text-[22px] font-display font-bold text-slate-800">
              {inactive}
            </div>
            <div className="text-xs text-slate-500">Inactive / Locked</div>
          </div>
        </Card>
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-[260px] flex-1">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search staff..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All Roles", ...ROLES.map((r) => roleLabel[r])].map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${roleFilter === f ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-blue-600"
                  />
                </th>
                {[
                  "Staff Member",
                  "Role",
                  "Department",
                  "Joined",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-slate-400 py-10"
                  >
                    <Loader2
                      size={18}
                      className="animate-spin inline-block mr-2"
                    />
                    Loading staff...
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-red-500 py-10"
                  >
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading && !loadError && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-slate-400 py-10"
                  >
                    No staff match this filter.
                  </td>
                </tr>
              )}
              {!loading &&
                !loadError &&
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://i.pravatar.cc/64?u=${s.email}`}
                          alt=""
                          className="rounded-full flex-shrink-0 object-cover"
                          style={{ width: 34, height: 34 }}
                        />
                        <div>
                          <div className="text-[13.5px] font-medium text-slate-800">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${roleBadgeStyle[s.roleType] || "bg-slate-100 text-slate-600"}`}
                      >
                        {s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {s.dept}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {s.joined}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          s.status === "Active"
                            ? "active"
                            : s.status === "Locked"
                              ? "critical"
                              : "warning"
                        }
                      >
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditTarget(s)}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        {s.status === "Locked" && (
                          <button
                            onClick={() => unlockUser(s)}
                            className="w-7 h-7 flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            title="Unlock"
                          >
                            <Lock size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => toggleSuspend(s)}
                          className={`w-7 h-7 flex items-center justify-center rounded-md border hover:opacity-80 ${
                            s.status === "Inactive"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : "border-red-200 bg-red-50 text-red-600"
                          }`}
                          title={
                            s.status === "Inactive" ? "Reactivate" : "Suspend"
                          }
                        >
                          <UserX size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div
          className="flex items-center justify-between border-t border-slate-100"
          style={{ padding: "14px 18px" }}
        >
          <div className="text-[13px] text-slate-500">
            Showing 1–{filtered.length} of {filtered.length} staff members
          </div>
          <div className="flex gap-1.5 items-center">
            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500">
              <ChevronLeft size={14} />
            </button>
            <button className="min-w-[30px] h-7 rounded-md bg-blue-600 text-white text-xs">
              1
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={loadStaff}
        />
      )}
      {editTarget && (
        <EditUserModal
          user={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={loadStaff}
        />
      )}
    </div>
  );
}
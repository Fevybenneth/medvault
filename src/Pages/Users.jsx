import { useState } from 'react'
import { Search, Download, Shield, UserPlus, Users as UsersIcon, Stethoscope, ShieldCheck, UserX, Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { staff } from '../lib/mockData'
import { Badge, Button, Card } from '../components/ui'

const roleBadgeStyle = {
  doctor: 'bg-blue-100 text-blue-700',
  admin: 'bg-violet-100 text-violet-800',
  nurse: 'bg-pink-100 text-pink-900',
}
const statusTone = { Active: 'active', 'On Leave': 'warning' }
const permStyle = {
  doctor: 'bg-blue-50 text-blue-600',
  admin: 'bg-violet-50 text-violet-700',
  nurse: 'bg-pink-50 text-pink-800',
}

export default function Users() {
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const doctors = staff.filter((s) => s.roleType === 'doctor').length
  const admins = staff.filter((s) => s.roleType === 'admin').length
  const inactive = staff.filter((s) => s.status !== 'Active').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{staff.length} staff accounts · 0 pending invitations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm"><Download size={14} />Export</Button>
          <Button size="sm"><Shield size={14} />Permissions</Button>
          <Button variant="primary" size="sm"><UserPlus size={14} />Create User</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><UsersIcon size={18} className="text-blue-600" /></div>
          <div><div className="text-[22px] font-display font-bold text-slate-800">{staff.length}</div><div className="text-xs text-slate-500">Total Staff</div></div>
        </Card>
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center"><Stethoscope size={18} className="text-blue-700" /></div>
          <div><div className="text-[22px] font-display font-bold text-slate-800">{doctors}</div><div className="text-xs text-slate-500">Doctors</div></div>
        </Card>
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center"><ShieldCheck size={18} className="text-violet-700" /></div>
          <div><div className="text-[22px] font-display font-bold text-slate-800">{admins}</div><div className="text-xs text-slate-500">Administrators</div></div>
        </Card>
        <Card className="p-5 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center"><UserX size={18} className="text-red-600" /></div>
          <div><div className="text-[22px] font-display font-bold text-slate-800">{inactive}</div><div className="text-xs text-slate-500">Inactive / Suspended</div></div>
        </Card>
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-[260px] flex-1">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search staff..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All Roles', 'Doctor', 'Nurse', 'Admin', 'Pharmacist'].map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md whitespace-nowrap ${roleFilter === f ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          <select className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5"><option>All Departments</option></select>
          <select className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5"><option>All Status</option><option>Active</option><option>On Leave</option></select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-2.5 w-10"><input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" /></th>
                {['Staff Member', 'Role', 'Department', 'Last Active', 'Permissions', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.email} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3"><input type="checkbox" className="w-3.5 h-3.5 accent-blue-600" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://i.pravatar.cc/64?u=${s.email}`}
                        alt=""
                        className="rounded-full flex-shrink-0 object-cover"
                        style={{ width: 34, height: 34 }}
                      />
                      <div>
                        <div className="text-[13.5px] font-medium text-slate-800">{s.name}</div>
                        <div className="text-xs text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${roleBadgeStyle[s.roleType]}`}>{s.role}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{s.dept}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{s.lastActive}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {s.permissions.map((p) => (
                        <span key={p} className={`text-[10.5px] px-2 py-0.5 rounded-full whitespace-nowrap ${permStyle[s.roleType]}`}>{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge tone={statusTone[s.status]}>{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"><Edit2 size={12} /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100"><Shield size={12} /></button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"><UserX size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100" style={{ padding: '14px 18px' }}>
          <div className="text-[13px] text-slate-500">Showing 1–{staff.length} of {staff.length} staff members</div>
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
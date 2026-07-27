import { useState } from 'react'
import {
  UserCircle, ShieldCheck, Key, Smartphone, Bell, Monitor, Globe,
  Building2, Link as LinkIcon, LifeBuoy, Save, Mail, Phone, Camera, Clock, Check, Send,
} from 'lucide-react'
import { hospital } from '../lib/mockData'
import { Badge, Button, Card, Toggle } from '../components/ui'
import { useToast } from '../components/Toast'

const navItems = [
  { id: 'profile', icon: UserCircle, label: 'My Profile' },
  { id: 'security', icon: ShieldCheck, label: 'Security' },
  { id: 'password', icon: Key, label: 'Password' },
  { id: '2fa', icon: Smartphone, label: 'Two-Factor Auth' },
  { divider: true },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'system', icon: Monitor, label: 'System Prefs' },
  { id: 'language', icon: Globe, label: 'Language & Region' },
  { divider: true },
  { id: 'hospital', icon: Building2, label: 'Hospital Settings' },
  { id: 'integrations', icon: LinkIcon, label: 'Integrations' },
  { id: 'support', icon: LifeBuoy, label: 'Support' },
]

export default function Settings() {
  const showToast = useToast()
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    firstName: 'Emeka', lastName: 'Nwachukwu', email: 'e.nwachukwu@amaku.gov.ng',
    phone: '+234 803 123 4567', department: 'Cardiology', mdcn: 'MDCN/R/48213',
  })
  const updateProfile = (field, value) => setProfile((p) => ({ ...p, [field]: value }))

  const [twoFactor, setTwoFactor] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes')

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })

  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: true, criticalAlerts: true, weeklyDigest: false })

  const [systemPrefs, setSystemPrefs] = useState({ theme: 'Light', density: 'Comfortable' })

  const [langPrefs, setLangPrefs] = useState({ language: 'English (UK)', timezone: 'WAT (UTC+1)' })

  const [integrations, setIntegrations] = useState({ nhis: true, smsGateway: false, backup: true })

  const [supportMsg, setSupportMsg] = useState('')

  const handleSave = () => {
    setSaved(true)
    showToast('Settings saved')
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!passwords.current || !passwords.next) {
      showToast('Fill in your current and new password', 'info')
      return
    }
    if (passwords.next !== passwords.confirm) {
      showToast('New password and confirmation do not match', 'info')
      return
    }
    showToast('Password updated')
    setPasswords({ current: '', next: '', confirm: '' })
  }

  const handleSupportSubmit = (e) => {
    e.preventDefault()
    if (!supportMsg.trim()) {
      showToast('Write a message before sending', 'info')
      return
    }
    showToast('Support request sent to IT — expect a reply within 1 business day')
    setSupportMsg('')
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-4.5 flex-wrap gap-3" style={{ marginBottom: 18 }}>
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your account, security, and system preferences</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? 'Saved' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
        <Card className="p-3" style={{ height: 'fit-content' }}>
          {navItems.map((item, i) =>
            item.divider ? (
              <div key={i} className="h-px bg-slate-200 my-2" />
            ) : (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm cursor-pointer w-full text-left ${
                  activeSection === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            )
          )}
        </Card>

        <div className="flex flex-col gap-4">
          {activeSection === 'profile' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Profile Information</h3>
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-700 border-[3px] border-slate-200 flex items-center justify-center text-xl font-semibold">EN</div>
                  <div className="absolute bottom-0 right-0 w-[26px] h-[26px] bg-blue-600 rounded-full border-[2.5px] border-white flex items-center justify-center cursor-pointer">
                    <Camera size={12} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-display text-lg font-bold text-slate-800">Dr. {profile.firstName} {profile.lastName}</div>
                  <div className="text-[13.5px] text-slate-500 mt-0.5">Consultant Cardiologist · {profile.department}</div>
                  <div className="text-[13px] text-blue-600 mt-0.5">{profile.email}</div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm"><UserCircle size={14} />Change Photo</Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                  <input value={profile.firstName} onChange={(e) => updateProfile('firstName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input value={profile.lastName} onChange={(e) => updateProfile('lastName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={profile.email} onChange={(e) => updateProfile('email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={profile.phone} onChange={(e) => updateProfile('phone', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
                  <select value={profile.department} onChange={(e) => updateProfile('department', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>Cardiology</option><option>Neurology</option><option>ICU</option>
                    <option>Orthopaedics</option><option>Paediatrics</option><option>Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">MDCN Number</label>
                  <input value={profile.mdcn} onChange={(e) => updateProfile('mdcn', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 font-mono" />
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'security' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Security & Authentication</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between bg-slate-50 border border-slate-200 rounded-[10px]" style={{ padding: 16 }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0"><Smartphone size={18} className="text-emerald-600" /></div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Two-Factor Authentication</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">Add an extra layer of security to your account</div>
                      {twoFactor && <Badge tone="active" className="mt-2">Enabled — Authenticator App</Badge>}
                    </div>
                  </div>
                  <Toggle on={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-[10px]" style={{ padding: 16 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><Clock size={18} className="text-blue-600" /></div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Auto Session Timeout</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">Automatically sign out after inactivity</div>
                    </div>
                  </div>
                  <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="text-[13px] bg-white border border-slate-200 rounded-lg px-3 py-1.5" style={{ width: 140 }}>
                    <option>15 minutes</option><option>30 minutes</option><option>1 hour</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-[10px]" style={{ padding: 16 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><Bell size={18} className="text-amber-600" /></div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Login Notifications</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">SMS alert on new sign-ins from unrecognised devices</div>
                    </div>
                  </div>
                  <Toggle on={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-[10px]" style={{ padding: 16 }}>
                  <div className="text-sm font-semibold text-slate-800 mb-3">Active Sessions</div>
                  <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <Monitor size={18} className="text-blue-600" />
                      <div>
                        <div className="text-[13.5px] font-medium text-slate-800">Windows 11 — Chrome</div>
                        <div className="text-xs text-slate-400">192.168.1.24 · This device · Now</div>
                      </div>
                    </div>
                    <Badge tone="active">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <Smartphone size={18} className="text-slate-500" />
                      <div>
                        <div className="text-[13.5px] font-medium text-slate-800">Infinix Smart 7 — Chrome Mobile</div>
                        <div className="text-xs text-slate-400">192.168.1.42 · 2 hrs ago</div>
                      </div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => showToast('Session revoked')}>Revoke</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'password' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-3.5 max-w-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Current Password</label>
                  <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                  <input type="password" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                  <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <button type="submit" className="bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 mt-1">Update Password</button>
              </form>
            </Card>
          )}

          {activeSection === '2fa' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-[10px] mb-4" style={{ padding: 16 }}>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Authenticator App</div>
                  <div className="text-[13px] text-slate-500 mt-0.5">{twoFactor ? 'Currently enabled and protecting your account' : 'Currently disabled'}</div>
                </div>
                <Toggle on={twoFactor} onChange={() => { setTwoFactor(!twoFactor); showToast(twoFactor ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled') }} />
              </div>
              {twoFactor && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg text-sm text-slate-600" style={{ padding: 14 }}>
                  Scan the QR code in your authenticator app (Google Authenticator, Authy) to link this account, or enter setup key: <span className="font-mono text-slate-800">MVLT-7F2A-93KD</span>
                </div>
              )}
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Notification Preferences</h3>
              <div className="flex flex-col gap-3">
                {[
                  ['email', 'Email Notifications', 'Receive updates via email'],
                  ['sms', 'SMS Alerts', 'Receive urgent alerts via SMS'],
                  ['criticalAlerts', 'Critical Patient Alerts', 'Immediate notification for critical status changes'],
                  ['weeklyDigest', 'Weekly Digest', 'Summary of hospital activity every Monday'],
                ].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-[10px]" style={{ padding: 16 }}>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{label}</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">{desc}</div>
                    </div>
                    <Toggle on={notifPrefs[key]} onChange={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'system' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">System Preferences</h3>
              <div className="flex flex-col gap-4 max-w-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Theme</label>
                  <select value={systemPrefs.theme} onChange={(e) => setSystemPrefs((p) => ({ ...p, theme: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>Light</option><option>Dark</option><option>System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Table Density</label>
                  <select value={systemPrefs.density} onChange={(e) => setSystemPrefs((p) => ({ ...p, density: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>Comfortable</option><option>Compact</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'language' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Language & Region</h3>
              <div className="flex flex-col gap-4 max-w-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Language</label>
                  <select value={langPrefs.language} onChange={(e) => setLangPrefs((p) => ({ ...p, language: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>English (UK)</option><option>English (US)</option><option>Igbo</option><option>Yoruba</option><option>Hausa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Timezone</label>
                  <select value={langPrefs.timezone} onChange={(e) => setLangPrefs((p) => ({ ...p, timezone: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500">
                    <option>WAT (UTC+1)</option><option>GMT (UTC+0)</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'hospital' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Hospital Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hospital Name</label>
                  <input defaultValue={hospital} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
                  <input defaultValue="Anambra" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Only administrators can modify hospital-wide settings.</p>
            </Card>
          )}

          {activeSection === 'integrations' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Integrations</h3>
              <div className="flex flex-col gap-3">
                {[
                  ['nhis', 'NHIS Verification API', 'Verify patient insurance eligibility'],
                  ['smsGateway', 'SMS Gateway', 'Send patient reminders and alerts via SMS'],
                  ['backup', 'Cloud Backup Service', 'Automatic daily encrypted backups'],
                ].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-[10px]" style={{ padding: 16 }}>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{label}</div>
                      <div className="text-[13px] text-slate-500 mt-0.5">{desc}</div>
                    </div>
                    <Toggle on={integrations[key]} onChange={() => setIntegrations((p) => ({ ...p, [key]: !p[key] }))} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'support' && (
            <Card className="p-6">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5">Contact Support</h3>
              <form onSubmit={handleSupportSubmit} className="flex flex-col gap-3.5 max-w-lg">
                <textarea
                  rows={5}
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  placeholder="Describe the issue you're experiencing..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
                />
                <button type="submit" className="self-start bg-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Send size={14} />Send to IT
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
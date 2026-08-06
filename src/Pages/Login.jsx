import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, TrendingUp, ShieldCheck, ArrowLeft } from 'lucide-react'
import { hospital } from '../lib/mockData'
import { api } from '../lib/api'
import { useToast } from '../components/Toast'

export default function Login() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [email, setEmail] = useState('e.nwachukwu@amaku.gov.ng')
  const [password, setPassword] = useState('password123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lockedOut, setLockedOut] = useState(false)
  const [mode, setMode] = useState('login')
  const [resetEmail, setResetEmail] = useState('')
  const [demoRole, setDemoRole] = useState('doctor')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLockedOut(false)
    setLoading(true)
    try {
      const { token, user } = await api.login(email, password, demoRole)
      localStorage.setItem('medvault_token', token)
      localStorage.setItem('medvault_user', JSON.stringify(user))
      navigate('/dashboard')
    } catch (err) {
      // A network/CORS failure throws a generic "Failed to fetch" TypeError from
      // the browser itself — that's not the same as a real 401 from the backend,
      // and showing "check your email and password" for it is actively misleading.
      if (err instanceof TypeError) {
        setError('Could not reach the server. It may be waking up (can take ~50s) or there may be a connection issue — try again in a moment.')
      } else if (err.message?.toLowerCase().includes('locked')) {
        // Confirmed exact string from the real backend (app/access_control/jwt_handlers.py
        // and auth/routes.py): "Account is locked due to multiple failed login attempts."
        setLockedOut(true)
        setError(err.message)
      } else {
        setError(err.message || 'Login failed — check your email and password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSSO = async (provider) => {
    setLoading(true)
    try {
      const { token, user } = await api.login(email, password, demoRole)
      localStorage.setItem('medvault_token', token)
      localStorage.setItem('medvault_user', JSON.stringify(user))
      showToast(`Signed in via ${provider} SSO (demo)`)
      navigate('/dashboard')
    } catch {
      showToast(`${provider} SSO is not configured yet`, 'info')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    showToast(resetEmail ? `If an account exists for ${resetEmail}, a reset link has been sent` : 'Enter your email first')
    if (resetEmail) setMode('login')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Mobile-only compact header */}
      <div
        className="flex lg:hidden items-center gap-2.5 px-6 py-5"
        style={{ background: 'linear-gradient(145deg, #060C18 0%, #0F1D36 50%, #0A1628 100%)' }}
      >
        <img
          src="/medvaultlogo.png"
          alt="MedVault"
          style={{ height: 36, filter: 'brightness(0) invert(1)' }}
          className="object-contain"
        />
        <div className="text-[11px] text-slate-400 leading-tight">
          {hospital}
        </div>
      </div>

      {/* Left hero panel (desktop only) */}
      <div
        className="hidden lg:flex w-[54%] relative flex-col p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #060C18 0%, #0F1D36 50%, #0A1628 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.032] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 480, height: 480, background: 'radial-gradient(circle, rgba(37,99,235,.12) 0%, transparent 65%)', bottom: -180, right: -120 }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(20,184,166,.08) 0%, transparent 70%)', top: 80, right: 60 }} />

        <img
          src="/medvaultlogo.png"
          alt="MedVault"
          className="w-auto relative z-10 self-start object-contain"
          style={{ height: 64, filter: 'brightness(0) invert(1)' }}
        />

        <div className="flex-1 flex items-center justify-center relative z-10 py-12">
          <div className="relative w-full max-w-[390px]">
            <div className="bg-white/5 border border-white/[0.08] rounded-[14px] backdrop-blur-md" style={{ padding: 18 }}>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 bg-blue-600/[0.22] rounded-lg flex items-center justify-center">
                  <TrendingUp size={15} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Monthly Admissions</div>
                  <div className="text-[10.5px] text-slate-500">Jan – Jul 2026</div>
                </div>
                <div className="ml-auto bg-teal-500/[0.15] text-teal-400 text-[10.5px] font-semibold px-2 py-0.5 rounded-full">▲ 12%</div>
              </div>
              <div className="flex items-end gap-1.5 h-14">
                {[38, 55, 42, 68, 58, 78, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      background: i === 6 ? 'linear-gradient(180deg, #60a5fa, #2563eb)' : 'rgba(37,99,235,0.3)',
                      boxShadow: i === 6 ? '0 0 12px rgba(37,99,235,.4)' : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -top-7 -right-7 bg-white/[0.07] border border-white/10 rounded-xl backdrop-blur-md min-w-[130px]" style={{ padding: '14px 18px' }}>
              <div className="text-[10.5px] text-slate-400 mb-0.5">Active Patients</div>
              <div className="font-display text-[28px] leading-none font-bold text-white">1,284</div>
              <div className="text-[10.5px] text-teal-400 mt-0.5 flex items-center gap-1">
                <TrendingUp size={11} />
                3.4% this week
              </div>
            </div>

            <div className="absolute -bottom-7 -left-7 bg-white/[0.07] border border-white/10 rounded-xl backdrop-blur-md min-w-[130px]" style={{ padding: '14px 18px' }}>
              <div className="text-[10.5px] text-slate-400 mb-0.5">Security Score</div>
              <div className="flex items-baseline gap-1">
                <div className="font-display text-[28px] leading-none font-bold text-white">94</div>
                <div className="text-[13px] text-slate-500">/100</div>
              </div>
              <div className="text-[10.5px] text-teal-400 mt-0.5">● Excellent</div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold text-white leading-snug mb-2.5">
            Trusted patient records for<br /><span className="text-blue-400">{hospital}</span>
          </h2>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            NDPA 2023-compliant patient record management<br />for modern Nigerian healthcare professionals.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-8 sm:p-13" style={{ padding: 'clamp(24px, 6vw, 52px)' }}>
        <div className="w-full max-w-[340px]">
          {mode === 'login' ? (
            <>
              <div style={{ marginBottom: 30 }}>
                <h1 className="font-display text-[28px] font-bold text-slate-800 mb-1.5">Welcome back</h1>
                <p className="text-sm text-slate-500">Sign in to your MedVault account</p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col" style={{ gap: 18 }}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preview role (demo only — has no effect on real accounts)</label>
                  <select
                    value={demoRole}
                    onChange={(e) => setDemoRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="doctor">Doctor</option>
                    <option value="admin">Administrator</option>
                    <option value="nurse">Nurse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={`text-xs rounded-lg px-3 py-2 border ${lockedOut ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
                    {error}
                    {lockedOut && ' Contact an administrator to unlock your account.'}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600 rounded" />
                    <span className="text-[13.5px] text-slate-600">Remember me</span>
                  </label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-[13.5px] text-blue-600 font-medium">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold text-[14.5px] py-3 rounded-[10px] hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <ShieldCheck size={18} />
                  {loading ? 'Signing in...' : 'Secure Login'}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400">Or continue with</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSSO('Microsoft')}
                    className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <svg width="15" height="15" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    Microsoft SSO
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSSO('Google')}
                    className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <svg width="15" height="15" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"/>
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16 3 9.1 7.6 6.3 14.7z"/>
                      <path fill="#4CAF50" d="M24 45c5.3 0 10.2-2 13.8-5.4l-6.4-5.4c-2 1.4-4.6 2.3-7.4 2.3-5.2 0-9.6-3.3-11.3-8l-6.5 5C9 40.4 15.9 45 24 45z"/>
                      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.4 5.4C41 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
                    </svg>
                    Google SSO
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 text-center -mt-1">SSO shown for demo — not connected to live Microsoft/Google accounts</div>
              </form>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2.5 items-start" style={{ marginTop: 22, padding: '11px 13px' }}>
                <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[12.5px] font-semibold text-emerald-800">Secure Connection Active</div>
                  <div className="text-[11.5px] text-emerald-600 mt-0.5">TLS 1.3 · AES-256 · NDPA 2023 Compliant</div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400" style={{ marginTop: 14 }}>
                Need access?{' '}
                <a href="mailto:it-support@amaku.gov.ng?subject=MedVault Access Request" className="text-blue-600">
                  Contact IT Support
                </a>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
                <ArrowLeft size={15} />
                Back to login
              </button>
              <div style={{ marginBottom: 30 }}>
                <h1 className="font-display text-[28px] font-bold text-slate-800 mb-1.5">Reset password</h1>
                <p className="text-sm text-slate-500">Enter your work email and we'll send you a reset link</p>
              </div>
              <form onSubmit={handleForgotSubmit} className="flex flex-col" style={{ gap: 18 }}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@amaku.gov.ng"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold text-[14.5px] py-3 rounded-[10px] hover:bg-blue-700">
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
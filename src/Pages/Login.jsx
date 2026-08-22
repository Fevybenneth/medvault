import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react'
import { hospital } from '../lib/mockData'
import { api } from '../lib/api'
import { useToast } from '../components/Toast'
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate()
  const showToast = useToast()
  const { login } = useAuth();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lockedOut, setLockedOut] = useState(false)
  const [mode, setMode] = useState('login')
  const [resetEmail, setResetEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLockedOut(false)
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          'Could not reach the server. It may be waking up (can take ~50s) or there may be a connection issue — try again in a moment.'
        )
      } else if (err.message?.toLowerCase().includes('locked')) {
        setLockedOut(true)
        setError(err.message)
      } else {
        setError(err.message || 'Login failed — check your email and password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    showToast(
      resetEmail
        ? `If an account exists for ${resetEmail}, a reset link has been sent`
        : 'Enter your email first'
    )

    if (resetEmail) setMode('login')
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Mobile header */}
      <div
        className="flex lg:hidden items-center gap-2.5 px-6 py-5"
        style={{
          background:
            "linear-gradient(145deg, #060C18 0%, #0F1D36 50%, #0A1628 100%)",
        }}
      >
        <img
          src="/medvaultlogo.png"
          alt="MedVault"
          style={{
            height: 36,
            filter: "brightness(0) invert(1)",
          }}
          className="object-contain"
        />

        <div className="text-[11px] text-slate-400 leading-tight">
          {hospital}
        </div>
      </div>

      {/* Desktop hero */}
      <div
        className="hidden lg:flex w-[54%] relative flex-col p-12 overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #060C18 0%, #0F1D36 50%, #0A1628 100%)",
        }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 560,
            height: 560,
            right: -220,
            top: "50%",
            transform: "translateY(-50%)",
            background:
              "radial-gradient(circle, rgba(37,99,235,.14) 0%, rgba(37,99,235,.04) 38%, transparent 70%)",
          }}
        />

        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 260,
            height: 260,
            left: -120,
            bottom: -100,
            background:
              "radial-gradient(circle, rgba(20,184,166,.08) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <img
          src="/medvaultlogo.png"
          alt="MedVault"
          className="w-auto relative z-10 self-start object-contain"
          style={{
            height: 64,
            filter: "brightness(0) invert(1)",
          }}
        />

        {/* Shield visual */}
        <div className="flex-1 flex items-center justify-center relative z-10 py-12">
          <div className="relative flex items-center justify-center w-[390px] h-[390px]">
            {/* Outer glow */}
            <div
              className="absolute rounded-full"
              style={{
                inset: 45,
                background:
                  "radial-gradient(circle, rgba(59,130,246,.12) 0%, rgba(59,130,246,.04) 45%, transparent 72%)",
              }}
            />

            {/* Outer ring */}
            <div
              className="absolute rounded-full border border-blue-400/[0.12]"
              style={{
                inset: 55,
              }}
            />

            {/* Inner ring */}
            <div
              className="absolute rounded-full border border-white/[0.06]"
              style={{
                inset: 82,
              }}
            />

            {/* Decorative orbital points */}
            <div className="absolute top-[58px] right-[76px] w-2 h-2 rounded-full bg-blue-400/60 shadow-[0_0_14px_rgba(96,165,250,.7)]" />
            <div className="absolute bottom-[78px] left-[72px] w-1.5 h-1.5 rounded-full bg-teal-400/50" />
            <div className="absolute top-[145px] left-[50px] w-1 h-1 rounded-full bg-white/30" />

            {/* Shield */}
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 178,
                height: 205,
                clipPath:
                  "polygon(50% 0%, 91% 14%, 91% 52%, 80% 72%, 66% 87%, 50% 100%, 34% 87%, 20% 72%, 9% 52%, 9% 14%)",
                background:
                  "linear-gradient(145deg, rgba(96,165,250,.95), rgba(37,99,235,.88) 55%, rgba(15,23,42,.96))",
                filter: "drop-shadow(0 0 28px rgba(37,99,235,.24))",
              }}
            >
              <div
                className="absolute"
                style={{
                  inset: 2,
                  clipPath:
                    "polygon(50% 0%, 91% 14%, 91% 52%, 80% 72%, 66% 87%, 50% 100%, 34% 87%, 20% 72%, 9% 52%, 9% 14%)",
                  background:
                    "linear-gradient(145deg, rgba(15,23,42,.98), rgba(15,31,54,.96))",
                }}
              />

              {/* Lock */}
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className="w-[52px] h-[42px] rounded-[10px] border-2 border-blue-300/80 relative"
                  style={{
                    background: "rgba(59,130,246,.14)",
                    boxShadow: "0 0 24px rgba(59,130,246,.14)",
                  }}
                >
                  <div className="absolute left-1/2 -top-[27px] -translate-x-1/2 w-[29px] h-[29px] rounded-t-full border-2 border-b-0 border-blue-300/80" />

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-300">
                    <div className="absolute left-1/2 top-full -translate-x-1/2 w-1 h-2.5 bg-blue-300 rounded-b-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Small status badge */}
            <div className="absolute bottom-[50px] right-[48px] flex items-center gap-2 bg-white/[0.06] border border-white/[0.09] backdrop-blur-md rounded-full px-3.5 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />
              <span className="text-[10.5px] text-slate-300 font-medium">
                Protected
              </span>
            </div>

            {/* Small security badge */}
            <div className="absolute top-[68px] left-[46px] flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] backdrop-blur-md">
              <ShieldCheck size={17} className="text-blue-300" />
            </div>
          </div>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold text-white leading-snug mb-2.5">
            Secure patient records for
            <br />
            <span className="text-blue-400">{hospital}</span>
          </h2>

          <p className="text-[13px] text-slate-400 leading-relaxed max-w-[500px]">
            A secure workspace for authorized healthcare professionals to
            manage, access, and protect patient records.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div
        className="flex-1 flex items-center justify-center bg-white px-6 py-8 sm:p-13"
        style={{ padding: "clamp(24px, 6vw, 52px)" }}
      >
        <div className="w-full max-w-[340px]">
          {mode === "login" ? (
            <>
              <div style={{ marginBottom: 30 }}>
                <h1 className="font-display text-[28px] font-bold text-slate-800 mb-1.5">
                  Welcome back
                </h1>

                <p className="text-sm text-slate-500">
                  Sign in to your MedVault account
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="flex flex-col"
                style={{ gap: 18 }}
              >
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className={`text-xs rounded-lg px-3 py-2 border ${
                      lockedOut
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }`}
                  >
                    {error}

                    {lockedOut &&
                      " Contact an administrator to unlock your account."}
                  </div>
                )}

                {/* Options */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-blue-600 rounded"
                    />

                    <span className="text-[13.5px] text-slate-600">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      showToast(
                        "Contact your system administrator to reset your password.",
                        "info",
                      )
                    }
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-semibold text-[14.5px] py-3 rounded-[10px] hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <ShieldCheck size={18} />

                  {loading ? "Signing in..." : "Secure Login"}
                </button>
              </form>

              {/* Security notice */}
              <div
                className="bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2.5 items-start"
                style={{ marginTop: 22, padding: "11px 13px" }}
              >
                <ShieldCheck
                  size={16}
                  className="text-emerald-600 flex-shrink-0 mt-0.5"
                />

                <div>
                  <div className="text-[12.5px] font-semibold text-emerald-800">
                    Secure Connection Active
                  </div>

                  <div className="text-[11.5px] text-emerald-600 mt-0.5">
                    Protected access to the MedVault system
                  </div>
                </div>
              </div>

              <div
                className="text-center text-xs text-slate-400"
                style={{ marginTop: 14 }}
              >
                Need access?{" "}
                <a
                  href="mailto:it-support@amaku.gov.ng?subject=MedVault Access Request"
                  className="text-blue-600"
                >
                  Contact IT Support
                </a>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1.5 text-sm text-slate-500 mb-6"
              >
                <ArrowLeft size={15} />
                Back to login
              </button>

              <div style={{ marginBottom: 30 }}>
                <h1 className="font-display text-[28px] font-bold text-slate-800 mb-1.5">
                  Reset password
                </h1>

                <p className="text-sm text-slate-500">
                  Enter your work email and we'll send you a reset link
                </p>
              </div>

              <form
                onSubmit={handleForgotSubmit}
                className="flex flex-col"
                style={{ gap: 18 }}
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@amaku.gov.ng"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold text-[14.5px] py-3 rounded-[10px] hover:bg-blue-700"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
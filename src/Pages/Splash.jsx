import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield, Award, Cloud } from 'lucide-react'
import { hospital } from '../lib/mockData'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 2800)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060C18 0%, #0F1A2E 40%, #091629 100%)' }}
    >
      <style>{`
        @keyframes loading-prog { 0%{width:0} 30%{width:45%} 60%{width:72%} 80%{width:85%} 95%{width:95%} 100%{width:100%} }
        .loading-bar { animation: loading-prog 2.6s ease-in-out forwards; }
      `}</style>

      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow blobs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 700, height: 700, background: 'radial-gradient(circle, rgba(37,99,235,.09) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{ width: 320, height: 320, background: 'radial-gradient(circle, rgba(20,184,166,.06) 0%, transparent 70%)', top: '15%', right: '18%' }}
      />

      <div className="relative flex flex-col items-center text-center z-10">
<img src="/medvaultlogo.png" alt="MedVault" className="w-72 max-w-[80vw] mb-2" />

        <div className="text-xs text-slate-600 tracking-[.15em] uppercase font-semibold mb-10 -mt-2">
          {hospital}
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="w-[220px] h-[2.5px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full loading-bar rounded-full" style={{ background: 'linear-gradient(90deg, #2563EB, #14B8A6)' }} />
          </div>
          <div className="text-slate-600 text-[12.5px] flex items-center gap-2">
            <div className="w-3.5 h-3.5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            Initialising secure session...
          </div>
        </div>
      </div>

      {/* Compliance badges */}
      <div className="absolute bottom-9 flex gap-5 items-center flex-wrap justify-center px-4">
        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <Lock size={14} className="text-blue-500" />AES-256 Encryption
        </div>
        <div className="w-[3px] h-[3px] bg-slate-800 rounded-full" />
        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <Shield size={14} className="text-teal-500" />NDPR Compliant
        </div>
        <div className="w-[3px] h-[3px] bg-slate-800 rounded-full" />
        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <Award size={14} className="text-teal-500" />ISO 27001 Certified
        </div>
        <div className="w-[3px] h-[3px] bg-slate-800 rounded-full" />
        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <Cloud size={14} className="text-slate-500" />NHIS Integrated
        </div>
      </div>
      <div className="absolute bottom-3.5 right-5 text-[11px] text-slate-800">v1.0.0 — Final Year Project Build</div>
    </div>
  )
}
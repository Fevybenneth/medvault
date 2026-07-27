import { Construction } from 'lucide-react'

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: 400 }}>
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Construction size={28} className="text-slate-400" />
      </div>
      <h2 className="text-lg font-display font-bold text-slate-800 mb-1">{title}</h2>
      <p className="text-sm text-slate-500">This module hasn't been designed yet — coming soon.</p>
    </div>
  )
}
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud, FolderOpen, ScanLine, FileText, Image,
  CheckCircle2, User, FileType, Building2, Stethoscope, Calendar, ShieldCheck, X,
} from 'lucide-react'
import { patients } from '../lib/mockData'
import { Card, EncBadge, Progress } from '../components/ui'
import { useToast } from '../components/Toast'

const iconForFile = (name) => {
  if (/\.(dcm|dicom)$/i.test(name)) return { icon: ScanLine, bg: 'bg-violet-50', color: 'text-violet-600' }
  if (/\.(jpg|jpeg|png)$/i.test(name)) return { icon: Image, bg: 'bg-amber-50', color: 'text-amber-600' }
  return { icon: FileText, bg: 'bg-emerald-50', color: 'text-emerald-600' }
}

export default function Upload() {
  const navigate = useNavigate()
  const showToast = useToast()
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [queue, setQueue] = useState([])
  const [form, setForm] = useState({
    patient: patients[0]?.id || '',
    type: 'MRI Scan',
    dept: 'Cardiology',
    doctor: [...new Set(patients.map((p) => p.doctor))][0] || '',
    date: '2026-07-14',
    notes: '',
  })

  const updateForm = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const addFiles = (fileList) => {
    const newItems = Array.from(fileList).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      progress: 0,
      done: false,
      ...iconForFile(file.name),
    }))
    setQueue((q) => [...q, ...newItems])

    newItems.forEach((item) => simulateUpload(item.id))
  }

  const simulateUpload = (id) => {
    const interval = setInterval(() => {
      setQueue((q) =>
        q.map((item) => {
          if (item.id !== id || item.done) return item
          const next = Math.min(item.progress + 18, 100)
          return { ...item, progress: next, done: next === 100 }
        })
      )
    }, 350)
    setTimeout(() => clearInterval(interval), 2500)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  const removeFromQueue = (id) => setQueue((q) => q.filter((item) => item.id !== id))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (queue.length === 0) {
      showToast('Add at least one file before uploading', 'info')
      return
    }
    const patientName = patients.find((p) => p.id === form.patient)?.name || 'patient'
    showToast(`${form.type} uploaded and encrypted for ${patientName}`)
    navigate('/records')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800">Upload Medical Record</h1>
          <p className="text-sm text-slate-500 mt-0.5">Securely upload and encrypt patient records</p>
        </div>
        <EncBadge className="text-xs" />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50'
            }`}
            style={{ padding: 48 }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files.length && addFiles(e.target.files)}
            />
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={32} className="text-blue-600" />
            </div>
            <div className="font-display text-base font-semibold text-slate-800 mb-1.5">Drag &amp; drop files here</div>
            <div className="text-[13.5px] text-slate-500" style={{ marginBottom: 18 }}>or click to browse from your computer</div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700"
            >
              <FolderOpen size={16} />
              Browse Files
            </button>
            <div className="text-xs text-slate-400 mt-3.5">Supported: PDF, DICOM, JPG, PNG, MP4 · Max 500 MB per file</div>
          </div>

          <Card style={{ padding: 18 }}>
            <h3 className="text-sm font-semibold text-slate-800 mb-3.5">Upload Queue</h3>
            {queue.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No files added yet.</p>
            ) : (
              <div>
                {queue.map((item, i) => (
                  <div key={item.id} className={`flex items-center gap-3 ${i < queue.length - 1 ? 'border-b border-slate-100' : ''}`} style={{ padding: '10px 0' }}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-medium text-slate-800 truncate mb-1">{item.name}</div>
                      <Progress value={item.progress} color={item.done ? '#059669' : '#2563eb'} />
                      <div className={`text-[11.5px] mt-1 flex items-center gap-1 ${item.done ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {item.done && <CheckCircle2 size={12} />}
                        {item.done ? 'Upload complete · Encrypted' : 'Encrypting...'}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${item.done ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {item.done ? 'Done' : `${item.progress}%`}
                    </span>
                    <button type="button" onClick={() => removeFromQueue(item.id)} className="text-slate-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card style={{ padding: 22, height: 'fit-content' }}>
          <h3 className="text-[15px] font-semibold text-slate-800 mb-4.5" style={{ marginBottom: 18 }}>Record Details</h3>
          <div className="flex flex-col" style={{ gap: 14 }}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Patient</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.patient}
                  onChange={(e) => updateForm('patient', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Record Type</label>
              <div className="relative">
                <FileType size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.type}
                  onChange={(e) => updateForm('type', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>MRI Scan</option><option>X-Ray</option><option>Blood Panel</option>
                  <option>ECG</option><option>Prescription</option><option>Discharge Summary</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Department</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.dept}
                  onChange={(e) => updateForm('dept', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>Cardiology</option><option>Neurology</option><option>ICU</option>
                  <option>Orthopaedics</option><option>Paediatrics</option><option>Emergency</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ordering Doctor</label>
              <div className="relative">
                <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.doctor}
                  onChange={(e) => updateForm('doctor', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  {[...new Set(patients.map((p) => p.doctor))].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Record Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm('date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Clinical Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                placeholder="Add clinical context or notes for this record..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2.5 items-start" style={{ padding: 12 }}>
              <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[12.5px] font-semibold text-emerald-800">End-to-End Encryption</div>
                <div className="text-[11.5px] text-emerald-600 mt-0.5">All records are encrypted before storage. Decryption requires staff authentication.</div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold text-[14.5px] py-3 rounded-[10px] hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <UploadCloud size={18} />
              Upload &amp; Encrypt
            </button>
          </div>
        </Card>
      </form>
    </div>
  )
}
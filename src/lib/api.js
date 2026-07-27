import { patients, records, staff, auditLogs, admissionsByMonth } from './mockData'

// Once the backend is ready, set this in a .env file: VITE_API_URL=http://localhost:5000/api
const BASE_URL = import.meta.env.VITE_API_URL

// Toggle this to false once your teammate's backend is live and BASE_URL works
const USE_MOCK_DATA = true

async function request(path, options = {}) {
  const token = localStorage.getItem('medvault_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  login: async (email, password, demoRole = 'doctor') => {
  const demoUsers = {
    doctor: { name: 'Dr. Emeka Nwachukwu', role: 'doctor', roleLabel: 'Consultant', dept: 'Cardiology', email: 'e.nwachukwu@amaku.gov.ng' },
    admin: { name: 'Dr. Adaeze Nwosu', role: 'admin', roleLabel: 'Admin / HOD', dept: 'ICU', email: 'a.nwosu@amaku.gov.ng' },
    nurse: { name: 'Nurse Ifeoma Adeyemi', role: 'nurse', roleLabel: 'Senior Nurse', dept: 'Cardiology', email: 'i.adeyemi@amaku.gov.ng' },
  }
  if (USE_MOCK_DATA) return { token: 'mock-token', user: demoUsers[demoRole] }
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
},

  getPatients: async () => {
    if (USE_MOCK_DATA) return patients
    const data = await request('/patients')
    return data.patients
  },

  getPatientById: async (id) => {
    if (USE_MOCK_DATA) return patients.find((p) => p.id === id)
    return request(`/patients/${id}`)
  },

  getRecords: async () => {
    if (USE_MOCK_DATA) return records
    const data = await request('/records')
    return data.records
  },

  uploadRecord: async (formData) => {
    if (USE_MOCK_DATA) return { recordId: 'MR-NEW', status: 'complete' }
    return request('/records/upload', { method: 'POST', body: formData, headers: {} })
  },

  getStaff: async () => {
    if (USE_MOCK_DATA) return staff
    const data = await request('/users')
    return data.users
  },

  getAuditLogs: async () => {
    if (USE_MOCK_DATA) return auditLogs
    const data = await request('/audit-logs')
    return data.logs
  },

  getDashboardStats: async () => {
    if (USE_MOCK_DATA) return { admissionsByMonth }
    return request('/dashboard/stats')
  },
}
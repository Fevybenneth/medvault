import { patients, records, staff, auditLogs, admissionsByMonth } from './mockData'

// Backend is live on Render: https://medvault-backend-vw9j.onrender.com
// Set VITE_API_URL in your .env / .env.local to that value (do not commit .env.local).
// Note: Render free tier spins down after inactivity — the first request after
// idle time can take 50+ seconds to respond while the instance wakes up.
const BASE_URL = import.meta.env.VITE_API_URL

// Auth + patients + records + audit are all confirmed working against the
// backend contract as of Aug 2 2026. Flip per-section as you verify each screen,
// or flip this off globally once everything's been clicked through for real.
const USE_MOCK_DATA = false

// Messages the backend contract calls out as needing an automatic logout,
// rather than just being shown as a normal error toast.
const FORCE_LOGOUT_MESSAGES = [
  'Account is no longer active.',
  'Your session has expired. Please log in again.',
]

function clearSessionAndRedirect() {
  localStorage.removeItem('medvault_token')
  localStorage.removeItem('medvault_user')
  if (typeof window !== 'undefined') window.location.href = '/login'
}

async function request(path, options = {}) {
  const token = localStorage.getItem('medvault_token')
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      // Don't set Content-Type for FormData — the browser needs to add its own
      // multipart boundary, and a hardcoded 'application/json' here would break uploads.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = data.error || `API error: ${res.status}`
    if (FORCE_LOGOUT_MESSAGES.includes(message)) {
      clearSessionAndRedirect()
    }
    throw new Error(message)
  }

  return data
}

function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries).toString()
}

export const api = {
  // ---------- Auth ----------

  login: async (email, password, demoRole = 'doctor') => {
    const demoUsers = {
      doctor: { name: 'Dr. Emeka Nwachukwu', role: 'doctor', roleLabel: 'Consultant', dept: 'Cardiology', email: 'e.nwachukwu@amaku.gov.ng' },
      admin: { name: 'Dr. Adaeze Nwosu', role: 'admin', roleLabel: 'Admin / HOD', dept: 'ICU', email: 'a.nwosu@amaku.gov.ng' },
      nurse: { name: 'Nurse Ifeoma Adeyemi', role: 'nurse', roleLabel: 'Senior Nurse', dept: 'Cardiology', email: 'i.adeyemi@amaku.gov.ng' },
    }
    if (USE_MOCK_DATA) return { token: 'mock-token', user: demoUsers[demoRole] }

    // Note: any role selector in the login UI is cosmetic only — the backend
    // ignores whatever role is sent and always uses the account's real role.
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    localStorage.setItem('medvault_token', data.token)
    localStorage.setItem('medvault_user', JSON.stringify(data.user))
    return data
  },

  getMyProfile: async () => {
    if (USE_MOCK_DATA) return null
    return request('/auth/me')
  },

  // Only phone and department are self-editable. At least one is required.
  updateMyProfile: async ({ phone, department }) => {
    if (USE_MOCK_DATA) return { message: 'Profile updated (mock)' }
    return request('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ ...(phone ? { phone } : {}), ...(department ? { department } : {}) }),
    })
  },

  // ---------- Admin: staff user management ----------

  getStaff: async ({ page, limit } = {}) => {
    if (USE_MOCK_DATA) return staff
    const data = await request(`/auth/users${qs({ page, limit })}`)
    return data.users
  },

  createStaffAccount: async (payload) => {
    // payload: first_name, last_name, email, password, role, department?, license_number?
    if (USE_MOCK_DATA) return { user_id: 0, message: 'Staff account created (mock)' }
    return request('/auth/users', { method: 'POST', body: JSON.stringify(payload) })
  },

  updateStaffAccount: async (userId, fields) => {
    // fields: any of role, is_active, is_locked, department, license_number
    if (USE_MOCK_DATA) return { id: userId, message: 'User updated (mock)', fields_updated: Object.keys(fields) }
    return request(`/auth/users/${userId}`, { method: 'PATCH', body: JSON.stringify(fields) })
  },

  // ---------- Patients ----------

  getPatients: async () => {
    if (USE_MOCK_DATA) return patients
    // Not a dedicated list-patients route in the contract — patients surface
    // through GET /records (patient_name per record). Adjust here once/if a
    // direct GET /records/patients listing route is confirmed.
    const data = await request('/records')
    return data.records
  },

  getPatientById: async (id) => {
    if (USE_MOCK_DATA) return patients.find((p) => p.id === id)
    return request(`/records/${id}`)
  },

  createPatient: async (payload) => {
    // payload: first_name, last_name (or full_name), age, gender?, phone?, address?,
    // national_id?, assigned_doctor_id?, portal_email?, portal_password?
    // Both portal_email and portal_password must be present together or neither is used.
    if (USE_MOCK_DATA) return { patient_id: 'mock-id', hospital_id: 'MR-000000', message: 'Patient record created (mock)' }
    return request('/records/patients', { method: 'POST', body: JSON.stringify(payload) })
  },

  createPortalAccount: async (patientId, portalEmail, portalPassword) => {
    if (USE_MOCK_DATA) return { user_id: 0, patient_id: patientId, message: 'Portal account created and linked (mock)' }
    return request(`/records/patients/${patientId}/portal-account`, {
      method: 'POST',
      body: JSON.stringify({ portal_email: portalEmail, portal_password: portalPassword }),
    })
  },

  // ---------- Records ----------

  getRecords: async ({ page, limit, patientId, recordType, dateFrom, dateTo } = {}) => {
    if (USE_MOCK_DATA) return records
    const data = await request(
      `/records${qs({ page, limit, patient_id: patientId, record_type: recordType, date_from: dateFrom, date_to: dateTo })}`
    )
    return data.records
  },

  getRecordById: async (recordId) => {
    if (USE_MOCK_DATA) return records.find((r) => r.id === recordId)
    return request(`/records/${recordId}`)
  },

  // formFields: { patient_id, record_type, data } — `data` will be JSON.stringified.
  // file is optional.
  uploadRecord: async ({ patientId, recordType, data, file }) => {
    if (USE_MOCK_DATA) return { record_id: 'MR-NEW', checksum: 'mock', message: 'Record uploaded successfully. (mock)' }
    const formData = new FormData()
    formData.append('patient_id', patientId)
    formData.append('record_type', recordType)
    formData.append('data', JSON.stringify(data))
    if (file) formData.append('file', file)
    return request('/records/upload', { method: 'POST', body: formData })
  },

  // Only works on a record that doesn't already have a file attached —
  // this route cannot replace an existing file.
  attachFileToRecord: async (recordId, file) => {
    if (USE_MOCK_DATA) return { record_id: recordId, file_path: 'mock/path', message: 'File attached successfully. (mock)' }
    const formData = new FormData()
    formData.append('file', file)
    return request(`/records/${recordId}/attach-file`, { method: 'PATCH', body: formData })
  },

  // ---------- Audit (admin + auditor only) ----------

  getAuditLogs: async ({ page, limit, userId, action, status, dateFrom, dateTo } = {}) => {
    if (USE_MOCK_DATA) return auditLogs
    const data = await request(
      `/audit/logs${qs({ page, limit, user_id: userId, action, status, date_from: dateFrom, date_to: dateTo })}`
    )
    return data.logs
  },

  getAuditReport: async (recordId) => {
    if (USE_MOCK_DATA) return { record_id: recordId, total_accesses: 0, access_history: [] }
    return request(`/audit/report/${recordId}`)
  },

  // ---------- Dashboard (not in backend contract yet — stays mock) ----------

  getDashboardStats: async () => {
    return { admissionsByMonth }
  },
}
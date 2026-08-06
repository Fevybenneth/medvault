// Temporary workaround: the backend contract has no "list all patients" route
// yet (only POST /records/patients, which returns a real patient_id per
// creation). Until that route exists, we cache real patients you've actually
// created here, in localStorage, so screens like Upload and Patients can show
// real data instead of the static mock list. Remove this once a real
// list-patients GET route is confirmed and wired up.
//
// Note: the real Patient model (confirmed from backend source) only stores
// first_name, last_name, age, gender, phone, address, national_id,
// hospital_id, assigned_doctor_id. There's no blood_group, department, or
// status field on patients in the real system — don't fabricate those here.
const STORAGE_KEY = 'medvault_known_patients'

export function getKnownPatients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addKnownPatient(patient) {
  if (!patient?.id) return // nothing to cache if the backend didn't return a real id
  const existing = getKnownPatients()
  if (existing.some((p) => p.id === patient.id)) return
  const updated = [...existing, patient]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage full or unavailable — non-fatal, just skip caching
  }
}
# MedVault API Contract

Based on DTS 302 Group 4 requirements: JWT auth, RBAC, AES-encrypted storage, audit logging.
Base URL (dev): `http://localhost:5000/api`

## Auth

### POST /auth/login
Request: `{ email, password }`
Response: `{ token, user: { id, name, email, role, department } }`
Roles: `doctor` | `nurse` | `admin` | `lab_tech` | `records_officer` | `auditor`

### POST /auth/logout
Header: `Authorization: Bearer <token>`
Response: `{ success: true }`

## Patients

### GET /patients
Response: `{ patients: [{ id, name, email, age, gender, blood, doctor, dept, status }] }`

### GET /patients/:id
Response: single patient object + `{ conditions, allergies, medications, timeline }`

### POST /patients
Request: patient fields (no `id` — server generates `PT-xxx`)

## Medical Records

### GET /records
Response: `{ records: [{ id, patientId, patient, type, doctor, dept, date, size, encrypted: true }] }`

### POST /records/upload
`multipart/form-data`: `file`, `patientId`, `type`, `dept`, `doctorId`, `date`, `notes`
Response: `{ recordId, status: 'encrypting' | 'complete' }`

### GET /records/:id/download
Returns encrypted file stream (requires role-based permission check server-side)

## Users (Staff)

### GET /users
Response: `{ users: [{ name, email, role, dept, lastActive, status, permissions }] }`

### PATCH /users/:id/status
Request: `{ status: 'Active' | 'Suspended' | 'On Leave' }`

## Audit Logs

### GET /audit-logs?from=&to=&type=
Response: `{ logs: [{ time, user, dept, role, action, target, ip, status }] }`
Every read/write of patient data MUST create a log entry server-side (tamper-evident, append-only per requirements doc).

## Dashboard Stats

### GET /dashboard/stats
Response: `{ totalPatients, medicalRecords, activeDoctors, departments, storageUsed, storageTotal, securityScore, admissionsByMonth: [{month, value}] }`

## Notes for backend dev
- All patient-linked data is "sensitive by default" per requirements doc §4 — encrypt uniformly (AES at rest, TLS in transit).
- RBAC matrix (requirements doc §6) should gate which endpoints/fields each role can access — e.g. nurses shouldn't get full record edit rights, only view + administer.
- Every endpoint above needs the `Authorization: Bearer <token>` header once auth is wired.
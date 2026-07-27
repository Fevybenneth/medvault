export const hospital = 'Amaku General Hospital, Awka'

export const patients = [
  { id: 'PT-001', name: 'Chidinma Okoro', email: 'chidinma.okoro@mail.com', age: 34, gender: 'F', blood: 'O+', doctor: 'Dr. Emeka Nwachukwu', dept: 'Cardiology', status: 'Admitted' },
  { id: 'PT-002', name: 'Tunde Adewale', email: 't.adewale@mail.com', age: 67, gender: 'M', blood: 'A+', doctor: 'Dr. Ngozi Okafor', dept: 'Neurology', status: 'Stable' },
  { id: 'PT-003', name: 'Aisha Bello', email: 'a.bello@mail.com', age: 28, gender: 'F', blood: 'B-', doctor: 'Dr. Ibrahim Yusuf', dept: 'Orthopaedics', status: 'Discharged' },
  { id: 'PT-004', name: 'Obinna Eze', email: 'o.eze@mail.com', age: 45, gender: 'M', blood: 'AB+', doctor: 'Dr. Adaeze Nwosu', dept: 'ICU', status: 'Critical' },
  { id: 'PT-005', name: 'Fatima Suleiman', email: 'f.suleiman@mail.com', age: 19, gender: 'F', blood: 'O-', doctor: 'Dr. Chukwuemeka Eze', dept: 'Paediatrics', status: 'Admitted' },
]

export const records = [
  { id: 'MR-8842', patient: 'Chidinma Okoro', patientId: 'PT-001', type: 'MRI Scan', doctor: 'Dr. Nwachukwu', dept: 'Cardiology', date: '13 Jul 2026', size: '248 MB' },
  { id: 'MR-8841', patient: 'Obinna Eze', patientId: 'PT-004', type: 'Blood Panel', doctor: 'Dr. Nwosu', dept: 'ICU', date: '13 Jul 2026', size: '1.2 MB' },
  { id: 'MR-8840', patient: 'Tunde Adewale', patientId: 'PT-002', type: 'Discharge Summary', doctor: 'Dr. Okafor', dept: 'Neurology', date: '12 Jul 2026', size: '340 KB' },
  { id: 'MR-8839', patient: 'Fatima Suleiman', patientId: 'PT-005', type: 'X-Ray', doctor: 'Dr. Eze', dept: 'Paediatrics', date: '11 Jul 2026', size: '18.4 MB' },
  { id: 'MR-8838', patient: 'Aisha Bello', patientId: 'PT-003', type: 'ECG Report', doctor: 'Dr. Yusuf', dept: 'Orthopaedics', date: '10 Jul 2026', size: '892 KB' },
]

export const staff = [
  { name: 'Dr. Emeka Nwachukwu', email: 'e.nwachukwu@amaku.gov.ng', role: 'Consultant', roleType: 'doctor', dept: 'Cardiology', lastActive: 'Today 08:14', status: 'Active', permissions: ['Records', 'Prescribe', 'Admit'] },
  { name: 'Dr. Ngozi Okafor', email: 'n.okafor@amaku.gov.ng', role: 'Consultant', roleType: 'doctor', dept: 'Neurology', lastActive: 'Today 07:58', status: 'Active', permissions: ['Records', 'Prescribe'] },
  { name: 'Dr. Adaeze Nwosu', email: 'a.nwosu@amaku.gov.ng', role: 'Admin / HOD', roleType: 'admin', dept: 'ICU', lastActive: 'Today 06:30', status: 'Active', permissions: ['Full Access'] },
  { name: 'Dr. Ibrahim Yusuf', email: 'i.yusuf@amaku.gov.ng', role: 'Registrar', roleType: 'doctor', dept: 'Orthopaedics', lastActive: '3 days ago', status: 'On Leave', permissions: ['Records', 'Prescribe'] },
  { name: 'Nurse Ifeoma Adeyemi', email: 'i.adeyemi@amaku.gov.ng', role: 'Senior Nurse', roleType: 'nurse', dept: 'Cardiology', lastActive: 'Today 09:12', status: 'Active', permissions: ['View Records', 'Administer'] },
]

export const auditLogs = [
  { time: '2026-07-14 09:42:18', user: 'Dr. Emeka Nwachukwu', dept: 'Cardiology', role: 'Consultant', roleType: 'doctor', action: 'Patient Admitted', target: 'Chidinma Okoro (PT-001)', ip: '192.168.1.24', status: 'Success' },
  { time: '2026-07-14 09:31:05', user: 'Dr. Adaeze Nwosu', dept: 'ICU', role: 'Admin / HOD', roleType: 'admin', action: 'Record Viewed', target: 'Obinna Eze (PT-004)', ip: '10.0.0.88', status: 'Success' },
  { time: '2026-07-14 09:14:47', user: 'Unknown', dept: '—', role: 'Unauthorised', roleType: 'failed', action: 'Failed Login (x3)', target: '—', ip: '203.18.44.119', status: 'Blocked' },
  { time: '2026-07-14 08:59:22', user: 'Dr. Ngozi Okafor', dept: 'Neurology', role: 'Consultant', roleType: 'doctor', action: 'Record Uploaded', target: 'Tunde Adewale (PT-002)', ip: '192.168.1.31', status: 'Success' },
  { time: '2026-07-14 08:44:18', user: 'Admin: C. Eze', dept: 'IT Administration', role: 'System Admin', roleType: 'admin', action: 'Permission Changed', target: 'User: Dr. Ibrahim Yusuf', ip: '10.0.1.5', status: 'Review' },
  { time: '2026-07-14 08:30:00', user: 'System', dept: 'Automated', role: 'System', roleType: 'system', action: 'Daily Backup', target: 'All records — 640 GB', ip: '127.0.0.1', status: 'Success' },
]

export const admissionsByMonth = [
  { month: 'Jan', value: 820 }, { month: 'Feb', value: 940 }, { month: 'Mar', value: 880 },
  { month: 'Apr', value: 1120 }, { month: 'May', value: 1050 }, { month: 'Jun', value: 1180 }, { month: 'Jul', value: 1284 },
]
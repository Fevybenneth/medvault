import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import { useToast } from './components/Toast'
import Splash from './Pages/Splash'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Patients from './Pages/Patients'
import AddPatient from './Pages/AddPatient'
import PatientProfile from './Pages/PatientProfile'
import Records from './Pages/Records'
import Upload from './Pages/Upload'
import Users from './Pages/Users'
import Audit from './Pages/Audit'
import Reports from './Pages/Reports'
import Settings from './Pages/Settings'
import ComingSoon from './Pages/ComingSoon'
import ErrorPage from './Pages/ErrorPage'

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('medvault_user'))
  } catch {
    return null
  }
}

function AppLayout({ children }) {
  const user = getCurrentUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav user={user} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function RoleGuard({ children, allowedRoles, message }) {
  const user = getCurrentUser()
  const showToast = useToast()
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    if (!user || !allowedRoles.includes(user.role)) {
      showToast(message, 'info')
      setRedirect(true)
    }
  }, [])

  if (redirect) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/patients" element={<AppLayout><Patients /></AppLayout>} />
      <Route path="/patients/new" element={<AppLayout><AddPatient /></AppLayout>} />
      <Route path="/patients/:id" element={<AppLayout><PatientProfile /></AppLayout>} />
      <Route path="/records" element={<AppLayout><Records /></AppLayout>} />
      <Route path="/upload" element={<AppLayout><Upload /></AppLayout>} />
      <Route path="/laboratory" element={<AppLayout><ComingSoon title="Laboratory" /></AppLayout>} />
      <Route path="/pharmacy" element={<AppLayout><ComingSoon title="Pharmacy" /></AppLayout>} />
      <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
      <Route
        path="/audit"
        element={
          <AppLayout>
            <RoleGuard allowedRoles={['admin', 'auditor']} message="Audit Logs is restricted to administrators and auditors">
              <Audit />
            </RoleGuard>
          </AppLayout>
        }
      />
      <Route
        path="/users"
        element={
          <AppLayout>
            <RoleGuard allowedRoles={['admin']} message="User Management is restricted to administrators">
              <Users />
            </RoleGuard>
          </AppLayout>
        }
      />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="/403" element={<ErrorPage code={403} />} />
      <Route path="/500" element={<ErrorPage code={500} />} />
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  )
}

export default App
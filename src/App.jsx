import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { useToast } from "./components/Toast";
import { useAuth } from "./context/AuthContext";
import Splash from "./Pages/Splash";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Patients from "./Pages/Patients";
import AddPatient from "./Pages/AddPatient";
import PatientProfile from "./Pages/PatientProfile";
import Records from "./Pages/Records";
import Upload from "./Pages/Upload";
import Users from "./Pages/Users";
import Audit from "./Pages/Audit";
import Reports from "./Pages/Reports";
import Settings from "./Pages/Settings";
import ErrorPage from "./Pages/ErrorPage";

function AppLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// Wraps any authenticated route. Waits for session validation to finish
// before judging, so a page refresh can't produce a false "not logged in"
// redirect while /auth/me is still resolving.
function ProtectedRoute({ children, permission, message }) {
  const { isAuthenticated, loading, hasPermission } = useAuth();
  const showToast = useToast();
  const [deniedRedirect, setDeniedRedirect] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && permission && !hasPermission(permission)) {
      showToast(message || "You do not have access to that page.", "info");
      setDeniedRedirect(true);
    }
  }, [loading, isAuthenticated]);

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (deniedRedirect) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Patients />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddPatient />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PatientProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/records"
        element={
          <ProtectedRoute
            permission="view_records"
            message="Medical Records is restricted for your role."
          >
            <AppLayout>
              <Records />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute
            permission="upload_records"
            message="Uploading records is restricted for your role."
          >
            <AppLayout>
              <Upload />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute
            permission="view_logs"
            message="Audit Logs is restricted to administrators and auditors."
          >
            <AppLayout>
              <Audit />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute
            permission="manage_users"
            message="User Management is restricted to administrators."
          >
            <AppLayout>
              <Users />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/403" element={<ErrorPage code={403} />} />
      <Route path="/500" element={<ErrorPage code={500} />} />
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  );
}

export default App;

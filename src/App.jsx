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
import LinkPortal from "./Pages/LinkPortal";
import PatientProfile from "./Pages/PatientProfile";
import Records from "./Pages/Records";
import RecordDetail from "./Pages/RecordDetail";
import Upload from "./Pages/Upload";
import Users from "./Pages/Users";
import StaffProfile from "./Pages/StaffProfile";
import CreateStaff from "./Pages/CreateStaff";
import Audit from "./Pages/Audit";
import Reports from "./Pages/Reports";
import Settings from "./Pages/Settings";
import ErrorPage from "./Pages/ErrorPage";
import { useScrollFade } from "./lib/useScrollFade";

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainScrollRef = useScrollFade();
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    const saved = localStorage.getItem("medvault_sidebar_pinned");

    return saved === null ? true : saved === "true";
  });

  const handleTogglePin = () => {
    setSidebarPinned((current) => {
      const next = !current;

      localStorage.setItem("medvault_sidebar_pinned", String(next));

      return next;
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pinned={sidebarPinned}
          onTogglePin={handleTogglePin}
        />

        <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
          <TopNav onMenuClick={() => setSidebarOpen(true)} />

          <main
            ref={mainScrollRef}
            className="flex-1 min-w-0 p-3 sm:p-6 overflow-y-auto"
          >
            {children}
          </main>
        </div>
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
          <ProtectedRoute
            permission="register_patient"
            message="Registering new patients is restricted for your role."
          >
            <AppLayout>
              <AddPatient />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/link-portal"
        element={
          <ProtectedRoute
            permission="link_patient_identity"
            message="Linking portal accounts is restricted for your role."
          >
            <AppLayout>
              <LinkPortal />
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
        path="/records/:id"
        element={
          <ProtectedRoute
            permission="view_record_detail"
            message="Viewing decrypted record content is restricted for your role."
          >
            <AppLayout>
              <RecordDetail />
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
      // new Route, placed right after the existing /users route block:
      <Route
        path="/users/new"
        element={
          <ProtectedRoute
            permission="manage_users"
            message="Creating staff accounts is restricted to administrators."
          >
            <AppLayout>
              <CreateStaff />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute
            permission="manage_users"
            message="Viewing staff profiles is restricted to administrators."
          >
            <AppLayout>
              <StaffProfile />
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

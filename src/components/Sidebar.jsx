import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  UploadCloud,
  History,
  UserCog,
  UserPlus,
  Link2,
  FileBarChart,
  Settings,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../lib/avatar";
import { ROLE_LABELS, ROLES } from "../config/navigation";
import { useScrollFade } from "../lib/useScrollFade";

export default function Sidebar({ isOpen, onClose, pinned, onTogglePin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, hasPermission } = useAuth();
  const navScrollRef = useScrollFade(700);

  const isAdmin = role === ROLES.ADMIN;
  const isAuditor = role === ROLES.AUDITOR;
  const isPatient = role === ROLES.PATIENT;

  // Permission-based — same fix as Dashboard. This is also what was
  // silently missing "Create Staff" entirely: there was nowhere in the
  // sidebar that pointed at staff creation at all, only staff *viewing*.
  const canUpload = hasPermission("upload_records");
  const canManageStaff = hasPermission("manage_users");
  const canGrantPortal = hasPermission("link_patient_identity");
  const canViewReports = isAdmin || isAuditor || role === ROLES.RECORDS_OFFICER;

  const name = user?.first_name
    ? `${user.first_name} ${user.last_name}`
    : "User";
  const department = user?.department || "General";
  const roleDisplay = ROLE_LABELS?.[role] || role || "Staff";

  const handleSignOut = async () => {
    if (onClose) onClose();
    await logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors group relative ${
      isActive
        ? "bg-blue-600 text-white shadow-xs"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    } ${!pinned ? "lg:justify-center lg:px-0" : ""}`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Persistent Dark Sidebar Shell */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 bg-slate-900 border-r border-slate-800 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${pinned ? "w-64" : "w-64 lg:w-20"} shrink-0 h-screen`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header - Hover Group for Pin Icon */}
          <div
            className={`group/header h-16 flex items-center border-b border-slate-800 shrink-0 px-4 justify-between ${
              !pinned ? "lg:justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Shield size={18} />
              </div>
              <div className={`min-w-0 ${!pinned ? "lg:hidden" : ""}`}>
                <div className="font-display text-sm font-bold text-white truncate">
                  MedVault
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Security Engine
                </div>
              </div>
            </div>

            {/* Mobile Close Button (X) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation drawer"
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className={`hidden lg:flex w-7 h-7 items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ${
                  pinned
                    ? "opacity-0 group-hover/header:opacity-100"
                    : "opacity-100"
                }`}
              >
                {pinned ? (
                  <PanelLeftClose size={16} />
                ) : (
                  <PanelLeftOpen size={16} />
                )}
              </button>
            )}
          </div>

          {/* Nav List with Scroll Fade */}
          <nav
            ref={navScrollRef}
            className="flex-1 overflow-y-auto fade-scroll px-3 py-4 space-y-6"
          >
            <div>
              <div
                className={`text-[10px] font-semibold uppercase text-slate-500 px-3 mb-2 ${
                  !pinned ? "lg:hidden" : ""
                }`}
              >
                Workspace
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  className={navItemClass}
                  onClick={onClose}
                >
                  <LayoutDashboard size={17} className="shrink-0" />
                  <span className={!pinned ? "lg:hidden" : ""}>Dashboard</span>
                </NavLink>
                {!isPatient && (
                  <NavLink
                    to="/patients"
                    className={({ isActive }) =>
                      navItemClass({
                        isActive:
                          isActive &&
                          !location.pathname.startsWith(
                            "/patients/link-portal",
                          ),
                      })
                    }
                    onClick={onClose}
                  >
                    <Users size={17} className="shrink-0" />
                    <span className={!pinned ? "lg:hidden" : ""}>Patients</span>
                  </NavLink>
                )}
                {canGrantPortal && (
                  <NavLink
                    to="/patients/link-portal"
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <Link2 size={17} className="shrink-0" />
                    <span className={!pinned ? "lg:hidden" : ""}>
                      Grant Portal Access
                    </span>
                  </NavLink>
                )}
                <NavLink
                  to="/records"
                  className={navItemClass}
                  onClick={onClose}
                >
                  <FileText size={17} className="shrink-0" />
                  <span className={!pinned ? "lg:hidden" : ""}>
                    Medical Records
                  </span>
                </NavLink>
                {canUpload && (
                  <NavLink
                    to="/upload"
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <UploadCloud size={17} className="shrink-0" />
                    <span className={!pinned ? "lg:hidden" : ""}>
                      Upload Record
                    </span>
                  </NavLink>
                )}
              </div>
            </div>

            {(isAdmin || isAuditor || canViewReports) && (
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase text-slate-500 px-3 mb-2 ${
                    !pinned ? "lg:hidden" : ""
                  }`}
                >
                  Hospital Operations
                </div>
                <div className="space-y-1">
                  {canViewReports && (
                    <NavLink
                      to="/reports"
                      className={navItemClass}
                      onClick={onClose}
                    >
                      <FileBarChart size={17} className="shrink-0" />
                      <span className={!pinned ? "lg:hidden" : ""}>
                        Reports
                      </span>
                    </NavLink>
                  )}
                  {(isAdmin || isAuditor) && (
                    <NavLink
                      to="/audit"
                      className={navItemClass}
                      onClick={onClose}
                    >
                      <History size={17} className="shrink-0" />
                      <span className={!pinned ? "lg:hidden" : ""}>
                        Audit Ledger
                      </span>
                    </NavLink>
                  )}
                </div>
              </div>
            )}

            {canManageStaff && (
              <div>
                <div
                  className={`text-[10px] font-semibold uppercase text-slate-500 px-3 mb-2 ${
                    !pinned ? "lg:hidden" : ""
                  }`}
                >
                  Administration
                </div>
                <div className="space-y-1">
                  <NavLink
                    to="/users"
                    end
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <UserCog size={17} className="shrink-0" />
                    <span className={!pinned ? "lg:hidden" : ""}>
                      Staff Users
                    </span>
                  </NavLink>
                  <NavLink
                    to="/users/new"
                    className={navItemClass}
                    onClick={onClose}
                  >
                    <UserPlus size={17} className="shrink-0" />
                    <span className={!pinned ? "lg:hidden" : ""}>
                      Create Staff
                    </span>
                  </NavLink>
                </div>
              </div>
            )}

            <div>
              <div
                className={`text-[10px] font-semibold uppercase text-slate-500 px-3 mb-2 ${
                  !pinned ? "lg:hidden" : ""
                }`}
              >
                Preferences
              </div>
              <div className="space-y-1">
                <NavLink
                  to="/settings"
                  className={navItemClass}
                  onClick={onClose}
                >
                  <Settings size={17} className="shrink-0" />
                  <span className={!pinned ? "lg:hidden" : ""}>Settings</span>
                </NavLink>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 space-y-2">
          {/* Identity Widget */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-800 border border-slate-700/50 shadow-2xs ${
              !pinned ? "lg:justify-center lg:p-1.5" : ""
            }`}
          >
            <img
              src={getAvatarUrl(user?.email)}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
            />
            <div className={`min-w-0 flex-1 ${!pinned ? "lg:hidden" : ""}`}>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {department} · {roleDisplay}
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer ${
              !pinned ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <LogOut size={15} className="shrink-0" />
            <span className={!pinned ? "lg:hidden" : ""}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

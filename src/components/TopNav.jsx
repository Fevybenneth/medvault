import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  UserCircle,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../lib/avatar";
import { ROLE_LABELS, ROLES } from "../config/navigation";
import SearchModal from "./SearchModal";

export default function TopNav({ onMenuClick, isSidebarOpen = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Keyboard Shortcut Listener (Cmd+K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dynamic breadcrumbs
  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return [{ label: "Dashboard", path: "/" }];
    }
    return segments.map((seg, index) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace("-", " "),
      path: `/${segments.slice(0, index + 1).join("/")}`,
    }));
  }, [location.pathname]);

  const name = user?.first_name
    ? user.role === "doctor"
      ? `Dr. ${user.first_name} ${user.last_name}`
      : `${user.first_name} ${user.last_name}`
    : "Authenticated User";

  const department = user?.department || "General";
  const roleDisplay = ROLE_LABELS?.[role] || role || "Staff";
  const isAuditorOrAdmin = role === ROLES.ADMIN || role === ROLES.AUDITOR;

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const navigateToTab = (tabName) => {
    setMenuOpen(false);
    navigate(`/settings?tab=${tabName}`);
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 gap-3 sticky top-0 z-30">
        {/* Zone 1: Navigation Hierarchy & Mobile Hamburger / Close Toggle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={
              isSidebarOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            {isSidebarOpen ? (
              <X size={20} className="text-red-500" />
            ) : (
              <Menu size={20} />
            )}
          </button>

          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 truncate"
          >
            {/* MedVault Text - Always Visible on Mobile */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              MedVault
            </button>

            {/* Path Breadcrumbs - Hidden on Mobile */}
            <div className="hidden sm:flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path} className="flex items-center gap-2">
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-slate-800 dark:text-slate-100 font-semibold truncate">
                      {crumb.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(crumb.path)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {crumb.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Zone 2: Global Search Trigger */}
        <div className="flex items-center gap-2 flex-1 max-w-md mx-2 justify-end md:justify-center">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open global search"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open global search command palette"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            className="w-full hidden md:flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors shadow-2xs group cursor-pointer"
          >
            <span className="flex items-center gap-2 min-w-0">
              <Search
                size={14}
                className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0"
              />
              <span className="truncate">
                Search patient ID, NIN, records...
              </span>
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm shadow-2xs font-mono shrink-0">
              <span className="text-[11px]">
                {typeof navigator !== "undefined" &&
                navigator?.userAgent?.includes("Mac")
                  ? "⌘"
                  : "Ctrl+"}
              </span>
              K
            </kbd>
          </button>
        </div>

        {/* Zone 3 & 4: Security Badges & Profile Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium border border-emerald-100 dark:border-emerald-500/20">
              <Lock
                size={12}
                className="text-emerald-600 dark:text-emerald-400 shrink-0"
              />
              <span>AES-256 GCM</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[11px] font-medium border border-blue-100 dark:border-blue-500/20">
              <ShieldCheck
                size={13}
                className="text-blue-600 dark:text-blue-400 shrink-0"
              />
              <span>Audit Chain OK</span>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
            >
              <img
                src={getAvatarUrl(user?.email)}
                alt=""
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
              <div className="hidden sm:block min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">
                  {name}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {department} ·{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {roleDisplay}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={14}
                className="text-slate-400 hidden sm:block ml-0.5"
              />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 sm:hidden">
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {department} · {roleDisplay}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateToTab("profile")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <UserCircle size={15} className="text-slate-400" />
                    <span>Account & Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab("security")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ShieldAlert size={15} className="text-slate-400" />
                    <span>Security & Sessions</span>
                  </button>

                  {isAuditorOrAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/audit");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <ShieldCheck size={15} className="text-slate-400" />
                      <span>Audit Ledger</span>
                    </button>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut size={15} className="text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

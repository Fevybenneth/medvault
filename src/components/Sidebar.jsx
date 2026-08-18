import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, X, PanelLeftClose, PanelLeftOpen, Pin } from "lucide-react";

import { hospital } from "../lib/mockData";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, getNavigationForRole } from "../config/navigation";

export default function Sidebar({
  isOpen,
  onClose,
  pinned = false,
  onTogglePin,
}) {
  const navigate = useNavigate();
  const { user, role, hasPermission } = useAuth();

  const navItems = getNavigationForRole(role).filter((item) =>
    hasPermission(item.permission),
  );

  const displayName = user?.first_name
    ? role === "doctor"
      ? `Dr. ${user.first_name} ${user.last_name}`
      : `${user.first_name} ${user.last_name}`
    : "Guest";

  const displayRole = ROLE_LABELS[role] || role || "Guest";

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch {
      // Continue local logout even if backend logout fails.
    }

    localStorage.removeItem("medvault_token");
    localStorage.removeItem("medvault_user");

    navigate("/login");
  };

  return (
    <>
      {/* =========================================================
          MOBILE OVERLAY
      ========================================================= */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          flex-col
          bg-slate-800
          border-r
          border-white/5
          shadow-xl
          lg:shadow-none

          transition-[width,transform]
          duration-200
          ease-out

          lg:relative

          ${pinned ? "lg:w-60" : "lg:w-[68px]"}

          w-[260px]

          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* =======================================================
            BRAND HEADER
        ======================================================= */}
        <div
          className={`
    h-[72px]
    shrink-0
    border-b
    border-white/5
    flex
    items-center
    relative
    ${pinned ? "px-5" : "justify-center px-2"}
  `}
        >
          <button
            type="button"
            onClick={onTogglePin}
            title={pinned ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={pinned ? "Collapse sidebar" : "Expand sidebar"}
            className={`
      group
      relative
      flex
      items-center
      shrink-0
      rounded-lg
      transition-colors
      hover:bg-white/5
      ${pinned ? "gap-2.5" : "justify-center"}
    `}
          >
            <img
              src="/medvaultlogo.png"
              alt="MedVault"
              className="w-[34px] h-[34px] object-contain shrink-0"
            />

            {pinned && (
              <div className="min-w-0 text-left">
                <div className="font-display text-base font-bold text-white leading-tight">
                  Med<span className="text-blue-400">Vault</span>
                </div>

                <div className="text-[10px] text-slate-500 truncate">
                  {hospital}
                </div>
              </div>
            )}

            {/* Collapsed hover icon */}
            {!pinned && (
              <span
                className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          rounded-lg
          bg-slate-800/95
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
              >
                <PanelLeftOpen size={18} className="text-slate-300" />
              </span>
            )}

            {/* Expanded hover icon */}
            {pinned && (
              <span
                className="
          absolute
          right-0
          top-1/2
          -translate-y-1/2
          w-8
          h-8
          flex
          items-center
          justify-center
          rounded-md
          bg-slate-800
          text-slate-400
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
              >
                <PanelLeftClose size={17} />
              </span>
            )}
          </button>

          {/* Mobile close remains separate */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5"
          >
            <X size={19} />
          </button>
        </div>
        {/* =======================================================
            NAVIGATION
        ======================================================= */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={!pinned ? item.label : undefined}
              className={({ isActive }) =>
                `
                group
                relative
                flex
                items-center
                h-10
                text-[13.5px]
                border-l-[2.5px]
                transition-colors

                ${pinned ? "gap-2.5 px-5" : "justify-center px-0"}

                ${
                  isActive
                    ? "text-blue-400 bg-blue-600/10 border-blue-600"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                }
                `
              }
            >
              <item.icon size={17} className="shrink-0" />

              {pinned && <span className="flex-1 truncate">{item.label}</span>}

              {/* Collapsed tooltip */}
              {!pinned && (
                <span
                  className="
                    pointer-events-none
                    absolute
                    left-[58px]
                    z-[60]
                    whitespace-nowrap
                    rounded-md
                    bg-slate-950
                    px-2.5
                    py-1.5
                    text-[11px]
                    font-medium
                    text-white
                    opacity-0
                    translate-x-1
                    group-hover:opacity-100
                    group-hover:translate-x-0
                    transition-all
                  "
                >
                  {item.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* =======================================================
            USER AREA
        ======================================================= */}
        <div className="shrink-0 border-t border-white/5 p-3">
          <div
            className={`
              flex
              items-center
              ${pinned ? "gap-2.5 px-2 mb-3" : "justify-center mb-2"}
            `}
          >
            <img
              src={`https://i.pravatar.cc/64?u=${user?.email || "demo"}`}
              alt=""
              className="w-[34px] h-[34px] rounded-full object-cover shrink-0"
            />

            {pinned && (
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-slate-300 truncate">
                  {displayName}
                </div>

                <div className="text-[11px] text-slate-500 truncate">
                  {displayRole}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title={!pinned ? "Sign Out" : undefined}
            className={`
              group
              relative
              flex
              items-center
              text-slate-400
              hover:text-slate-200
              hover:bg-white/5
              rounded-lg
              text-[13px]
              transition-colors

              ${
                pinned
                  ? "gap-2.5 w-full px-2 py-2"
                  : "justify-center w-full h-9"
              }
            `}
          >
            <LogOut size={16} className="shrink-0" />

            {pinned && <span>Sign Out</span>}

            {!pinned && (
              <span
                className="
                  pointer-events-none
                  absolute
                  left-[58px]
                  z-[60]
                  whitespace-nowrap
                  rounded-md
                  bg-slate-950
                  px-2.5
                  py-1.5
                  text-[11px]
                  font-medium
                  text-white
                  opacity-0
                  translate-x-1
                  group-hover:opacity-100
                  group-hover:translate-x-0
                  transition-all
                "
              >
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

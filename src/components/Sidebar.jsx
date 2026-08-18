import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { hospital } from "../lib/mockData";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, getNavigationForRole } from "../config/navigation";

export default function Sidebar({ isOpen, onClose }) {
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
      // Backend call failed or token already invalid — still clear
      // local state and redirect, don't trap the user on the page.
    }
    localStorage.removeItem("medvault_token");
    localStorage.removeItem("medvault_user");
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`w-60 min-h-screen bg-slate-800 flex flex-col flex-shrink-0 fixed lg:static top-0 left-0 z-40 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="border-b border-white/5 flex items-center gap-2.5 justify-between"
          style={{ padding: "18px 20px" }}
        >
          <div className="flex items-center gap-2.5">
            <img
              src="/medvaultlogo.png"
              alt="MedVault"
              style={{ width: 34, height: 34 }}
              className="object-contain"
            />
            <div>
              <div className="font-display text-base font-bold text-white leading-tight">
                Med<span className="text-blue-400">Vault</span>
              </div>
              <div className="text-[10px] text-slate-500">{hospital}</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 text-[13.5px] border-l-[2.5px] transition-colors ${
                  isActive
                    ? "text-blue-400 bg-blue-600/10 border-blue-600"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5"
                }`
              }
              style={{ padding: "9px 20px" }}
            >
              <item.icon size={17} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="border-t border-white/5"
          style={{ padding: "14px 20px" }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={`https://i.pravatar.cc/64?u=${user?.email || "demo"}`}
              alt=""
              className="rounded-full flex-shrink-0 object-cover"
              style={{ width: 34, height: 34 }}
            />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-slate-300 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500">{displayRole}</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full text-slate-400 hover:text-slate-200 text-[13px] py-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

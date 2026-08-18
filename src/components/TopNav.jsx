import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  HelpCircle,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useToast } from "./Toast";
import { useAuth } from "../context/AuthContext";
import { getAvatarUrl } from "../lib/avatar";

export default function TopNav({ onMenuClick }) {
  const showToast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.first_name
    ? user.role === "doctor"
      ? `Dr. ${user.first_name} ${user.last_name}`
      : `${user.first_name} ${user.last_name}`
    : "Guest";
  const dept = user?.department || null;

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="h-15 bg-white border-b border-slate-200 flex items-center px-3 sm:px-6 gap-2 sm:gap-3 relative">
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center text-slate-600 flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search
          size={16}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          placeholder="Search patients, records, staff..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex-1" />

      <button
        onClick={() =>
          showToast(
            "Support: check with your department administrator.",
            "info",
          )
        }
        className="hidden sm:flex w-9 h-9 rounded-lg border border-slate-200 items-center justify-center text-slate-500 hover:bg-slate-50 flex-shrink-0"
      >
        <HelpCircle size={17} />
      </button>
      <div className="w-px h-7 bg-slate-200 hidden sm:block" />

      <div className="relative flex-shrink-0">
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 cursor-pointer px-1.5 sm:px-2.5 py-1 rounded-lg hover:bg-slate-50"
        >
          <img
            src={getAvatarUrl(user?.email)}
            alt=""
            className="rounded-full object-cover flex-shrink-0"
            style={{ width: 32, height: 32 }}
          />
          <div className="hidden md:block">
            <div className="text-[13px] font-semibold text-slate-800 whitespace-nowrap">
              {name}
            </div>
            {dept && <div className="text-[11px] text-slate-400">{dept}</div>}
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </div>

        {menuOpen && (
          <div>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-12 bg-white border border-slate-200 rounded-lg shadow-lg z-20"
              style={{ width: 200, padding: 6 }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 text-left"
              >
                <UserCircle size={16} />
                My Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 text-left"
              >
                <Settings size={16} />
                Settings
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

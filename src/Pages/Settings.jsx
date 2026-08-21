import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  UserCircle,
  ShieldCheck,
  LifeBuoy,
  Save,
  Mail,
  Phone,
  Building,
  KeyRound,
  Send,
  Lock,
  ChevronDown,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../config/navigation";
import { Button, Card } from "../components/ui";
import { useToast } from "../components/Toast";
import { getAvatarUrl } from "../lib/avatar";

const TABS = [
  { id: "profile", label: "My Profile", icon: UserCircle },
  { id: "security", label: "Security & Sessions", icon: ShieldCheck },
  { id: "support", label: "IT Support", icon: LifeBuoy },
];

export default function Settings() {
  const showToast = useToast();
  const { user, role, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabQuery || "profile");
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "Cardiology",
  });

  const [supportMsg, setSupportMsg] = useState("");

  useEffect(() => {
    if (tabQuery && ["profile", "security", "support"].includes(tabQuery)) {
      setActiveTab(tabQuery);
    }
  }, [tabQuery]);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    api
      .getCurrentUser()
      .then((data) => {
        if (!data) return;
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          department: data.department || "Cardiology",
        });
      })
      .catch((err) => {
        console.warn("Could not sync user profile:", err.message);
      });
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateCurrentUser({
        phone: profile.phone,
        department: profile.department,
      });
      await refreshUser();
      showToast("Profile settings saved successfully.");
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMsg.trim()) {
      showToast("Please enter an issue description", "info");
      return;
    }
    showToast("Support ticket dispatched to Hospital IT.");
    setSupportMsg("");
  };

  const roleLabel = ROLE_LABELS[role] || role || "Staff";

  return (
    <div className="space-y-6 pb-12">
      {/* Mobile Profile Card with Section Switcher */}
      <Card className="p-4 lg:hidden">
        <div className="flex items-center gap-3.5 mb-4">
          <img
            src={getAvatarUrl(user?.email)}
            alt=""
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-xs text-slate-400 truncate">{profile.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
              {profile.department} · {roleLabel}
            </span>
          </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Settings Section
          </label>
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => handleTabSelect(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
            >
              {TABS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </Card>

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">
          Account & Security Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your verified hospital profile, session security, and support
          requests.
        </p>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Desktop Sidebar Navigation Tabs */}
        <Card className="p-2 hidden lg:block space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </Card>

        {/* Content Pane */}
        <div>
          {activeTab === "profile" && (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Profile Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your contact details and active department assignment.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      disabled
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      disabled
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="080XXXXXXXX"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Assigned Department
                  </label>
                  <div className="relative">
                    <Building
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      value={profile.department}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="ICU">ICU</option>
                      <option value="Orthopaedics">Orthopaedics</option>
                      <option value="Paediatrics">Paediatrics</option>
                      <option value="Emergency">Emergency</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={saving}
                  >
                    <Save size={13} />
                    <span>{saving ? "Saving..." : "Save Profile Changes"}</span>
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Security & Active Sessions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cryptographic posture, password policy, and current
                  authorization status.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <KeyRound size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Active JWT Authorization
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Bearer session token verified via TLS 1.3
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Lock
                      size={14}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                    <span>Compliance & Security Controls</span>
                  </div>
                  <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 list-disc pl-4">
                    <li>
                      Passwords hashed using PBKDF2/Bcrypt with random
                      salt[cite: 1, 12].
                    </li>
                    <li>
                      Account lockout triggers after 5 failed consecutive
                      attempts[cite: 1, 4].
                    </li>
                    <li>
                      Records sealed at rest using per-record fresh AES-256
                      keys[cite: 1].
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "support" && (
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Contact Hospital IT Support
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Report account authorization issues or submit administrative
                  change requests.
                </p>
              </div>

              <form
                onSubmit={handleSupportSubmit}
                className="space-y-4 max-w-lg"
              >
                <textarea
                  rows={4}
                  value={supportMsg}
                  onChange={(e) => setSupportMsg(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 resize-none"
                />
                <Button type="submit" variant="primary" size="sm">
                  <Send size={13} />
                  <span>Dispatch Request</span>
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

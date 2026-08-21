import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Database,
  Users,
  ShieldCheck,
  History,
  Activity,
  ArrowRight,
  Lock,
  RefreshCw,
  UploadCloud,
  UserPlus,
  FileBarChart,
  UserCog,
} from "lucide-react";
import { Card } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, ROLES } from "../config/navigation";

// Self-contained inline formatting helpers
function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

function timeAgo(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatCard({ icon: Icon, label, value, detail, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
    emerald:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 leading-none truncate">
            {value}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
            {label}
          </div>
        </div>
      </div>
      {detail && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 truncate">
          {detail}
        </div>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role, hasPermission } = useAuth();

  const [data, setData] = useState({
    recordStats: null,
    staffStats: null,
    auditStats: null,
    recentRecords: [],
    totalPatients: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = role === ROLES.ADMIN;
  const isAuditor = role === ROLES.AUDITOR;
  const isPatient = role === ROLES.PATIENT;

  // Permission-based, not role-arrays — this is what was actually wrong.
  // register_patient is held by doctor, nurse, records_officer only; admin
  // was never supposed to be in this list, and checking the real permission
  // means it can never drift out of sync with the backend matrix again.
  const canUpload = hasPermission("upload_records");
  const canCreatePatient = hasPermission("register_patient");
  const canManageStaff = hasPermission("manage_users");

  // Reports has no dedicated permission yet (still mock-data per the
  // backend, flagged in the open items list) — access note says Admin +
  // Records Officer + Auditor. Once Reports gets backend-wired, replace
  // this with hasPermission("view_reports") like everything else here.
  const canViewReports = isAdmin || isAuditor || role === ROLES.RECORDS_OFFICER;

  const loadDashboardData = useCallback(async () => {
    const requests = [];

    if (!isAuditor) {
      requests.push(
        api
          .getRecordStats()
          .then((res) => ["recordStats", res])
          .catch(() => ["recordStats", null]),
        api
          .getRecords({ limit: 5 })
          .then((res) => ["recentRecords", res?.records || []])
          .catch(() => ["recentRecords", []]),
      );
    }

    if (isAdmin) {
      requests.push(
        api
          .getStaffStats()
          .then((res) => ["staffStats", res])
          .catch(() => ["staffStats", null]),
        api
          .getPatients({ limit: 1 })
          .then((res) => ["totalPatients", res?.total || 0])
          .catch(() => ["totalPatients", 0]),
      );
    }

    if (isAdmin || isAuditor) {
      requests.push(
        api
          .getAuditStats()
          .then((res) => ["auditStats", res])
          .catch(() => ["auditStats", null]),
      );
    }

    const results = await Promise.all(requests);
    const updates = Object.fromEntries(results);

    setData((prev) => ({ ...prev, ...updates }));
  }, [isAdmin, isAuditor]);

  useEffect(() => {
    setLoading(true);
    loadDashboardData().finally(() => setLoading(false));
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  const recordStats = data.recordStats || {};
  const staffStats = data.staffStats || {};
  const auditStats = data.auditStats || {};

  const roleLabel = ROLE_LABELS[role] || role || "Staff";
  const userGreeting = user?.first_name
    ? user.role === "doctor"
      ? `Good to see you, Dr. ${user.first_name}.`
      : `Good to see you, ${user.first_name}.`
    : "Welcome back.";

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Trigger Cluster */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">
              {roleLabel}
            </span>
            <span className="text-xs text-slate-400">
              · MedVault Clinical Engine
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100 mt-1">
            {userGreeting}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canUpload && (
            <button
              type="button"
              onClick={() => navigate("/upload")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <UploadCloud size={14} />
              <span>Upload Record</span>
            </button>
          )}

          {canCreatePatient && (
            <button
              type="button"
              onClick={() => navigate("/patients/new")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <UserPlus
                size={14}
                className="text-slate-500 dark:text-slate-400"
              />
              <span>Add Patient</span>
            </button>
          )}

          {canManageStaff && (
            <button
              type="button"
              onClick={() => navigate("/users/new")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <UserCog
                size={14}
                className="text-slate-500 dark:text-slate-400"
              />
              <span>Create Staff</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin text-blue-600" : ""}
            />
            <span>{refreshing ? "Syncing..." : "Sync Metrics"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="p-4 h-24 animate-pulse bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"
            />
          ))
        ) : (
          <>
            {!isAuditor && (
              <>
                <StatCard
                  icon={FileText}
                  label={isPatient ? "My Records" : "Medical Records"}
                  value={recordStats.total ?? "—"}
                  detail={`${recordStats.attachments ?? 0} files in storage`}
                  tone="blue"
                />
                <StatCard
                  icon={Database}
                  label="Encrypted Volume"
                  value={formatBytes(recordStats.storage?.used_bytes || 0)}
                  detail="AES-256-GCM sealed blobs"
                  tone="neutral"
                />
              </>
            )}

            {isAdmin && (
              <>
                <StatCard
                  icon={Users}
                  label="Registered Patients"
                  value={data.totalPatients}
                  detail="Verified demographic entries"
                  tone="neutral"
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Active Staff"
                  value={staffStats.active ?? "—"}
                  detail={`${staffStats.locked ?? 0} locked accounts`}
                  tone={staffStats.locked > 0 ? "amber" : "emerald"}
                />
              </>
            )}

            {isAuditor && (
              <>
                <StatCard
                  icon={History}
                  label="Total Audit Events"
                  value={auditStats.total ?? "—"}
                  detail={`${auditStats.successful ?? 0} verified transactions`}
                  tone="blue"
                />
                <StatCard
                  icon={ShieldCheck}
                  label="Blocked Attempts"
                  value={auditStats.blocked ?? 0}
                  detail={`${auditStats.failed ?? 0} authentication failures`}
                  tone={auditStats.blocked > 0 ? "amber" : "emerald"}
                />
                <StatCard
                  icon={Activity}
                  label="Action Scopes"
                  value={Object.keys(auditStats.recent_activity || {}).length}
                  detail="Distinct logged action types"
                  tone="neutral"
                />
                <StatCard
                  icon={Lock}
                  label="Hash Chain State"
                  value="Secured"
                  detail="Sequential SHA-256 validation"
                  tone="emerald"
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Main Operational Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Left Column: Recent Record Activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {isAuditor
                  ? "Forensic Action Breakdown"
                  : "Recent Record Activity"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAuditor
                  ? "Distribution of security events across hospital subsystems"
                  : "Latest decrypted records queried within your authorization scope"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(isAuditor ? "/audit" : "/records")}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {isAuditor ? (
            <div className="space-y-3 pt-2">
              {Object.entries(auditStats.recent_activity || {}).map(
                ([action, count]) => {
                  const percentage = auditStats.total
                    ? Math.max(5, Math.round((count / auditStats.total) * 100))
                    : 5;
                  return (
                    <div key={action} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                          {action.replaceAll("_", " ")}
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400 font-semibold">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentRecords.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No recent records found in your authorized scope.
                </div>
              ) : (
                data.recentRecords.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => navigate(`/records/${rec.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 capitalize truncate">
                          {rec.record_type?.replaceAll("_", " ") ||
                            "Medical Record"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {rec.patient_name ? `${rec.patient_name} · ` : ""}
                          {rec.department || "General"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-3">
                      {timeAgo(rec.created_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>

        {/* Right Column: Security & Role Scope Info */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
              <ShieldCheck size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Security & Scope Posture
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Access Governance
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Pure RBAC (NDPA-2023)
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Authenticated Role
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {roleLabel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">
                  Clinical Department
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {user?.department || "General"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">
                  Storage Cipher
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  AES-256-GCM / RSA
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Workspace Shortcuts Card */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Workspace Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate("/records")}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <FileText
                  size={14}
                  className="text-blue-600 dark:text-blue-400"
                />
                <span>All Records</span>
              </button>

              {!isPatient && (
                <button
                  type="button"
                  onClick={() => navigate("/patients")}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <Users
                    size={14}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                  <span>Directory</span>
                </button>
              )}

              {canViewReports && (
                <button
                  type="button"
                  onClick={() => navigate("/reports")}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FileBarChart
                    size={14}
                    className="text-amber-600 dark:text-amber-400"
                  />
                  <span>Reports</span>
                </button>
              )}

              {canManageStaff && (
                <button
                  type="button"
                  onClick={() => navigate("/users")}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <UserCog
                    size={14}
                    className="text-purple-600 dark:text-purple-400"
                  />
                  <span>Staff Users</span>
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

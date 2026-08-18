import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Database,
  FileText,
  HardDrive,
  HeartPulse,
  History,
  LockKeyhole,
  RefreshCw,
  Server,
  ShieldCheck,
  UploadCloud,
  UserCog,
  Users,
  Wifi,
} from "lucide-react";

import { Card } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS, ROLES } from "../config/navigation";

const STORAGE_PROVIDER_META = {
  cloudflare_r2: {
    label: "Cloudflare R2",
    capacityBytes: 10 * 1024 * 1024 * 1024,
    hasKnownCapacity: true,
  },
  minio: {
    label: "MinIO",
    capacityBytes: null,
    hasKnownCapacity: false,
  },
  s3_compatible: {
    label: "S3-compatible storage",
    capacityBytes: null,
    hasKnownCapacity: false,
  },
};

function getStorageMeta(provider) {
  return (
    STORAGE_PROVIDER_META[provider] || {
      label: "Object storage",
      capacityBytes: null,
      hasKnownCapacity: false,
    }
  );
}
const ROLE_INTRO = {
  [ROLES.ADMIN]: "System overview, staff access and security posture.",
  [ROLES.DOCTOR]: "Your clinical workspace and assigned-record activity.",
  [ROLES.NURSE]: "Your patient-record workspace and clinical activity.",
  [ROLES.LAB_TECHNICIAN]: "Your laboratory records and upload activity.",
  [ROLES.RECORDS_OFFICER]: "Hospital record retrieval and storage overview.",
  [ROLES.AUDITOR]: "Audit activity, access outcomes and system health.",
  [ROLES.PATIENT]: "Your medical records and account status.",
};

const ACTIONS = {
  [ROLES.ADMIN]: [
    {
      label: "New patient",
      icon: Users,
      to: "/patients/new",
      primary: true,
    },
    {
      label: "Manage users",
      icon: UserCog,
      to: "/users",
    },
    {
      label: "Review audit",
      icon: History,
      to: "/audit",
    },
  ],

  [ROLES.DOCTOR]: [
    {
      label: "Upload record",
      icon: UploadCloud,
      to: "/upload",
      primary: true,
    },
    {
      label: "My patients",
      icon: Users,
      to: "/patients",
    },
    {
      label: "Medical records",
      icon: FileText,
      to: "/records",
    },
  ],

  [ROLES.NURSE]: [
    {
      label: "Upload record",
      icon: UploadCloud,
      to: "/upload",
      primary: true,
    },
    {
      label: "My patients",
      icon: Users,
      to: "/patients",
    },
    {
      label: "Medical records",
      icon: FileText,
      to: "/records",
    },
  ],

  [ROLES.LAB_TECHNICIAN]: [
    {
      label: "Upload result",
      icon: UploadCloud,
      to: "/upload",
      primary: true,
    },
    {
      label: "Patients",
      icon: Users,
      to: "/patients",
    },
    {
      label: "Medical records",
      icon: FileText,
      to: "/records",
    },
  ],

  [ROLES.RECORDS_OFFICER]: [
    {
      label: "Medical records",
      icon: FileText,
      to: "/records",
      primary: true,
    },
    {
      label: "Patients",
      icon: Users,
      to: "/patients",
    },
  ],

  [ROLES.AUDITOR]: [
    {
      label: "Open audit logs",
      icon: History,
      to: "/audit",
      primary: true,
    },
  ],

  [ROLES.PATIENT]: [
    {
      label: "My records",
      icon: FileText,
      to: "/records",
      primary: true,
    },
    {
      label: "My profile",
      icon: HeartPulse,
      to: "/settings",
    },
  ],
};

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** index;

  return `${
    value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)
  } ${units[index]}`;
}

function timeAgo(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "yesterday";

  return `${days}d ago`;
}

function StatCard({ icon: Icon, label, value, detail, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-50 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="p-4 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${tones[tone]}`}
        >
          <Icon size={17} />
        </div>

        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          Current
        </span>
      </div>

      <div className="mt-4 text-2xl font-display font-bold text-slate-800 truncate">
        {value}
      </div>

      <div className="text-xs font-medium text-slate-600 mt-0.5">{label}</div>

      {detail && (
        <div className="text-[11px] text-slate-400 mt-1 truncate">{detail}</div>
      )}
    </Card>
  );
}

function SectionTitle({ title, caption, action, onAction, badge }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>

        {caption && <p className="text-xs text-slate-400 mt-0.5">{caption}</p>}
      </div>

      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            {badge}
          </span>
        )}

        {action && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            {action}
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <Card className="p-4 h-[142px]">
      <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />

      <div className="h-7 w-20 rounded bg-slate-100 animate-pulse mt-4" />

      <div className="h-3 w-28 rounded bg-slate-100 animate-pulse mt-2" />

      <div className="h-3 w-36 rounded bg-slate-100 animate-pulse mt-2" />
    </Card>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
      {text}
    </div>
  );
}

function ChainRow({ icon: Icon, label, status, detail, isLast }) {
  const healthy = status === "healthy";

  return (
    <div className="relative flex items-center gap-3 pl-1">
      {!isLast && (
        <span className="absolute left-[7px] top-5 bottom-[-14px] w-px bg-slate-200" />
      )}

      <span
        className={`relative z-10 w-[9px] h-[9px] rounded-full ${
          healthy ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />

      <span className="flex-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
        <span className="flex items-center gap-2 text-xs text-slate-600">
          <Icon size={14} className="text-slate-400" />
          {label}
        </span>

        <span
          className={`text-[11px] font-semibold ${
            healthy ? "text-emerald-600" : "text-amber-600"
          }`}
        >
          {detail || status || "Unknown"}
        </span>
      </span>
    </div>
  );
}

function AuditMetric({ label, value, tone }) {
  const classes = {
    emerald: "text-emerald-600 bg-emerald-50",
    red: "text-red-600 bg-red-50",
    amber: "text-amber-600 bg-amber-50",
  };

  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <div
        className={`w-fit rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${classes[tone]}`}
      >
        {label}
      </div>

      <div className="mt-2 text-xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 px-3.5 py-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </div>

      <div className="text-xs font-semibold text-slate-700 mt-1 truncate">
        {value}
      </div>
    </div>
  );
}

function RecentRecords({ records, onOpen }) {
  if (!records?.length) {
    return <EmptyState text="No recent records to show yet." />;
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <button
          key={record.id}
          type="button"
          onClick={() => onOpen(record.id)}
          className="w-full flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5 text-left hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <FileText size={14} className="text-slate-400 shrink-0" />

            <span className="text-xs font-medium text-slate-700 truncate capitalize">
              {record.record_type?.replaceAll("_", " ") || "Medical record"}
            </span>
          </span>

          <span className="text-[11px] text-slate-400 shrink-0 ml-3">
            {timeAgo(record.created_at)}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [data, setData] = useState({
    record: null,
    staff: null,
    audit: null,
    health: null,
    patients: null,
    recent: null,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isAdmin = role === ROLES.ADMIN;
  const canAudit = role === ROLES.ADMIN || role === ROLES.AUDITOR;
  const isPatient = role === ROLES.PATIENT;

  const canViewRecordStats = [
    ROLES.DOCTOR,
    ROLES.NURSE,
    ROLES.LAB_TECHNICIAN,
    ROLES.RECORDS_OFFICER,
    ROLES.PATIENT,
  ].includes(role);

  const load = useCallback(async () => {
    const requests = [];

    if (canAudit) {
      requests.push(["health", api.getSystemHealth()]);
    }

    if (canViewRecordStats) {
      requests.push(["record", api.getRecordStats()]);

      requests.push([
        "recent",
        api.getRecords({
          limit: 5,
          page: 1,
        }),
      ]);
    }

    if (isAdmin) {
      requests.push(["staff", api.getStaffStats()]);

      requests.push(["patients", api.getPatients()]);

      requests.push(["record", api.getRecordStats()]);
    }

    if (canAudit) {
      requests.push(["audit", api.getAuditStats()]);
    }

    const results = await Promise.allSettled(
      requests.map(([, promise]) => promise),
    );

    const next = {};
    const failed = [];

    results.forEach((result, index) => {
      const key = requests[index][0];

      if (result.status === "fulfilled") {
        next[key] = result.value;
      } else {
        failed.push(key);
      }
    });

    setData((current) => ({
      ...current,
      ...next,
    }));

    setErrors(failed);
    setLastUpdated(new Date());
  }, [canAudit, canViewRecordStats, isAdmin]);

  useEffect(() => {
    let active = true;

    setLoading(true);

    load().finally(() => {
      if (active) {
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const record = data.record || {};
  const staff = data.staff || {};
  const audit = data.audit || {};
  const health = data.health || {};

  const recentRecords = data.recent?.records || [];

  const recordTypes = Object.entries(record.by_type || {}).sort(
    (a, b) => b[1] - a[1],
  );

  const auditActions = Object.entries(audit.recent_activity || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const totalAudit = audit.total || 0;
  const successful = audit.successful || 0;
  const failedAudit = audit.failed || 0;
  const blocked = audit.blocked || 0;
  const errorEvents = audit.error_events || 0;

  const auditBreakdownTotal = successful + failedAudit + blocked + errorEvents;

  const storageUsedBytes = record.storage?.used_bytes || 0;


  const title = user?.first_name
    ? `Good to see you, ${user.first_name}.`
    : "Dashboard";

  const roleLabel = ROLE_LABELS[role] || "Authenticated user";

  const actions = ACTIONS[role] || [];

  const date = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  const isAuditRole = canAudit;

  const dataScope = isPatient
    ? "Own records"
    : role === ROLES.DOCTOR
      ? "Assigned patients"
      : role === ROLES.NURSE
        ? "Assigned patients"
        : role === ROLES.LAB_TECHNICIAN
          ? "Uploaded records"
          : role === ROLES.RECORDS_OFFICER || role === ROLES.ADMIN
            ? "Hospital records"
            : "Audit events";

  const primaryStats =
    role === ROLES.ADMIN
      ? [
          {
            icon: Users,
            label: "Active staff",
            value: staff.active ?? "—",
            detail: `${staff.total ?? 0} staff accounts`,
            tone: "neutral",
          },
          {
            icon: UserCog,
            label: "Locked staff",
            value: staff.locked ?? "—",
            detail: "Accounts requiring attention",
            tone: staff.locked > 0 ? "amber" : "neutral",
          },
          {
            icon: Users,
            label: "Patients",
            value: data.patients?.total ?? "—",
            detail: "Registered patient records",
            tone: "neutral",
          },
          {
            icon: ShieldCheck,
            label: "Audit events",
            value: totalAudit || "—",
            detail: `${blocked} blocked · ${errorEvents} errors`,
            tone: "neutral",
          },
        ]
      : role === ROLES.AUDITOR
        ? [
            {
              icon: History,
              label: "Audit events",
              value: totalAudit,
              detail: `${successful} successful`,
              tone: "neutral",
            },
            {
              icon: ShieldCheck,
              label: "Blocked events",
              value: blocked,
              detail: `${failedAudit} failed · ${errorEvents} errors`,
              tone: blocked > 0 ? "amber" : "neutral",
            },
            {
              icon: Activity,
              label: "Tracked actions",
              value: auditActions.length,
              detail: "Action groups currently recorded",
              tone: "neutral",
            },
          ]
        : role === ROLES.LAB_TECHNICIAN
          ? [
              {
                icon: FileText,
                label: "Lab records",
                value: record.total ?? "—",
                detail: "Uploaded by you",
                tone: "neutral",
              },
              {
                icon: UploadCloud,
                label: "With attachments",
                value: record.attachments ?? "—",
                detail: "Results with files",
                tone: "neutral",
              },
            ]
          : isPatient
            ? [
                {
                  icon: FileText,
                  label: "My records",
                  value: record.total ?? "—",
                  detail: `${record.attachments ?? 0} with attachments`,
                  tone: "neutral",
                },
              ]
            : [
                {
                  icon: FileText,
                  label: "Medical records",
                  value: record.total ?? "—",
                  detail: `${record.attachments ?? 0} with attachments`,
                  tone: "neutral",
                },
                {
                  icon: Database,
                  label: "Record storage",
                  value: formatBytes(record.storage?.used_bytes || 0),
                  detail: "File storage in your scope",
                  tone: "neutral",
                },
                {
                  icon: FileText,
                  label: "Record types",
                  value: recordTypes.length,
                  detail: "Types in your authorised scope",
                  tone: "neutral",
                },
              ];

  const HeaderBlock = (
    <header className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 mb-6">
      {/* Left */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-blue-600">
            MedVault / {roleLabel}
          </span>

          {isAuditRole && health.status && (
            <>
              {/* <span className="text-[10px] text-slate-300">•</span> */}

              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${
                  health.status === "healthy"
                    ? "text-[#2F6F5E]"
                    : "text-[#C48A2A]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    health.status === "healthy"
                      ? "bg-[#2F6F5E]"
                      : "bg-[#C48A2A]"
                  }`}
                />

                {health.status === "healthy"
                  ? "System healthy"
                  : "System degraded"}
              </span>
            </>
          )}
        </div>

        <h1 className="text-xl font-display font-bold text-slate-800">
          {title}
        </h1>

        <p className="text-sm text-slate-500 mt-0.5">
          {ROLE_INTRO[role] || "Secure hospital records workspace."}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center justify-start sm:justify-end gap-4 sm:pt-0.5">
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />

          {refreshing ? "Refreshing" : "Refresh"}
        </button>

        <div className="text-right text-xs text-slate-400 leading-tight">
          <div>{date}</div>

          {lastUpdated && (
            <div className="text-[10px] text-slate-300 mt-1">
              Updated {timeAgo(lastUpdated.toISOString())}
            </div>
          )}
        </div>
      </div>
    </header>
  );
  const ErrorBanner = errors.length > 0 && (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      Some current metrics could not be loaded: {errors.join(", ")}. The
      dashboard is showing the data that was available.
    </div>
  );

  /*
   * Patient dashboard intentionally stays simple.
   *
   * Patients should see their records and account
   * information, not hospital infrastructure,
   * audit statistics, storage metrics, or staff
   * management information.
   */
  if (isPatient) {
    return (
      <div className="pb-6">
        {HeaderBlock}

        {ErrorBanner}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          {loading ? (
            <>
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            primaryStats.map((stat) => <StatCard key={stat.label} {...stat} />)
          )}
        </div>

        <Card className="p-5 mb-4">
          <SectionTitle
            title="My recent records"
            caption="Your most recently added medical records."
            action="View all"
            onAction={() => navigate("/records")}
          />

          <RecentRecords
            records={recentRecords}
            onOpen={(id) => navigate(`/records/${id}`)}
          />
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="My account"
            caption="Your profile as held by the hospital."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow
              label="Account"
              value={user?.is_active === false ? "Inactive" : "Active"}
            />

            <InfoRow label="Data scope" value={dataScope} />
          </div>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="w-full mt-3 flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-md flex items-center justify-center bg-slate-100 text-slate-600">
                <HeartPulse size={15} />
              </span>

              <span className="text-xs font-medium text-slate-700">
                Edit my profile
              </span>
            </span>

            <ArrowRight size={14} className="text-slate-400" />
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {HeaderBlock}

      {ErrorBanner}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6">
        {loading
          ? primaryStats.map((_, index) => <LoadingCard key={index} />)
          : primaryStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </div>

      {isAdmin &&
        (() => {
          const storageMeta = getStorageMeta(health.storage?.provider);

          return (
            <Card className="p-5 mb-4">
              <SectionTitle
                title="Storage usage"
                caption={
                  storageMeta.hasKnownCapacity
                    ? `Total encrypted record storage against the ${storageMeta.label} free tier.`
                    : `Total encrypted record storage on ${storageMeta.label}. No fixed platform capacity to measure against.`
                }
              />

              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                  <HardDrive size={16} />
                </span>

                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">
                      {formatBytes(storageUsedBytes)} used
                    </span>

                    {storageMeta.hasKnownCapacity ? (
                      <span className="text-slate-400">
                        {formatBytes(storageMeta.capacityBytes)} free tier limit
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {storageMeta.label}
                      </span>
                    )}
                  </div>

                  {storageMeta.hasKnownCapacity ? (
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          Math.round(
                            (storageUsedBytes / storageMeta.capacityBytes) *
                              100,
                          ) >= 90
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                        style={{
                          width: `${Math.max(
                            2,
                            Math.min(
                              100,
                              Math.round(
                                (storageUsedBytes / storageMeta.capacityBytes) *
                                  100,
                              ),
                            ),
                          )}%`,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">
                      No platform-defined capacity for self-hosted storage.
                    </div>
                  )}
                </div>
              </div>

              {storageMeta.hasKnownCapacity && (
                <p className="text-[11px] text-slate-400 mt-3">
                  {Math.round(
                    (storageUsedBytes / storageMeta.capacityBytes) * 100,
                  )}
                  % of the {storageMeta.label} free tier used. Covers attached
                  files across all patient records.
                </p>
              )}
            </Card>
          );
        })()}

      <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-4 mb-4">
        <Card className="p-5">
          <SectionTitle
            title={
              isAuditRole
                ? "Audit activity"
                : canViewRecordStats
                  ? "Recent activity"
                  : "Overview"
            }
            caption={
              isAuditRole
                ? "Events currently recorded by the audit service."
                : canViewRecordStats
                  ? "Your most recently added records."
                  : "Current dashboard information."
            }
            action={
              isAuditRole
                ? "Open audit"
                : canViewRecordStats
                  ? "Open records"
                  : undefined
            }
            onAction={() => navigate(isAuditRole ? "/audit" : "/records")}
          />

          {isAuditRole ? (
            <div className="space-y-3">
              {auditActions.length ? (
                auditActions.map(([action, count]) => {
                  const width = totalAudit
                    ? Math.max(4, Math.round((count / totalAudit) * 100))
                    : 4;

                  return (
                    <div key={action}>
                      <div className="flex justify-between gap-3 text-xs mb-1">
                        <span className="text-slate-600 truncate">
                          {action}
                        </span>

                        <span className="font-semibold text-slate-800">
                          {count}
                        </span>
                      </div>

                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState text="No audit activity has been recorded yet." />
              )}
            </div>
          ) : canViewRecordStats ? (
            <RecentRecords
              records={recentRecords}
              onOpen={(id) => navigate(`/records/${id}`)}
            />
          ) : (
            <EmptyState text="No recent activity to show." />
          )}
        </Card>

        {canAudit ? (
          <Card className="p-5">
            <SectionTitle
              title="System status"
              caption="Live dependency checks."
              badge="Admin & auditor"
            />

            <div className="space-y-3.5">
              <ChainRow icon={Wifi} label="API" status={health.api?.status} />

              <ChainRow
                icon={Database}
                label="Database"
                status={health.database?.status}
              />

              <ChainRow
                icon={Server}
                label={`Storage · ${health.storage?.provider || "Storage"}`}
                status={health.storage?.status}
                detail={health.storage?.status}
                isLast
              />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                <LockKeyhole size={13} />
                Encrypted records
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                Protected
              </span>
            </div>
          </Card>
        ) : (
          <Card className="p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <ShieldCheck size={16} />

              <span className="text-xs font-semibold">
                Access scope enforced
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Your dashboard only displays information returned for your
              authorised role and data scope.
            </p>
          </Card>
        )}
      </div>

      {isAuditRole && (
        <Card className="p-5 mb-4">
          <SectionTitle
            title="Audit integrity"
            caption="Status distribution across the audit trail."
            action="Review logs"
            onAction={() => navigate("/audit")}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AuditMetric label="Success" value={successful} tone="emerald" />

            <AuditMetric label="Failed" value={failedAudit} tone="red" />

            <AuditMetric label="Blocked" value={blocked} tone="amber" />

            <AuditMetric label="Errors" value={errorEvents} tone="red" />
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              {totalAudit
                ? Math.round((auditBreakdownTotal / totalAudit) * 100)
                : 100}
              % of total events represented
            </span>

            <span>{totalAudit} total</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-4">
        <Card className="p-5">
          <SectionTitle
            title="Quick actions"
            caption="Shortcuts available to your role."
          />

          <div className="space-y-2">
            {actions.map(({ label, icon: Icon, to, primary }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(to)}
                className={`w-full flex items-center justify-between rounded-lg border px-3.5 py-3 text-left transition-colors ${
                  primary
                    ? "border-blue-200 bg-blue-50/60 hover:bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      primary
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon size={15} />
                  </span>

                  <span className="text-xs font-medium text-slate-700">
                    {label}
                  </span>
                </span>

                <ArrowRight size={14} className="text-slate-400" />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle
            title="Scope & access"
            caption="What this dashboard is showing you."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow label="Role" value={roleLabel} />

            <InfoRow
              label="Account"
              value={user?.is_active === false ? "Inactive" : "Active"}
            />

            <InfoRow
              label="Department"
              value={user?.department || "Not specified"}
            />

            <InfoRow label="Data scope" value={dataScope} />
          </div>

          {!isAuditRole && record.storage?.used_bytes !== undefined && (
            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Storage represented in your scope
              </span>

              <span className="text-xs font-semibold text-slate-800">
                {formatBytes(record.storage.used_bytes)}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Loader2,
  Mail,
  CheckCircle2,
  Circle,
  FlaskConical,
  ScanLine,
  HeartPulse,
  FileText,
  ChevronRight,
} from "lucide-react";
import { api } from "../lib/api";
import { Card, Badge, Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { GrantModal } from "./LinkPortal";

// Patient Profile — metadata-only hub for one patient. Built entirely from
// GET /patients/<id> (demographics, portal status) and GET /records (list,
// metadata only — no decrypted content). This is deliberately the same
// permission tier as the main Patients directory (view_patients / view_records),
// so a role like admin — which has view_records but not view_record_detail —
// can fully see this page. Opening a record's actual decrypted content is a
// separate, deeper action (RecordDetail.jsx) gated by view_record_detail.

const recordTypeIcons = {
  "Lab Report": FlaskConical,
  Imaging: ScanLine,
  Prescription: HeartPulse,
  "Discharge Summary": FileText,
  Vitals: HeartPulse,
  "Clinical Notes": FileText,
};

const statusTone = {
  admitted: "admitted",
  discharged: "discharged",
  outpatient: "stable",
};

function formatDate(timestamp) {
  if (!timestamp) return "—";
  try {
    return new Date(timestamp).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return timestamp;
  }
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div className="text-sm text-slate-800 dark:text-slate-100">
        {value || "—"}
      </div>
    </div>
  );
}

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();
  const { hasPermission } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  const [grantOpen, setGrantOpen] = useState(false);

  const loadPatient = () => {
    setLoading(true);
    setLoadError("");
    api
      .getPatient(id)
      .then((data) => setPatient(data))
      .catch((err) => {
        if (err instanceof TypeError) {
          setLoadError(
            "Could not reach the server — it may be waking up, try refreshing shortly",
          );
        } else {
          setLoadError(err.message || "Could not load this patient");
        }
      })
      .finally(() => setLoading(false));
  };

  const loadRecords = () => {
    setRecordsLoading(true);
    api
      .getRecords({ patient_id: id })
      .then((data) => setRecords(data?.records || []))
      .catch(() => setRecords([]))
      .finally(() => setRecordsLoading(false));
  };

  useEffect(() => {
    loadPatient();
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 flex justify-center text-slate-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (loadError || !patient) {
    return (
      <Card className="p-10 text-center text-sm text-slate-500">
        {loadError || "Patient not found."}
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/patients")}
          >
            <ArrowLeft size={13} />
            Back to Patients
          </Button>
        </div>
      </Card>
    );
  }

  const linked = patient.has_portal_account;

  return (
    <div>
      <button
        onClick={() => navigate("/patients")}
        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={13} />
        Back to Patients
      </button>

      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
              {patient.full_name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {patient.hospital_id} · Age {patient.age}
              {patient.gender ? ` · ${patient.gender}` : ""}
            </p>
          </div>
          {hasPermission("edit_patients") && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => showToast("Edit patient form coming soon", "info")}
            >
              <Pencil size={13} />
              Edit
            </Button>
          )}
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Patient Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4">
          <InfoField label="Age" value={patient.age} />
          <InfoField label="Gender" value={patient.gender} />
          <InfoField label="Phone" value={patient.phone} />
          <InfoField label="National ID" value={patient.national_id} />
          <InfoField label="Address" value={patient.address} />
          <InfoField label="Doctor" value={patient.assigned_doctor_name} />
          <InfoField label="Ward" value={patient.ward} />
          <InfoField
            label="Status"
            value={
              patient.status && (
                <Badge
                  tone={
                    statusTone[patient.status?.toLowerCase()] || "discharged"
                  }
                >
                  {patient.status}
                </Badge>
              )
            }
          />
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Portal Access
        </h2>
        {linked ? (
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              size={18}
              className="text-emerald-600 flex-shrink-0"
            />
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Linked
              </div>
              {patient.portal_email && (
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail size={12} />
                  {patient.portal_email}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <Circle size={18} className="text-slate-300 flex-shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Not linked
              </span>
            </div>
            {hasPermission("link_patient_identity") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setGrantOpen(true)}
              >
                Grant Portal Access
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Records
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          {recordsLoading
            ? "Loading…"
            : `${records.length} medical record${records.length === 1 ? "" : "s"}`}
        </p>

        {recordsLoading ? (
          <div className="py-6 flex justify-center text-slate-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No records for this patient yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700">
            {records.map((r) => {
              const Icon = recordTypeIcons[r.record_type] || FileText;
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/records/${r.id}`)}
                  className="flex items-center gap-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {r.record_type}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(r.created_at)}
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium flex items-center gap-0.5 flex-shrink-0">
                    View
                    <ChevronRight size={13} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {grantOpen && (
        <GrantModal
          patient={patient}
          onClose={() => setGrantOpen(false)}
          onGranted={loadPatient}
        />
      )}
    </div>
  );
}

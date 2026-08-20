import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  Edit2,
  ArrowLeft,
  Loader2,
  FileText,
  ShieldCheck,
  ShieldOff,
  Eye,
} from "lucide-react";
import { api } from "../lib/api";
import { Badge, Button, Card } from "../components/ui";
import { useToast } from "../components/Toast";

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    api
      .getPatient(id)
      .then((data) => {
        if (!cancelled) setPatient(data);
      })
      .catch((err) => {
        if (cancelled) return;

        if (err instanceof TypeError) {
          setLoadError(
            "Could not reach the server — it may be waking up, try again shortly",
          );
        } else if (err.message?.toLowerCase().includes("not found")) {
          setLoadError("not_found");
        } else {
          setLoadError(err.message || "Could not load this patient");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    setRecordsLoading(true);

    api
      .getRecords({ patient_id: id })
      .then((data) => {
        if (cancelled) return;

        const items = Array.isArray(data)
          ? data
          : data?.records || data?.items || [];

        setRecords(items);
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setRecordsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-sm text-slate-400 py-20">
        <Loader2 size={20} className="animate-spin inline-block mr-2" />
        Loading patient...
      </div>
    );
  }

  if (loadError || !patient) {
    return (
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Link to="/patients" className="text-blue-600">
            Patients
          </Link>

          <ChevronRight size={13} />

          <span className="text-slate-700">Not found</span>
        </div>

        <Card className="p-10 text-center">
          <div className="text-sm font-semibold text-slate-700">
            {loadError === "not_found"
              ? "No patient found with this ID"
              : loadError || "Could not load this patient"}
          </div>

          <div className="text-[13px] text-slate-500 mt-1">
            It may have been removed, or the link is incorrect.
          </div>

          <Link to="/patients">
            <Button size="sm" className="mt-4">
              Back to Patients
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const fullName =
    patient.full_name ||
    `${patient.first_name || ""} ${patient.last_name || ""}`.trim();

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P";

  const isLinked = Boolean(patient.has_portal_account);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getRecordTitle = (record) => {
    return (
      record.title ||
      record.record_type_label ||
      record.record_type ||
      "Medical Record"
    );
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/patients" className="text-blue-600 hover:text-blue-700">
          Patients
        </Link>

        <ChevronRight size={13} />

        <span className="text-slate-700">{fullName}</span>
      </div>

      {/* Patient Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">
                  Patient
                </p>

                <h1 className="text-2xl font-bold text-slate-800">
                  {fullName}
                </h1>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded">
                    {patient.hospital_id || "—"}
                  </span>

                  {isLinked ? (
                    <Badge tone="active">
                      <ShieldCheck size={13} className="mr-1 inline" />
                      Linked
                    </Badge>
                  ) : (
                    <Badge tone="warning">
                      <ShieldOff size={13} className="mr-1 inline" />
                      Not Linked
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/patients")}
                >
                  <ArrowLeft size={14} />
                  Back
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    showToast("Patient edit form — coming soon", "info")
                  }
                >
                  <Edit2 size={14} />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Information */}
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-800">
            Patient Information
          </h2>

          <div className="h-px bg-slate-200 mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
          <InfoItem
            label="Age"
            value={patient.age ? `${patient.age} years` : "—"}
          />

          <InfoItem label="Gender" value={formatGender(patient.gender)} />

          <InfoItem label="Phone" value={patient.phone} />

          <InfoItem label="National ID" value={patient.national_id} />

          <InfoItem
            label="Address"
            value={patient.address}
            className="lg:col-span-2"
          />

          <InfoItem
            label="Doctor"
            value={
              patient.assigned_doctor_name ||
              (patient.assigned_doctor_id
                ? `Staff #${patient.assigned_doctor_id}`
                : "Not assigned")
            }
          />

          <InfoItem
            label="Status"
            value={patient.is_active === false ? "Inactive" : "Active"}
          />
        </div>
      </Card>

      {/* Portal Access */}
      <Card className="p-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-800">
            Portal Access
          </h2>

          <div className="h-px bg-slate-200 mt-3" />
        </div>

        {isLinked ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={17} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Linked
                  </span>

                  <Badge tone="active">Portal enabled</Badge>
                </div>

                <p className="text-[13px] text-slate-500 mt-1">
                  {patient.portal_email ||
                    patient.email ||
                    "Portal account linked"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                <ShieldOff size={17} />
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-800">
                  Not linked
                </div>

                <p className="text-[13px] text-slate-500 mt-1">
                  This patient does not currently have portal access.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() =>
                showToast("Grant Portal Access — coming next", "info")
              }
            >
              Grant Portal Access
            </Button>
          </div>
        )}
      </Card>

      {/* Records */}
      <Card className="overflow-hidden">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Records
              </h2>

              <p className="text-[13px] text-slate-500 mt-1">
                {records.length} medical record
                {records.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-200 mt-4" />
        </div>

        {recordsLoading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            <Loader2 size={18} className="animate-spin inline-block mr-2" />
            Loading records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText size={18} />
            </div>

            <p className="text-sm font-medium text-slate-700 mt-3">
              No medical records
            </p>

            <p className="text-xs text-slate-400 mt-1">
              There are no records available for this patient.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={17} />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {getRecordTitle(record)}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatDate(
                        record.created_at || record.record_date || record.date,
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/records/${record.id}`)}
                >
                  <Eye size={14} />
                  View
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function InfoItem({ label, value, className = "" }) {
  return (
    <div className={className}>
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
        {label}
      </div>

      <div className="text-sm font-medium text-slate-800 break-words">
        {value || "—"}
      </div>
    </div>
  );
}

function formatGender(gender) {
  if (!gender) return "—";

  const value = String(gender).toUpperCase();

  if (value === "M") return "Male";
  if (value === "F") return "Female";

  return gender;
}

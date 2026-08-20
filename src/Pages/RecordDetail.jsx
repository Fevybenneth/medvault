import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { api } from "../lib/api";
import { Card, EncBadge } from "../components/ui";

// Record Detail — the one place actual decrypted clinical content ever
// renders. Calls GET /records/<id> (view_record_detail permission), which
// is deliberately a deeper tier than the Patient Profile / Records list
// (view_records, metadata only). Server-side this route also writes a
// record_viewed audit log entry — opening this page is the sensitive event,
// not browsing the list or the patient profile.

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp)$/i;

function formatDate(timestamp) {
  if (!timestamp) return "—";
  try {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}

function formatKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoadError("");
    setImageFailed(false);
    api
      .getRecord(id)
      .then((data) => setRecord(data))
      .catch((err) => {
        if (err instanceof TypeError) {
          setLoadError(
            "Could not reach the server — it may be waking up, try refreshing shortly",
          );
        } else {
          setLoadError(
            err.message ||
              "Could not load this record — you may not have permission to view its contents",
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 flex justify-center text-slate-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <Card className="p-10 text-center text-sm text-slate-500">
        {loadError || "Record not found."}
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 inline-flex items-center gap-1.5 hover:bg-slate-50"
          >
            <ArrowLeft size={13} />
            Back
          </button>
        </div>
      </Card>
    );
  }

  const isImage = record.file_path && IMAGE_EXT.test(record.file_path);
  const dataEntries =
    record.data && typeof record.data === "object"
      ? Object.entries(record.data)
      : [];

  return (
    <div>
      <button
        onClick={() =>
          record.patient_id
            ? navigate(`/patients/${record.patient_id}`)
            : navigate(-1)
        }
        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-4"
      >
        <ArrowLeft size={13} />
        Back to Patient
      </button>

      <Card className="p-5 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
              {record.record_type}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {record.patient_name}
              {record.department ? ` · ${record.department}` : ""}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Uploaded by {record.uploaded_by_name} ·{" "}
              {formatDate(record.created_at)}
            </p>
          </div>
          <EncBadge />
        </div>
      </Card>

      {record.file_path && (
        <Card className="p-5 mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Attached File
          </h2>
          {record.file_url ? (
            isImage && !imageFailed ? (
              <img
                src={record.file_url}
                alt="Attached scan"
                onError={() => setImageFailed(true)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 max-h-[480px] w-auto object-contain"
              />
            ) : (
              <a
                href={record.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 w-fit"
              >
                <FileText size={18} className="text-slate-500" />
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {record.file_path.split("/").pop()}
                </span>
                <Download size={14} className="text-slate-400" />
              </a>
            )
          ) : (
            <p className="text-sm text-slate-400">
              This record has an attached file, but a temporary access link
              could not be generated. Try again shortly.
            </p>
          )}
        </Card>
      )}

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Record Data
        </h2>
        {dataEntries.length === 0 ? (
          <p className="text-sm text-slate-400">
            No structured data on this record.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {dataEntries.map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-3">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide col-span-1">
                  {formatKey(key)}
                </div>
                <div className="text-sm text-slate-800 dark:text-slate-100 col-span-2">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
          Integrity
        </h2>
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Checksum verified
            </div>
            <div className="text-xs font-mono text-slate-400 break-all mt-0.5">
              {record.checksum}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

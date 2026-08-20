import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Download,
  FileText,
  ShieldCheck,
  User,
  Calendar,
  Building2,
  Upload,
  ExternalLink,
} from "lucide-react";
import { api } from "../lib/api";
import { Card, EncBadge } from "../components/ui";

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
  return String(key)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-700 dark:text-slate-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return String(value);
}

function getFileName(filePath) {
  if (!filePath) return "Attached file";

  const cleanPath = filePath.split("?")[0];
  return cleanPath.split("/").pop() || "Attached file";
}

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setLoadError("");
    setRecord(null);
    setImageFailed(false);

    api
      .getRecord(id)
      .then((data) => {
        if (mounted) {
          setRecord(data);
        }
      })
      .catch((err) => {
        if (!mounted) return;

        if (err instanceof TypeError) {
          setLoadError(
            "Could not reach the server — it may be waking up. Try refreshing shortly.",
          );
        } else {
          setLoadError(
            err?.message ||
              "Could not load this record — you may not have permission to view its contents.",
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center text-slate-400">
        <Loader2 size={22} className="animate-spin" />
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <Card className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>{loadError || "Record not found."}</p>

        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={13} />
            Back
          </button>
        </div>
      </Card>
    );
  }

  const isImage = Boolean(record.file_path) && IMAGE_EXT.test(record.file_path);

  const dataEntries =
    record.data && typeof record.data === "object"
      ? Object.entries(record.data)
      : [];

  const fileName = getFileName(record.file_path);

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={() =>
          record.patient_id
            ? navigate(`/patients/${record.patient_id}`)
            : navigate(-1)
        }
        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5"
      >
        <ArrowLeft size={13} />
        Back to Patient
      </button>

      {/* Header / Record */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Record Detail
            </p>

            <h1 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
              {record.record_type || "Medical Record"}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {record.patient_name || "Patient unavailable"}
            </p>
          </div>

          <EncBadge />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-slate-400">
              <User size={13} />
              Patient
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-100 mt-1">
              {record.patient_name || "—"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-slate-400">
              <Upload size={13} />
              Uploaded By
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-100 mt-1">
              {record.uploaded_by_name || "—"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-slate-400">
              <Building2 size={13} />
              Department
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-100 mt-1">
              {record.department || "—"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-semibold text-slate-400">
              <Calendar size={13} />
              Created
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-100 mt-1">
              {formatDate(record.created_at)}
            </p>
          </div>
        </div>
      </Card>

      {/* Clinical Data */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Clinical Information
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Decrypted clinical content for this authorized record view.
          </p>
        </div>

        {dataEntries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
            <FileText
              size={22}
              className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
            />
            <p className="text-sm text-slate-400">
              No structured clinical data on this record.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dataEntries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 py-3 first:pt-0 last:pb-0"
              >
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  {formatKey(key)}
                </div>

                <div className="md:col-span-2 text-sm text-slate-800 dark:text-slate-100 break-words">
                  {formatValue(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Attachment */}
      {record.file_path && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Attachment
              </h2>
              <p className="text-xs text-slate-400 mt-1">{fileName}</p>
            </div>

            {record.file_url && (
              <div className="flex items-center gap-2">
                <a
                  href={record.file_url}
                  download={fileName}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                >
                  <Download size={13} />
                  Download
                </a>
              </div>
            )}
          </div>

          {!record.file_url ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center">
              <FileText
                size={22}
                className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
              />
              <p className="text-sm text-slate-400">
                This record has an attached file, but a temporary access link
                could not be generated.
              </p>
            </div>
          ) : isImage && !imageFailed ? (
            showPreview ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3 flex justify-center">
                  <img
                    src={record.file_url}
                    alt={`Attachment for ${record.patient_name || "patient"}`}
                    onError={() => setImageFailed(true)}
                    className="rounded-lg max-h-[520px] max-w-full w-auto object-contain"
                  />
                </div>

                <button
                  onClick={() => setShowPreview(false)}
                  className="text-xs px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Hide Preview
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <FileText
                  size={22}
                  className="text-slate-500 dark:text-slate-400"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Image attachment
                  </p>
                </div>

                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs px-3 py-1.5 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                >
                  View
                </button>
              </div>
            )
          ) : (
            // keep your existing non-image file UI
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <FileText
                    size={22}
                    className="text-slate-500 dark:text-slate-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attachment available for secure viewing/download
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Integrity */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <ShieldCheck
              size={19}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Record Integrity
            </h2>

            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Integrity verified by the backend
            </p>

            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
                SHA-256 Checksum
              </p>

              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">
                {record.checksum || "—"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

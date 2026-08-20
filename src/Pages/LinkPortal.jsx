import { useState, useEffect } from "react";
import { Search, Mail, Lock, Link2, X, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { Card, Button, Badge } from "../components/ui";
import { useToast } from "../components/Toast";

// Portal Access — dedicated lookup + action page, distinct from the
// Patients directory. Shows every patient's portal-linking status
// (not filtered to unlinked-only), matches the wireframe: search-first,
// one card per patient, clear status, single action.
// Calls POST /patients/<id>/portal-access via api.grantPortalAccess —
// deliberately separate from patient registration (POST /patients/),
// since creating a patient identity and granting that identity login
// access are different actions with different audit consequences
// (patient_created vs patient_portal_linked).
// Visible to admin + records_officer only, matching link_patient_identity.

function GrantModal({ patient, onClose, onGranted }) {
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.grantPortalAccess(patient.id, {
        portal_email: email,
        portal_password: password,
      });
      showToast(
        `Portal access granted for ${patient.first_name} ${patient.last_name}`,
      );
      onGranted();
      onClose();
    } catch (err) {
      if (err instanceof TypeError) {
        showToast(
          "Could not reach the server — it may be waking up, try again shortly",
          "info",
        );
      } else {
        showToast(
          err.message || "Could not grant portal access — please try again",
          "info",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <Card
        className="w-full p-6"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            Grant Portal Access
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          {patient.first_name} {patient.last_name} · {patient.hospital_id}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Portal Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="email"
                autocomplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patient@mail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Portal Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="password"
                autocomplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Granting..." : "Grant Portal Access"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function PatientCard({ patient, onGrant }) {
  const linked = patient.has_portal_account;

  return (
    <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {patient.first_name} {patient.last_name}
          </span>
          <span className="text-[12px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded">
            {patient.hospital_id}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Age {patient.age}
          {patient.phone ? ` · ${patient.phone}` : ""}
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          <Badge tone={linked ? "active" : "discharged"}>
            Portal Access: {linked ? "Linked" : "Not linked"}
          </Badge>
          {linked && patient.portal_email && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {patient.portal_email}
            </span>
          )}
        </div>
      </div>

      <div className="sm:flex-shrink-0">
        {linked ? (
          <Button size="sm" disabled className="w-full sm:w-auto opacity-60">
            <CheckCircle2 size={13} />
            Already Linked
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onGrant(patient)}
          >
            <Link2 size={13} />
            Grant Portal Access
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function LinkPortal() {
  const showToast = useToast();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [grantTarget, setGrantTarget] = useState(null);

  const loadPatients = (searchTerm = "") => {
    setLoading(true);
    setLoadError("");
    api
      .getPatients({ search: searchTerm || undefined })
      .then((data) => setPatients(data?.patients || []))
      .catch((err) => {
        if (err instanceof TypeError) {
          setLoadError(
            "Could not reach the server — it may be waking up, try refreshing shortly",
          );
        } else {
          setLoadError(err.message || "Could not load patients");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadPatients(search), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Portal Access
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Search any patient to view or grant portal login access. This does
          not create a new patient identity — use Register Patient for that.
        </p>
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, hospital ID, phone, or national ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </Card>

      {loading ? (
        <div className="p-10 flex justify-center text-slate-400">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : loadError ? (
        <Card className="p-10 text-center text-sm text-slate-500">
          {loadError}
        </Card>
      ) : patients.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-500">
          {search
            ? "No patients match this search."
            : "No patients registered yet."}
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {patients.map((p) => (
            <PatientCard key={p.id} patient={p} onGrant={setGrantTarget} />
          ))}
        </div>
      )}

      {grantTarget && (
        <GrantModal
          patient={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={() => loadPatients(search)}
        />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Search, Mail, Lock, Link2, X, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { Card, Button } from "../components/ui";
import { useToast } from "../components/Toast";

// Grants portal access to a patient identity that already exists.
// Deliberately separate from AddPatient/register — creating a patient
// record and granting that patient login access are different actions
// with different audit consequences (patient_created vs
// patient_portal_linked), so this page only ever calls
// POST /patients/<id>/portal-account, never POST /patients/.
// Visible to admin + records_officer only, matching link_patient_identity.

function LinkModal({ patient, onClose, onLinked }) {
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createPatientPortalAccount(patient.id, {
        portal_email: email,
        portal_password: password,
      });
      showToast(
        `Portal account linked for ${patient.first_name} ${patient.last_name}`,
      );
      onLinked();
      onClose();
    } catch (err) {
      if (err instanceof TypeError) {
        showToast(
          "Could not reach the server — it may be waking up, try again shortly",
          "info",
        );
      } else {
        showToast(
          err.message || "Could not link portal account — please try again",
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
            Link Portal Account
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
              {submitting ? "Linking..." : "Link Portal Account"}
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

export default function LinkPortal() {
  const showToast = useToast();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [linkTarget, setLinkTarget] = useState(null);

  const loadUnlinked = (searchTerm = "") => {
    setLoading(true);
    setLoadError("");
    api
      .getPatients({ search: searchTerm || undefined, unlinked: true })
      .then((data) => setPatients(data?.patients || []))
      .catch((err) => {
        if (err instanceof TypeError) {
          setLoadError(
            "Could not reach the server — it may be waking up, try refreshing shortly",
          );
        } else {
          setLoadError(err.message || "Could not load unlinked patients");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUnlinked();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadUnlinked(search), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
          Link Portal Account
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Patients without portal access — grant login credentials to an
          existing record. This does not create a new patient identity.
        </p>
      </div>

      <Card className="p-3.5 mb-3.5 flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <Search
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or national ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-10 flex justify-center text-slate-400">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : loadError ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {loadError}
          </div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No unlinked patients found. Every patient record currently has
            portal access, or none match this search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-4 py-3 font-semibold">Hospital ID</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Age</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {p.hospital_id}
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-slate-100 font-medium">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {p.age}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {p.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setLinkTarget(p)}
                      >
                        <Link2 size={13} />
                        Link Portal
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {linkTarget && (
        <LinkModal
          patient={linkTarget}
          onClose={() => setLinkTarget(null)}
          onLinked={() => loadUnlinked(search)}
        />
      )}
    </div>
  );
}

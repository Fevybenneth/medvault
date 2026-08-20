import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  UserPlus,
  Link2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { Card, Badge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { GrantModal } from "./LinkPortal";

// Real GET /patients route, includes has_portal_account / portal_email /
// assigned_doctor_name (added to PatientListItemSchema). Row actions are
// permission-gated per role (see ROLE_PERMISSIONS): View is available to
// anyone who can see this page at all (view_patients already gates the
// route); Grant Portal Access only shows for link_patient_identity roles
// (admin, records_officer) and only on unlinked patients. Edit intentionally
// has no row-level button here — it lives on PatientProfile, gated there by
// edit_patients, so a lab technician (view_patients but not edit_patients)
// never sees an edit affordance for a patient at all.

function downloadCSV(rows) {
  const header =
    "Hospital ID,Name,Age,Gender,Phone,Assigned Doctor,Portal Access\n";
  const body = rows
    .map(
      (p) =>
        `${p.hospital_id},${p.first_name} ${p.last_name},${p.age},${p.gender || ""},${p.phone || ""},${p.assigned_doctor_name || ""},${p.has_portal_account ? "Linked" : "Not linked"}`,
    )
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "medvault_patients.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Patients() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState("");

  const [patientsList, setPatientsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [grantTarget, setGrantTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPatients = (searchTerm = "", pageNum = 1) => {
    setLoading(true);
    setLoadError("");
    api
      .getPatients({
        search: searchTerm || undefined,
        page: pageNum,
        limit: 20,
      })
      .then((data) => {
        setPatientsList(data?.patients || []);
        setTotal(data?.total || 0);
        setTotalPages(data?.pages || 1);
        setPage(data?.page || 1);
      })
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
    const t = setTimeout(() => loadPatients(search, 1), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const canGrantPortal = hasPermission("link_patient_identity");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">
            Patient Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {patientsList.length} patients
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => downloadCSV(patientsList)}
            className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
          >
            <Download size={14} />
            Export CSV
          </button>
          {canGrantPortal && (
            <button
              onClick={() => navigate("/patients/link-portal")}
              className="text-xs px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 flex items-center gap-1.5 hover:bg-slate-50"
            >
              <Link2 size={14} />
              Portal Access
            </button>
          )}
          {hasPermission("register_patient") && (
            <button
              onClick={() => navigate("/patients/new")}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white flex items-center gap-1.5 hover:bg-blue-700"
            >
              <UserPlus size={14} />
              Register Patient
            </button>
          )}
        </div>
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
            placeholder="Search by name, hospital ID, phone, or national ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {[
                  "Hospital ID",
                  "Patient Name",
                  "Age",
                  "Phone",
                  "Portal Access",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-4 py-2.5 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-slate-400 py-10"
                  >
                    <Loader2
                      size={18}
                      className="animate-spin inline-block mr-2"
                    />
                    Loading patients...
                  </td>
                </tr>
              )}
              {!loading && loadError && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-red-500 py-10"
                  >
                    {loadError}
                  </td>
                </tr>
              )}
              {!loading && !loadError && patientsList.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-sm text-slate-400 py-10"
                  >
                    No patients found{search ? " matching your search" : ""}.
                  </td>
                </tr>
              )}
              {!loading &&
                !loadError &&
                patientsList.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[12.5px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                        {p.hospital_id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {p.first_name} {p.last_name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {p.age}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {p.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={p.has_portal_account ? "active" : "discharged"}
                      >
                        {p.has_portal_account ? "Linked" : "Not linked"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/patients/${p.id}`)}
                          className="text-xs px-2.5 py-1 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          View
                        </button>
                        {canGrantPortal && !p.has_portal_account && (
                          <button
                            onClick={() => setGrantTarget(p)}
                            className="text-xs px-2.5 py-1 rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                          >
                            <Link2 size={11} />
                            Grant
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div
          className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700"
          style={{ padding: "14px 18px" }}
        >
          <div className="text-[13px] text-slate-500">
            Showing {patientsList.length === 0 ? 0 : (page - 1) * 20 + 1}–
            {(page - 1) * 20 + patientsList.length} of {total} patients
          </div>
          <div className="flex gap-1.5 items-center">
            <button
              disabled={page <= 1}
              onClick={() => loadPatients(search, page - 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <button className="min-w-[30px] h-7 rounded-md bg-blue-600 text-white text-xs">
              {page}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => loadPatients(search, page + 1)}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {grantTarget && (
        <GrantModal
          patient={grantTarget}
          onClose={() => setGrantTarget(null)}
          onGranted={() => {
            setGrantTarget(null);
            loadPatients(search);
          }}
        />
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, FileText, X, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/navigation";

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const inputRef = useRef(null);

  const isPatient = role === ROLES.PATIENT;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setPatients([]);
      setRecords([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) {
      setPatients([]);
      setRecords([]);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const requests = [api.getRecords({ q: cleanQuery, limit: 5 })];

        // Only search patient directory if user has staff privileges
        if (!isPatient) {
          requests.push(api.getPatients({ search: cleanQuery, limit: 5 }));
        }

        const [recordRes, patientRes] = await Promise.allSettled(requests);

        if (recordRes.status === "fulfilled" && recordRes.value) {
          setRecords(recordRes.value.records || []);
        } else {
          setRecords([]);
        }

        if (
          patientRes &&
          patientRes.status === "fulfilled" &&
          patientRes.value
        ) {
          setPatients(patientRes.value.patients || []);
        } else {
          setPatients([]);
        }
      } catch (err) {
        console.error("Search query failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(handler);
  }, [query, isPatient]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-100">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isPatient
                ? "Search your records by type, department..."
                : "Search patient name, Hospital ID, NIN, record type..."
            }
            className="w-full py-3.5 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
          />
          {loading ? (
            <Loader2 size={16} className="animate-spin text-slate-400" />
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-50 text-xs">
          {query.trim().length >= 2 &&
            !loading &&
            patients.length === 0 &&
            records.length === 0 && (
              <div className="py-8 text-center text-slate-400">
                No results found for "{query}".
              </div>
            )}

          {/* Patients Section (Staff Only) */}
          {!isPatient && patients.length > 0 && (
            <div className="p-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Patients ({patients.length})
              </div>
              <div className="space-y-1">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/patients`);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-800">
                          {p.first_name} {p.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.hospital_id}{" "}
                          {p.national_id ? `· NIN: ${p.national_id}` : ""}
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Records Section */}
          {records.length > 0 && (
            <div className="p-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">
                Medical Records ({records.length})
              </div>
              <div className="space-y-1">
                {records.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/records/${r.id}`);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText size={14} />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-800 capitalize">
                          {r.record_type?.replaceAll("_", " ") ||
                            "Medical Record"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {r.patient_name ? `${r.patient_name} · ` : ""}
                          {r.department ? `${r.department} · ` : ""}
                          ID: {r.id?.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search scope restricted by active role</span>
          <span>
            Press{" "}
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
              ESC
            </kbd>{" "}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}

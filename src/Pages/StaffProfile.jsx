import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Pencil, Loader2, Mail, Lock, UserX, X } from "lucide-react";
import { api } from "../lib/api";
import { Card, Badge, Button } from "../components/ui";
import { useToast } from "../components/Toast";

const ROLES = [
  "doctor",
  "nurse",
  "lab_technician",
  "records_officer",
  "auditor",
  "admin",
];

const roleLabel = {
  doctor: "Doctor",
  admin: "Admin",
  nurse: "Nurse",
  lab_technician: "Lab Technician",
  records_officer: "Records Officer",
  auditor: "Auditor",
};

const roleBadgeStyle = {
  doctor: "bg-blue-100 text-blue-700",
  admin: "bg-violet-100 text-violet-800",
  nurse: "bg-pink-100 text-pink-900",
  lab_technician: "bg-amber-100 text-amber-800",
  records_officer: "bg-teal-100 text-teal-800",
  auditor: "bg-slate-200 text-slate-700",
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

function normalizeUser(u) {
  return {
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    email: u.email,
    roleType: u.role,
    dept: u.department || "",
    license: u.license_number || "",
    phone: u.phone || "",
    joined: u.created_at,
    isActive: Boolean(u.is_active),
    isLocked: Boolean(u.is_locked),
  };
}

function EditStaffModal({ staff, onClose, onUpdated }) {
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    role: staff.roleType,
    department: staff.dept,
    license_number: staff.license,
    phone: staff.phone,
  });
  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateUser(staff.id, form);
      showToast(`${staff.name} updated`);
      onUpdated();
      onClose();
    } catch (err) {
      showToast(err.message || "Could not update staff account", "info");
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
        className="w-full p-6 max-h-[85vh] overflow-y-auto"
        style={{ maxWidth: 440 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-slate-800">
            Edit {staff.name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Department
            </label>
            <input
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              License Number
            </label>
            <input
              value={form.license_number}
              onChange={(e) => update("license_number", e.target.value)}
              placeholder="Optional"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
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

export default function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  const [staff, setStaff] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadStaff = () => {
    setLoading(true);
    setLoadError("");
    api
      .getUser(id)
      .then((data) => setStaff(normalizeUser(data)))
      .catch((err) =>
        setLoadError(err.message || "Could not load staff account"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStaff();
  }, [id]);

  const toggleSuspend = async () => {
    const suspending = staff.isActive;
    if (
      !window.confirm(`${suspending ? "Suspend" : "Reactivate"} ${staff.name}?`)
    )
      return;
    try {
      await api.updateUser(staff.id, { is_active: !suspending });
      showToast(`${staff.name} ${suspending ? "suspended" : "reactivated"}`);
      loadStaff();
    } catch (err) {
      showToast(err.message || "Could not update account", "info");
    }
  };

  const unlockUser = async () => {
    try {
      await api.updateUser(staff.id, { is_locked: false });
      showToast(`${staff.name} unlocked`);
      loadStaff();
    } catch (err) {
      showToast(err.message || "Could not unlock account", "info");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={20} className="animate-spin mr-2" />
        Loading staff account...
      </div>
    );
  }

  if (loadError || !staff) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-red-500 mb-3">
          {loadError || "Staff account not found."}
        </p>
        <Button size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft size={14} /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate("/users")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={15} /> Back to Users
      </button>

      <Card className="p-6 mb-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3.5">
            <img
              src={`https://i.pravatar.cc/96?u=${staff.email}`}
              alt=""
              className="rounded-full object-cover"
              style={{ width: 56, height: 56 }}
            />
            <div>
              <h1 className="text-lg font-display font-bold text-slate-800">
                {staff.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeStyle[staff.roleType] || "bg-slate-100 text-slate-600"}`}
                >
                  {roleLabel[staff.roleType] || staff.roleType}
                </span>
                <Badge
                  tone={
                    staff.isLocked
                      ? "critical"
                      : staff.isActive
                        ? "active"
                        : "warning"
                  }
                >
                  {staff.isLocked
                    ? "Locked"
                    : staff.isActive
                      ? "Active"
                      : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                <Mail size={12} /> {staff.email}
              </div>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowEdit(true)}>
            <Pencil size={13} /> Edit
          </Button>
        </div>
      </Card>

      <Card className="p-6 mb-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Contact &amp; Employment
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoField label="Phone" value={staff.phone || "—"} />
          <InfoField label="Department" value={staff.dept || "—"} />
          <InfoField label="License Number" value={staff.license || "—"} />
          <InfoField label="Joined" value={formatDate(staff.joined)} />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Account Status
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {staff.isLocked && (
            <Button size="sm" variant="secondary" onClick={unlockUser}>
              <Lock size={13} /> Unlock Account
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={toggleSuspend}>
            <UserX size={13} />{" "}
            {staff.isActive ? "Suspend Account" : "Reactivate Account"}
          </Button>
        </div>
      </Card>

      {showEdit && (
        <EditStaffModal
          staff={staff}
          onClose={() => setShowEdit(false)}
          onUpdated={loadStaff}
        />
      )}
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm text-slate-700 font-medium">{value}</div>
    </div>
  );
}

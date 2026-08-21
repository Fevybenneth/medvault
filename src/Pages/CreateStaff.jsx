import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Briefcase, IdCard } from "lucide-react";
import { Card } from "../components/ui";
import { useToast } from "../components/Toast";
import { api } from "../lib/api";

// Fields mirror POST /auth/users from the backend contract. "patient" is
// explicitly rejected by that route — patient accounts only ever come
// from the patient routes, never this one.
const ROLE_OPTIONS = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "records_officer", label: "Records Officer" },
  { value: "auditor", label: "Auditor" },
  { value: "admin", label: "Admin" },
];

export default function CreateStaff() {
  const navigate = useNavigate();
  const showToast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "doctor",
    department: "",
    licenseNumber: "",
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
      department: form.department || undefined,
      license_number: form.licenseNumber || undefined,
    };

    setSubmitting(true);
    try {
      await api.createUser(payload);
      showToast(
        `${form.firstName} ${form.lastName} created as ${ROLE_OPTIONS.find((r) => r.value === form.role)?.label}`,
      );
      navigate("/users/new");
    } catch (err) {
      if (err instanceof TypeError) {
        showToast(
          "Could not reach the server — it may be waking up, try again shortly",
          "info",
        );
      } else {
        showToast(
          err.message || "Could not create account — please try again",
          "info",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-display font-bold text-slate-800">
          Create Staff Account
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Add a new staff member to MedVault
        </p>
      </div>

      <Card className="p-6" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                First Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  placeholder="Amara"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  required
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  placeholder="Okafor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                required
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Role
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <div className="relative">
                <Briefcase
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                License Number
              </label>
              <div className="relative">
                <IdCard
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={form.licenseNumber}
                  onChange={(e) => update("licenseNumber", e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white font-semibold text-sm py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Account"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/users")}
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

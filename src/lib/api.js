const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TOKEN_KEY = "medvault_token";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("medvault_user");
};

const request = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }

    const error = new Error(
      data?.error || data?.message || "An unexpected error occurred."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

export const api = {
  // ─────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────

  login: async (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: async () =>
    request("/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: async () =>
    request("/auth/me", {
      method: "GET",
    }),

  updateCurrentUser: async (payload) =>
    request("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ─────────────────────────────────────────────
  // Dashboard / System
  // ─────────────────────────────────────────────

  getSystemHealth: async () =>
    request("/system/health", {
      method: "GET",
    }),

  getStaffStats: async () =>
    request("/auth/users/stats", {
      method: "GET",
    }),

  getRecordStats: async () =>
    request("/records/stats", {
      method: "GET",
    }),

  getAuditStats: async () =>
    request("/audit/logs/stats", {
      method: "GET",
    }),

  // ─────────────────────────────────────────────
  // Users / Staff
  // ─────────────────────────────────────────────

  getUsers: async () =>
    request("/auth/users", {
      method: "GET",
    }),

  createUser: async (payload) =>
    request("/auth/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateUser: async (userId, payload) =>
    request(`/auth/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ─────────────────────────────────────────────
  // Patients
  // ─────────────────────────────────────────────

  getPatients: async (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return request(`/patients/${suffix}`, {
      method: "GET",
    });
  },

  getPatient: async (patientId) =>
    request(`/patients/${patientId}`, {
      method: "GET",
    }),

  createPatient: async (payload) =>
    request("/patients/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePatient: async (patientId, payload) =>
    request(`/patients/${patientId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  createPatientPortalAccount: async (patientId, payload) =>
    request(`/patients/${patientId}/portal-account`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ─────────────────────────────────────────────
  // Records
  // ─────────────────────────────────────────────

  getRecords: async (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return request(`/records/${suffix}`, {
      method: "GET",
    });
  },

  getRecord: async (recordId) =>
    request(`/records/${recordId}`, {
      method: "GET",
    }),

  uploadRecord: async (formData) =>
    request("/records/upload", {
      method: "POST",
      body: formData,
    }),

  attachFileToRecord: async (recordId, formData) =>
    request(`/records/${recordId}/attach-file`, {
      method: "PATCH",
      body: formData,
    }),

  // ─────────────────────────────────────────────
  // Audit
  // ─────────────────────────────────────────────

  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return request(`/audit/logs${suffix}`, {
      method: "GET",
    });
  },

  getAuditReport: async (recordId) =>
    request(`/audit/report/${recordId}`, {
      method: "GET",
    }),
};

export { API_BASE_URL, TOKEN_KEY };
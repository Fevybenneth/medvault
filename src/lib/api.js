const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = "medvault_token";
const USER_KEY = "medvault_user";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

let onUnauthorized = null;

export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn;
};

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
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
    // 401: Unauthorized (Token Expired / Missing)
    // 423: Account Locked
    if (response.status === 401 || response.status === 423) {
      clearAuth();
      if (onUnauthorized) onUnauthorized();
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
  // Authentication & Session
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
  // Dashboard & Metrics
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
  // Staff & User Management (Admin)
  // ─────────────────────────────────────────────

  getUsers: async (params = {}) =>
    request(`/auth/users${buildQueryString(params)}`, {
      method: "GET",
    }),

  getUser: async (userId) =>
    request(`/auth/users/${userId}`, {
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
  // Patients & Identity Resolution
  // ─────────────────────────────────────────────

  getPatients: async (params = {}) => {
    // Normalizes both 'q' and 'search' to match the backend ILIKE handler
    const queryParams = { ...params };
    if (queryParams.q && !queryParams.search) {
      queryParams.search = queryParams.q;
      delete queryParams.q;
    }
    return request(`/patients${buildQueryString(queryParams)}`, {
      method: "GET",
    });
  },

  getPatient: async (patientId) =>
    request(`/patients/${patientId}`, {
      method: "GET",
    }),

  registerPatient: async (payload) =>
    request("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePatient: async (patientId, payload) =>
    request(`/patients/${patientId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  grantPortalAccess: async (patientId, payload) =>
    request(`/patients/${patientId}/portal-access`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ─────────────────────────────────────────────
  // Medical Records & Cryptographic Storage
  // ─────────────────────────────────────────────

  getRecords: async (params = {}) => {
    // Normalizes both 'search' and 'q' to match the backend Record metadata handler
    const queryParams = { ...params };
    if (queryParams.search && !queryParams.q) {
      queryParams.q = queryParams.search;
      delete queryParams.search;
    }
    return request(`/records${buildQueryString(queryParams)}`, {
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
  // Audit Ledger & Forensic Reports
  // ─────────────────────────────────────────────

  getAuditLogs: async (params = {}) =>
    request(`/audit/logs${buildQueryString(params)}`, {
      method: "GET",
    }),

  getAuditReport: async (recordId) =>
    request(`/audit/report/${recordId}`, {
      method: "GET",
    }),
};

export { API_BASE_URL, TOKEN_KEY, USER_KEY, clearAuth };
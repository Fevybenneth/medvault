import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setOnUnauthorized } from "../lib/api";

const AuthContext = createContext(null);

const USER_KEY = "medvault_user";
const TOKEN_KEY = "medvault_token";

const loadStoredUser = () => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem(TOKEN_KEY)),
  );

  const token = localStorage.getItem(TOKEN_KEY);

  const login = async (email, password) => {
    const response = await api.login(email, password);

    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
    }

    const currentUser = response?.user || response?.data?.user || null;

    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      setUser(currentUser);
    }

    return response;
  };

  const refreshUser = async () => {
    try {
      const currentUser = await api.getCurrentUser();

      const normalizedUser =
        currentUser?.user || currentUser?.data?.user || currentUser;

      if (normalizedUser) {
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
        setUser(normalizedUser);
      }

      return normalizedUser;
    } catch (error) {
      if (error.status === 401) {
        logout();
      }

      throw error;
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await api.logout();
      }
    } catch {
      // Local session must still be cleared if the API request fails.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }
  };

  useEffect(() => {
    let active = true;

    const validateSession = async () => {
      if (!localStorage.getItem(TOKEN_KEY)) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await api.getCurrentUser();

        if (!active) return;

        const normalizedUser =
          currentUser?.user || currentUser?.data?.user || currentUser;

        if (normalizedUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
          setUser(normalizedUser);
        }
      } catch (error) {
        if (error.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => setUser(null));
    return () => setOnUnauthorized(null);
  }, []);

  const role = user?.role || user?.role_name || user?.role?.role_name || null;
  const permissions = user?.permissions || user?.role?.permissions || [];

  const hasPermission = (permission) => {
    if (!permission) return true;

    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions = []) => {
    if (!requiredPermissions.length) return true;

    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  const value = useMemo(
    () => ({
      user,
      role,
      permissions,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
      hasPermission,
      hasAnyPermission
    }),
    [ user, role, permissions, token, loading ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

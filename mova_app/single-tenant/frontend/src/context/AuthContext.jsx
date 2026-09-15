import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService.js";
import { setLoggingOut } from "../lib/axios.js";

const AuthContext = createContext(null);

/**
 * Returns the canonical landing route for each role post-authentication.
 */
export function getRoleLandingPath(role) {
  switch (String(role).toUpperCase()) {
    case "RIDER":
      return "/operational-rider";
    case "SUPERVISOR":
    case "MANAGEMENT":
    case "SUPERADMIN":
    default:
      return "/dashboard";
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Optimistic Non-Blocking Logout handler
  const logout = useCallback(() => {
    // 1. Mark logging out to cancel pending Axios calls and suppress refresh-token loops
    setLoggingOut(true);

    // 2. Grab current token before wiping storage
    const currentToken = token || localStorage.getItem("token");

    // 3. Immediately wipe local auth state & storage synchronously
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();

    // 4. Send background cleanup request to backend with keepalive (Fire-and-Forget)
    const API_URL =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
      "http://localhost:8090/api";

    try {
      fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        },
        credentials: "include",
        keepalive: true,
      }).catch(() => {});
    } catch (err) {
      // Ignored: Local session is already cleaned up
    }

    // 5. Instantly redirect browser to /login
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, [token]);

  // Hydrate user profile on mount / resume from backend session
  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await authService.getMe();
          const userData = res?.user || res?.data?.user || res?.data || res;
          if (userData && typeof userData === "object") {
            const { password, password_hash, secret, refresh_token, ...safeUser } = userData;
            setUser(safeUser);
            localStorage.setItem("user", JSON.stringify(safeUser));
          }
        } catch (err) {
          console.warn("Session validation notice:", err?.response?.data?.msg || err?.message || err);
          if (err?.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token, logout]);

  // Real backend Login handler
  const login = async ({ identifier, password, turnstileToken }) => {
    const res = await authService.login({ identifier, password, turnstileToken });
    const authToken = res.token;
    const userData = res.user;

    const { password: pw, password_hash, secret, refresh_token, ...safeUser } = userData || {};

    setUser(safeUser);
    setToken(authToken);
    if (authToken) {
      localStorage.setItem("token", authToken);
    }
    if (res.refreshToken) {
      localStorage.setItem("refreshToken", res.refreshToken);
    }
    localStorage.setItem("user", JSON.stringify(safeUser));

    return {
      token: authToken,
      user: safeUser,
      msg: res.msg || "Login berhasil",
    };
  };

  // Update user in state & storage
  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
        role: user?.role || "GUEST",
        getRoleLandingPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

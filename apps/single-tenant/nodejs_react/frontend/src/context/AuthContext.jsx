import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

/**
 * Returns the canonical landing route for each role post-authentication.
 */
export function getRoleLandingPath(role) {
  switch (role) {
    case "RIDER":
      return "/rider/zone";
    case "SUPERVISOR":
    case "MANAGEMENT":
    case "SUPERADMIN":
    default:
      return "/superadmin/dashboard";
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

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  // Hydrate user profile on mount / resume
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
          console.warn("Session validation failed:", err?.message || err);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token, logout]);

  // Login handler
  const login = (userData, authToken) => {
    const { password, password_hash, secret, refresh_token, ...safeUser } = userData || {};
    setUser(safeUser);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(safeUser));
    localStorage.setItem("token", authToken);
    return safeUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
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

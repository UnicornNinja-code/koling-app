import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, getRoleLandingPath } from "../../context/AuthContext.jsx";
import { InlineLoading } from "@carbon/react";

/**
 * ProtectedRoute Component
 * Hard Security Guard enforcing Authentication & RBAC Authorization:
 * - Checks active JWT token & authenticated state
 * - Blocks unauthorized roles from accessing restricted endpoints
 * - Redirects to login or user's canonical landing path
 */
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. Loading state during initial session validation
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--cds-background)]">
        <InlineLoading description="Memverifikasi sesi keamanan..." />
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!isAuthenticated && !localStorage.getItem("token")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. RBAC Authorization check (if roles are restricted)
  if (allowedRoles.length > 0 && user) {
    const userRole = String(user.role || "").toUpperCase();
    const isAllowed = allowedRoles.some((r) => String(r).toUpperCase() === userRole);

    if (!isAllowed) {
      // Unauthorized direct URL access blocked: redirect to appropriate role home
      const safePath = getRoleLandingPath(userRole);
      return <Navigate to={safePath} replace />;
    }
  }

  return children;
}

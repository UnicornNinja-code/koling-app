import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function RoleGuard({ children, allowedRoles = [] }) {
  const { user } = useAuth();
  const role = user?.role || "RIDER";

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

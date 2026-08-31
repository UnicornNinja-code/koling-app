import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-[#FF5052] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect inactive accounts to dedicated inactive screen
  if (user && user.is_active === false && location.pathname !== "/inactive") {
    return <Navigate to="/inactive" replace />;
  }

  return children;
}

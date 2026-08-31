import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth, getRoleLandingPath } from "./context/AuthContext.jsx";
import { ProtectedRoute } from "./components/guards/ProtectedRoute.jsx";
import { RoleGuard } from "./components/guards/RoleGuard.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Lazy-loaded pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx").then((m) => ({ default: m.LoginPage })));
const AccountActivationPage = lazy(() => import("./pages/auth/RegisterPage.jsx").then((m) => ({ default: m.AccountActivationPage })));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage.jsx").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage.jsx").then((m) => ({ default: m.ResetPasswordPage })));

const ProfilePage = lazy(() => import("./pages/profile/ProfilePage.jsx").then((m) => ({ default: m.ProfilePage })));

const SuperAdminDashboardPage = lazy(() => import("./pages/superadmin/SuperAdminDashboardPage.jsx").then((m) => ({ default: m.SuperAdminDashboardPage })));
const ZoneManagementPage = lazy(() => import("./pages/superadmin/ZoneManagementPage.jsx").then((m) => ({ default: m.ZoneManagementPage })));
const DssManagementPage = lazy(() => import("./pages/superadmin/DssManagementPage.jsx").then((m) => ({ default: m.DssManagementPage })));
const FleetManagementPage = lazy(() => import("./pages/superadmin/FleetManagementPage.jsx").then((m) => ({ default: m.FleetManagementPage })));
const UserManagementPage = lazy(() => import("./pages/superadmin/UserManagementPage.jsx").then((m) => ({ default: m.UserManagementPage })));
const DistributionPage = lazy(() => import("./pages/distribution/DistributionPage.jsx").then((m) => ({ default: m.DistributionPage })));
const CatalogPage = lazy(() => import("./pages/catalog/CatalogPage.jsx").then((m) => ({ default: m.CatalogPage })));
const ReportsPage = lazy(() => import("./pages/reports/ReportsPage.jsx").then((m) => ({ default: m.ReportsPage })));
const AuditCronPage = lazy(() => import("./pages/superadmin/AuditCronPage.jsx").then((m) => ({ default: m.AuditCronPage })));

const RiderMapPage = lazy(() => import("./pages/rider/RiderMapPage.jsx").then((m) => ({ default: m.RiderMapPage })));
const RiderOperationalPage = lazy(() => import("./pages/rider/RiderOperationalPage.jsx").then((m) => ({ default: m.RiderOperationalPage })));

const NotFoundPage = lazy(() => import("./pages/errors/NotFoundPage.jsx").then((m) => ({ default: m.NotFoundPage })));
const ForbiddenPage = lazy(() => import("./pages/errors/ForbiddenPage.jsx").then((m) => ({ default: m.ForbiddenPage })));
const InactiveAccountPage = lazy(() => import("./pages/errors/InactiveAccountPage.jsx").then((m) => ({ default: m.InactiveAccountPage })));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
    <div className="w-8 h-8 border-4 border-[#FF5052] border-t-transparent rounded-full animate-spin" />
  </div>
);

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (isAuthenticated && user) {
    if (user.is_active === false) {
      return <Navigate to="/inactive" replace />;
    }
    return <Navigate to={getRoleLandingPath(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (isAuthenticated && user) {
    if (user.is_active === false) {
      return <Navigate to="/inactive" replace />;
    }
    return <Navigate to={getRoleLandingPath(user.role)} replace />;
  }
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Root Dynamic Redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth & Activation Routes */}
              <Route
                path="/login"
                element={
                  <PublicAuthRoute>
                    <LoginPage />
                  </PublicAuthRoute>
                }
              />
              <Route
                path="/activate"
                element={
                  <PublicAuthRoute>
                    <AccountActivationPage />
                  </PublicAuthRoute>
                }
              />
              {/* Backward compatibility alias */}
              <Route path="/register" element={<Navigate to="/activate" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Shared Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Executive / Operational Dashboard */}
              <Route
                path="/superadmin/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]}>
                      <SuperAdminDashboardPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* User Management Route (SUPERADMIN & MANAGEMENT only) */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "MANAGEMENT"]}>
                      <UserManagementPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Zone Management Route */}
              <Route
                path="/zones"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                      <ZoneManagementPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* DSS Decision Support Route */}
              <Route
                path="/dss"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                      <DssManagementPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Fleet Management Route */}
              <Route
                path="/fleet"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]}>
                      <FleetManagementPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Distribution & Plotting Workspace Route */}
              <Route
                path="/distribution"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                      <DistributionPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route path="/riders" element={<Navigate to="/distribution" replace />} />

              {/* Product Catalog Route */}
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]}>
                      <CatalogPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Reports & Analytics Route */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]}>
                      <ReportsPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* System Audit & Settings Route */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["SUPERADMIN"]}>
                      <AuditCronPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />

              {/* Protected Rider Routes */}
              <Route
                path="/rider/zone"
                element={
                  <ProtectedRoute>
                    <RoleGuard allowedRoles={["RIDER"]}>
                      <RiderOperationalPage />
                    </RoleGuard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/map"
                element={
                  <ProtectedRoute>
                    <RiderMapPage />
                  </ProtectedRoute>
                }
              />

              {/* Special Status & Error Pages */}
              <Route path="/inactive" element={<InactiveAccountPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

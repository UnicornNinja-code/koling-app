import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.jsx";
import { ShowcasePage } from "./pages/showcase/ShowcasePage.jsx";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./pages/auth/index.js";
import {
  DashboardPage,
  MapOpsPage,
  ZoneManagementPage,
  DistributionPage,
  DssPage,
  OperationalRiderPage,
  ReportsPage,
  FleetManagementPage,
  CatalogPage,
  UserManagementPage,
  SettingsPage,
  PoiModerationPage,
  CompetitorPage,
} from "./pages/superadmin/index.js";
import { ProfilePage } from "./pages/profile/index.js";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/activate" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ForgotPasswordPage />} />

              {/* Carbon Living Verification Surface */}
              <Route path="/showcase" element={<ShowcasePage />} />

              {/* Protected Executive Dashboard (Superadmin, Management, Supervisor, RIDER) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR", "RIDER"]}>
                    <AppLayout><DashboardPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Map Operations (Superadmin, Supervisor, Management) */}
              <Route
                path="/map-ops"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR", "MANAGEMENT"]}>
                    <AppLayout><MapOpsPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Zone Geofence (Superadmin, Supervisor) */}
              <Route
                path="/zones"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><ZoneManagementPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected FIFO Distribution (Superadmin, Supervisor, Management) */}
              <Route
                path="/distribution"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR", "MANAGEMENT"]}>
                    <AppLayout><DistributionPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Decision Intelligence DSS (Superadmin, Management) */}
              <Route
                path="/dss"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><DssPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dss/criteria"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><DssPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dss/bwm"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><DssPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Rider Operational HUD (Rider, Superadmin, Supervisor) */}
              <Route
                path="/operational-rider"
                element={
                  <ProtectedRoute allowedRoles={["RIDER", "SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><OperationalRiderPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider/zone"
                element={
                  <ProtectedRoute allowedRoles={["RIDER", "SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><OperationalRiderPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Analytics & Reports (Superadmin, Management, Supervisor) */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR","RIDER"]}>
                    <AppLayout><ReportsPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected Administration: Fleet, Catalog, Users, Settings, POIs, Competitors */}
              <Route
                path="/fleet"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "MANAGEMENT"]}>
                    <AppLayout><FleetManagementPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/armadas"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN","MANAGEMENT"]}>
                    <AppLayout><FleetManagementPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN","MANAGEMENT"]}>
                    <AppLayout><CatalogPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR"]}>
                    <AppLayout><UserManagementPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "MANAGEMENT", "SUPERVISOR","RIDER"]}>
                    <AppLayout><SettingsPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sync"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                    <AppLayout><SettingsPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pois"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR"]}>
                    <AppLayout><PoiModerationPage /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/competitors"
                element={
                  <ProtectedRoute allowedRoles={["SUPERADMIN", "SUPERVISOR", "MANAGEMENT"]}>
                    <AppLayout><CompetitorPage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Protected User Profile (All authenticated users) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout><ProfilePage /></AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default Routing: Landing on Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { ShowcasePage } from "./pages/showcase/ShowcasePage.jsx";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./pages/auth/index.js";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import {
  DashboardPage,
  MapOpsPage,
  DistributionPage,
  OperationalRiderPage,
  DssPage,
  ZoneManagementPage,
  FleetManagementPage,
  UserManagementPage,
  CatalogPage,
  PoiModerationPage,
  CompetitorPage,
  ReportsPage,
  SettingsPage,
} from "./pages/admin/index.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <Routes>
                  {/* Auth Pages */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/activate" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ForgotPasswordPage />} />

                  {/* Super Admin Application Routes wrapped in AppLayout */}
                  <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
                  <Route path="/map-ops" element={<AppLayout><MapOpsPage /></AppLayout>} />
                  <Route path="/distribution" element={<AppLayout><DistributionPage /></AppLayout>} />
                  <Route path="/rider/zone" element={<AppLayout><OperationalRiderPage /></AppLayout>} />
                  <Route path="/operational-rider" element={<AppLayout><OperationalRiderPage /></AppLayout>} />
                  <Route path="/fleet" element={<AppLayout><FleetManagementPage /></AppLayout>} />
                  <Route path="/armadas" element={<AppLayout><FleetManagementPage /></AppLayout>} />

                  {/* Decision Support Routes */}
                  <Route path="/dss" element={<AppLayout><DssPage /></AppLayout>} />
                  <Route path="/dss/criteria" element={<AppLayout><DssPage /></AppLayout>} />
                  <Route path="/dss/bwm" element={<AppLayout><DssPage /></AppLayout>} />

                  {/* Reporting & Audit Routes */}
                  <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
                  <Route path="/reports/operational" element={<AppLayout><ReportsPage /></AppLayout>} />
                  <Route path="/reports/dss" element={<AppLayout><ReportsPage /></AppLayout>} />
                  <Route path="/reports/sales" element={<AppLayout><ReportsPage /></AppLayout>} />
                  <Route path="/audit-logs" element={<AppLayout><ReportsPage /></AppLayout>} />

                  {/* Master Data Routes */}
                  <Route path="/zones" element={<AppLayout><ZoneManagementPage /></AppLayout>} />
                  <Route path="/users" element={<AppLayout><UserManagementPage /></AppLayout>} />
                  <Route path="/catalog" element={<AppLayout><CatalogPage /></AppLayout>} />
                  <Route path="/pois" element={<AppLayout><PoiModerationPage /></AppLayout>} />
                  <Route path="/competitors" element={<AppLayout><CompetitorPage /></AppLayout>} />

                  {/* System & Sync Routes */}
                  <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                  <Route path="/sync" element={<AppLayout><SettingsPage /></AppLayout>} />

                  {/* Design System Showcase Route */}
                  <Route path="/showcase" element={<ShowcasePage />} />
                  <Route path="/components-showcase" element={<ShowcasePage />} />

                  {/* Root Route */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

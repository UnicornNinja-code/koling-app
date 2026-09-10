import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import { ShowcasePage } from "./pages/showcase/ShowcasePage.jsx";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./pages/auth/index.js";

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

                  {/* Design System Showcase Route */}
                  <Route path="/showcase" element={<ShowcasePage />} />
                  <Route path="/components-showcase" element={<ShowcasePage />} />

                  {/* Root Route */}
                  <Route path="/" element={<ShowcasePage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

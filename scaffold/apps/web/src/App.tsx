/**
 * SyndeoCare Web — Root App Component
 *
 * Defines all routes with lazy-loaded pages and auth guards.
 */
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@syndeocare/auth";
import { RequireAuth } from "@syndeocare/auth/guards/RequireAuth";
import { RequireRole } from "@syndeocare/auth/guards/RequireRole";
import { RequireOnboarding } from "@syndeocare/auth/guards/RequireOnboarding";
import { SkipLink } from "@syndeocare/ui";

// ── Lazy-loaded pages ───────────────────────────────────────────────────────
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// Dashboards
const ProfessionalDashboard = lazy(() => import("./pages/dashboard/ProfessionalDashboard"));
const ClinicDashboard = lazy(() => import("./pages/dashboard/ClinicDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));

// Onboarding
const ProfessionalOnboarding = lazy(() => import("./pages/onboarding/ProfessionalOnboarding"));
const ClinicOnboarding = lazy(() => import("./pages/onboarding/ClinicOnboarding"));

// Features
const ShiftSearch = lazy(() => import("./pages/shifts/ShiftSearch"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));

const NotFound = lazy(() => import("./pages/NotFound"));

// ── Loading Fallback ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// ── Dashboard Router ────────────────────────────────────────────────────────
function DashboardRouter() {
  const { userRole } = useAuth();

  switch (userRole) {
    case "professional":
      return <ProfessionalDashboard />;
    case "clinic":
      return <ClinicDashboard />;
    case "admin":
    case "super_admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
}

// ── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <SkipLink />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Onboarding (authenticated, no onboarding check) */}
          <Route
            path="/onboarding/professional"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <ProfessionalOnboarding />
              </RequireAuth>
            }
          />
          <Route
            path="/onboarding/clinic"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <ClinicOnboarding />
              </RequireAuth>
            }
          />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <RequireOnboarding fallback={<PageLoader />}>
                  <DashboardRouter />
                </RequireOnboarding>
              </RequireAuth>
            }
          />

          <Route
            path="/shifts"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <RequireOnboarding fallback={<PageLoader />}>
                  <ShiftSearch />
                </RequireOnboarding>
              </RequireAuth>
            }
          />

          <Route
            path="/messages"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <RequireOnboarding fallback={<PageLoader />}>
                  <Messages />
                </RequireOnboarding>
              </RequireAuth>
            }
          />

          <Route
            path="/settings"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <Settings />
              </RequireAuth>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={
              <RequireAuth fallback={<PageLoader />}>
                <RequireRole roles={["admin", "super_admin"]} fallback={<PageLoader />}>
                  <AdminDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

/**
 * @syndeocare/auth — RequireAuth Guard
 *
 * Wraps routes that need an authenticated user.
 * Redirects to /auth if no session exists.
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../provider";

interface RequireAuthProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users (default: "/auth") */
  redirectTo?: string;
  /** Optional loading fallback */
  fallback?: React.ReactNode;
}

export function RequireAuth({
  children,
  redirectTo = "/auth",
  fallback = null,
}: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * @syndeocare/auth — RequireRole Guard
 *
 * Wraps routes that need a specific user role.
 * Shows a 403-style redirect or fallback if role doesn't match.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../provider";
import type { AppRole } from "../types";

interface RequireRoleProps {
  children: React.ReactNode;
  /** Allowed roles (user must have at least one) */
  roles: AppRole[];
  /** Where to redirect if role doesn't match (default: "/") */
  redirectTo?: string;
  /** Optional loading fallback */
  fallback?: React.ReactNode;
}

export function RequireRole({
  children,
  roles,
  redirectTo = "/",
  fallback = null,
}: RequireRoleProps) {
  const { userRole, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

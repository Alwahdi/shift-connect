/**
 * @syndeocare/auth — RequireOnboarding Guard
 *
 * Ensures the user has completed onboarding before
 * accessing dashboard routes.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../provider";

interface RequireOnboardingProps {
  children: React.ReactNode;
  /** Redirect destination for incomplete onboarding */
  onboardingPath?: string;
  fallback?: React.ReactNode;
}

export function RequireOnboarding({
  children,
  onboardingPath = "/onboarding",
  fallback = null,
}: RequireOnboardingProps) {
  const { isLoading, isOnboardingComplete, userRole } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isOnboardingComplete) {
    const path =
      userRole === "clinic"
        ? `${onboardingPath}/clinic`
        : `${onboardingPath}/professional`;
    return <Navigate to={path} replace />;
  }

  return <>{children}</>;
}

/**
 * @syndeocare/auth — Type Definitions
 */
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "professional" | "clinic" | "admin" | "super_admin";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  onboarding_completed: boolean;
  verification_status: "pending" | "verified" | "rejected";
}

export interface ClinicProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string | null;
  logo_url?: string | null;
  onboarding_completed: boolean;
  verification_status: "pending" | "verified" | "rejected";
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  userRole: AppRole | null;
  profile: UserProfile | ClinicProfile | null;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  isVerified: boolean;
}

export interface AuthActions {
  signUp: (
    email: string,
    password: string,
    role: AppRole,
    metadata?: Record<string, unknown>
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

export type AuthContextValue = AuthState & AuthActions;

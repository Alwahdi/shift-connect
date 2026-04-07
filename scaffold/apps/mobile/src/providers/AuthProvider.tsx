/**
 * AuthProvider for the mobile app.
 *
 * Wraps the Supabase auth state and provides it via React Context.
 * Adapted from @syndeocare/auth to work with React Native and
 * expo-router navigation (no react-router-dom dependency).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────

export type AppRole = "professional" | "clinic";

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
    metadata?: Record<string, unknown>,
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

export type AuthContextValue = AuthState & AuthActions;

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  supabase: SupabaseClient;
  children: React.ReactNode;
}

export function AuthProvider({ supabase, children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<UserProfile | ClinicProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const initialized = useRef(false);

  // ── Fetch role & profile ──────────────────────────────────────────────
  const fetchUserData = useCallback(
    async (userId: string) => {
      try {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();

        const role = (roleData?.role as AppRole) ?? null;
        setUserRole(role);

        if (role === "professional") {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
          setProfile(data as UserProfile | null);
        } else if (role === "clinic") {
          const { data } = await supabase
            .from("clinics")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
          setProfile(data as ClinicProfile | null);
        }
      } catch (error) {
        console.error("[Auth] Failed to fetch user data:", error);
      }
    },
    [supabase],
  );

  // ── Initialize ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // 1. Listen FIRST (Supabase best practice)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setTimeout(() => fetchUserData(newSession.user.id), 0);
      } else {
        setUserRole(null);
        setProfile(null);
      }

      if (event === "SIGNED_OUT") {
        setUserRole(null);
        setProfile(null);
      }

      setIsLoading(false);
    });

    // 2. Then get existing session
    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (existing?.user) {
        setSession(existing);
        setUser(existing.user);
        fetchUserData(existing.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchUserData]);

  // ── Actions ───────────────────────────────────────────────────────────
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      role: AppRole,
      metadata?: Record<string, unknown>,
    ) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, ...metadata },
        },
      });
      return { error: error as Error | null };
    },
    [supabase],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setProfile(null);
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error as Error | null };
    },
    [supabase],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error as Error | null };
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  }, [user?.id, fetchUserData]);

  // ── Derived state ─────────────────────────────────────────────────────
  const isOnboardingComplete = profile
    ? "onboarding_completed" in profile
      ? !!profile.onboarding_completed
      : false
    : false;

  const isVerified = profile
    ? profile.verification_status === "verified"
    : false;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      userRole,
      profile,
      isLoading,
      isOnboardingComplete,
      isVerified,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
    }),
    [
      user,
      session,
      userRole,
      profile,
      isLoading,
      isOnboardingComplete,
      isVerified,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook: useAuth
 *
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}

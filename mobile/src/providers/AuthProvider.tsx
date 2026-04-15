import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type UserRole = "professional" | "clinic";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserRole, metadata: Record<string, string>) => Promise<{ error: Error | null; needsOnboarding: boolean; email: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).single();
      if (!error && data) {
        const role = data.role as string;
        if (role === "professional" || role === "clinic") return role;
      }
      return null;
    } catch { return null; }
  }, []);

  const checkOnboardingStatus = useCallback(async (userId: string, role: UserRole | null): Promise<boolean> => {
    if (!role) return false;
    try {
      const table = role === "professional" ? "profiles" : "clinics";
      const { data, error } = await supabase.from(table).select("onboarding_completed").eq("user_id", userId).single();
      if (!error && data) return data.onboarding_completed ?? false;
      return false;
    } catch { return false; }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    if (user && userRole) {
      const status = await checkOnboardingStatus(user.id, userRole);
      setIsOnboardingComplete(status);
    }
  }, [user, userRole, checkOnboardingStatus]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (s?.user) {
          setSession(s);
          setUser(s.user);
          const role = await fetchUserRole(s.user.id);
          if (!mounted) return;
          setUserRole(role);
          if (role) {
            const ob = await checkOnboardingStatus(s.user.id, role);
            if (mounted) setIsOnboardingComplete(ob);
          }
        }
      } catch (e) { console.error(e); }
      finally { if (mounted) setIsLoading(false); }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        setTimeout(async () => {
          if (!mounted) return;
          const role = await fetchUserRole(newSession.user.id);
          if (mounted) setUserRole(role);
          if (role) {
            const ob = await checkOnboardingStatus(newSession.user.id, role);
            if (mounted) setIsOnboardingComplete(ob);
          }
        }, 0);
      } else if (!newSession?.user) {
        setUserRole(null);
        setIsOnboardingComplete(false);
      }
    });

    init();
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchUserRole, checkOnboardingStatus]);

  const signUp = useCallback(async (email: string, password: string, role: UserRole, metadata: Record<string, string>) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { ...metadata, role } } });
      if (error) throw error;
      if (data.user) { setUserRole(role); setIsOnboardingComplete(false); }
      return { error: null, needsOnboarding: true, email };
    } catch (error) { return { error: error as Error, needsOnboarding: false, email: "" }; }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
        if (role) {
          const ob = await checkOnboardingStatus(data.user.id, role);
          setIsOnboardingComplete(ob);
        }
      }
      return { error: null };
    } catch (error) { return { error: error as Error }; }
  }, [fetchUserRole, checkOnboardingStatus]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setUserRole(null); setIsOnboardingComplete(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, userRole, isOnboardingComplete, isLoading, signUp, signIn, signOut, refreshOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

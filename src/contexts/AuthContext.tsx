import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "professional" | "clinic" | "admin";

interface SignUpResult {
  error: Error | null;
  needsOnboarding: boolean;
  needsEmailConfirmation: boolean;
  email: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserRole, metadata: Record<string, string>) => Promise<SignUpResult>;
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

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setUserRole(data.role as UserRole);
      return data.role as UserRole;
    }
    return null;
  };

  const checkOnboardingStatus = async (userId: string, role: UserRole | null) => {
    if (!role || role === "admin") {
      setIsOnboardingComplete(true);
      return true;
    }

    const table = role === "professional" ? "profiles" : "clinics";
    const { data, error } = await supabase
      .from(table)
      .select("onboarding_completed")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setIsOnboardingComplete(data.onboarding_completed);
      return data.onboarding_completed;
    }
    return false;
  };

  const refreshOnboardingStatus = async () => {
    if (user && userRole) {
      await checkOnboardingStatus(user.id, userRole);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer the role fetch to avoid deadlock
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            await checkOnboardingStatus(session.user.id, role);
          }, 0);
        } else {
          setUserRole(null);
          setIsOnboardingComplete(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        await checkOnboardingStatus(session.user.id, role);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    role: UserRole, 
    metadata: Record<string, string>
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/verify-callback`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            ...metadata,
            role,
          },
        },
      });

      if (error) throw error;

      // Check if user needs email confirmation
      // If identities is empty, user already exists or email confirmation is required
      const needsEmailConfirmation = data.user && (!data.user.identities || data.user.identities.length === 0);
      
      // The database trigger (handle_new_user) automatically creates user_roles and profiles/clinics
      // So we don't need to insert them manually here
      
      if (data.user && !needsEmailConfirmation) {
        setUserRole(role);
        setIsOnboardingComplete(false);
      }

      return { 
        error: null, 
        needsOnboarding: !needsEmailConfirmation,
        needsEmailConfirmation: !!needsEmailConfirmation,
        email 
      };
    } catch (error) {
      return { error: error as Error, needsOnboarding: false, needsEmailConfirmation: false, email: "" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsOnboardingComplete(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isOnboardingComplete,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshOnboardingStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'professional' | 'clinic' | 'admin' | 'super_admin';

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

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      if (!error && data) return data.role as UserRole;
      return null;
    } catch {
      return null;
    }
  }, []);

  const checkOnboardingStatus = useCallback(async (userId: string, role: UserRole | null): Promise<boolean> => {
    if (!role || role === 'admin' || role === 'super_admin') return true;
    try {
      const table = role === 'professional' ? 'profiles' : 'clinics';
      const { data, error } = await supabase
        .from(table)
        .select('onboarding_completed')
        .eq('user_id', userId)
        .single();
      if (!error && data) return data.onboarding_completed ?? false;
      return false;
    } catch {
      return false;
    }
  }, []);

  const refreshOnboardingStatus = useCallback(async () => {
    if (user && userRole) {
      const status = await checkOnboardingStatus(user.id, userRole);
      setIsOnboardingComplete(status);
    }
  }, [user, userRole, checkOnboardingStatus]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          const role = await fetchUserRole(currentSession.user.id);
          if (!isMounted) return;
          setUserRole(role);
          if (role) {
            const onboardingStatus = await checkOnboardingStatus(currentSession.user.id, role);
            if (!isMounted) return;
            setIsOnboardingComplete(onboardingStatus);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setTimeout(async () => {
            if (!isMounted) return;
            try {
              const role = await fetchUserRole(newSession.user.id);
              if (!isMounted) return;
              setUserRole(role);
              const onboardingStatus = await checkOnboardingStatus(newSession.user.id, role);
              if (!isMounted) return;
              setIsOnboardingComplete(onboardingStatus);
            } catch {}
          }, 0);
        }
      } else {
        setUserRole(null);
        setIsOnboardingComplete(false);
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserRole, checkOnboardingStatus]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    metadata: Record<string, string>
  ): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { ...metadata, role },
        },
      });
      if (error) throw error;
      const needsEmailConfirmation = data.user && (!data.user.identities || data.user.identities.length === 0);
      if (data.user && !needsEmailConfirmation) {
        setUserRole(role);
        setIsOnboardingComplete(false);
      }
      return {
        error: null,
        needsOnboarding: !needsEmailConfirmation,
        needsEmailConfirmation: !!needsEmailConfirmation,
        email,
      };
    } catch (error) {
      return { error: error as Error, needsOnboarding: false, needsEmailConfirmation: false, email: '' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
        const onboardingStatus = await checkOnboardingStatus(data.user.id, role);
        setIsOnboardingComplete(onboardingStatus);
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [fetchUserRole, checkOnboardingStatus]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setIsOnboardingComplete(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, session, userRole, isOnboardingComplete, isLoading, signUp, signIn, signOut, refreshOnboardingStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

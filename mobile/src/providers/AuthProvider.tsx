import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

export type SupportedRole = 'professional' | 'clinic';
type AnyRole = SupportedRole | 'admin' | 'super_admin';

type AuthModeResult = {
  error: string | null;
  needsEmailConfirmation?: boolean;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  role: SupportedRole | null;
  isLoading: boolean;
  isDemoMode: boolean;
  isUnsupportedRole: boolean;
  signIn: (email: string, password: string) => Promise<AuthModeResult>;
  signUp: (payload: { email: string; password: string; role: SupportedRole; name: string; organizationName?: string }) => Promise<AuthModeResult>;
  activatePreview: (role: SupportedRole) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const demoProfiles: Record<SupportedRole, { id: string; email: string; name: string }> = {
  professional: { id: 'demo-professional', email: 'preview@professional.demo', name: 'Leena Faris' },
  clinic: { id: 'demo-clinic', email: 'preview@clinic.demo', name: 'SyndeoCare Partner Clinic' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<SupportedRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnsupportedRole, setIsUnsupportedRole] = useState(false);

  useEffect(() => {
    const client = supabase;

    if (!isSupabaseConfigured || !client) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchRole = async (userId: string) => {
      const { data } = await client.from('user_roles').select('role').eq('user_id', userId).single();
      const nextRole = data?.role as AnyRole | undefined;

      if (!isMounted) return;

      if (nextRole === 'admin' || nextRole === 'super_admin') {
        setRole(null);
        setIsUnsupportedRole(true);
        return;
      }

      setRole(nextRole === 'professional' || nextRole === 'clinic' ? nextRole : null);
      setIsUnsupportedRole(false);
    };

    const bootstrap = async () => {
      const { data } = await client.auth.getSession();
      if (!isMounted) return;

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        await fetchRole(data.session.user.id);
      }

      if (isMounted) setIsLoading(false);
    };

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        fetchRole(nextSession.user.id).finally(() => setIsLoading(false));
      } else {
        setRole(null);
        setIsUnsupportedRole(false);
        setIsLoading(false);
      }
    });

    bootstrap();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const activatePreview = async (previewRole: SupportedRole) => {
    const profile = demoProfiles[previewRole];
    const previewUser = {
      id: profile.id,
      email: profile.email,
      app_metadata: {},
      user_metadata: { name: profile.name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    setUser(previewUser);
    setSession({
      access_token: `${previewRole}-preview-token`,
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: `${previewRole}-preview-refresh`,
      user: previewUser,
    } as Session);
    setRole(previewRole);
    setIsUnsupportedRole(false);
    setIsLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      await activatePreview(email.toLowerCase().includes('clinic') ? 'clinic' : 'professional');
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async ({ email, password, role: selectedRole, name, organizationName }: { email: string; password: string; role: SupportedRole; name: string; organizationName?: string }) => {
    if (!isSupabaseConfigured || !supabase) {
      await activatePreview(selectedRole);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: selectedRole,
          name,
          organizationName,
        },
      },
    });

    if (error) return { error: error.message };

    return {
      error: null,
      needsEmailConfirmation: !data.session,
    };
  };

  const signOut = async () => {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setSession(null);
    setRole(null);
    setIsUnsupportedRole(false);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      role,
      isLoading,
      isDemoMode: !isSupabaseConfigured,
      isUnsupportedRole,
      signIn,
      signUp,
      activatePreview,
      signOut,
    }),
    [user, session, role, isLoading, isUnsupportedRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

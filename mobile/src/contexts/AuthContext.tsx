import { Session, User } from '@supabase/supabase-js';
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/src/lib/supabase';
import type { AppRole, Clinic, Profile } from '@/src/types';

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  role: Extract<AppRole, 'professional' | 'clinic'>;
};

type SignUpResult = {
  error: Error | null;
  requiresEmailConfirmation: boolean;
};

type AuthContextValue = {
  initialized: boolean;
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: Profile | null;
  clinic: Clinic | null;
  isOnboardingComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const getFriendlyError = (error: unknown) => {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Something went wrong. Please try again.');
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);

  const fetchRole = useCallback(async (userId: string) => {
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle();
    return (data?.role ?? null) as AppRole | null;
  }, []);

  const fetchProfileState = useCallback(async (userId: string, nextRole: AppRole | null) => {
    if (nextRole === 'professional') {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      setProfile((data as Profile | null) ?? null);
      setClinic(null);
      return Boolean(data?.onboarding_completed);
    }

    if (nextRole === 'clinic') {
      const { data } = await supabase.from('clinics').select('*').eq('user_id', userId).maybeSingle();
      setClinic((data as Clinic | null) ?? null);
      setProfile(null);
      return Boolean(data?.onboarding_completed);
    }

    setProfile(null);
    setClinic(null);
    return Boolean(nextRole);
  }, []);

  const hydrateUser = useCallback(
    async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setRole(null);
        setProfile(null);
        setClinic(null);
        return;
      }

      const nextRole = await fetchRole(nextSession.user.id);
      setRole(nextRole);
      await fetchProfileState(nextSession.user.id, nextRole);
    },
    [fetchProfileState, fetchRole],
  );

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) {
          return;
        }
        await hydrateUser(data.session);
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => {
        hydrateUser(nextSession).catch(() => undefined);
      }, 0);
    });

    initialize().catch(() => setInitialized(true));

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [hydrateUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        await hydrateUser(data.session);
        return { error: null };
      } catch (error) {
        return { error: getFriendlyError(error) };
      }
    },
    [hydrateUser],
  );

  const signUp = useCallback(
    async ({ fullName, email, password, role: nextRole }: SignUpInput): Promise<SignUpResult> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: nextRole,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.user) {
          return { error: new Error('Unable to create account.'), requiresEmailConfirmation: false };
        }

        await supabase.from('user_roles').upsert(
          {
            user_id: data.user.id,
            role: nextRole,
          },
          { onConflict: 'user_id' },
        );

        if (nextRole === 'professional') {
          await supabase.from('profiles').upsert(
            {
              user_id: data.user.id,
              full_name: fullName,
              email,
              is_available: true,
              onboarding_completed: false,
              verification_status: 'pending',
            },
            { onConflict: 'user_id' },
          );
        } else {
          await supabase.from('clinics').upsert(
            {
              user_id: data.user.id,
              name: fullName,
              email,
              onboarding_completed: false,
              verification_status: 'pending',
            },
            { onConflict: 'user_id' },
          );
        }

        if (data.session) {
          await hydrateUser(data.session);
        }

        return {
          error: null,
          requiresEmailConfirmation: !data.session,
        };
      } catch (error) {
        return { error: getFriendlyError(error), requiresEmailConfirmation: false };
      }
    },
    [hydrateUser],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
    setClinic(null);
  }, []);

  const refreshAuthState = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await hydrateUser(data.session);
  }, [hydrateUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      user,
      session,
      role,
      profile,
      clinic,
      isOnboardingComplete: role === 'professional' ? Boolean(profile?.onboarding_completed) : role === 'clinic' ? Boolean(clinic?.onboarding_completed) : Boolean(role),
      signIn,
      signUp,
      signOut,
      refreshAuthState,
    }),
    [clinic, initialized, profile, refreshAuthState, role, session, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

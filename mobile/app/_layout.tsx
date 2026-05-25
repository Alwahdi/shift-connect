import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/src/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

void SplashScreen.preventAutoHideAsync();

function RouteGuard() {
  const { initialized, user, role, isOnboardingComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const segment = segments[0];
    const inAuth = segment === '(auth)';
    const inClinic = segment === '(clinic)';
    const inProfessional = segment === '(professional)';
    const inOnboarding = segment === 'onboarding';
    const inShared = segment === 'conversation' || segment === 'shift' || segment === 'notifications';

    if (!user) {
      if (!inAuth) {
        router.replace('/(auth)/sign-in');
      }
      return;
    }

    if ((role === 'clinic' || role === 'professional') && !isOnboardingComplete) {
      const target = role === 'clinic' ? '/onboarding/clinic' : '/onboarding/professional';
      if (!inOnboarding) {
        router.replace(target);
      }
      return;
    }

    if (role === 'clinic') {
      if (!inClinic && !inShared) {
        router.replace('/(clinic)');
      }
      return;
    }

    if (role === 'professional') {
      if (!inProfessional && !inShared) {
        router.replace('/(professional)');
      }
      return;
    }

    if (inAuth) {
      router.replace('/(professional)');
    }
  }, [initialized, isOnboardingComplete, role, router, segments, user]);

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [initialized]);

  if (!initialized) {
    return <LoadingSpinner fullScreen label="Preparing Shift-Connect..." />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 2,
            gcTime: 5 * 60_000,
          },
        },
      }),
    [],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ErrorBoundary>
              <StatusBar style="dark" />
              <RouteGuard />
            </ErrorBoundary>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

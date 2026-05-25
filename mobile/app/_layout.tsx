import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

void SplashScreen.preventAutoHideAsync();

type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{this.state.error?.message ?? 'An unexpected error occurred.'}</Text>
            <Pressable onPress={() => this.setState({ hasError: false, error: null })} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

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
            <AppErrorBoundary>
              <StatusBar style="dark" />
              <RouteGuard />
            </AppErrorBoundary>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorContent: {
    flex: 1,
    padding: theme.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorMessage: {
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
  },
  errorButtonText: {
    color: theme.colors.white,
    fontWeight: '700',
    fontSize: theme.typography.sizes.md,
  },
});

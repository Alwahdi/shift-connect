import { useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui';

export default function IndexScreen() {
  const { user, userRole, isLoading, isOnboardingComplete } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (!userRole) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (!isOnboardingComplete) {
      if (userRole === 'professional') {
        router.replace('/(onboarding)/professional');
      } else if (userRole === 'clinic') {
        router.replace('/(onboarding)/clinic');
      }
      return;
    }

    router.replace('/(tabs)/dashboard');
  }, [user, userRole, isLoading, isOnboardingComplete]);

  return <LoadingScreen message="Starting SyndeoCare..." />;
}

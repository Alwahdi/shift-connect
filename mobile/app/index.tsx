import { Redirect } from 'expo-router';
import React from 'react';

import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Index() {
  const { initialized, user, role, isOnboardingComplete } = useAuth();

  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (role === 'clinic' && !isOnboardingComplete) {
    return <Redirect href="/onboarding/clinic" />;
  }

  if (role === 'professional' && !isOnboardingComplete) {
    return <Redirect href="/onboarding/professional" />;
  }

  return <Redirect href={role === 'clinic' ? '/(clinic)' : '/(professional)'} />;
}

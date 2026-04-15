import { Redirect } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function Index() {
  const { user, isLoading, userRole, isOnboardingComplete } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (!isOnboardingComplete) return <Redirect href="/(app)/onboarding" />;
  return <Redirect href="/(app)/(tabs)/home" />;
}

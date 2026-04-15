import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="shifts/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="chat/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="profile/edit" options={{ animation: "slide_from_right", presentation: "modal" }} />
      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      <Stack.Screen name="bookings/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

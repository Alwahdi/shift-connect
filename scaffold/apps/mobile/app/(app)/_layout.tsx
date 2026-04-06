/**
 * Authenticated app group layout.
 *
 * Redirects to auth if not logged in.
 * Redirects to onboarding if not completed.
 */
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { colors } from "@/constants/theme";

export default function AppLayout() {
  const { user, isLoading, userRole, isOnboardingComplete } = useAuth();
  const { themeColors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  // Redirect to onboarding if not completed
  if (userRole && !isOnboardingComplete) {
    const path =
      userRole === "clinic"
        ? "/(app)/onboarding/clinic"
        : "/(app)/onboarding/professional";
    return <Redirect href={path as any} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="shift/[id]"
        options={{ headerShown: true, title: "Shift Details" }}
      />
      <Stack.Screen
        name="booking/[id]"
        options={{ headerShown: true, title: "Booking Details" }}
      />
      <Stack.Screen
        name="chat/[id]"
        options={{ headerShown: true, title: "Chat" }}
      />
      <Stack.Screen
        name="professional/[id]"
        options={{ headerShown: true, title: "Professional" }}
      />
      <Stack.Screen
        name="clinic/[id]"
        options={{ headerShown: true, title: "Clinic" }}
      />
      <Stack.Screen
        name="search/professionals"
        options={{ headerShown: true, title: "Search Professionals" }}
      />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});

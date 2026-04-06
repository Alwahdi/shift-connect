/**
 * Admin group layout.
 *
 * Restricts access to admin/super_admin roles.
 */
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { colors } from "@/constants/theme";

export default function AdminLayout() {
  const { user, userRole, isLoading } = useAuth();
  const { themeColors } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Only admin and super_admin can access
  if (!user || (userRole !== "admin" && userRole !== "super_admin")) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: themeColors.card },
        headerTintColor: themeColors.foreground,
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="users" options={{ title: "User Management" }} />
      <Stack.Screen name="documents" options={{ title: "Document Verification" }} />
      <Stack.Screen name="config" options={{ title: "System Configuration" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

/**
 * Bottom tab navigator layout.
 *
 * Role-adaptive tabs: Professional vs. Clinic get different tab labels.
 */
import { Tabs } from "expo-router";
import { Platform, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { colors, typography } from "@/constants/theme";

function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: "🏠",
    shifts: "📋",
    messages: "💬",
    profile: "👤",
  };
  return <Text style={{ fontSize: 20 }}>{icons[name] ?? "•"}</Text>;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const { themeColors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: themeColors.mutedForeground,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
          minHeight: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        },
        headerStyle: { backgroundColor: themeColors.card },
        headerTintColor: themeColors.foreground,
        headerTitleStyle: { fontWeight: typography.fontWeight.semibold },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="shifts"
        options={{
          title: t("tabs.shifts"),
          tabBarIcon: ({ color }) => <TabIcon name="shifts" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t("tabs.messages"),
          tabBarIcon: ({ color }) => <TabIcon name="messages" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

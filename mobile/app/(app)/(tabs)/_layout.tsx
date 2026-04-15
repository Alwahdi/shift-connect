import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  const { t } = useTranslation();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: { borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 4, height: 85, paddingBottom: 28 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
    }}>
      <Tabs.Screen name="home" options={{ title: t("tabs.home"), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="shifts" options={{ title: t("tabs.shifts"), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="briefcase-search" size={size} color={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: t("tabs.messages"), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chat" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: t("tabs.profile"), tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account" size={size} color={color} /> }} />
    </Tabs>
  );
}

/**
 * Settings hub screen.
 *
 * Menu list navigating to individual settings screens.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

interface MenuItem {
  emoji: string;
  label: string;
  onPress: () => void;
}

function SettingsMenuItem({ emoji, label, onPress }: MenuItem) {
  const { themeColors } = useTheme();

  return (
    <Pressable
      style={[styles.menuItem, { borderBottomColor: themeColors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, { color: themeColors.foreground }]}>
        {label}
      </Text>
      <Text style={[styles.menuArrow, { color: themeColors.mutedForeground }]}>
        ›
      </Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { themeColors, toggleTheme, theme } = useTheme();

  let appVersion = "1.0.0";
  try {
    const Application = require("expo-application");
    appVersion = Application.nativeApplicationVersion ?? "1.0.0";
  } catch {
    // expo-application may not be available in all environments
  }

  const menuItems: MenuItem[] = [
    {
      emoji: "🔔",
      label: t("settings.notifications"),
      onPress: () => router.push("/(app)/settings/notifications"),
    },
    {
      emoji: "🌐",
      label: t("settings.language"),
      onPress: () => router.push("/(app)/settings/language"),
    },
    {
      emoji: "🎨",
      label: `${t("settings.theme")} (${theme === "dark" ? "Dark" : "Light"})`,
      onPress: toggleTheme,
    },
    {
      emoji: "👤",
      label: t("settings.account"),
      onPress: () => router.push("/(app)/settings/account"),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[styles.heading, { color: themeColors.foreground }]}
          accessibilityRole="header"
        >
          {t("settings.settings")}
        </Text>

        <View
          style={[styles.menuSection, { backgroundColor: themeColors.card }]}
        >
          {menuItems.map((item) => (
            <SettingsMenuItem
              key={item.label}
              emoji={item.emoji}
              label={item.label}
              onPress={item.onPress}
            />
          ))}
        </View>

        <Text
          style={[styles.versionText, { color: themeColors.mutedForeground }]}
        >
          SyndeoCare v{appVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  heading: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.md,
  },
  menuSection: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: TOUCH_TARGET_SIZE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  menuEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
  },
  menuArrow: {
    fontSize: typography.fontSize.xl,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});

/**
 * Email verification screen.
 *
 * Prompts user to check email and provides retry option.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { colors, spacing, typography, borderRadius, TOUCH_TARGET_SIZE } from "@/constants/theme";

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const params = useLocalSearchParams<{ email: string }>();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>📧</Text>
        <Text style={[styles.heading, { color: themeColors.foreground }]}>
          {t("auth.verifyEmail")}
        </Text>
        <Text style={[styles.description, { color: themeColors.mutedForeground }]}>
          {t("auth.verifyEmailDescription")}
        </Text>
        {params.email && (
          <Text style={[styles.email, { color: themeColors.foreground }]}>
            {params.email}
          </Text>
        )}
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.replace("/(auth)")}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{t("auth.login")}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.lg },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  heading: { fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  description: { fontSize: typography.fontSize.base, textAlign: "center", marginBottom: spacing.md, lineHeight: 24 },
  email: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, marginBottom: spacing["2xl"] },
  button: {
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing["2xl"],
  },
  buttonText: { color: colors.primaryForeground, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});

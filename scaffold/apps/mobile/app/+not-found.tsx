/**
 * 404 / Not Found screen.
 */
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

export default function NotFoundScreen() {
  const { themeColors } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <Text style={styles.emoji}>🔍</Text>
        <Text style={[styles.title, { color: themeColors.foreground }]}>
          Page Not Found
        </Text>
        <Text
          style={[styles.description, { color: themeColors.mutedForeground }]}
        >
          The screen you're looking for doesn't exist.
        </Text>
        <Link href="/(app)/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  link: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  linkText: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

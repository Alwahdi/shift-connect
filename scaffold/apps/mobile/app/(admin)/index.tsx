/**
 * Admin dashboard screen.
 *
 * Overview stats and quick action navigation.
 */
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const { data: stats, refetch, isRefetching } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [usersResult, pendingDocsResult] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      return {
        totalUsers: usersResult.count ?? 0,
        pendingVerifications: pendingDocsResult.count ?? 0,
      };
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: themeColors.card }, shadows.sm]}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {stats?.totalUsers ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>
            {t("admin.totalUsers")}
          </Text>
        </View>

        <View
          style={[styles.statCard, { backgroundColor: themeColors.card }, shadows.sm]}
        >
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats?.pendingVerifications ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>
            {t("admin.pendingVerifications")}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.actionCard, { backgroundColor: themeColors.card }, shadows.sm]}
          onPress={() => router.push("/(admin)/users")}
          accessibilityRole="button"
          accessibilityLabel={t("admin.users")}
        >
          <Text style={styles.actionEmoji}>👥</Text>
          <Text style={[styles.actionLabel, { color: themeColors.foreground }]}>
            {t("admin.users")}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: themeColors.card }, shadows.sm]}
          onPress={() => router.push("/(admin)/documents")}
          accessibilityRole="button"
          accessibilityLabel={t("admin.documentVerification")}
        >
          <Text style={styles.actionEmoji}>📄</Text>
          <Text style={[styles.actionLabel, { color: themeColors.foreground }]}>
            {t("admin.documentVerification")}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.actionCard, { backgroundColor: themeColors.card }, shadows.sm]}
          onPress={() => router.push("/(admin)/config")}
          accessibilityRole="button"
          accessibilityLabel={t("admin.systemConfig")}
        >
          <Text style={styles.actionEmoji}>⚙️</Text>
          <Text style={[styles.actionLabel, { color: themeColors.foreground }]}>
            {t("admin.systemConfig")}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  actions: {
    gap: spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    minHeight: TOUCH_TARGET_SIZE,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

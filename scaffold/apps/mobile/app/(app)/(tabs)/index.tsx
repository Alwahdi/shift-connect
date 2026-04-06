/**
 * Dashboard / Home tab.
 *
 * Role-adaptive: shows different content for professionals vs. clinics.
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
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

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const { themeColors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: themeColors.card }, shadows.sm]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: themeColors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function QuickAction({
  emoji,
  label,
  onPress,
}: {
  emoji: string;
  label: string;
  onPress: () => void;
}) {
  const { themeColors } = useTheme();
  return (
    <Pressable
      style={[styles.quickAction, { backgroundColor: themeColors.card }, shadows.sm]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.quickEmoji}>{emoji}</Text>
      <Text style={[styles.quickLabel, { color: themeColors.foreground }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { profile, userRole } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const displayName =
    profile && "full_name" in profile
      ? profile.full_name
      : profile && "name" in profile
        ? profile.name
        : "User";

  const { data: stats, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard-stats", userRole],
    queryFn: async () => {
      if (userRole === "professional") {
        const [active, upcoming] = await Promise.all([
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("professional_id", profile?.id ?? "")
            .in("status", ["confirmed", "checked_in"]),
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("professional_id", profile?.id ?? "")
            .eq("status", "accepted"),
        ]);
        return { active: active.count ?? 0, upcoming: upcoming.count ?? 0 };
      }
      // Clinic
      const [posted, applicants] = await Promise.all([
        supabase
          .from("shifts")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", profile?.id ?? "")
          .eq("status", "open"),
        supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("clinic_id", profile?.id ?? "")
          .eq("status", "pending"),
      ]);
      return { posted: posted.count ?? 0, applicants: applicants.count ?? 0 };
    },
    enabled: !!profile?.id,
  });

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.welcome, { color: themeColors.mutedForeground }]}>
            {t("dashboard.welcome", { name: "" })}
          </Text>
          <Text style={[styles.name, { color: themeColors.foreground }]}>
            {displayName}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {userRole === "professional" ? (
            <>
              <StatCard label={t("dashboard.activeBookings")} value={stats?.active ?? 0} color={colors.success} />
              <StatCard label={t("dashboard.upcomingShifts")} value={stats?.upcoming ?? 0} color={colors.accent} />
            </>
          ) : (
            <>
              <StatCard label={t("dashboard.postedShifts")} value={stats?.posted ?? 0} color={colors.primary} />
              <StatCard label={t("dashboard.applicants")} value={stats?.applicants ?? 0} color={colors.accent} />
            </>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
          {t("dashboard.quickActions")}
        </Text>
        <View style={styles.actionsGrid}>
          {userRole === "professional" ? (
            <>
              <QuickAction emoji="🔍" label={t("dashboard.findShifts")} onPress={() => router.push("/(app)/(tabs)/shifts")} />
              <QuickAction emoji="📅" label={t("dashboard.viewSchedule")} onPress={() => router.push("/(app)/(tabs)/shifts")} />
              <QuickAction emoji="💬" label={t("tabs.messages")} onPress={() => router.push("/(app)/(tabs)/messages")} />
            </>
          ) : (
            <>
              <QuickAction emoji="➕" label={t("dashboard.postShift")} onPress={() => router.push("/(app)/(tabs)/shifts")} />
              <QuickAction emoji="🔍" label={t("dashboard.searchProfessionals")} onPress={() => router.push("/(app)/search/professionals")} />
              <QuickAction emoji="💬" label={t("tabs.messages")} onPress={() => router.push("/(app)/(tabs)/messages")} />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing["2xl"], gap: spacing.lg },
  header: { gap: spacing.xs },
  welcome: { fontSize: typography.fontSize.base },
  name: { fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.bold },
  statsRow: { flexDirection: "row", gap: spacing.md },
  statCard: { flex: 1, padding: spacing.md, borderRadius: borderRadius.lg, gap: spacing.xs },
  statValue: { fontSize: typography.fontSize["3xl"], fontWeight: typography.fontWeight.bold },
  statLabel: { fontSize: typography.fontSize.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  quickAction: {
    flex: 1,
    minWidth: "30%",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 100,
    justifyContent: "center",
  },
  quickEmoji: { fontSize: 28 },
  quickLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, textAlign: "center" },
});

/**
 * Profile tab.
 *
 * User profile display with edit and settings navigation.
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
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

function MenuItem({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  const { themeColors } = useTheme();
  return (
    <Pressable
      style={[styles.menuItem, { borderBottomColor: themeColors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={[styles.menuLabel, { color: themeColors.foreground }]}>{label}</Text>
      <Text style={[styles.menuArrow, { color: themeColors.mutedForeground }]}>›</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { profile, userRole, signOut, refreshProfile } = useAuth();
  const { themeColors } = useTheme();

  const displayName =
    profile && "full_name" in profile ? profile.full_name : profile && "name" in profile ? profile.name : "User";
  const email = profile?.email ?? "";
  const status = profile?.verification_status ?? "pending";

  const statusConfig = {
    pending: { color: colors.warning, label: t("profile.pending"), emoji: "⏳" },
    verified: { color: colors.success, label: t("profile.verified"), emoji: "✅" },
    rejected: { color: colors.destructive, label: t("profile.rejected"), emoji: "❌" },
  };
  const { color: statusColor, label: statusLabel, emoji: statusEmoji } = statusConfig[status];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refreshProfile} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={[styles.profileHeader, { backgroundColor: themeColors.card }]}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarLargeText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[styles.displayName, { color: themeColors.foreground }]}>{displayName}</Text>
          <Text style={[styles.emailText, { color: themeColors.mutedForeground }]}>{email}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
            <Text style={styles.statusEmoji}>{statusEmoji}</Text>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menuSection, { backgroundColor: themeColors.card }]}>
          <MenuItem emoji="✏️" label={t("profile.editProfile")} onPress={() => {}} />
          <MenuItem emoji="📄" label={t("profile.documents")} onPress={() => {}} />
          {userRole === "professional" && (
            <MenuItem emoji="📅" label={t("profile.availability")} onPress={() => {}} />
          )}
          <MenuItem emoji="⭐" label={t("profile.ratings")} onPress={() => {}} />
        </View>

        <View style={[styles.menuSection, { backgroundColor: themeColors.card }]}>
          <MenuItem emoji="⚙️" label={t("settings.settings")} onPress={() => router.push("/(app)/settings")} />
          <MenuItem emoji="🌐" label={t("settings.language")} onPress={() => router.push("/(app)/settings/language")} />
        </View>

        {/* Sign Out */}
        <Pressable
          style={[styles.signOutButton, { borderColor: colors.destructive }]}
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel={t("common.signOut")}
        >
          <Text style={[styles.signOutText, { color: colors.destructive }]}>
            {t("common.signOut")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingVertical: spacing.md, gap: spacing.md },
  profileHeader: {
    alignItems: "center",
    padding: spacing.xl,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  avatarLargeText: { fontSize: typography.fontSize["4xl"], fontWeight: typography.fontWeight.bold, color: colors.primaryForeground },
  displayName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  emailText: { fontSize: typography.fontSize.sm },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusEmoji: { fontSize: 14 },
  statusText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  menuSection: { marginHorizontal: spacing.md, borderRadius: borderRadius.lg, overflow: "hidden" },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: TOUCH_TARGET_SIZE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  menuEmoji: { fontSize: 20, width: 28, textAlign: "center" },
  menuLabel: { flex: 1, fontSize: typography.fontSize.base },
  menuArrow: { fontSize: typography.fontSize.xl },
  signOutButton: {
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    minHeight: TOUCH_TARGET_SIZE,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  signOutText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});

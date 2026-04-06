/**
 * Booking detail screen.
 *
 * Shows booking status and info with role-based action buttons.
 */
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.accent,
  confirmed: colors.success,
  checked_in: colors.success,
  checked_out: colors.accent,
  completed: colors.primary,
  cancelled: colors.destructive,
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, shifts(title, hourly_rate, start_time, end_time, location)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
    },
    onError: (err: Error) => {
      Alert.alert(t("common.error"), err.message);
    },
  });

  const handleAction = (status: string, label: string) => {
    Alert.alert("Confirm", `${label}?`, [
      { text: t("common.cancel"), style: "cancel" },
      { text: label, onPress: () => updateStatus.mutate(status) },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: themeColors.mutedForeground }}>Booking not found</Text>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[booking.status] ?? colors.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {booking.status.replace("_", " ").toUpperCase()}
        </Text>
      </View>

      {/* Shift info */}
      {booking.shifts && (
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
            {booking.shifts.title}
          </Text>
          <Text style={[styles.sectionDetail, { color: themeColors.mutedForeground }]}>
            💰 {booking.shifts.hourly_rate} SAR/hr
          </Text>
          <Text style={[styles.sectionDetail, { color: themeColors.mutedForeground }]}>
            📅 {new Date(booking.shifts.start_time).toLocaleDateString()}
          </Text>
          {booking.shifts.location && (
            <Text style={[styles.sectionDetail, { color: themeColors.mutedForeground }]}>
              📍 {booking.shifts.location}
            </Text>
          )}
        </View>
      )}

      {/* Actions based on status and role */}
      <View style={styles.actions}>
        {booking.status === "pending" && userRole === "clinic" && (
          <>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.success }]}
              onPress={() => handleAction("accepted", "Accept")}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnText}>Accept</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.destructive }]}
              onPress={() => handleAction("cancelled", "Reject")}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnText}>Reject</Text>
            </Pressable>
          </>
        )}
        {booking.status === "accepted" && userRole === "professional" && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.success }]}
            onPress={() => handleAction("confirmed", "Confirm")}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>Confirm</Text>
          </Pressable>
        )}
        {booking.status === "confirmed" && userRole === "professional" && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            onPress={() => handleAction("checked_in", "Check In")}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>Check In</Text>
          </Pressable>
        )}
        {booking.status === "checked_in" && userRole === "professional" && (
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.accent }]}
            onPress={() => handleAction("checked_out", "Check Out")}
            accessibilityRole="button"
          >
            <Text style={styles.actionBtnText}>Check Out</Text>
          </Pressable>
        )}
        {!["completed", "cancelled"].includes(booking.status) && (
          <Pressable
            style={[styles.cancelBtn, { borderColor: colors.destructive }]}
            onPress={() => handleAction("cancelled", "Cancel Booking")}
            accessibilityRole="button"
          >
            <Text style={[styles.cancelBtnText, { color: colors.destructive }]}>
              Cancel Booking
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing["3xl"] },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md, alignSelf: "flex-start" },
  statusText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  section: { padding: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm },
  sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  sectionDetail: { fontSize: typography.fontSize.sm },
  actions: { gap: spacing.sm },
  actionBtn: {
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  actionBtnText: { color: "#FFF", fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  cancelBtn: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  cancelBtnText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});

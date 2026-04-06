/**
 * Shift detail screen.
 *
 * Shows full shift info with apply/manage action.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  shadows,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { userRole, profile } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: shift, isLoading } = useQuery({
    queryKey: ["shift", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("*, clinics(name, logo_url)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("bookings").insert({
        shift_id: id,
        professional_id: profile?.id,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["shift", id] });
      Alert.alert("Success", "Application submitted!");
    },
    onError: (err: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("common.error"), err.message);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!shift) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: themeColors.mutedForeground }}>Shift not found</Text>
      </View>
    );
  }

  const startDate = new Date(shift.start_time);
  const endDate = new Date(shift.end_time);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Title */}
      <Text style={[styles.title, { color: themeColors.foreground }]}>
        {shift.title}
      </Text>

      {/* Clinic info */}
      {shift.clinics && (
        <Text style={[styles.clinic, { color: themeColors.mutedForeground }]}>
          🏥 {shift.clinics.name}
        </Text>
      )}

      {/* Rate */}
      <View style={[styles.rateCard, { backgroundColor: colors.success + "15" }]}>
        <Text style={[styles.rateValue, { color: colors.success }]}>
          {shift.hourly_rate} SAR/hr
        </Text>
      </View>

      {/* Details */}
      <View style={[styles.detailSection, { backgroundColor: themeColors.card }]}>
        <DetailRow label="📅 Date" value={startDate.toLocaleDateString()} themeColors={themeColors} />
        <DetailRow
          label="🕐 Time"
          value={`${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          themeColors={themeColors}
        />
        {shift.location && (
          <DetailRow label="📍 Location" value={shift.location} themeColors={themeColors} />
        )}
        {shift.specialty && (
          <DetailRow label="🩺 Specialty" value={shift.specialty} themeColors={themeColors} />
        )}
      </View>

      {/* Description */}
      {shift.description && (
        <View style={styles.descSection}>
          <Text style={[styles.descTitle, { color: themeColors.foreground }]}>Description</Text>
          <Text style={[styles.descText, { color: themeColors.mutedForeground }]}>
            {shift.description}
          </Text>
        </View>
      )}

      {/* Directions */}
      {shift.latitude && shift.longitude && (
        <Pressable
          style={[styles.directionsButton, { borderColor: colors.accent }]}
          onPress={() => {
            const url = `https://maps.google.com/?q=${shift.latitude},${shift.longitude}`;
            Linking.openURL(url);
          }}
          accessibilityRole="link"
        >
          <Text style={[styles.directionsText, { color: colors.accent }]}>
            🗺️ {t("shifts.getDirections")}
          </Text>
        </Pressable>
      )}

      {/* Action */}
      {userRole === "professional" && (
        <Pressable
          style={[styles.applyButton, { backgroundColor: colors.primary }, applyMutation.isPending && styles.buttonDisabled]}
          onPress={() => applyMutation.mutate()}
          disabled={applyMutation.isPending}
          accessibilityRole="button"
        >
          <Text style={styles.applyButtonText}>
            {applyMutation.isPending ? t("common.loading") : t("shifts.apply")}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value, themeColors }: { label: string; value: string; themeColors: any }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: themeColors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: themeColors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing["3xl"] },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.bold },
  clinic: { fontSize: typography.fontSize.base },
  rateCard: { padding: spacing.md, borderRadius: borderRadius.md, alignSelf: "flex-start" },
  rateValue: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  detailSection: { borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 36 },
  detailLabel: { fontSize: typography.fontSize.sm },
  detailValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, textAlign: "right", flex: 1, marginLeft: spacing.md },
  descSection: { gap: spacing.sm },
  descTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  descText: { fontSize: typography.fontSize.base, lineHeight: 24 },
  directionsButton: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  directionsText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  applyButton: {
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  applyButtonText: { color: colors.primaryForeground, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});

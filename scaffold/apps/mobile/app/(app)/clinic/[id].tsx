/**
 * View clinic profile (read-only).
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
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function ClinicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ["clinic", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: openShifts } = useQuery({
    queryKey: ["clinic-shifts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shifts")
        .select("id, title, hourly_rate, start_time")
        .eq("clinic_id", id)
        .eq("status", "open")
        .order("start_time", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!clinic) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: themeColors.mutedForeground }}>Clinic not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={[styles.logo, { backgroundColor: colors.accent + "20" }]}>
          <Text style={[styles.logoText, { color: colors.accent }]}>
            {(clinic.name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: themeColors.foreground }]}>
          {clinic.name}
        </Text>
        <Text style={[styles.email, { color: themeColors.mutedForeground }]}>
          {clinic.email}
        </Text>
      </View>

      {/* Info */}
      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        {clinic.phone && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>📞 Phone</Text>
            <Text style={[styles.infoValue, { color: themeColors.foreground }]}>{clinic.phone}</Text>
          </View>
        )}
        {clinic.address && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>📍 Address</Text>
            <Text style={[styles.infoValue, { color: themeColors.foreground }]}>{clinic.address}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>✅ Status</Text>
          <Text style={[styles.infoValue, { color: themeColors.foreground }]}>
            {clinic.verification_status}
          </Text>
        </View>
      </View>

      {/* Open shifts */}
      {openShifts && openShifts.length > 0 && (
        <View style={styles.shiftsSection}>
          <Text style={[styles.shiftsTitle, { color: themeColors.foreground }]}>
            Open Shifts
          </Text>
          {openShifts.map((shift: any) => (
            <View key={shift.id} style={[styles.shiftItem, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.shiftName, { color: themeColors.foreground }]}>{shift.title}</Text>
              <Text style={[styles.shiftRate, { color: colors.success }]}>
                {shift.hourly_rate} SAR/hr
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Message */}
      <Pressable
        style={[styles.messageBtn, { backgroundColor: colors.primary }]}
        onPress={() => Alert.alert("Message", "Conversation feature")}
        accessibilityRole="button"
      >
        <Text style={styles.messageBtnText}>💬 Send Message</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing["3xl"] },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerSection: { alignItems: "center", gap: spacing.sm },
  logo: { width: 80, height: 80, borderRadius: borderRadius.lg, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: typography.fontSize["4xl"], fontWeight: typography.fontWeight.bold },
  name: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  email: { fontSize: typography.fontSize.sm },
  section: { padding: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 36 },
  infoLabel: { fontSize: typography.fontSize.sm },
  infoValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, flex: 1, textAlign: "right", marginLeft: spacing.md },
  shiftsSection: { gap: spacing.sm },
  shiftsTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  shiftItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  shiftName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, flex: 1 },
  shiftRate: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
  messageBtn: {
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  messageBtnText: { color: colors.primaryForeground, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});

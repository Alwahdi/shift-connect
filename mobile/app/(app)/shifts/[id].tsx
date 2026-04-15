import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { colors, spacing, borderRadius, typography, shadows } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import type { Shift } from "@/types";

export default function ShiftDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, userRole } = useAuth();
  const { profileId } = useProfile();
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("shifts").select("*, clinic:clinics(id, name, address, rating_avg, logo_url)").eq("id", id).single();
      setShift(data as any);
      if (profileId && userRole === "professional") {
        const { data: booking } = await supabase.from("bookings").select("id").eq("shift_id", id).eq("professional_id", profileId).limit(1).single();
        setHasApplied(!!booking);
      }
      setLoading(false);
    };
    if (id) fetch();
  }, [id, profileId]);

  const handleApply = async () => {
    if (!shift || !profileId) return;
    setApplying(true);
    const { error } = await supabase.from("bookings").insert({ shift_id: shift.id, professional_id: profileId, clinic_id: shift.clinic_id, status: "pending" });
    setApplying(false);
    if (error) { Toast.show({ type: "error", text1: "Error", text2: error.message }); }
    else { setHasApplied(true); Toast.show({ type: "success", text1: "Applied!", text2: "Your application has been submitted" }); }
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>;
  if (!shift) return <SafeAreaView style={styles.safe}><Text style={{ textAlign: "center", marginTop: 100 }}>Shift not found</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>{t("shifts.shiftDetails")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.titleSection}>
          <Text style={styles.shiftTitle}>{shift.title}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm }}>
            <Badge variant="default">{shift.role_required}</Badge>
            {shift.is_urgent && <Badge variant="error">{t("shifts.urgent")}</Badge>}
          </View>
        </View>

        {/* Clinic info */}
        {shift.clinic && (
          <Card style={styles.clinicCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <Avatar uri={shift.clinic.logo_url} name={shift.clinic.name} size="md" />
              <View style={{ flex: 1 }}>
                <Text style={styles.clinicName}>{shift.clinic.name}</Text>
                {shift.clinic.rating_avg && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <MaterialCommunityIcons name="star" size={14} color={colors.warning} />
                    <Text style={styles.meta}>{shift.clinic.rating_avg.toFixed(1)}</Text>
                  </View>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Info boxes */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.infoLabel}>{t("shifts.date")}</Text>
            <Text style={styles.infoValue}>{format(parseISO(shift.shift_date), "MMM d, yyyy")}</Text>
          </View>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.teal} />
            <Text style={styles.infoLabel}>{t("shifts.time")}</Text>
            <Text style={styles.infoValue}>{shift.start_time?.slice(0,5)} - {shift.end_time?.slice(0,5)}</Text>
          </View>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="currency-usd" size={20} color={colors.success} />
            <Text style={styles.infoLabel}>{t("shifts.rate")}</Text>
            <Text style={styles.infoValue}>${shift.hourly_rate}/hr</Text>
          </View>
        </View>

        {/* Location */}
        {shift.location_address && (
          <Card style={styles.section}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.meta}>{shift.location_address}</Text>
            </View>
          </Card>
        )}

        {/* Description */}
        {shift.description && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t("shifts.description")}</Text>
            <Text style={styles.descText}>{shift.description}</Text>
          </Card>
        )}

        {/* Certifications */}
        {shift.required_certifications && shift.required_certifications.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Required Certifications</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {shift.required_certifications.map(c => <Badge key={c} variant="info">{c}</Badge>)}
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Bottom action */}
      {userRole === "professional" && (
        <View style={styles.bottomBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomRate}>${shift.hourly_rate}/hr</Text>
          </View>
          <Button onPress={handleApply} loading={applying} disabled={hasApplied || !!shift.is_filled}
            variant={hasApplied ? "secondary" : "primary"}>
            {hasApplied ? t("shifts.applied") : t("shifts.apply")}
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  titleSection: { padding: spacing.base },
  shiftTitle: { fontSize: typography.sizes["2xl"], fontWeight: typography.weights.bold, color: colors.text },
  clinicCard: { marginHorizontal: spacing.base, marginBottom: spacing.md },
  clinicName: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text },
  infoRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.base, marginBottom: spacing.md },
  infoBox: { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: "center", gap: 4, ...shadows.sm },
  infoLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  infoValue: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.text, textAlign: "center" },
  section: { marginHorizontal: spacing.base, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.sm },
  descText: { fontSize: typography.sizes.base, color: colors.textSecondary, lineHeight: 22 },
  meta: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  bottomBar: { flexDirection: "row", alignItems: "center", padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.border },
  bottomRate: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.primary },
});

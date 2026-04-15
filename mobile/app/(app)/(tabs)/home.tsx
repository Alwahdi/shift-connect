import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { colors, spacing, borderRadius, typography, shadows } from "@/constants/theme";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import type { Shift, Booking } from "@/types";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, userRole, isOnboardingComplete } = useAuth();
  const { displayName, avatarUrl, verificationStatus, profileId } = useProfile();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ completed: 0, earnings: 0, rating: 0 });

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.goodMorning");
    if (h < 18) return t("dashboard.goodAfternoon");
    return t("dashboard.goodEvening");
  };

  const fetchData = useCallback(async () => {
    if (!user || !profileId) return;
    try {
      if (userRole === "professional") {
        // Fetch available shifts
        const { data: shiftsData } = await supabase
          .from("shifts").select("*, clinic:clinics(id, name, address, rating_avg, logo_url)")
          .eq("is_filled", false).order("shift_date", { ascending: true }).limit(5);
        setShifts((shiftsData as any) || []);

        // Fetch active bookings
        const { data: bookingsData } = await supabase
          .from("bookings").select("*, shift:shifts(*), clinic:clinics(id, name, logo_url)")
          .eq("professional_id", profileId).in("status", ["pending", "accepted", "confirmed", "checked_in"])
          .order("created_at", { ascending: false }).limit(5);
        setBookings((bookingsData as any) || []);

        // Stats
        const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true })
          .eq("professional_id", profileId).eq("status", "completed");
        setStats(prev => ({ ...prev, completed: count || 0 }));
      } else {
        // Clinic: fetch own shifts
        const { data: shiftsData } = await supabase
          .from("shifts").select("*").eq("clinic_id", profileId).order("shift_date", { ascending: true }).limit(10);
        setShifts((shiftsData as any) || []);

        // Clinic bookings
        const { data: bookingsData } = await supabase
          .from("bookings").select("*, shift:shifts(*), professional:profiles(id, full_name, avatar_url)")
          .eq("clinic_id", profileId).in("status", ["pending", "accepted", "confirmed"])
          .order("created_at", { ascending: false }).limit(5);
        setBookings((bookingsData as any) || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user, userRole, profileId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }, [fetchData]);

  const statusColor = (s: string | null) => {
    if (s === "accepted" || s === "confirmed") return "success";
    if (s === "pending") return "warning";
    if (s === "checked_in") return "info";
    return "default";
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{displayName || "there"} 👋</Text>
          </View>
          <Pressable onPress={() => router.push("/(app)/notifications")}>
            <MaterialCommunityIcons name="bell-outline" size={26} color={colors.text} />
          </Pressable>
          <Avatar uri={avatarUrl} name={displayName} size="md" showVerification={verificationStatus === "verified"} />
        </View>

        {/* Onboarding banner */}
        {!isOnboardingComplete && (
          <Card style={styles.onboardingBanner} onPress={() => router.push("/(app)/onboarding")}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <MaterialCommunityIcons name="alert-circle" size={24} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>{t("dashboard.onboardingIncomplete")}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
            </View>
          </Card>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={22} color={colors.teal} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>{t("dashboard.completedShifts")}</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star" size={22} color={colors.warning} />
            <Text style={styles.statValue}>{stats.rating || "—"}</Text>
            <Text style={styles.statLabel}>{t("dashboard.rating")}</Text>
          </View>
        </View>

        {/* Create shift button for clinics */}
        {userRole === "clinic" && (
          <Button variant="primary" fullWidth icon={<MaterialCommunityIcons name="plus" size={20} color={colors.white} />}
            style={{ marginHorizontal: spacing.base, marginBottom: spacing.lg }}
            onPress={() => {}}>{t("dashboard.createShift")}</Button>
        )}

        {/* Available Shifts / Your Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{userRole === "clinic" ? t("dashboard.yourShifts") : t("dashboard.availableShifts")}</Text>
          <Pressable onPress={() => router.push("/(app)/(tabs)/shifts")}><Text style={styles.seeAll}>{t("common.viewAll")}</Text></Pressable>
        </View>

        {shifts.length === 0 ? (
          <Card style={{ margin: spacing.base }}><Text style={styles.emptyText}>{t("dashboard.noShifts")}</Text></Card>
        ) : (
          shifts.map((shift) => (
            <Card key={shift.id} style={styles.shiftCard} onPress={() => router.push(`/(app)/shifts/${shift.id}`)}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shiftTitle}>{shift.title}</Text>
                  {shift.clinic && <Text style={styles.clinicName}>{shift.clinic.name}</Text>}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.rate}>${shift.hourly_rate}/hr</Text>
                  {shift.is_urgent && <Badge variant="error">Urgent</Badge>}
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: spacing.base, marginTop: spacing.sm }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
                  <Text style={styles.meta}>{format(parseISO(shift.shift_date), "MMM d")}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.meta}>{shift.start_time?.slice(0,5)} - {shift.end_time?.slice(0,5)}</Text>
                </View>
                {shift.location_address && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.meta} numberOfLines={1}>{shift.location_address}</Text>
                  </View>
                )}
              </View>
            </Card>
          ))
        )}

        {/* Active Bookings */}
        {bookings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("dashboard.activeBookings")}</Text>
            </View>
            {bookings.map((b) => (
              <Card key={b.id} style={styles.shiftCard} onPress={() => router.push(`/(app)/bookings/${b.id}`)}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={styles.shiftTitle}>{b.shift?.title || "Shift"}</Text>
                  <Badge variant={statusColor(b.status)}>{b.status || "pending"}</Badge>
                </View>
                {b.shift && (
                  <Text style={styles.meta}>{format(parseISO(b.shift.shift_date), "MMM d")} · {b.shift.start_time?.slice(0,5)}</Text>
                )}
              </Card>
            ))}
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.base, paddingTop: spacing.sm },
  greeting: { fontSize: typography.sizes.base, color: colors.textSecondary },
  name: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text },
  onboardingBanner: { marginHorizontal: spacing.base, marginBottom: spacing.base, backgroundColor: colors.warningBg },
  bannerTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colors.text },
  statsRow: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.base, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.base, alignItems: "center", gap: 4, ...shadows.sm },
  statValue: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary, textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: spacing.base, marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  seeAll: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: typography.weights.medium },
  shiftCard: { marginHorizontal: spacing.base, marginBottom: spacing.sm },
  shiftTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text },
  clinicName: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  rate: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold, color: colors.primary },
  meta: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  emptyText: { color: colors.textSecondary, textAlign: "center" },
});

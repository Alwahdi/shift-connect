import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert, TextInput, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, borderRadius, typography, shadows } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import type { Booking, BookingStatus } from "@/types";

const STATUS_ORDER: BookingStatus[] = ["pending", "accepted", "confirmed", "checked_in", "checked_out", "completed"];

export default function BookingDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userRole } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const fetchBooking = async () => {
    const { data } = await supabase.from("bookings")
      .select("*, shift:shifts(*, clinic:clinics(id, name, logo_url)), professional:profiles(id, full_name, avatar_url), clinic:clinics(id, name, logo_url)")
      .eq("id", id).single();
    setBooking(data as any);
    setLoading(false);
  };

  useEffect(() => { if (id) fetchBooking(); }, [id]);

  const updateStatus = async (status: BookingStatus) => {
    setActing(true);
    const update: any = { status };
    if (status === "checked_in") update.check_in_time = new Date().toISOString();
    if (status === "checked_out") update.check_out_time = new Date().toISOString();
    const { error } = await supabase.from("bookings").update(update).eq("id", id);
    setActing(false);
    if (error) Toast.show({ type: "error", text1: "Error", text2: error.message });
    else { Toast.show({ type: "success", text1: "Updated!" }); fetchBooking(); }
  };

  const cancelBooking = () => {
    Alert.alert("Cancel Booking", "Are you sure?", [
      { text: "No", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: () => updateStatus("cancelled") },
    ]);
  };

  const submitRating = async () => {
    if (!booking || rating === 0) return;
    setActing(true);
    await supabase.from("ratings").insert({
      shift_id: booking.shift_id, booking_id: booking.id,
      rater_id: userRole === "professional" ? booking.professional_id : booking.clinic_id,
      rated_id: userRole === "professional" ? booking.clinic_id : booking.professional_id,
      rater_type: userRole || "professional", rating, comment: comment || null,
    });
    setShowRating(false);
    Toast.show({ type: "success", text1: "Thank you for your feedback!" });
    setActing(false);
  };

  const statusColor = (s: string | null): "default" | "success" | "warning" | "error" | "info" => {
    if (s === "completed" || s === "accepted" || s === "confirmed") return "success";
    if (s === "pending") return "warning";
    if (s === "cancelled" || s === "declined") return "error";
    if (s === "checked_in" || s === "checked_out") return "info";
    return "default";
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>;
  if (!booking) return <SafeAreaView style={styles.safe}><Text style={{ textAlign: "center", marginTop: 100 }}>Booking not found</Text></SafeAreaView>;

  const currentIdx = STATUS_ORDER.indexOf(booking.status as BookingStatus);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: 100 }}>
        {/* Status */}
        <View style={styles.statusSection}>
          <Badge variant={statusColor(booking.status)} size="md">{booking.status || "pending"}</Badge>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {STATUS_ORDER.map((s, i) => (
            <View key={s} style={styles.timelineItem}>
              <View style={[styles.timelineDot, i <= currentIdx && styles.timelineDotActive]} />
              <Text style={[styles.timelineLabel, i <= currentIdx && styles.timelineLabelActive]}>{s.replace("_", " ")}</Text>
            </View>
          ))}
        </View>

        {/* Shift info */}
        {booking.shift && (
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={styles.cardTitle}>{booking.shift.title}</Text>
            <View style={{ flexDirection: "row", gap: spacing.base, marginTop: spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
                <Text style={styles.meta}>{format(parseISO(booking.shift.shift_date), "MMM d, yyyy")}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.meta}>{booking.shift.start_time?.slice(0,5)} - {booking.shift.end_time?.slice(0,5)}</Text>
              </View>
            </View>
            <Text style={styles.rate}>${booking.shift.hourly_rate}/hr</Text>
          </Card>
        )}

        {/* Timestamps */}
        {(booking.check_in_time || booking.check_out_time) && (
          <Card style={{ marginBottom: spacing.md }}>
            {booking.check_in_time && <Text style={styles.meta}>Checked in: {format(parseISO(booking.check_in_time), "MMM d, h:mm a")}</Text>}
            {booking.check_out_time && <Text style={styles.meta}>Checked out: {format(parseISO(booking.check_out_time), "MMM d, h:mm a")}</Text>}
          </Card>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionBar}>
        {userRole === "professional" && booking.status === "confirmed" && (
          <Button onPress={() => updateStatus("checked_in")} loading={acting} fullWidth>{t("bookings.checkIn")}</Button>
        )}
        {userRole === "professional" && booking.status === "checked_in" && (
          <Button onPress={() => updateStatus("checked_out")} loading={acting} fullWidth variant="secondary">{t("bookings.checkOut")}</Button>
        )}
        {userRole === "clinic" && booking.status === "pending" && (
          <View style={{ flexDirection: "row", gap: spacing.md, flex: 1 }}>
            <Button onPress={() => updateStatus("accepted")} loading={acting} style={{ flex: 1 }}>Accept</Button>
            <Button variant="destructive" onPress={() => updateStatus("declined")} loading={acting} style={{ flex: 1 }}>Decline</Button>
          </View>
        )}
        {booking.status === "completed" && (
          <Button onPress={() => setShowRating(true)} fullWidth>{t("bookings.rateExperience")}</Button>
        )}
        {["pending", "accepted", "confirmed"].includes(booking.status || "") && (
          <Button variant="ghost" onPress={cancelBooking}><Text style={{ color: colors.error }}>{t("bookings.cancel")}</Text></Button>
        )}
      </View>

      {/* Rating Modal */}
      <Modal visible={showRating} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("bookings.rateExperience")}</Text>
            <View style={styles.starsRow}>
              {[1,2,3,4,5].map(i => (
                <Pressable key={i} onPress={() => setRating(i)}>
                  <MaterialCommunityIcons name={i <= rating ? "star" : "star-outline"} size={36} color={colors.warning} />
                </Pressable>
              ))}
            </View>
            <TextInput style={styles.commentInput} value={comment} onChangeText={setComment} placeholder="Add a comment (optional)" multiline />
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <Button variant="outline" onPress={() => setShowRating(false)} style={{ flex: 1 }}>{t("common.cancel")}</Button>
              <Button onPress={submitRating} loading={acting} style={{ flex: 1 }}>Submit</Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  statusSection: { alignItems: "center", paddingVertical: spacing.lg },
  timeline: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
  timelineItem: { alignItems: "center", flex: 1 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginBottom: 4 },
  timelineDotActive: { backgroundColor: colors.primary },
  timelineLabel: { fontSize: 9, color: colors.textTertiary, textAlign: "center", textTransform: "capitalize" },
  timelineLabelActive: { color: colors.primary, fontWeight: typography.weights.medium },
  cardTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text },
  meta: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  rate: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary, marginTop: spacing.sm },
  actionBar: { padding: spacing.base, backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.border, gap: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.xl },
  modalTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text, textAlign: "center", marginBottom: spacing.lg },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, marginBottom: spacing.lg },
  commentInput: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.DEFAULT, padding: spacing.md, fontSize: typography.sizes.base, minHeight: 80, textAlignVertical: "top", marginBottom: spacing.lg },
});

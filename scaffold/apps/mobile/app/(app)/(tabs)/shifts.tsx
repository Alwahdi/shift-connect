/**
 * Shifts tab.
 *
 * Search/browse available shifts (professional) or manage posted shifts (clinic).
 */
import { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
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

interface Shift {
  id: string;
  title: string;
  clinic_name?: string;
  hourly_rate: number;
  start_time: string;
  end_time: string;
  location?: string;
  status: string;
}

function ShiftCard({ shift }: { shift: Shift }) {
  const { themeColors } = useTheme();
  const date = new Date(shift.start_time);

  return (
    <Pressable
      style={[styles.shiftCard, { backgroundColor: themeColors.card }, shadows.sm]}
      onPress={() => router.push(`/(app)/shift/${shift.id}`)}
      accessibilityRole="button"
      accessibilityLabel={shift.title}
    >
      <View style={styles.shiftHeader}>
        <Text style={[styles.shiftTitle, { color: themeColors.foreground }]} numberOfLines={1}>
          {shift.title}
        </Text>
        <Text style={[styles.shiftRate, { color: colors.success }]}>
          {shift.hourly_rate} SAR/hr
        </Text>
      </View>
      {shift.clinic_name && (
        <Text style={[styles.shiftClinic, { color: themeColors.mutedForeground }]} numberOfLines={1}>
          🏥 {shift.clinic_name}
        </Text>
      )}
      <View style={styles.shiftMeta}>
        <Text style={[styles.shiftMetaText, { color: themeColors.mutedForeground }]}>
          📅 {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        {shift.location && (
          <Text style={[styles.shiftMetaText, { color: themeColors.mutedForeground }]} numberOfLines={1}>
            📍 {shift.location}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export default function ShiftsScreen() {
  const { t } = useTranslation();
  const { userRole, profile } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const [search, setSearch] = useState("");

  const { data: shifts, refetch, isRefetching, isLoading } = useQuery({
    queryKey: ["shifts", userRole, search],
    queryFn: async () => {
      let query = supabase
        .from("shifts")
        .select("*")
        .order("start_time", { ascending: true })
        .limit(50);

      if (userRole === "clinic") {
        query = query.eq("clinic_id", profile?.id ?? "");
      } else {
        query = query.eq("status", "open");
      }

      if (search.trim()) {
        query = query.ilike("title", `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Shift[];
    },
    enabled: !!profile?.id,
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { borderColor: themeColors.border, color: themeColors.foreground, backgroundColor: themeColors.card }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t("shifts.searchShifts")}
          placeholderTextColor={themeColors.mutedForeground}
          accessibilityLabel={t("shifts.searchShifts")}
        />
      </View>

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ShiftCard shift={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>
                {t("shifts.noShiftsFound")}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  searchInput: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing["2xl"], gap: spacing.sm },
  shiftCard: { padding: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm },
  shiftHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  shiftTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, flex: 1, marginRight: spacing.sm },
  shiftRate: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
  shiftClinic: { fontSize: typography.fontSize.sm },
  shiftMeta: { gap: spacing.xs },
  shiftMetaText: { fontSize: typography.fontSize.sm },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: spacing["3xl"], gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: typography.fontSize.base, textAlign: "center" },
});

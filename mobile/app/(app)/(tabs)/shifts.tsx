import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { colors, spacing, borderRadius, typography, shadows } from "@/constants/theme";
import { ROLE_OPTIONS } from "@/constants/config";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import type { Shift } from "@/types";

export default function ShiftsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userRole } = useAuth();
  const { profileId } = useProfile();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const fetchShifts = useCallback(async () => {
    let query = supabase.from("shifts").select("*, clinic:clinics(id, name, address, rating_avg, logo_url)").order("shift_date", { ascending: true });
    if (userRole === "professional") query = query.eq("is_filled", false);
    else if (profileId) query = query.eq("clinic_id", profileId);
    if (selectedRole !== "All") query = query.eq("role_required", selectedRole);
    const { data } = await query.limit(30);
    setShifts((data as any) || []);
    setLoading(false);
  }, [userRole, profileId, selectedRole]);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await fetchShifts(); setRefreshing(false); }, [fetchShifts]);

  const filtered = shifts.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.role_required.toLowerCase().includes(search.toLowerCase()));

  const renderShift = ({ item }: { item: Shift }) => (
    <Card style={styles.card} onPress={() => router.push(`/(app)/shifts/${item.id}`)}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          {item.clinic && <Text style={styles.clinic}>{item.clinic.name}</Text>}
        </View>
        <Text style={styles.rate}>${item.hourly_rate}/hr</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm }}>
        <Badge variant="default">{item.role_required}</Badge>
        {item.is_urgent && <Badge variant="error">{t("shifts.urgent")}</Badge>}
        {item.is_filled && <Badge variant="outline">{t("shifts.filled")}</Badge>}
      </View>
      <View style={{ flexDirection: "row", gap: spacing.base, marginTop: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
          <Text style={styles.meta}>{format(parseISO(item.shift_date), "MMM d, yyyy")}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.meta}>{item.start_time?.slice(0,5)} - {item.end_time?.slice(0,5)}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.searchBar}>
        <Input placeholder={t("shifts.search")} value={search} onChangeText={setSearch}
          leftIcon={<MaterialCommunityIcons name="magnify" size={20} color={colors.textTertiary} />}
          containerStyle={{ marginBottom: 0 }} />
      </View>

      {/* Role filter chips */}
      <FlatList
        horizontal showsHorizontalScrollIndicator={false}
        data={["All", ...ROLE_OPTIONS]}
        keyExtractor={(i) => i}
        contentContainerStyle={{ paddingHorizontal: spacing.base, paddingBottom: spacing.sm, gap: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedRole(item)}
            style={[styles.chip, selectedRole === item && styles.chipSelected]}>
            <Text style={[styles.chipText, selectedRole === item && styles.chipTextSelected]}>{item === "All" ? t("shifts.allRoles") : item}</Text>
          </Pressable>
        )}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderShift}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={filtered.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
          ListEmptyComponent={<EmptyState icon="briefcase-search" title={t("shifts.noShiftsFound")} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  searchBar: { paddingHorizontal: spacing.base, paddingTop: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.sizes.sm, color: colors.textSecondary },
  chipTextSelected: { color: colors.white, fontWeight: typography.weights.medium },
  card: { marginHorizontal: spacing.base, marginBottom: spacing.sm },
  title: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text },
  clinic: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  rate: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.primary },
  meta: { fontSize: typography.sizes.sm, color: colors.textSecondary },
});

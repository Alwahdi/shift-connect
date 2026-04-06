/**
 * Search professionals screen (for clinic role).
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

interface Professional {
  id: string;
  full_name: string;
  email: string;
  specialty?: string;
  verification_status: string;
}

export default function SearchProfessionalsScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const [search, setSearch] = useState("");

  const { data: professionals, refetch, isRefetching } = useQuery({
    queryKey: ["search-professionals", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, full_name, email, specialty, verification_status")
        .eq("verification_status", "verified")
        .order("full_name")
        .limit(50);

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,specialty.ilike.%${search.trim()}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Professional[];
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              borderColor: themeColors.border,
              color: themeColors.foreground,
              backgroundColor: themeColors.card,
            },
          ]}
          value={search}
          onChangeText={setSearch}
          placeholder={t("common.search")}
          placeholderTextColor={themeColors.mutedForeground}
          accessibilityLabel="Search professionals"
        />
      </View>

      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: themeColors.card }, shadows.sm]}
            onPress={() => router.push(`/(app)/professional/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={item.full_name}
          >
            <View style={[styles.cardAvatar, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.cardAvatarText, { color: colors.primary }]}>
                {item.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={[styles.cardName, { color: themeColors.foreground }]} numberOfLines={1}>
                {item.full_name}
              </Text>
              {item.specialty && (
                <Text style={[styles.cardSpecialty, { color: themeColors.mutedForeground }]}>
                  🩺 {item.specialty}
                </Text>
              )}
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyText, { color: themeColors.mutedForeground }]}>
              {t("common.noResults")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: spacing.md },
  searchInput: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: spacing["2xl"], gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  cardAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  cardAvatarText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  cardContent: { flex: 1, gap: spacing.xs },
  cardName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  cardSpecialty: { fontSize: typography.fontSize.sm },
  emptyState: { alignItems: "center", paddingVertical: spacing["3xl"], gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: typography.fontSize.base },
});

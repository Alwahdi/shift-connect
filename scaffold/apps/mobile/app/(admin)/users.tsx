/**
 * Admin user management screen.
 *
 * Searchable list of all users with role and verification status.
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

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  verification_status: string;
  role?: string;
}

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const [search, setSearch] = useState("");

  const { data: users, refetch, isRefetching } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, user_id, full_name, email, verification_status")
        .order("created_at", { ascending: false })
        .limit(100);

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as UserItem[];
    },
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "verified":
        return colors.success;
      case "rejected":
        return colors.destructive;
      default:
        return colors.warning;
    }
  };

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
          accessibilityLabel={t("common.search")}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[styles.userCard, { backgroundColor: themeColors.card }]}
          >
            <View style={styles.userInfo}>
              <Text
                style={[styles.userName, { color: themeColors.foreground }]}
                numberOfLines={1}
              >
                {item.full_name}
              </Text>
              <Text
                style={[styles.userEmail, { color: themeColors.mutedForeground }]}
                numberOfLines={1}
              >
                {item.email}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor(item.verification_status) + "15" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColor(item.verification_status) },
                ]}
              >
                {item.verification_status}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
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
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchInput: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing["2xl"],
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  empty: {
    padding: spacing["2xl"],
    alignItems: "center",
  },
  emptyText: {
    fontSize: typography.fontSize.base,
  },
});

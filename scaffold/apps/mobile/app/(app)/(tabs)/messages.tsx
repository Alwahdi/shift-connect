/**
 * Messages tab — conversations list.
 *
 * Shows all conversations with last message preview and unread count.
 * Uses Supabase Realtime for live updates.
 */
import { useEffect } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from "@/constants/theme";

interface Conversation {
  id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

function ConversationItem({ conversation }: { conversation: Conversation }) {
  const { themeColors } = useTheme();
  const timeAgo = conversation.last_message_at
    ? new Date(conversation.last_message_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "";

  return (
    <Pressable
      style={[styles.convItem, { backgroundColor: themeColors.card }]}
      onPress={() => router.push(`/(app)/chat/${conversation.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${conversation.participant_name}`}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>
          {conversation.participant_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.convContent}>
        <View style={styles.convHeader}>
          <Text style={[styles.convName, { color: themeColors.foreground }]} numberOfLines={1}>
            {conversation.participant_name}
          </Text>
          {timeAgo ? (
            <Text style={[styles.convTime, { color: themeColors.mutedForeground }]}>
              {timeAgo}
            </Text>
          ) : null}
        </View>
        <View style={styles.convFooter}>
          <Text style={[styles.convMessage, { color: themeColors.mutedForeground }]} numberOfLines={1}>
            {conversation.last_message ?? "No messages yet"}
          </Text>
          {conversation.unread_count > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{conversation.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();

  const { data: conversations, refetch, isRefetching } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Conversation[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, supabase, queryClient]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={[styles.emptyTitle, { color: themeColors.foreground }]}>
              {t("messages.noConversations")}
            </Text>
            <Text style={[styles.emptySub, { color: themeColors.mutedForeground }]}>
              {t("messages.startConversation")}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingVertical: spacing.sm, flexGrow: 1 },
  convItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    minHeight: 72,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
  convContent: { flex: 1, gap: spacing.xs },
  convHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  convName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, flex: 1 },
  convTime: { fontSize: typography.fontSize.xs },
  convFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  convMessage: { fontSize: typography.fontSize.sm, flex: 1, marginRight: spacing.sm },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#FFF", fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: spacing["3xl"], gap: spacing.md },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
  emptySub: { fontSize: typography.fontSize.sm, textAlign: "center", paddingHorizontal: spacing.xl },
});

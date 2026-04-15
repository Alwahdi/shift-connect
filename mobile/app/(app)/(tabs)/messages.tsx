import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";
import Avatar from "@/components/ui/Avatar";
import EmptyState from "@/components/ui/EmptyState";

interface ConvoItem {
  id: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export default function MessagesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userRole } = useAuth();
  const { profileId } = useProfile();
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!profileId) return;
    const field = userRole === "professional" ? "professional_id" : "clinic_id";
    const { data } = await supabase
      .from("conversations")
      .select("id, professional_id, clinic_id, last_message_at")
      .eq(field, profileId)
      .order("last_message_at", { ascending: false });

    if (!data) { setLoading(false); return; }

    const items: ConvoItem[] = [];
    for (const c of data) {
      const otherId = userRole === "professional" ? c.clinic_id : c.professional_id;
      const table = userRole === "professional" ? "clinics" : "profiles";
      const nameField = userRole === "professional" ? "name" : "full_name";
      const avatarField = userRole === "professional" ? "logo_url" : "avatar_url";

      const { data: other } = await supabase.from(table).select(`${nameField}, ${avatarField}`).eq("id", otherId).single();
      const { data: lastMsg } = await supabase.from("messages").select("content, created_at").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).single();

      items.push({
        id: c.id,
        otherName: (other as any)?.[nameField] || "Unknown",
        otherAvatar: (other as any)?.[avatarField] || null,
        lastMessage: lastMsg?.content || "",
        lastAt: c.last_message_at || c.id,
        unread: 0,
      });
    }
    setConversations(items);
    setLoading(false);
  }, [profileId, userRole]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  const onRefresh = useCallback(async () => { setRefreshing(true); await fetchConversations(); setRefreshing(false); }, [fetchConversations]);

  const renderItem = ({ item }: { item: ConvoItem }) => (
    <Pressable style={styles.row} onPress={() => router.push(`/(app)/chat/${item.id}`)}>
      <Avatar uri={item.otherAvatar} name={item.otherName} size="lg" />
      <View style={styles.rowContent}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.rowName} numberOfLines={1}>{item.otherName}</Text>
          {item.lastAt && <Text style={styles.time}>{formatDistanceToNow(parseISO(item.lastAt), { addSuffix: true })}</Text>}
        </View>
        <Text style={styles.preview} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t("chat.messages")}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={conversations.length === 0 ? { flex: 1 } : {}}
          ListEmptyComponent={<EmptyState icon="chat-outline" title={t("chat.noConversations")} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerBar: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.border, backgroundColor: colors.white },
  headerTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight },
  rowContent: { flex: 1 },
  rowName: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text, flex: 1 },
  preview: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: 2 },
  time: { fontSize: typography.sizes.xs, color: colors.textTertiary },
});

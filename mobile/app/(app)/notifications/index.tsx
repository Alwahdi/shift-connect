import React, { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, typography } from "@/constants/theme";
import EmptyState from "@/components/ui/EmptyState";
import type { AppNotification } from "@/types";

const ICONS: Record<string, { name: string; color: string }> = {
  booking: { name: "calendar-check", color: colors.teal },
  message: { name: "message-text", color: colors.sky },
  shift: { name: "briefcase", color: colors.primary },
  system: { name: "information", color: colors.textSecondary },
};

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
    setItems((data as AppNotification[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await fetch(); setRefreshing(false); }, [fetch]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
    setItems(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const icon = ICONS[item.type] || ICONS.system;
    return (
      <Pressable style={[styles.row, !item.is_read && styles.unread]} onPress={() => {
        supabase.from("notifications").update({ is_read: true }).eq("id", item.id);
        setItems(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
      }}>
        <View style={[styles.iconCircle, { backgroundColor: icon.color + "18" }]}>
          <MaterialCommunityIcons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, !item.is_read && styles.bold]} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.msg} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{formatDistanceToNow(parseISO(item.created_at), { addSuffix: true })}</Text>
        </View>
        {!item.is_read && <View style={styles.dot} />}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
        <Pressable onPress={markAllRead}><Text style={styles.markAll}>{t("notifications.markAllRead")}</Text></Pressable>
      </View>

      {loading ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} /> : (
        <FlatList data={items} keyExtractor={i => i.id} renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          contentContainerStyle={items.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
          ListEmptyComponent={<EmptyState icon="bell-outline" title={t("notifications.noNotifications")} />} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  markAll: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: typography.weights.medium },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight },
  unread: { backgroundColor: colors.primaryBg },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: spacing.md },
  title: { fontSize: typography.sizes.base, color: colors.text },
  bold: { fontWeight: typography.weights.semibold },
  msg: { fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 18 },
  time: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginLeft: spacing.sm },
});

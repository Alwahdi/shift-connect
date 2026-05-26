import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar, EmptyState } from '@/components/ui';
import { Spacing, Typography } from '@/config/theme';
import { formatTimeAgo } from '@/lib/utils';

interface ConversationItem {
  id: string;
  professional_id: string;
  clinic_id: string;
  last_message_at: string | null;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string | null;
  unreadCount: number;
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user || !userRole) return;

    // 1. resolve profile/clinic UUID (conversations FK references profiles.id / clinics.id, NOT auth.uid())
    const profileTable = userRole === 'professional' ? 'profiles' : 'clinics';
    const { data: profileRow, error: profileErr } = await supabase
      .from(profileTable)
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileErr || !profileRow) { setLoading(false); return; }
    const profileId = profileRow.id as string;

    // 2. fetch base conversations for this user
    let query = supabase
      .from('conversations')
      .select('id, professional_id, clinic_id, last_message_at')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50);

    if (userRole === 'professional') {
      query = query.eq('professional_id', profileId);
    } else {
      query = query.eq('clinic_id', profileId);
    }

    const { data: convData, error } = await query;
    if (error || !convData) { setLoading(false); return; }

    // 2. enrich each conversation in parallel
    const enriched = await Promise.all(
      convData.map(async (conv) => {
        // fetch other party details
        const isClinic = userRole === 'clinic';
        const otherQuery = isClinic
          ? supabase.from('profiles').select('full_name, avatar_url').eq('id', conv.professional_id).single()
          : supabase.from('clinics').select('name, logo_url').eq('id', conv.clinic_id).single();

        const [{ data: other }, { data: lastMsg }, { count: unread }] = await Promise.all([
          otherQuery,
          supabase
            .from('messages')
            .select('content, file_type')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_type', userRole ?? ''),
        ]);

        type OtherParty = { full_name?: string; avatar_url?: string; name?: string; logo_url?: string } | null;
        const otherData = other as OtherParty;
        const otherName = isClinic ? (otherData?.full_name ?? 'Professional') : (otherData?.name ?? 'Clinic');
        const otherAvatar = isClinic ? (otherData?.avatar_url ?? null) : (otherData?.logo_url ?? null);

        let preview: string | null = null;
        if (lastMsg?.file_type?.startsWith('image/')) preview = `📷 ${t('messages.photo')}`;
        else if (lastMsg?.file_type) preview = `📎 ${t('messages.file')}`;
        else preview = lastMsg?.content ?? null;

        return {
          id: conv.id,
          professional_id: conv.professional_id,
          clinic_id: conv.clinic_id,
          last_message_at: conv.last_message_at,
          otherName,
          otherAvatar,
          lastMessage: preview,
          unreadCount: unread ?? 0,
        } satisfies ConversationItem;
      })
    );

    setConversations(enriched);
    setLoading(false);
  }, [user, userRole, t]);

  useEffect(() => {
    fetchConversations();

    // realtime: refresh list when any message changes
    const channel = supabase
      .channel('conversation-list-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.conversationRow,
        { borderBottomColor: colors.borderLight, backgroundColor: pressed ? colors.surface : colors.background },
      ]}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <Avatar uri={item.otherAvatar} name={item.otherName} size={50} />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text
            style={[
              styles.conversationName,
              { color: colors.text, fontWeight: item.unreadCount > 0 ? '700' : '600' },
            ]}
            numberOfLines={1}
          >
            {item.otherName}
          </Text>
          {item.last_message_at && (
            <Text style={[styles.conversationTime, { color: colors.textTertiary }]}>
              {formatTimeAgo(item.last_message_at)}
            </Text>
          )}
        </View>
        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.lastMessage,
              { color: item.unreadCount > 0 ? colors.text : colors.textSecondary,
                fontWeight: item.unreadCount > 0 ? '600' : '400', flex: 1 },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage ?? t('messages.noMessages')}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{t('messages.title')}</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title={t('messages.noConversations')}
              description={t('messages.noConversationsDesc')}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  listContent: { paddingBottom: Spacing['3xl'] },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  conversationContent: { flex: 1, marginLeft: Spacing.md },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  conversationName: { fontSize: Typography.sizes.base, flex: 1 },
  conversationTime: { fontSize: Typography.sizes.xs, marginLeft: Spacing.sm },
  conversationFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  lastMessage: { fontSize: Typography.sizes.sm },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});

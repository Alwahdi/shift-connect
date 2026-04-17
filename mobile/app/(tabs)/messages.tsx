import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Avatar, EmptyState } from '@/components/ui';
import { Spacing, Typography } from '@/config/theme';
import { formatTimeAgo } from '@/lib/utils';

export default function MessagesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('conversations')
        .select('*, messages(content, created_at, sender_id), profiles!conversations_professional_id_fkey(full_name, avatar_url), clinics!conversations_clinic_id_fkey(name, logo_url)')
        .or(`professional_id.eq.${user.id},clinic_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })
        .limit(30);
      return data || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  });

  const renderConversation = ({ item }: { item: any }) => {
    const otherName = item.profiles?.full_name || item.clinics?.name || 'User';
    const otherAvatar = item.profiles?.avatar_url || item.clinics?.logo_url || null;
    const lastMessage = item.messages?.[item.messages.length - 1];

    return (
      <Pressable
        style={[styles.conversationRow, { borderBottomColor: colors.borderLight }]}
        onPress={() => {/* Navigate to chat detail */}}
      >
        <Avatar uri={otherAvatar} name={otherName} size={50} />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: colors.text }]} numberOfLines={1}>
              {otherName}
            </Text>
            {lastMessage && (
              <Text style={[styles.conversationTime, { color: colors.textTertiary }]}>
                {formatTimeAgo(lastMessage.created_at)}
              </Text>
            )}
          </View>
          <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
            {lastMessage?.content || t('messages.noConversationsDesc')}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Text style={[styles.screenTitle, { color: colors.text }]}>{t('messages.title')}</Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="chatbubbles-outline"
              title={t('messages.noConversations')}
              description={t('messages.noConversationsDesc')}
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, paddingHorizontal: Spacing.xl, paddingTop: Spacing.base, paddingBottom: Spacing.md },
  listContent: { paddingBottom: Spacing['3xl'] },
  conversationRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  conversationContent: { flex: 1, marginLeft: Spacing.md },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  conversationName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, flex: 1 },
  conversationTime: { fontSize: Typography.sizes.xs, marginLeft: Spacing.sm },
  lastMessage: { fontSize: Typography.sizes.sm },
});

import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConversationItem } from '@/src/components/messages/ConversationItem';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useConversations } from '@/src/hooks/useMessages';

export default function ProfessionalMessagesScreen() {
  const { profile } = useAuth();
  const query = useConversations({ role: 'professional', entityId: profile?.id });

  const onRefresh = useCallback(() => { query.refetch().catch(() => undefined); }, [query]);

  if (!profile || query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading conversations..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={query.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.description}>Stay in touch with clinics about your shift applications and bookings.</Text>
            {query.isError ? <ErrorState onRetry={onRefresh} /> : null}
          </View>
        }
        ListEmptyComponent={
          !query.isError ? (
            <EmptyState
              title="No conversations yet"
              description="Messages with clinics will appear here after they contact you or once you are booked."
            />
          ) : null
        }
        renderItem={({ item: conversation }) => (
          <ConversationItem
            name={conversation.clinic?.name ?? 'Clinic'}
            avatarUrl={conversation.clinic?.logo_url}
            preview={conversation.lastMessage?.content ?? 'No messages yet'}
            timestamp={conversation.last_message_at ?? conversation.lastMessage?.created_at}
            unreadCount={conversation.unreadCount}
            onPress={() => router.push(`/conversation/${conversation.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  heading: { gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xxl },
  description: { color: theme.colors.muted, marginTop: 6 },
  separator: { height: theme.spacing.md },
});

import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/hooks/useNotifications';
import type { NotificationItem } from '@/src/types';

function getNotificationRoute(item: NotificationItem): string | null {
  const data = item.data ?? {};
  const conversationId = typeof data.conversation_id === 'string' ? data.conversation_id : null;
  const shiftId = typeof data.shift_id === 'string' ? data.shift_id : null;

  switch (item.type) {
    case 'new_message':
    case 'message':
      return conversationId ? `/conversation/${conversationId}` : null;
    case 'booking_confirmed':
    case 'booking_requested':
    case 'booking_cancelled':
    case 'booking_declined':
    case 'booking':
      return null;
    case 'shift':
    case 'new_shift':
      return shiftId ? `/shift/${shiftId}` : null;
    default:
      return null;
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const notifications = useNotifications(user?.id);

  const onRefresh = useCallback(() => { notifications.refetch().catch(() => undefined); }, [notifications]);

  if (!user || notifications.isLoading) {
    return <LoadingSpinner fullScreen label="Loading notifications..." />;
  }

  const markAll = async () => {
    try {
      await notifications.markAllAsRead.mutateAsync();
    } catch (error) {
      Alert.alert('Unable to mark all as read', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const markOne = async (id: string) => {
    try {
      await notifications.markAsRead.mutateAsync(id);
    } catch (error) {
      Alert.alert('Unable to update notification', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <FlatList
        data={notifications.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={notifications.isFetching && !notifications.isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.description}>Stay updated on applications, bookings, and messages.</Text>
            </View>
            <Button
              title="Mark all read"
              variant="outline"
              size="sm"
              onPress={markAll}
              loading={notifications.markAllAsRead.isPending}
            />
            {notifications.isError ? <ErrorState onRetry={onRefresh} /> : null}
          </View>
        }
        ListEmptyComponent={
          !notifications.isError ? (
            <EmptyState title="No notifications" description="When something important happens, you will see it here." />
          ) : null
        }
        renderItem={({ item }) => {
          const route = getNotificationRoute(item);

          return (
            <Pressable
              onPress={async () => {
                if (!item.is_read) {
                  await markOne(item.id);
                }
                if (route) {
                  router.push(route);
                }
              }}
            >
              <Card style={[styles.card, !item.is_read ? styles.cardUnread : null]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {!item.is_read ? <Badge label="New" variant="primary" /> : null}
                </View>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardMeta}>{item.created_at.replace('T', ' ').slice(0, 16)}</Text>
                {!item.is_read ? (
                  <Button title="Mark as read" variant="ghost" onPress={() => markOne(item.id)} />
                ) : null}
              </Card>
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  headerText: { flex: 1 },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xxl },
  description: { color: theme.colors.muted, marginTop: 6 },
  separator: { height: theme.spacing.md },
  card: { gap: theme.spacing.sm },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md },
  cardTitle: { color: theme.colors.text, fontWeight: '700', flex: 1 },
  cardMessage: { color: theme.colors.text, lineHeight: 21 },
  cardMeta: { color: theme.colors.muted, fontSize: theme.typography.sizes.xs },
});

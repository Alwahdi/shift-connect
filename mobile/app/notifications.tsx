import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/hooks/useNotifications';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const notifications = useNotifications(user?.id);

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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.description}>Stay updated on applications, bookings, and messages.</Text>
          </View>
          <Button title="Mark all read" variant="outline" size="sm" onPress={markAll} loading={notifications.markAllAsRead.isPending} />
        </View>

        <View style={styles.list}>
          {notifications.data?.length ? notifications.data.map((item) => (
            <Card key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!item.is_read ? <Badge label="New" variant="primary" /> : null}
              </View>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <Text style={styles.cardMeta}>{item.created_at.replace('T', ' ').slice(0, 16)}</Text>
              {!item.is_read ? <Button title="Mark as read" variant="ghost" onPress={() => markOne(item.id)} /> : null}
            </Card>
          )) : <EmptyState title="No notifications" description="When something important happens, you will see it here." />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing.md },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xxl },
  description: { color: theme.colors.muted, marginTop: 6, maxWidth: 260 },
  list: { gap: theme.spacing.md },
  card: { gap: theme.spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.md },
  cardTitle: { color: theme.colors.text, fontWeight: '700', flex: 1 },
  cardMessage: { color: theme.colors.text, lineHeight: 21 },
  cardMeta: { color: theme.colors.muted, fontSize: theme.typography.sizes.xs },
});

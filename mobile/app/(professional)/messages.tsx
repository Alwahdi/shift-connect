import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { ConversationItem } from '@/src/components/messages/ConversationItem';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useConversations } from '@/src/hooks/useMessages';

export default function ProfessionalMessagesScreen() {
  const { profile } = useAuth();
  const query = useConversations({ role: 'professional', entityId: profile?.id });

  if (!profile || query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading conversations..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.description}>Stay in touch with clinics about your shift applications and bookings.</Text>
        </View>

        <View style={styles.list}>
          {query.data?.length ? (
            query.data.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                name={conversation.clinic?.name ?? 'Clinic'}
                avatarUrl={conversation.clinic?.logo_url}
                preview={conversation.lastMessage?.content ?? 'No messages yet'}
                timestamp={conversation.last_message_at ?? conversation.lastMessage?.created_at}
                unreadCount={conversation.unreadCount}
                onPress={() => router.push(`/conversation/${conversation.id}`)}
              />
            ))
          ) : (
            <EmptyState title="No conversations yet" description="Messages with clinics will appear here after they contact you or once you are booked." />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xxl },
  description: { color: theme.colors.muted, marginTop: 6 },
  list: { gap: theme.spacing.md },
});

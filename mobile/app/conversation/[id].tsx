import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useConversationMessages } from '@/src/hooks/useMessages';
import { supabase } from '@/src/lib/supabase';
import type { Message } from '@/src/types';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role, clinic, profile } = useAuth();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const query = useConversationMessages(id);

  const senderId = role === 'clinic' ? clinic?.id : profile?.id;
  const senderType = role === 'clinic' ? 'clinic' : 'professional';

  const messages = useMemo(() => query.data ?? [], [query.data]);

  const send = async () => {
    if (!text.trim() || !senderId) {
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: id,
        sender_id: senderId,
        sender_type: senderType,
        content: text.trim(),
        is_read: false,
      });
      if (error) {
        throw error;
      }
      await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', id);
      setText('');
      query.refetch();
    } catch (error) {
      Alert.alert('Unable to send message', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading conversation..." />;
  }

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === senderId;
    return (
      <View style={[styles.messageRow, isMine && styles.messageRowMine]}>
        <Card style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine && styles.myBubbleText]}>{item.content}</Text>
          <Text style={[styles.messageTime, isMine && styles.myBubbleText]}>{item.created_at.slice(11, 16)}</Text>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Text style={styles.title}>Conversation</Text>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
        </View>
        <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.list} />
        <View style={styles.composer}>
          <Input value={text} onChangeText={setText} placeholder="Type a message" />
          <Button title="Send" onPress={send} loading={sending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xl },
  list: { padding: theme.spacing.lg, gap: theme.spacing.sm },
  messageRow: { alignItems: 'flex-start' },
  messageRowMine: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '82%', gap: theme.spacing.xs },
  myBubble: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  otherBubble: { backgroundColor: theme.colors.card },
  messageText: { color: theme.colors.text, lineHeight: 20 },
  myBubbleText: { color: theme.colors.white },
  messageTime: { fontSize: theme.typography.sizes.xs, opacity: 0.8 },
  composer: { padding: theme.spacing.lg, gap: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.card },
});

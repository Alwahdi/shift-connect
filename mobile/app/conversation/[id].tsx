import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useConversationMessages } from '@/src/hooks/useMessages';
import { supabase } from '@/src/lib/supabase';
import type { Clinic, Conversation, Message, Profile } from '@/src/types';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role, clinic, profile } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherPartyName, setOtherPartyName] = useState('');
  const inputRef = useRef<TextInput>(null);
  const query = useConversationMessages(id);

  const senderId = role === 'clinic' ? clinic?.id : profile?.id;
  const senderType = role === 'clinic' ? 'clinic' : 'professional';

  // Inverted list shows newest messages at the bottom; data must be in descending order.
  const reversedMessages = useMemo(() => [...(query.data ?? [])].reverse(), [query.data]);

  // Resolve the other party's display name once.
  useEffect(() => {
    if (!id) return;
    supabase
      .from('conversations')
      .select('*, professional:profiles(*), clinic:clinics(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const conv = data as Conversation & { professional?: Profile | null; clinic?: Clinic | null };
        setOtherPartyName(
          role === 'clinic'
            ? (conv.professional?.full_name ?? 'Professional')
            : (conv.clinic?.name ?? 'Clinic'),
        );
      });
  }, [id, role]);

  // Mark all unread messages from the other party as read when this screen opens.
  useEffect(() => {
    if (!senderId || !id) return;
    supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', id)
      .neq('sender_id', senderId)
      .eq('is_read', false)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      });
  }, [id, senderId, queryClient]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !senderId) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: id,
        sender_id: senderId,
        sender_type: senderType,
        content: trimmed,
        is_read: false,
      });
      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', id);

      setText('');
      query.refetch().catch(() => undefined);
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
        <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isMine && styles.myBubbleText]}>{item.content}</Text>
          <Text style={[styles.messageTime, isMine ? styles.myBubbleText : styles.otherTime]}>
            {item.created_at.slice(11, 16)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </Pressable>
          <View style={styles.headerContent}>
            <Text style={styles.headerName} numberOfLines={1}>{otherPartyName || '…'}</Text>
            <Text style={styles.headerSub}>{reversedMessages.length} messages</Text>
          </View>
          <Ionicons name="chatbubble-ellipses" size={22} color={theme.colors.primary} />
        </View>

        {/* Inverted message list — newest at bottom */}
        <FlatList
          data={reversedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            ref={inputRef}
            style={styles.composerInput}
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={theme.colors.muted}
            multiline
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={send}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!text.trim() || sending}
          >
            <Ionicons name="send" size={20} color={theme.colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  backBtn: {
    padding: theme.spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerName: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: theme.typography.sizes.lg,
  },
  headerSub: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
    marginTop: 1,
  },
  list: {
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  messageRow: {
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  messageRowMine: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 2,
  },
  myBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: theme.colors.text,
    lineHeight: 20,
    fontSize: theme.typography.sizes.md,
  },
  myBubbleText: { color: theme.colors.white },
  messageTime: {
    fontSize: theme.typography.sizes.xs,
    alignSelf: 'flex-end',
  },
  otherTime: { color: theme.colors.muted, opacity: 0.8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  composerInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: theme.colors.muted,
    opacity: 0.6,
  },
});

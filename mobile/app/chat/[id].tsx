import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Avatar } from '@/components/ui';
import { BorderRadius, Spacing, Typography } from '@/config/theme';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
  file_url?: string | null;
  file_type?: string | null;
  file_name?: string | null;
}

interface ConversationDetails {
  id: string;
  professional_id: string;
  clinic_id: string;
  otherName: string;
  otherAvatar: string | null;
}

function getDateLabel(dateStr: string, today: string, yesterday: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);

  if (d.toDateString() === todayStr) return today;
  if (d.toDateString() === yesterdayDate.toDateString()) return yesterday;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  // useLocalSearchParams can return string | string[] — always coerce to string
  const conversationId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const { profileId } = useProfile();
  const insets = useSafeAreaInsets();

  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const listRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const scrollToBottom = useCallback((animated = true) => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated });
    }, 100);
  }, []);

  // Fetch conversation details + messages — split so messages load even if metadata fails
  useEffect(() => {
    if (!conversationId) return;

    // --- 1. Fetch messages (only needs conversationId, no userRole required) ---
    const loadMessages = async () => {
      console.log('[Chat] fetching messages for', conversationId);
      const { data: msgs, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      console.log('[Chat] messages result:', msgs?.length ?? 0, 'error:', error?.message);

      if (error) {
        Toast.show({ type: 'error', text1: 'Could not load messages', text2: error.message });
      }
      setMessages(msgs ?? []);
      setLoading(false);
      if (msgs && msgs.length > 0) scrollToBottom(false);
    };

    // --- 2. Fetch conversation header metadata (other party name/avatar) ---
    const loadConversation = async () => {
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('id, professional_id, clinic_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conv) {
        console.error('[Chat] conversation fetch error:', convError?.message);
        return;
      }

      // Determine other party — fall back gracefully if userRole is not yet loaded
      const isClinic = userRole === 'clinic';
      const { data: other } = isClinic
        ? await supabase.from('profiles').select('full_name, avatar_url').eq('id', conv.professional_id).single()
        : await supabase.from('clinics').select('name, logo_url').eq('id', conv.clinic_id).single();

      const otherData = other as { full_name?: string; avatar_url?: string; name?: string; logo_url?: string } | null;
      setConversation({
        id: conv.id,
        professional_id: conv.professional_id,
        clinic_id: conv.clinic_id,
        otherName: isClinic ? (otherData?.full_name ?? 'Professional') : (otherData?.name ?? 'Clinic'),
        otherAvatar: isClinic ? (otherData?.avatar_url ?? null) : (otherData?.logo_url ?? null),
      });
    };

    // --- 3. Mark incoming as read (only once userRole is available) ---
    const markAsRead = async () => {
      if (!userRole) return;
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_type', userRole)
        .eq('is_read', false);
    };

    loadMessages();
    loadConversation();
    markAsRead();

    // --- 4. Realtime: new / updated / deleted messages ---
    const msgChannel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          setOtherTyping(false);
          if (newMsg.sender_type !== userRole) {
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
          }
          scrollToBottom();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          const deleted = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== deleted.id));
        }
      )
      .subscribe();

    // --- 5. Realtime: typing broadcast ---
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload?.sender_type !== userRole) {
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId, userRole, scrollToBottom]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      supabase
        .channel(`typing-${conversationId}`)
        .send({ type: 'broadcast', event: 'typing', payload: { sender_type: userRole } });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { isTypingRef.current = false; }, 2000);
  }, [conversationId, userRole]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || !user || !userRole) return;
    setSending(true);
    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setText('');

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: profileId ?? user.id,
        sender_type: userRole,
        content: trimmed,
      });
      if (error) throw error;

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (err: unknown) {
      setText(trimmed); // restore
      const msg = err instanceof Error ? err.message : String(err);
      Toast.show({ type: 'error', text1: t('messages.sendError'), text2: msg });
    } finally {
      setSending(false);
    }
  }, [text, sending, user, userRole, conversationId, t]);

  const handleDeleteMessage = useCallback((msgId: string, msgSenderType: string) => {
    // Only allow deleting your own messages (compare sender_type since sender_id may be a profile ID, not auth UUID)
    if (msgSenderType !== userRole) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t('messages.deleteMessage'), t('messages.deleteMessageConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete') ?? 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('messages').delete().eq('id', msgId);
          if (error) {
            Toast.show({ type: 'error', text1: t('common.error'), text2: error.message });
          }
        },
      },
    ]);
  }, [userRole, t]);

  // Use a ref to access latest messages inside renderItem without stale closure
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.sender_type === userRole;
    // Use ref to avoid stale closure on messages array
    const prevMsg = index > 0 ? messagesRef.current[index - 1] : null;
    const todayLabel = t('messages.today');
    const yestLabel = t('messages.yesterday');
    const showDateSep =
      !prevMsg ||
      getDateLabel(item.created_at, todayLabel, yestLabel) !==
        getDateLabel(prevMsg.created_at, todayLabel, yestLabel);

    return (
      <View>
        {showDateSep && (
          <View style={styles.dateSeparator}>
            <Text style={[styles.dateSeparatorText, { color: colors.textTertiary, backgroundColor: colors.surface }]}>
              {getDateLabel(item.created_at, todayLabel, yestLabel)}
            </Text>
          </View>
        )}
        <Pressable
          onLongPress={() => handleDeleteMessage(item.id, item.sender_type)}
          style={[styles.messageRow, isOwn ? styles.messageRowOwn : styles.messageRowOther]}
        >
          <View
            style={[
              styles.bubble,
              isOwn
                ? [styles.bubbleOwn, { backgroundColor: colors.primary }]
                : [styles.bubbleOther, { backgroundColor: colors.surface, borderColor: colors.borderLight }],
            ]}
          >
            {item.file_type?.startsWith('image/') ? (
              <Text style={[styles.bubbleText, { color: isOwn ? '#fff' : colors.text }]}>
                📷 {item.content}
              </Text>
            ) : item.file_type ? (
              <Text style={[styles.bubbleText, { color: isOwn ? '#fff' : colors.text }]}>
                📎 {item.file_name ?? item.content}
              </Text>
            ) : (
              <Text style={[styles.bubbleText, { color: isOwn ? '#fff' : colors.text }]}>
                {item.content}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={[styles.timeText, { color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
                {formatTime(item.created_at)}
              </Text>
              {isOwn && (
                <Ionicons
                  name={item.is_read ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color="rgba(255,255,255,0.7)"
                  style={{ marginLeft: 3 }}
                />
              )}
            </View>
          </View>
        </Pressable>
      </View>
    );
  }, [userRole, colors, t, handleDeleteMessage]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <ActivityIndicator style={{ marginTop: 60 }} color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, borderBottomColor: colors.borderLight, backgroundColor: colors.background },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Avatar uri={conversation?.otherAvatar ?? null} name={conversation?.otherName ?? ''} size={38} />
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]} numberOfLines={1}>
            {conversation?.otherName}
          </Text>
          {otherTyping ? (
            <Text style={[styles.headerSub, { color: colors.primary }]}>{t('messages.typing')}</Text>
          ) : (
            <Text style={[styles.headerSub, { color: colors.textTertiary }]}>
              {userRole === 'professional' ? t('messages.clinic') : t('messages.professional')}
            </Text>
          )}
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={userRole}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 && styles.messageListEmpty,
        ]}
        onContentSizeChange={() => scrollToBottom(false)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={56} color={colors.textTertiary} />
            <Text style={[styles.emptyChatText, { color: colors.textTertiary }]}>
              {t('messages.startConversation')}
            </Text>
          </View>
        }
      />

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          {
            borderTopColor: colors.borderLight,
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder={t('messages.typeMessage')}
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={2000}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() || sending}
          style={[
            styles.sendBtn,
            {
              backgroundColor: text.trim() ? colors.primary : colors.border,
              opacity: sending ? 0.6 : 1,
            },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  headerInfo: { flex: 1, marginLeft: Spacing.xs },
  headerName: { fontSize: Typography.sizes.base, fontWeight: '700' },
  headerSub: { fontSize: Typography.sizes.xs, marginTop: 1 },
  messageList: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: 4 },
  messageListEmpty: { flex: 1 },
  messageRow: { flexDirection: 'row', marginVertical: 2 },
  messageRowOwn: { justifyContent: 'flex-end' },
  messageRowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  bubbleOwn: { borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth },
  bubbleText: { fontSize: Typography.sizes.base, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 3 },
  timeText: { fontSize: 11 },
  dateSeparator: { alignItems: 'center', marginVertical: Spacing.md },
  dateSeparatorText: {
    fontSize: Typography.sizes.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: BorderRadius.full ?? 99,
    overflow: 'hidden',
  },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingTop: 80 },
  emptyChatText: { fontSize: Typography.sizes.base, textAlign: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl ?? 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 8,
    fontSize: Typography.sizes.base,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
});

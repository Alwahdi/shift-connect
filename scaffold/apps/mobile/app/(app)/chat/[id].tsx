/**
 * Chat screen.
 *
 * Individual conversation with real-time messaging via Supabase Realtime.
 */
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // Fetch initial messages
  useEffect(() => {
    if (!id) return;
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });
  }, [id, supabase]);

  // Realtime subscription
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as Message, ...prev]);
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, supabase]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: id,
        sender_id: user?.id,
        text: input.trim(),
      });
      if (error) throw error;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setInput("");
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.sender_id === user?.id;
    return (
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleTheirs,
          {
            backgroundColor: isMine ? colors.primary : themeColors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isMine ? colors.primaryForeground : themeColors.foreground },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.bubbleTime,
            { color: isMine ? colors.primaryForeground + "80" : themeColors.mutedForeground },
          ]}
        >
          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.listContent}
      />

      {/* Input bar */}
      <View style={[styles.inputBar, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
        <TextInput
          style={[styles.textInput, { color: themeColors.foreground, backgroundColor: themeColors.background }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={themeColors.mutedForeground}
          multiline
          maxLength={2000}
          accessibilityLabel="Message input"
        />
        <Pressable
          style={[styles.sendButton, { backgroundColor: colors.primary }, (!input.trim() || sending) && styles.sendDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubble: { maxWidth: "80%", padding: spacing.sm, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
  bubbleMine: { alignSelf: "flex-end", borderBottomRightRadius: borderRadius.sm },
  bubbleTheirs: { alignSelf: "flex-start", borderBottomLeftRadius: borderRadius.sm },
  bubbleText: { fontSize: typography.fontSize.base, lineHeight: 22 },
  bubbleTime: { fontSize: typography.fontSize.xs, marginTop: spacing.xs, alignSelf: "flex-end" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: TOUCH_TARGET_SIZE,
    maxHeight: 120,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
  },
  sendButton: {
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    borderRadius: TOUCH_TARGET_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: "#FFF", fontSize: 18 },
});

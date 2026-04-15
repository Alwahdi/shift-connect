import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";
import Avatar from "@/components/ui/Avatar";
import type { Message } from "@/types";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherName, setOtherName] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", id).order("created_at", { ascending: false }).limit(50);
      setMessages((data as Message[]) || []);
      setLoading(false);
    };
    if (id) fetchMessages();

    // Realtime subscription
    const channel = supabase.channel(`chat-${id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
      (payload) => { setMessages(prev => [payload.new as Message, ...prev]); }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    const msg = newMessage.trim();
    setNewMessage("");
    await supabase.from("messages").insert({ conversation_id: id, sender_id: user.id, sender_type: "user", content: msg });
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", id);
  };

  const formatDate = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return "Today";
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d");
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMine = item.sender_id === user?.id;
    const showDate = index === messages.length - 1 || formatDate(item.created_at) !== formatDate(messages[index + 1]?.created_at);

    return (
      <>
        <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.msgText, isMine && { color: colors.white }]}>{item.content}</Text>
          <Text style={[styles.msgTime, isMine && { color: "rgba(255,255,255,0.7)" }]}>{format(parseISO(item.created_at), "h:mm a")}</Text>
        </View>
        {showDate && <Text style={styles.dateLabel}>{formatDate(item.created_at)}</Text>}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}><MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} /></Pressable>
        <Text style={styles.headerName} numberOfLines={1}>{otherName || "Chat"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={i => i.id}
            renderItem={renderMessage}
            inverted
            contentContainerStyle={{ padding: spacing.base }}
          />
        )}

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            multiline
            maxLength={2000}
          />
          <Pressable onPress={sendMessage} disabled={!newMessage.trim()}
            style={[styles.sendBtn, !newMessage.trim() && { opacity: 0.4 }]}>
            <MaterialCommunityIcons name="send" size={20} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerName: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  bubble: { maxWidth: "78%", padding: spacing.md, borderRadius: borderRadius.xl, marginBottom: spacing.sm },
  myBubble: { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: "flex-start", backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  msgText: { fontSize: typography.sizes.base, color: colors.text, lineHeight: 20 },
  msgTime: { fontSize: typography.sizes.xs, color: colors.textTertiary, marginTop: 4, alignSelf: "flex-end" },
  dateLabel: { textAlign: "center", fontSize: typography.sizes.xs, color: colors.textTertiary, marginVertical: spacing.md },
  inputBar: { flexDirection: "row", alignItems: "flex-end", padding: spacing.sm, backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.border, gap: spacing.sm },
  textInput: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.xl, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.text },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
});

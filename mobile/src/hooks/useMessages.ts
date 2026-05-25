import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/src/lib/supabase';
import type { Clinic, Conversation, Message, Profile } from '@/src/types';

export function useConversations({ role, entityId }: { role: 'clinic' | 'professional'; entityId?: string }) {
  const queryClient = useQueryClient();

  // Real-time: keep the conversations list fresh whenever a message arrives.
  useEffect(() => {
    if (!entityId) return;

    const column = role === 'clinic' ? 'clinic_id' : 'professional_id';
    const channel = supabase
      .channel(`conversations-list-${role}-${entityId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', role, entityId] });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations', filter: `${column}=eq.${entityId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations', role, entityId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entityId, role, queryClient]);

  return useQuery<Array<Conversation & { unreadCount: number }>>({
    queryKey: ['conversations', role, entityId],
    enabled: Boolean(entityId),
    queryFn: async () => {
      const column = role === 'clinic' ? 'clinic_id' : 'professional_id';
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq(column, entityId!)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        throw error;
      }

      const conversations = (data ?? []) as Array<Conversation & { unreadCount?: number }>;
      const professionalIds = [...new Set(conversations.map((conversation) => conversation.professional_id))];
      const clinicIds = [...new Set(conversations.map((conversation) => conversation.clinic_id))];
      const conversationIds = conversations.map((conversation) => conversation.id);

      const [{ data: professionals }, { data: clinics }, { data: messages }] = await Promise.all([
        supabase.from('profiles').select('*').in('id', professionalIds),
        supabase.from('clinics').select('*').in('id', clinicIds),
        supabase.from('messages').select('*').in('conversation_id', conversationIds).order('created_at', { ascending: false }),
      ]);

      const professionalMap = new Map((professionals ?? []).map((item) => [item.id, item as unknown as Profile]));
      const clinicMap = new Map((clinics ?? []).map((item) => [item.id, item as unknown as Clinic]));
      const latestMessageMap = new Map<string, Message>();
      const unreadCounts = new Map<string, number>();

      (messages ?? []).forEach((message: Message) => {
        if (!latestMessageMap.has(message.conversation_id)) {
          latestMessageMap.set(message.conversation_id, message as Message);
        }
        if (!message.is_read) {
          unreadCounts.set(message.conversation_id, (unreadCounts.get(message.conversation_id) ?? 0) + 1);
        }
      });

      return conversations.map((conversation) => ({
        ...conversation,
        professional: professionalMap.get(conversation.professional_id) ?? null,
        clinic: clinicMap.get(conversation.clinic_id) ?? null,
        lastMessage: latestMessageMap.get(conversation.id) ?? null,
        unreadCount: unreadCounts.get(conversation.id) ?? 0,
      }));
    },
  });
}

export function useConversationMessages(conversationId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    enabled: Boolean(conversationId),
    queryFn: async () => {
      const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversationId!).order('created_at', { ascending: true });
      if (error) {
        throw error;
      }
      return (data ?? []) as Message[];
    },
  });
}

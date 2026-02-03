import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Building2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Conversation {
  id: string;
  professional_id: string;
  clinic_id: string;
  last_message_at: string;
  professional?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  clinic?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  unread_count?: number;
  last_message?: string;
}

interface ChatListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  userType: "professional" | "clinic";
  profileId: string;
}

export const ChatList = ({
  selectedConversation,
  onSelectConversation,
  userType,
  profileId,
}: ChatListProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profileId) return;
    
    const fetchConversations = async () => {
      try {
        // Build query with filter for current user
        let query = supabase
          .from("conversations")
          .select(`
            id,
            professional_id,
            clinic_id,
            last_message_at
          `)
          .order("last_message_at", { ascending: false });

        // Filter by user type to only get conversations the user is part of
        if (userType === "professional") {
          query = query.eq("professional_id", profileId);
        } else {
          query = query.eq("clinic_id", profileId);
        }

        const { data: convData, error } = await query;
        
        if (error) throw error;

        // Fetch related data and unread counts
        const enrichedConversations = await Promise.all(
          (convData || []).map(async (conv) => {
            // Get professional data
            const { data: professional } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", conv.professional_id)
              .single();

            // Get clinic data
            const { data: clinic } = await supabase
              .from("clinics")
              .select("id, name, logo_url")
              .eq("id", conv.clinic_id)
              .single();

            // Get unread count
            const { count: unreadCount } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("conversation_id", conv.id)
              .eq("is_read", false)
              .neq("sender_type", userType);

            // Get last message
            const { data: lastMessageData } = await supabase
              .from("messages")
              .select("content")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            return {
              ...conv,
              professional,
              clinic,
              unread_count: unreadCount || 0,
              last_message: lastMessageData?.content,
            };
          })
        );

        setConversations(enrichedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel("conversations-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userType, profileId]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t("chat.noConversations")}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conv) => {
          const name = userType === "professional" ? conv.clinic?.name : conv.professional?.full_name;
          const avatarUrl = userType === "professional" ? conv.clinic?.logo_url : conv.professional?.avatar_url;
          const Icon = userType === "professional" ? Building2 : User;

          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-start ${
                selectedConversation === conv.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary/50"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatarUrl || undefined} alt={name || ""} />
                <AvatarFallback>
                  <Icon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{name}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conv.last_message_at), {
                      addSuffix: true,
                      locale: isRTL ? ar : enUS,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message || t("chat.noMessages")}
                  </p>
                  {conv.unread_count > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center text-xs">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

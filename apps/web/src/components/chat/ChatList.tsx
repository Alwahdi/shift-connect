import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Building2, User, ImageIcon, Paperclip } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Conversation {
  id: string;
  professional_id: string;
  clinic_id: string;
  last_message_at: string;
  professional?: { id: string; full_name: string; avatar_url: string | null; };
  clinic?: { id: string; name: string; logo_url: string | null; };
  unread_count?: number;
  last_message?: string;
  last_file_type?: string | null;
}

interface ChatListProps {
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  userType: "professional" | "clinic";
  profileId: string;
}

export const ChatList = ({ selectedConversation, onSelectConversation, userType, profileId }: ChatListProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profileId) return;

    const fetchConversations = async () => {
      let query = supabase.from("conversations").select("id, professional_id, clinic_id, last_message_at").order("last_message_at", { ascending: false });
      if (userType === "professional") query = query.eq("professional_id", profileId);
      else query = query.eq("clinic_id", profileId);

      const { data: convData, error } = await query;
      if (error) { console.error(error); setLoading(false); return; }

      const enriched = await Promise.all(
        (convData || []).map(async (conv) => {
          const { data: professional } = await supabase.from("profiles").select("id, full_name, avatar_url").eq("id", conv.professional_id).single();
          const { data: clinic } = await supabase.from("clinics").select("id, name, logo_url").eq("id", conv.clinic_id).single();
          const { count: unreadCount } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("conversation_id", conv.id).eq("is_read", false).neq("sender_type", userType);
          const { data: lastMsg } = await supabase.from("messages").select("content, file_type").eq("conversation_id", conv.id).order("created_at", { ascending: false }).limit(1).single();

          return { ...conv, professional, clinic, unread_count: unreadCount || 0, last_message: lastMsg?.content, last_file_type: lastMsg?.file_type };
        })
      );
      setConversations(enriched);
      setLoading(false);
    };

    fetchConversations();
    const channel = supabase.channel("conversations-updates").on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchConversations()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, userType, profileId]);

  const getLastMessagePreview = (conv: Conversation) => {
    if (conv.last_file_type?.startsWith("image/")) return <span className="flex items-center gap-1"><ImageIcon className="h-3.5 w-3.5" />{t("chat.photo") || "Photo"}</span>;
    if (conv.last_file_type?.startsWith("video/")) return <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{t("chat.video") || "Video"}</span>;
    if (conv.last_file_type?.startsWith("audio/")) return <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{t("chat.audio") || "Audio"}</span>;
    if (conv.last_file_type) return <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{t("chat.file") || "File"}</span>;
    return conv.last_message || t("chat.noMessages");
  };

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">{t("chat.noConversations")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("chat.startByBooking") || "Start by booking a shift"}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-0.5 p-2">
        {conversations.map((conv) => {
          const name = userType === "professional" ? conv.clinic?.name : conv.professional?.full_name;
          const avatarUrl = userType === "professional" ? conv.clinic?.logo_url : conv.professional?.avatar_url;
          const Icon = userType === "professional" ? Building2 : User;

          return (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-start min-h-[64px] ${
                selectedConversation === conv.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
              }`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatarUrl || undefined} alt={name || ""} />
                  <AvatarFallback><Icon className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium truncate ${(conv.unread_count ?? 0) > 0 ? "font-semibold" : ""}`}>{name}</span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {conv.last_message_at && formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: isRTL ? ar : enUS })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className={`text-sm truncate ${(conv.unread_count ?? 0) > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {getLastMessagePreview(conv)}
                  </div>
                  {(conv.unread_count ?? 0) > 0 && (
                    <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center text-xs rounded-full px-1.5">
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

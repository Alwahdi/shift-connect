import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Loader2, ArrowLeft, Building2, User, Check, CheckCheck, Image, FileText, Link2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ChatMediaUpload } from "./ChatMediaUpload";
import { ChatFilters } from "./ChatFilters";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  file_size?: number | null;
}

interface ConversationDetails {
  id: string;
  professional: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  clinic: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

interface ChatMessagesProps {
  conversationId: string;
  userType: "professional" | "clinic";
  profileId: string;
  onBack?: () => void;
}

export const ChatMessages = ({
  conversationId,
  userType,
  profileId,
  onBack,
}: ChatMessagesProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [filter, setFilter] = useState<"all" | "media" | "links" | "files">("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingMedia, setPendingMedia] = useState<{
    url: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 100);
  }, []);

  useEffect(() => {
    const fetchConversation = async () => {
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("id, professional_id, clinic_id")
        .eq("id", conversationId)
        .single();

      if (convError) {
        console.error("Error fetching conversation:", convError);
        return;
      }

      // Get professional and clinic details
      const { data: professional } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", convData.professional_id)
        .single();

      const { data: clinic } = await supabase
        .from("clinics")
        .select("id, name, logo_url")
        .eq("id", convData.clinic_id)
        .single();

      setConversation({
        id: convData.id,
        professional: professional!,
        clinic: clinic!,
      });
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
      setLoading(false);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_type", userType)
        .eq("is_read", false);

      // Scroll to bottom on initial load
      scrollToBottom("auto");
    };

    fetchConversation();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          setOtherTyping(false);
          
          // Mark as read if from other party
          if (newMsg.sender_type !== userType) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
          
          // Auto-scroll when new message arrives
          scrollToBottom();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
          );
        }
      )
      .subscribe();

    // Subscribe to typing indicator via broadcast
    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.sender_type !== userType) {
          setOtherTyping(true);
          // Clear after 3 seconds
          setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, userType, scrollToBottom]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${conversationId}`).send({
        type: "broadcast",
        event: "typing",
        payload: { sender_type: userType },
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [conversationId, isTyping, userType]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !pendingMedia) || sending) return;

    setSending(true);
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      const messageData: any = {
        conversation_id: conversationId,
        sender_id: profileId,
        sender_type: userType,
        content: newMessage.trim() || (pendingMedia ? `📎 ${pendingMedia.name}` : ""),
      };

      if (pendingMedia) {
        messageData.file_url = pendingMedia.url;
        messageData.file_type = pendingMedia.type;
        messageData.file_name = pendingMedia.name;
        messageData.file_size = pendingMedia.size;
      }

      const { error } = await supabase.from("messages").insert(messageData);

      if (error) throw error;

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);

      setNewMessage("");
      setPendingMedia(null);
      scrollToBottom();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("chat.sendError"),
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  const handleMediaUpload = (fileUrl: string, fileName: string, fileType: string, fileSize: number) => {
    setPendingMedia({ url: fileUrl, name: fileName, type: fileType, size: fileSize });
  };

  // Filter messages based on selected filter
  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    if (filter === "media") return msg.file_type?.startsWith("image/");
    if (filter === "files") return msg.file_url && !msg.file_type?.startsWith("image/");
    if (filter === "links") {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return urlRegex.test(msg.content);
    }
    return true;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherParty = userType === "professional" ? conversation?.clinic : conversation?.professional;
  const otherName = userType === "professional" ? conversation?.clinic?.name : conversation?.professional?.full_name;
  const otherAvatar = userType === "professional" ? conversation?.clinic?.logo_url : conversation?.professional?.avatar_url;
  const OtherIcon = userType === "professional" ? Building2 : User;

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className="h-16 w-48 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3 bg-background">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherAvatar || undefined} alt={otherName || ""} />
          <AvatarFallback>
            <OtherIcon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{otherName}</p>
          {otherTyping ? (
            <p className="text-xs text-primary animate-pulse">
              {t("chat.typing")}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {userType === "professional" ? t("chat.clinic") : t("chat.professional")}
            </p>
          )}
        </div>
        <ChatFilters activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {filter === "all" ? t("chat.startConversation") : t("chat.noFilteredMessages")}
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isOwn = msg.sender_type === userType;
              const hasImage = msg.file_type?.startsWith("image/");
              const hasFile = msg.file_url && !hasImage;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                  >
                    {/* Image attachment */}
                    {hasImage && msg.file_url && (
                      <button 
                        onClick={() => setPreviewImage(msg.file_url!)}
                        className="block mb-2 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                      >
                        <img 
                          src={msg.file_url} 
                          alt={msg.file_name || "Image"} 
                          className="max-w-full max-h-48 object-cover rounded-lg"
                        />
                      </button>
                    )}
                    
                    {/* File attachment */}
                    {hasFile && (
                      <a 
                        href={msg.file_url!} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
                          isOwn ? "bg-primary-foreground/10" : "bg-muted"
                        }`}
                      >
                        <FileText className="h-5 w-5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{msg.file_name}</p>
                          {msg.file_size && (
                            <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    )}
                    
                    {msg.content && !msg.content.startsWith("📎") && (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <p
                        className={`text-xs ${
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {format(new Date(msg.created_at), "HH:mm", {
                          locale: isRTL ? ar : enUS,
                        })}
                      </p>
                      {isOwn && (
                        msg.is_read ? (
                          <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                        ) : (
                          <Check className="h-3 w-3 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {otherTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-background">
        {/* Pending media preview */}
        {pendingMedia && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg">
            {pendingMedia.type.startsWith("image/") ? (
              <img src={pendingMedia.url} alt={pendingMedia.name} className="h-12 w-12 object-cover rounded" />
            ) : (
              <FileText className="h-12 w-12 p-2 bg-background rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pendingMedia.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(pendingMedia.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPendingMedia(null)}>
              ✕
            </Button>
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          <ChatMediaUpload 
            conversationId={conversationId} 
            onUploadComplete={handleMediaUpload}
            disabled={sending}
          />
          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.typePlaceholder")}
            className="min-h-[48px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !pendingMedia) || sending}
            size="icon"
            className="h-12 w-12 shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Send, Loader2, ArrowLeft, ArrowRight, Building2, User, Check, CheckCheck,
  FileText, ExternalLink, Download, ChevronLeft, ChevronRight, Grid3X3,
  FileSpreadsheet, File as FileIcon, Play, Volume2
} from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ChatMediaUpload } from "./ChatMediaUpload";
import { ChatMediaGallery } from "./ChatMediaGallery";

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
  professional: { id: string; full_name: string; avatar_url: string | null; };
  clinic: { id: string; name: string; logo_url: string | null; };
}

interface ChatMessagesProps {
  conversationId: string;
  userType: "professional" | "clinic";
  profileId: string;
  onBack?: () => void;
}

// Parse URLs in text and return React elements
const renderMessageContent = (content: string, isOwn: boolean) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${isOwn ? "text-primary-foreground/90 hover:text-primary-foreground" : "text-primary hover:text-primary/80"}`}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// Get file icon based on type
const getFileIcon = (fileName?: string | null, fileType?: string | null) => {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (ext === "doc" || ext === "docx") return <FileText className="h-5 w-5 text-blue-500" />;
  if (ext === "xls" || ext === "xlsx") return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  return <FileIcon className="h-5 w-5" />;
};

export const ChatMessages = ({ conversationId, userType, profileId, onBack }: ChatMessagesProps) => {
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{ url: string; name: string; type: string; size: number; } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Collect all images for navigation
  const allImages = useMemo(() =>
    messages.filter(m => m.file_type?.startsWith("image/") && m.file_url).map(m => m.file_url!),
    [messages]
  );
  const currentImageIndex = previewImage ? allImages.indexOf(previewImage) : -1;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior }), 100);
  }, []);

  useEffect(() => {
    const fetchConversation = async () => {
      const { data: convData, error } = await supabase.from("conversations").select("id, professional_id, clinic_id").eq("id", conversationId).single();
      if (error) return;
      const { data: professional } = await supabase.from("profiles").select("id, full_name, avatar_url").eq("id", convData.professional_id).single();
      const { data: clinic } = await supabase.from("clinics").select("id, name, logo_url").eq("id", convData.clinic_id).single();
      setConversation({ id: convData.id, professional: professional!, clinic: clinic! });
    };

    const fetchMessages = async () => {
      const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      if (error) return;
      setMessages(data || []);
      setLoading(false);
      await supabase.from("messages").update({ is_read: true }).eq("conversation_id", conversationId).neq("sender_type", userType).eq("is_read", false);
      scrollToBottom("auto");
    };

    fetchConversation();
    fetchMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => [...prev, newMsg]);
        setOtherTyping(false);
        if (newMsg.sender_type !== userType) supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id);
        scrollToBottom();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .subscribe();

    const typingChannel = supabase
      .channel(`typing-${conversationId}`)
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.sender_type !== userType) {
          setOtherTyping(true);
          setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(typingChannel); };
  }, [conversationId, userType, scrollToBottom]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      supabase.channel(`typing-${conversationId}`).send({ type: "broadcast", event: "typing", payload: { sender_type: userType } });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
  }, [conversationId, isTyping, userType]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !pendingMedia) || sending) return;
    setSending(true);
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

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
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
      setNewMessage("");
      setPendingMedia(null);
      scrollToBottom();
    } catch (error: any) {
      toast({ variant: "destructive", title: t("chat.sendError"), description: error.message });
    } finally {
      setSending(false);
    }
  };

  const handleMediaUpload = (fileUrl: string, fileName: string, fileType: string, fileSize: number) => {
    setPendingMedia({ url: fileUrl, name: fileName, type: fileType, size: fileSize });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t("chat.today") || "Today";
    if (isYesterday(date)) return t("chat.yesterday") || "Yesterday";
    return format(date, "MMM d, yyyy", { locale: isRTL ? ar : enUS });
  };

  const otherName = userType === "professional" ? conversation?.clinic?.name : conversation?.professional?.full_name;
  const otherAvatar = userType === "professional" ? conversation?.clinic?.logo_url : conversation?.professional?.avatar_url;
  const OtherIcon = userType === "professional" ? Building2 : User;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full">
        <div className="border-b p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
              <Skeleton className="h-16 w-48 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="border-b p-3 md:p-4 flex items-center gap-3 bg-background shadow-sm shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0">
            <BackArrow className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherAvatar || undefined} alt={otherName || ""} />
          <AvatarFallback><OtherIcon className="h-5 w-5" /></AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{otherName}</p>
          {otherTyping ? (
            <p className="text-xs text-primary animate-pulse">{t("chat.typing")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{userType === "professional" ? t("chat.clinic") : t("chat.professional")}</p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setGalleryOpen(true)} className="h-10 w-10 shrink-0" title={t("chat.mediaAndFiles")}>
          <Grid3X3 className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 md:p-4">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">{t("chat.startConversation")}</div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender_type === userType;
              const hasImage = msg.file_type?.startsWith("image/");
              const hasVideo = msg.file_type?.startsWith("video/");
              const hasAudio = msg.file_type?.startsWith("audio/");
              const hasFile = msg.file_url && !hasImage && !hasVideo && !hasAudio;
              const msgDate = new Date(msg.created_at);
              const prevDate = idx > 0 ? new Date(messages[idx - 1].created_at) : null;
              const showDateSeparator = !prevDate || !isSameDay(msgDate, prevDate);

              return (
                <div key={msg.id}>
                  {/* Date separator */}
                  {showDateSeparator && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground bg-background px-2 font-medium">{getDateLabel(msgDate)}</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 ${isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"}`}>
                      
                      {/* Image */}
                      {hasImage && msg.file_url && (
                        <button onClick={() => setPreviewImage(msg.file_url!)} className="block mb-2 rounded-xl overflow-hidden hover:opacity-90 transition-opacity shadow-sm">
                          <img src={msg.file_url} alt={msg.file_name || "Image"} className="max-w-full max-h-64 object-cover rounded-xl" loading="lazy" />
                        </button>
                      )}

                      {/* Video */}
                      {hasVideo && msg.file_url && (
                        <div className="mb-2 rounded-xl overflow-hidden shadow-sm">
                          <video controls preload="metadata" className="max-w-full max-h-64 rounded-xl w-full">
                            <source src={msg.file_url} type={msg.file_type || "video/mp4"} />
                          </video>
                        </div>
                      )}

                      {/* Audio */}
                      {hasAudio && msg.file_url && (
                        <div className="mb-2 flex items-center gap-2 p-2 rounded-lg bg-background/10">
                          <Volume2 className="h-5 w-5 shrink-0 opacity-70" />
                          <audio controls preload="metadata" className="w-full h-8 [&::-webkit-media-controls-panel]:bg-transparent">
                            <source src={msg.file_url} type={msg.file_type || "audio/mpeg"} />
                          </audio>
                        </div>
                      )}

                      {/* File */}
                      {hasFile && (
                        <a href={msg.file_url!} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2.5 rounded-lg mb-2 ${isOwn ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" : "bg-muted hover:bg-muted/80"} transition-colors`}>
                          {getFileIcon(msg.file_name, msg.file_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{msg.file_name}</p>
                            {msg.file_size && <p className="text-xs opacity-70">{formatFileSize(msg.file_size)}</p>}
                          </div>
                          <Download className="h-4 w-4 shrink-0 opacity-70" />
                        </a>
                      )}

                      {/* Text content with clickable links */}
                      {msg.content && !msg.content.startsWith("📎") && (
                        <p className="text-sm whitespace-pre-wrap break-words">{renderMessageContent(msg.content, isOwn)}</p>
                      )}

                      {/* Timestamp + read status */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <p className={`text-[11px] ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {format(msgDate, "HH:mm", { locale: isRTL ? ar : enUS })}
                        </p>
                        {isOwn && (msg.is_read ? <CheckCheck className="h-3.5 w-3.5 text-primary-foreground/60" /> : <Check className="h-3.5 w-3.5 text-primary-foreground/60" />)}
                      </div>
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
      <div className="border-t p-3 md:p-4 bg-background pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-4 shrink-0">
        {pendingMedia && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-muted rounded-lg">
            {pendingMedia.type.startsWith("image/") ? (
              <img src={pendingMedia.url} alt={pendingMedia.name} className="h-12 w-12 object-cover rounded" />
            ) : pendingMedia.type.startsWith("video/") ? (
              <div className="h-12 w-12 bg-background rounded flex items-center justify-center"><Play className="h-5 w-5" /></div>
            ) : pendingMedia.type.startsWith("audio/") ? (
              <div className="h-12 w-12 bg-background rounded flex items-center justify-center"><Volume2 className="h-5 w-5" /></div>
            ) : (
              <div className="h-12 w-12 bg-background rounded flex items-center justify-center">{getFileIcon(pendingMedia.name, pendingMedia.type)}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{pendingMedia.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(pendingMedia.size)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPendingMedia(null)}>✕</Button>
          </div>
        )}
        <div className="flex gap-2 items-end">
          <ChatMediaUpload conversationId={conversationId} onUploadComplete={handleMediaUpload} disabled={sending} />
          <Textarea
            value={newMessage}
            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.typePlaceholder")}
            className="min-h-[48px] max-h-32 resize-none"
            rows={1}
          />
          <Button onClick={handleSend} disabled={(!newMessage.trim() && !pendingMedia) || sending} size="icon" className="h-12 w-12 min-h-[48px] min-w-[48px] shrink-0">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Image Preview Dialog with navigation */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-3xl p-0 overflow-hidden bg-black/95 border-none">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative flex items-center justify-center min-h-[50vh]">
            {/* Navigation */}
            {allImages.length > 1 && currentImageIndex > 0 && (
              <Button variant="ghost" size="icon" className="absolute start-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white h-10 w-10" onClick={() => setPreviewImage(allImages[currentImageIndex - 1])}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {allImages.length > 1 && currentImageIndex < allImages.length - 1 && (
              <Button variant="ghost" size="icon" className="absolute end-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white h-10 w-10" onClick={() => setPreviewImage(allImages[currentImageIndex + 1])}>
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
            {/* Top bar */}
            <div className="absolute top-2 end-2 z-10 flex items-center gap-2">
              {allImages.length > 1 && (
                <span className="text-white/80 text-sm bg-black/50 px-2 py-1 rounded">{currentImageIndex + 1} / {allImages.length}</span>
              )}
              <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70 text-white h-9 w-9" asChild>
                <a href={previewImage || ""} download target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
              </Button>
            </div>
            {previewImage && (
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain touch-pinch-zoom" style={{ touchAction: "pinch-zoom" }} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Gallery */}
      <ChatMediaGallery conversationId={conversationId} isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </div>
  );
};

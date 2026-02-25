import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Image, File, Loader2, X, Video, Music } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMediaUploadProps {
  conversationId: string;
  onUploadComplete: (fileUrl: string, fileName: string, fileType: string, fileSize: number) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ChatMediaUpload = ({ conversationId, onUploadComplete, disabled }: ChatMediaUploadProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: "destructive", title: t("chat.fileTooLarge"), description: t("chat.maxFileSize", { size: "10MB" }) });
      return;
    }
    await uploadFile(file);
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage.from("chat-media").upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(data.path);
      onUploadComplete(urlData.publicUrl, file.name, file.type, file.size);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ variant: "destructive", title: t("chat.uploadError"), description: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" onChange={handleFileSelect} className="hidden" />
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <input ref={videoInputRef} type="file" accept="video/*,audio/*" onChange={handleFileSelect} className="hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled || uploading} className="shrink-0 h-12 w-12 min-h-[48px] min-w-[48px]">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <Image className="h-4 w-4 me-2" />{t("chat.uploadImage")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
            <Video className="h-4 w-4 me-2" />{t("chat.uploadVideo")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <File className="h-4 w-4 me-2" />{t("chat.uploadFile")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

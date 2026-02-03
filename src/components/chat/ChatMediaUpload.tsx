import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Paperclip, Image, File, Loader2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMediaUploadProps {
  conversationId: string;
  onUploadComplete: (fileUrl: string, fileName: string, fileType: string, fileSize: number) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ChatMediaUpload = ({ conversationId, onUploadComplete, disabled }: ChatMediaUploadProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; type: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: t("chat.fileTooLarge"),
        description: t("chat.maxFileSize", { size: "10MB" }),
      });
      return;
    }

    // Show preview for images
    if (type === "image" && file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setPreview({ url: previewUrl, name: file.name, type: file.type });
    }

    await uploadFile(file);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${conversationId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage.from("chat-media").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(data.path);

      onUploadComplete(urlData.publicUrl, file.name, file.type, file.size);
      setPreview(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: t("chat.uploadError"),
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => {
    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }
    setPreview(null);
  };

  if (preview) {
    return (
      <div className="relative inline-flex items-center gap-2 bg-muted p-2 rounded-lg">
        {preview.type.startsWith("image/") ? (
          <img src={preview.url} alt={preview.name} className="h-10 w-10 object-cover rounded" />
        ) : (
          <File className="h-10 w-10 p-2 bg-background rounded" />
        )}
        <span className="text-sm truncate max-w-[100px]">{preview.name}</span>
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Button variant="ghost" size="icon" onClick={cancelPreview} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
        onChange={(e) => handleFileSelect(e, "file")}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, "image")}
        className="hidden"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled || uploading} className="shrink-0">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <Image className="h-4 w-4 me-2" />
            {t("chat.uploadImage")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <File className="h-4 w-4 me-2" />
            {t("chat.uploadFile")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  onUpload: (url: string) => void;
  size?: "sm" | "md" | "lg";
  name?: string;
}

const AvatarUpload = ({ 
  userId, 
  currentAvatarUrl, 
  onUpload, 
  size = "lg",
  name = ""
}: AvatarUploadProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("profile.uploadPhoto"),
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: "Image must be less than 5MB",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const publicUrl = getPublicUrl(fileName);
      onUpload(publicUrl);

      toast({
        title: t("profile.photoUploaded"),
        description: t("profile.photoUploadedDesc"),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("documents.uploadFailed"),
        description: error.message,
      });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-lg`}>
          <AvatarImage src={displayUrl || undefined} alt={name} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
            {initials || <User className="w-8 h-8" />}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {previewUrl && !isUploading && (
          <button
            type="button"
            onClick={clearPreview}
            className="absolute -top-1 -end-1 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        {currentAvatarUrl || previewUrl ? t("profile.changePhoto") : t("profile.uploadPhoto")}
      </Button>
    </div>
  );
};

export default AvatarUpload;
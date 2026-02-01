import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StartChatButtonProps {
  targetType: "professional" | "clinic";
  targetId: string;
  currentProfileId: string;
  currentUserType: "professional" | "clinic";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const StartChatButton = ({
  targetType,
  targetId,
  currentProfileId,
  currentUserType,
  variant = "outline",
  size = "default",
  className,
}: StartChatButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    setLoading(true);
    try {
      // Determine professional and clinic IDs
      const professionalId = currentUserType === "professional" ? currentProfileId : targetId;
      const clinicId = currentUserType === "clinic" ? currentProfileId : targetId;

      // Check if conversation already exists
      const { data: existing, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .eq("professional_id", professionalId)
        .eq("clinic_id", clinicId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      let conversationId = existing?.id;

      // Create new conversation if it doesn't exist
      if (!conversationId) {
        const { data: newConv, error: createError } = await supabase
          .from("conversations")
          .insert({
            professional_id: professionalId,
            clinic_id: clinicId,
          })
          .select("id")
          .single();

        if (createError) throw createError;
        conversationId = newConv.id;
      }

      // Navigate to chat page
      navigate(`/dashboard/${currentUserType}?tab=messages&conversation=${conversationId}`);
    } catch (error: any) {
      console.error("Error starting chat:", error);
      toast({
        variant: "destructive",
        title: t("chat.startError"),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartChat}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <MessageCircle className="h-4 w-4 me-2" />
          {t("chat.startChat")}
        </>
      )}
    </Button>
  );
};

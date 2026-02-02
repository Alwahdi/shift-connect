import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";

const Messages = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationParam = searchParams.get("conversation");
  const [userType, setUserType] = useState<"professional" | "clinic" | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchUserType = async () => {
      // Check if user is a professional
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setUserType("professional");
        setProfileId(profile.id);
        setLoading(false);
        return;
      }

      // Check if user is a clinic
      const { data: clinic } = await supabase
        .from("clinics")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (clinic) {
        setUserType("clinic");
        setProfileId(clinic.id);
        setLoading(false);
        return;
      }

      // No profile found, redirect to onboarding
      navigate("/");
    };

    fetchUserType();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
        <Header />
        <main className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[600px] w-full rounded-xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userType || !profileId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <main className="container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            {t("chat.messages")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("chat.messagesDescription")}
          </p>
        </div>
        
        <ChatContainer 
          userType={userType} 
          profileId={profileId} 
          initialConversation={conversationParam}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;

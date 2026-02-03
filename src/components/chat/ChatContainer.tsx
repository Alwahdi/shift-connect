import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChatList } from "./ChatList";
import { ChatMessages } from "./ChatMessages";
import { MessageCircle } from "lucide-react";

interface ChatContainerProps {
  userType: "professional" | "clinic";
  profileId: string;
  initialConversation?: string | null;
}

export const ChatContainer = ({ userType, profileId, initialConversation }: ChatContainerProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    initialConversation || null
  );

  // Update selected conversation when initialConversation changes
  useEffect(() => {
    if (initialConversation) {
      setSelectedConversation(initialConversation);
    }
  }, [initialConversation]);

  return (
    <div className="h-[600px] flex rounded-xl border overflow-hidden bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Conversation List - Hidden on mobile when conversation selected */}
      <div
        className={`w-full md:w-80 border-e flex-shrink-0 ${
          selectedConversation ? "hidden md:block" : "block"
        }`}
      >
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {t("chat.messages")}
          </h2>
        </div>
        <ChatList
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          userType={userType}
          profileId={profileId}
        />
      </div>

      {/* Chat Messages */}
      <div
        className={`flex-1 ${
          selectedConversation ? "block" : "hidden md:block"
        }`}
      >
        {selectedConversation ? (
          <ChatMessages
            conversationId={selectedConversation}
            userType={userType}
            profileId={profileId}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <MessageCircle className="h-16 w-16 mb-4 opacity-50" />
            <p>{t("chat.selectConversation")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

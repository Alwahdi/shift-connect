import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Search, User, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { user, userRole, isOnboardingComplete } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Fetch profile/clinic ID and unread messages
  useEffect(() => {
    if (!user) return;

    const fetchProfileAndUnread = async () => {
      // Get profile/clinic ID
      if (userRole === "professional") {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (data) setProfileId(data.id);
      } else if (userRole === "clinic") {
        const { data } = await supabase
          .from("clinics")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (data) setProfileId(data.id);
      }
    };

    fetchProfileAndUnread();
  }, [user, userRole]);

  // Subscribe to unread messages
  useEffect(() => {
    if (!profileId || !userRole) return;

    const fetchUnread = async () => {
      const senderType = userRole === "professional" ? "clinic" : "professional";
      const filterColumn = userRole === "professional" ? "professional_id" : "clinic_id";

      // Get conversations for user
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq(filterColumn, profileId);

      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map((c) => c.id);
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .eq("sender_type", senderType)
          .eq("is_read", false);
        setUnreadCount(count || 0);
      }
    };

    fetchUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, userRole]);

  // Only show for authenticated users who completed onboarding
  if (!user || !isOnboardingComplete) {
    return null;
  }

  const getDashboardPath = () => {
    if (userRole === "admin" || userRole === "super_admin") return "/admin";
    if (userRole === "clinic") return "/dashboard/clinic";
    return "/dashboard/professional";
  };

  const getProfilePath = () => {
    if (userRole === "clinic") return "/profile/clinic";
    return "/profile/professional";
  };

  const getSearchPath = () => {
    // Clinics search for professionals, professionals search for shifts
    if (userRole === "clinic") return "/search/professionals";
    return "/shifts";
  };

  const navItems = [
    {
      label: t("nav.dashboard"),
      icon: LayoutDashboard,
      path: getDashboardPath(),
    },
    {
      label: userRole === "clinic" ? t("nav.findPros") : t("nav.findShifts"),
      icon: userRole === "clinic" ? Users : Search,
      path: getSearchPath(),
    },
    {
      label: t("nav.messages"),
      icon: MessageCircle,
      path: "/messages",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      label: t("nav.profile"),
      icon: User,
      path: getProfilePath(),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around px-2 safe-area-inset-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] min-h-[48px] rounded-lg text-muted-foreground transition-colors",
              "hover:text-foreground hover:bg-muted/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            activeClassName="text-primary bg-primary/10"
            aria-label={item.label}
          >
            <div className="relative">
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.badge && (
                <span className="absolute -top-1.5 -end-1.5 h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium px-1">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

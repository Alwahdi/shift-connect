import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Search, User, MessageCircle, Users, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const MobileBottomNav = () => {
  const { t } = useTranslation();
  const { user, userRole, isOnboardingComplete } = useAuth();
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);

  // Fetch profile/clinic ID
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
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

    fetchProfile();
  }, [user, userRole]);

  // Subscribe to unread messages
  useEffect(() => {
    if (!profileId || !userRole) return;

    const fetchUnread = async () => {
      const senderType = userRole === "professional" ? "clinic" : "professional";
      const filterColumn = userRole === "professional" ? "professional_id" : "clinic_id";

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
        setUnreadMessageCount(count || 0);
      }
    };

    fetchUnread();

    const channel = supabase
      .channel("unread-messages-mobile")
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

  // Subscribe to unread notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      setUnreadNotificationCount(count || 0);
    };

    fetchNotifications();

    const channel = supabase
      .channel("notifications-mobile")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
      badge: unreadMessageCount > 0 ? unreadMessageCount : undefined,
    },
    {
      label: t("nav.profile"),
      icon: User,
      path: getProfilePath(),
    },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 md:hidden shadow-lg"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around px-1 safe-area-inset-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 px-2 py-2 min-w-[60px] min-h-[48px] rounded-xl text-muted-foreground transition-all duration-200",
              "hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "active:scale-95"
            )}
            activeClassName="text-primary"
            aria-label={item.label}
          >
            <div className="relative">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg"
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </motion.div>
              {item.badge && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -end-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium px-1"
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </motion.span>
              )}
            </div>
            <span className="text-[10px] font-medium">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};

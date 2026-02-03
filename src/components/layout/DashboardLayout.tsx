import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2 } from "lucide-react";

interface UserProfile {
  full_name?: string;
  name?: string;
  avatar_url?: string | null;
  logo_url?: string | null;
}

const DashboardLayout = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, userRole, signOut, isLoading: authLoading, isOnboardingComplete } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user needs onboarding (non-admin users)
    if (userRole && userRole !== "admin" && userRole !== "super_admin" && !isOnboardingComplete) {
      if (userRole === "professional") {
        navigate("/onboarding/professional");
      } else if (userRole === "clinic") {
        navigate("/onboarding/clinic");
      }
      return;
    }

    fetchProfile();
  }, [user, userRole, authLoading, isOnboardingComplete, navigate]);

  const fetchProfile = async () => {
    if (!user || !userRole) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      if (userRole === "professional" || userRole === "admin" || userRole === "super_admin") {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setProfile({ full_name: data.full_name, avatar_url: data.avatar_url });
        }
      } else if (userRole === "clinic") {
        const { data } = await supabase
          .from("clinics")
          .select("name, logo_url")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setProfile({ name: data.name, logo_url: data.logo_url });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardType = (): "professional" | "clinic" | "admin" => {
    if (userRole === "admin" || userRole === "super_admin") return "admin";
    if (userRole === "clinic") return "clinic";
    return "professional";
  };

  const getDisplayName = () => {
    return profile?.full_name || profile?.name || "";
  };

  const getAvatarUrl = () => {
    return profile?.avatar_url || profile?.logo_url || null;
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <DashboardHeader
        type={getDashboardType()}
        onSignOut={handleSignOut}
        avatarUrl={getAvatarUrl()}
        name={getDisplayName()}
      />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

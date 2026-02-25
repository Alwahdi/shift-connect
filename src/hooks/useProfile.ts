import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  id: string;
  full_name?: string;
  name?: string;
  avatar_url?: string | null;
  logo_url?: string | null;
  verification_status?: "pending" | "verified" | "rejected" | null;
}

export const useProfile = () => {
  const { user, userRole } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id, userRole],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!user || !userRole) return null;

      if (userRole === "professional" || userRole === "admin" || userRole === "super_admin") {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, verification_status")
          .eq("user_id", user.id)
          .single();

        if (data) {
          return {
            id: data.id,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            verification_status: data.verification_status,
          };
        }
      } else if (userRole === "clinic") {
        const { data } = await supabase
          .from("clinics")
          .select("id, name, logo_url, verification_status")
          .eq("user_id", user.id)
          .single();

        if (data) {
          return {
            id: data.id,
            name: data.name,
            logo_url: data.logo_url,
            verification_status: data.verification_status,
          };
        }
      }

      return null;
    },
    enabled: !!user && !!userRole,
    staleTime: 5 * 60 * 1000,
  });

  const displayName = profile?.full_name || profile?.name || "";
  const avatarUrl = profile?.avatar_url || profile?.logo_url || null;
  const verificationStatus = profile?.verification_status || null;
  const profileId = profile?.id || null;

  return {
    profile,
    isLoading,
    displayName,
    avatarUrl,
    verificationStatus,
    profileId,
  };
};

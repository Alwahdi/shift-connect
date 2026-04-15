import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

export const useProfile = () => {
  const { user, userRole } = useAuth();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["profile", user?.id, userRole],
    queryFn: async () => {
      if (!user || !userRole) return null;
      if (userRole === "professional") {
        const { data } = await supabase.from("profiles").select("id, full_name, avatar_url, verification_status, rating_avg, rating_count, created_at").eq("user_id", user.id).single();
        return data ? { id: data.id, displayName: data.full_name, avatarUrl: data.avatar_url, verificationStatus: data.verification_status, ratingAvg: data.rating_avg, ratingCount: data.rating_count, createdAt: data.created_at } : null;
      } else {
        const { data } = await supabase.from("clinics").select("id, name, logo_url, verification_status, rating_avg, rating_count, created_at").eq("user_id", user.id).single();
        return data ? { id: data.id, displayName: data.name, avatarUrl: data.logo_url, verificationStatus: data.verification_status, ratingAvg: data.rating_avg, ratingCount: data.rating_count, createdAt: data.created_at } : null;
      }
    },
    enabled: !!user && !!userRole,
    staleTime: 5 * 60 * 1000,
  });

  return {
    profile, isLoading, refetch,
    displayName: profile?.displayName || "",
    avatarUrl: profile?.avatarUrl || null,
    verificationStatus: profile?.verificationStatus || null,
    profileId: profile?.id || null,
  };
};

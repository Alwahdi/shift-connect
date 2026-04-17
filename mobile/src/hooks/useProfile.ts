import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfileData {
  id: string;
  full_name?: string;
  name?: string;
  avatar_url?: string | null;
  logo_url?: string | null;
  verification_status?: 'pending' | 'verified' | 'rejected' | null;
  email?: string;
  phone?: string;
  bio?: string;
  location_address?: string;
  hourly_rate?: number;
  specialties?: string[];
  qualifications?: string[];
  rating_avg?: number;
  rating_count?: number;
  onboarding_completed?: boolean;
  description?: string;
  address?: string;
  tax_id?: string;
  website?: string;
}

export const useProfile = () => {
  const { user, userRole } = useAuth();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id, userRole],
    queryFn: async (): Promise<ProfileData | null> => {
      if (!user || !userRole) return null;

      if (userRole === 'professional') {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) return data as unknown as ProfileData;
      } else if (userRole === 'clinic') {
        const { data } = await supabase
          .from('clinics')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data) return data as unknown as ProfileData;
      }
      return null;
    },
    enabled: !!user && !!userRole,
    staleTime: 5 * 60 * 1000,
  });

  const displayName = profile?.full_name || profile?.name || '';
  const avatarUrl = profile?.avatar_url || profile?.logo_url || null;
  const verificationStatus = profile?.verification_status || null;
  const profileId = profile?.id || null;

  return { profile, isLoading, refetch, displayName, avatarUrl, verificationStatus, profileId };
};

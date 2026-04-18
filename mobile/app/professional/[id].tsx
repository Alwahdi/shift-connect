import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/lib/supabase';
import { Avatar, Card, Badge, Button } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userRole } = useAuth();
  const { profileId: myProfileId } = useProfile();
  const [messaging, setMessaging] = useState(false);

  const handleMessage = async () => {
    if (!myProfileId || !id) return;
    setMessaging(true);
    try {
      // For a clinic viewing a professional: myProfileId = clinic.id, id = professional profile.id
      // Find existing conversation first
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('clinic_id', myProfileId)
        .eq('professional_id', id)
        .maybeSingle();

      if (existing?.id) {
        router.push(`/chat/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: created, error } = await supabase
        .from('conversations')
        .insert({ clinic_id: myProfileId, professional_id: id })
        .select('id')
        .single();

      if (created?.id) {
        router.push(`/chat/${created.id}`);
      }
    } finally {
      setMessaging(false);
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['professional-profile', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, location_address, hourly_rate, specialties, qualifications, rating_avg, rating_count, verification_status')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['professional-reviews', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer:clinics(name, logo_url)')
        .eq('reviewed_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const { data: completedShifts } = useQuery({
    queryKey: ['professional-completed', id],
    enabled: !!id,
    queryFn: async () => {
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('professional_id', id)
        .eq('status', 'completed');
      return count || 0;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Professional Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !profile ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Profile not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.lg }}>
          {/* Hero */}
          <Card variant="elevated" style={{ alignItems: 'center', padding: Spacing.xl, gap: Spacing.md }}>
            <Avatar uri={profile.avatar_url} name={profile.full_name} size={80} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: Typography.sizes['2xl'], fontWeight: '700', color: colors.text }}>{profile.full_name}</Text>
              {profile.location_address ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                  <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>{profile.location_address}</Text>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {profile.verification_status === 'verified' && (
                <Badge label="Verified" variant="success" size="sm" />
              )}
              {profile.hourly_rate ? (
                <Badge label={`$${profile.hourly_rate}/hr`} variant="primary" size="sm" />
              ) : null}
            </View>
            {userRole === 'clinic' && (
              <Button
                title={messaging ? 'Opening...' : 'Message'}
                onPress={handleMessage}
                disabled={messaging}
                variant="primary"
                size="sm"
                icon={<Ionicons name="chatbubble-outline" size={15} color="#fff" style={{ marginRight: 4 }} />}
              />
            )}
          </Card>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Card variant="outlined" style={{ flex: 1, alignItems: 'center', padding: Spacing.md }}>
              <Text style={{ fontSize: Typography.sizes['2xl'], fontWeight: '700', color: colors.primary }}>
                {profile.rating_avg ? profile.rating_avg.toFixed(1) : '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.xs }}>Rating</Text>
              {profile.rating_count ? (
                <Text style={{ color: colors.textTertiary, fontSize: Typography.sizes.xs }}>({profile.rating_count})</Text>
              ) : null}
            </Card>
            <Card variant="outlined" style={{ flex: 1, alignItems: 'center', padding: Spacing.md }}>
              <Text style={{ fontSize: Typography.sizes['2xl'], fontWeight: '700', color: colors.primary }}>
                {completedShifts ?? '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.xs }}>Shifts Done</Text>
            </Card>

          </View>

          {/* Bio */}
          {profile.bio ? (
            <Card variant="outlined" style={{ padding: Spacing.lg }}>
              <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 6 }}>About</Text>
              <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{profile.bio}</Text>
            </Card>
          ) : null}

          {/* Specialties */}
          {profile.specialties?.length ? (
            <Card variant="outlined" style={{ padding: Spacing.lg }}>
              <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 10 }}>Specialties</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {profile.specialties.map((s: string, i: number) => (
                  <Badge key={`${s}-${i}`} label={s} variant="primary" size="sm" />
                ))}
              </View>
            </Card>
          ) : null}

          {/* Qualifications */}
          {profile.qualifications?.length ? (
            <Card variant="outlined" style={{ padding: Spacing.lg }}>
              <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 10 }}>Qualifications</Text>
              {profile.qualifications.map((q: string, i: number) => (
                <View key={`${q}-${i}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginTop: 2 }} />
                  <Text style={{ color: colors.textSecondary, flex: 1 }}>{q}</Text>
                </View>
              ))}
            </Card>
          ) : null}

          {/* Reviews */}
          {reviews && reviews.length > 0 ? (
            <View style={{ gap: Spacing.sm }}>
              <Text style={{ fontWeight: '700', color: colors.text, fontSize: Typography.sizes.lg }}>Reviews</Text>
              {reviews.map((r: any) => (
                <Card key={r.id} variant="outlined" style={{ padding: Spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{(r.reviewer as any)?.name || 'Clinic'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{r.rating}</Text>
                    </View>
                  </View>
                  {r.comment ? <Text style={{ color: colors.textSecondary }}>{r.comment}</Text> : null}
                </Card>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, justifyContent: 'space-between' },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: '700' },
});

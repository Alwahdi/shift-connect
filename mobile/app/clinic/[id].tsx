import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Avatar, Card, Badge } from '@/components/ui';
import { Spacing, Typography } from '@/config/theme';

export default function ClinicProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic-profile', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, logo_url, description, address, phone, email, rating_avg, rating_count, verification_status')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['clinic-reviews', id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer:profiles(full_name, avatar_url)')
        .eq('reviewed_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const { data: totalShifts } = useQuery({
    queryKey: ['clinic-shifts-count', id],
    enabled: !!id,
    queryFn: async () => {
      const { count } = await supabase
        .from('shifts')
        .select('id', { count: 'exact', head: true })
        .eq('clinic_id', id);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Clinic Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !clinic ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Clinic not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.lg }}>
          {/* Hero */}
          <Card variant="elevated" style={{ alignItems: 'center', padding: Spacing.xl, gap: Spacing.md }}>
            <Avatar uri={clinic.logo_url} name={clinic.name} size={80} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: Typography.sizes['2xl'], fontWeight: '700', color: colors.text }}>{clinic.name}</Text>
              {clinic.address ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                  <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>{clinic.address}</Text>
                </View>
              ) : null}
            </View>
            {clinic.verification_status === 'verified' && (
              <Badge label="Verified Clinic" variant="success" size="sm" />
            )}
          </Card>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Card variant="outlined" style={{ flex: 1, alignItems: 'center', padding: Spacing.md }}>
              <Text style={{ fontSize: Typography.sizes['2xl'], fontWeight: '700', color: colors.primary }}>
                {clinic.rating_avg ? clinic.rating_avg.toFixed(1) : '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.xs }}>Rating</Text>
              {clinic.rating_count ? (
                <Text style={{ color: colors.textTertiary, fontSize: Typography.sizes.xs }}>({clinic.rating_count})</Text>
              ) : null}
            </Card>
            <Card variant="outlined" style={{ flex: 1, alignItems: 'center', padding: Spacing.md }}>
              <Text style={{ fontSize: Typography.sizes['2xl'], fontWeight: '700', color: colors.primary }}>
                {totalShifts ?? '—'}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.xs }}>Total Shifts</Text>
            </Card>
          </View>

          {/* Description */}
          {clinic.description ? (
            <Card variant="outlined" style={{ padding: Spacing.lg }}>
              <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 6 }}>About</Text>
              <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>{clinic.description}</Text>
            </Card>
          ) : null}

          {/* Contact */}
          {(clinic.phone || clinic.email) ? (
            <Card variant="outlined" style={{ padding: Spacing.lg, gap: Spacing.sm }}>
              <Text style={{ fontWeight: '600', color: colors.text, marginBottom: 4 }}>Contact</Text>
              {clinic.phone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${clinic.phone}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="call-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary }}>{clinic.phone}</Text>
                </Pressable>
              ) : null}
              {clinic.email ? (
                <Pressable onPress={() => Linking.openURL(`mailto:${clinic.email}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="mail-outline" size={16} color={colors.primary} />
                  <Text style={{ color: colors.primary }}>{clinic.email}</Text>
                </Pressable>
              ) : null}

            </Card>
          ) : null}

          {/* Reviews */}
          {reviews && reviews.length > 0 ? (
            <View style={{ gap: Spacing.sm }}>
              <Text style={{ fontWeight: '700', color: colors.text, fontSize: Typography.sizes.lg }}>Reviews</Text>
              {reviews.map((r: any) => (
                <Card key={r.id} variant="outlined" style={{ padding: Spacing.md }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: colors.text, fontWeight: '600' }}>{(r.reviewer as any)?.full_name || 'Professional'}</Text>
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

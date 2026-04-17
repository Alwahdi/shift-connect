import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBookingRealtime } from '@/hooks/useBookingRealtime';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Avatar, SectionHeader, EmptyState } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const { displayName, avatarUrl, verificationStatus, profileId } = useProfile();
  const insets = useSafeAreaInsets();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', user?.id, userRole],
    queryFn: async () => {
      if (!user) return null;
      if (userRole === 'professional') {
        const [bookingsRes, shiftsRes] = await Promise.all([
          supabase.from('bookings').select('id, status', { count: 'exact' }).eq('professional_id', profileId || ''),
          supabase.from('shifts').select('id', { count: 'exact' }).eq('is_filled', false),
        ]);
        const activeBookings = bookingsRes.data?.filter(b => ['confirmed', 'accepted', 'checked_in'].includes(b.status)) || [];
        const completedBookings = bookingsRes.data?.filter(b => b.status === 'completed') || [];
        return {
          availableShifts: shiftsRes.count || 0,
          activeBookings: activeBookings.length,
          completedShifts: completedBookings.length,
        };
      } else if (userRole === 'clinic') {
        const [shiftsRes, bookingsRes] = await Promise.all([
          supabase.from('shifts').select('id, is_filled', { count: 'exact' }).eq('clinic_id', profileId || ''),
          supabase.from('bookings').select('id, status', { count: 'exact' }).eq('clinic_id', profileId || ''),
        ]);
        const activeShifts = shiftsRes.data?.filter(s => !s.is_filled) || [];
        const pendingBookings = bookingsRes.data?.filter(b => b.status === 'pending') || [];
        return {
          postedShifts: shiftsRes.count || 0,
          activeShifts: activeShifts.length,
          pendingApplicants: pendingBookings.length,
        };
      }
      return null;
    },
    enabled: !!user && !!profileId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: recentItems, isLoading: recentLoading, refetch: refetchRecent } = useQuery({
    queryKey: ['dashboard-recent', user?.id, userRole],
    queryFn: async () => {
      if (!user || !profileId) return [];
      if (userRole === 'professional') {
        const { data } = await supabase
          .from('shifts')
          .select('id, title, role_required, shift_date, start_time, end_time, hourly_rate, location_address, is_urgent')
          .eq('is_filled', false)
          .order('created_at', { ascending: false })
          .limit(5);
        return data || [];
      } else {
        const { data } = await supabase
          .from('bookings')
          .select('id, status, created_at, shifts(title, shift_date, start_time)')
          .eq('clinic_id', profileId)
          .order('created_at', { ascending: false })
          .limit(5);
        return data || [];
      }
    },
    enabled: !!user && !!profileId,
    staleTime: 2 * 60 * 1000,
  });

  useBookingRealtime({
    professionalId: userRole === 'professional' ? profileId || undefined : undefined,
    clinicId: userRole === 'clinic' ? profileId || undefined : undefined,
    onBookingUpdate: () => { refetchStats(); refetchRecent(); },
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchRecent()]);
    setRefreshing(false);
  }, [refetchStats, refetchRecent]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning');
    if (hour < 18) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.base, paddingBottom: Spacing['3xl'] }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()}</Text>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {displayName || 'User'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')}>
          <Avatar uri={avatarUrl} name={displayName} size={48} />
        </Pressable>
      </View>

      {/* Verification Banner */}
      {verificationStatus === 'pending' && (
        <Card variant="outlined" style={[styles.banner, { borderColor: colors.warning }]}>
          <View style={styles.bannerRow}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Text style={[styles.bannerTitle, { color: colors.text }]}>{t('dashboard.verificationPending')}</Text>
              <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>{t('dashboard.verificationPendingDesc')}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {userRole === 'professional' ? (
          <>
            <StatCard icon="calendar" label={t('dashboard.availableShifts')} value={`${stats?.availableShifts || 0}`} color={colors.primary} colors={colors} />
            <StatCard icon="clipboard" label={t('dashboard.activeBookings')} value={`${stats?.activeBookings || 0}`} color={colors.accent} colors={colors} />
            <StatCard icon="checkmark-circle" label={t('dashboard.completedShifts')} value={`${stats?.completedShifts || 0}`} color={colors.success} colors={colors} />
          </>
        ) : (
          <>
            <StatCard icon="document-text" label={t('dashboard.postedShifts')} value={`${stats?.postedShifts || 0}`} color={colors.primary} colors={colors} />
            <StatCard icon="flash" label={t('dashboard.activeShifts')} value={`${stats?.activeShifts || 0}`} color={colors.accent} colors={colors} />
            <StatCard icon="people" label={t('dashboard.applicants')} value={`${stats?.pendingApplicants || 0}`} color={colors.warning} colors={colors} />
          </>
        )}
      </View>

      {/* Quick Actions */}
      <SectionHeader title={t('dashboard.quickActions')} />
      <View style={styles.quickActions}>
        <QuickAction
          icon="search" label={userRole === 'professional' ? t('dashboard.findShifts') : t('dashboard.manageShifts')}
          color={colors.primary} bgColor={colors.primary + '12'} onPress={() => router.push('/(tabs)/shifts')}
          colors={colors}
        />
        <QuickAction
          icon="clipboard" label={t('dashboard.myBookings')}
          color={colors.accent} bgColor={colors.accent + '12'} onPress={() => router.push('/(tabs)/bookings')}
          colors={colors}
        />
        <QuickAction
          icon="person" label={t('dashboard.myProfile')}
          color={colors.info} bgColor={colors.info + '12'} onPress={() => router.push('/(tabs)/profile')}
          colors={colors}
        />
      </View>

      {/* Recent Items */}
      <SectionHeader
        title={userRole === 'professional' ? t('dashboard.availableShifts') : t('dashboard.recentActivity')}
        actionLabel={t('dashboard.viewAll')}
        onAction={() => router.push('/(tabs)/shifts')}
      />

      {recentItems && recentItems.length > 0 ? (
        recentItems.map((item: any) => (
          <ShiftCard key={item.id} item={item} userRole={userRole} colors={colors} t={t} />
        ))
      ) : (
        <EmptyState
          icon="calendar-outline"
          title={userRole === 'professional' ? t('shifts.noShifts') : t('dashboard.noActivity')}
          description={userRole === 'professional' ? t('shifts.noShiftsDesc') : undefined}
        />
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value, color, colors }: any) {
  return (
    <Card variant="elevated" style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>{label}</Text>
    </Card>
  );
}

function QuickAction({ icon, label, color, bgColor, onPress, colors }: any) {
  return (
    <Pressable onPress={onPress} style={[styles.quickAction, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.quickActionLabel, { color: colors.text }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function ShiftCard({ item, userRole, colors, t }: any) {
  return (
    <Card variant="outlined" style={styles.shiftCard} onPress={() => router.push('/(tabs)/shifts')}>
      <View style={styles.shiftRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.shiftTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || item.shifts?.title || 'Shift'}
          </Text>
          <View style={styles.shiftMeta}>
            <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.shiftMetaText, { color: colors.textSecondary }]}>
              {formatDate(item.shift_date || item.shifts?.shift_date || item.created_at)}
            </Text>
          </View>
          {item.hourly_rate && (
            <Text style={[styles.shiftRate, { color: colors.primary }]}>
              {formatCurrency(item.hourly_rate)}{t('shifts.hourly')}
            </Text>
          )}
        </View>
        {item.is_urgent && <Badge label={t('shifts.urgent')} variant="error" />}
        {item.status && <Badge label={item.status} variant={item.status === 'pending' ? 'warning' : 'success'} />}
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  greeting: { fontSize: Typography.sizes.sm, marginBottom: 2 },
  name: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold },
  banner: { marginHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  bannerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  bannerTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, marginBottom: 2 },
  bannerDesc: { fontSize: Typography.sizes.xs },
  statsGrid: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  statValue: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold },
  statLabel: { fontSize: Typography.sizes.xs, textAlign: 'center', marginTop: 2 },
  quickActions: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.xl },
  quickAction: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.md, borderRadius: BorderRadius.lg, gap: Spacing.xs,
  },
  quickActionLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium, textAlign: 'center' },
  shiftCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.sm },
  shiftRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  shiftTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, marginBottom: 4 },
  shiftMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  shiftMetaText: { fontSize: Typography.sizes.xs },
  shiftRate: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
});

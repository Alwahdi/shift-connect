import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBookingRealtime } from '@/hooks/useBookingRealtime';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Avatar, SectionHeader, EmptyState, Button } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';
import { formatCurrency, formatDate } from '@/lib/utils';
import Toast from 'react-native-toast-message';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const { displayName, avatarUrl, verificationStatus, profileId } = useProfile();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Helper: parse "HH:MM" to minutes
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const calcHours = (start: string, end: string) => {
    if (!start || !end) return 8;
    const diff = parseTime(end) - parseTime(start);
    return (diff > 0 ? diff : diff + 24 * 60) / 60;
  };

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', user?.id, userRole],
    queryFn: async () => {
      if (!user) return null;
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
      if (userRole === 'professional') {
        const [bookingsRes, shiftsRes, invitationsRes, profileRes] = await Promise.all([
          supabase.from('bookings').select('id, status, shift_id, shift:shifts(start_time, end_time, shift_date), hourly_rate').eq('professional_id', profileId || ''),
          supabase.from('shifts').select('id', { count: 'exact' }).eq('is_filled', false),
          supabase.from('shift_invitations')
            .select('id, shift_id, clinic_id, professional_id, status, message, created_at, shift:shifts(id, title, role_required, shift_date, start_time, end_time, hourly_rate, location_address), clinic:clinics(id, name, logo_url)')
            .eq('professional_id', profileId || '')
            .eq('status', 'pending'),
          supabase.from('profiles').select('rating_avg').eq('id', profileId || '').single(),
        ]);
        const activeBookings = bookingsRes.data?.filter(b => ['confirmed', 'accepted', 'checked_in', 'checked_out'].includes(b.status)) || [];
        const completedBookings = bookingsRes.data?.filter(b => b.status === 'completed') || [];
        const monthlyEarnings = bookingsRes.data
          ?.filter(b => b.status === 'completed' && (b.shift as any)?.shift_date >= monthStart && (b.shift as any)?.shift_date <= monthEnd)
          .reduce((sum, b) => {
            const s = b.shift as any;
            const hrs = s ? calcHours(s.start_time, s.end_time) : 8;
            return sum + hrs * (b.hourly_rate || 0);
          }, 0) || 0;
        return {
          availableShifts: shiftsRes.count || 0,
          activeBookings: activeBookings.length,
          completedShifts: completedBookings.length,
          monthlyEarnings,
          avgRating: profileRes.data?.rating_avg ?? null,
          invitations: invitationsRes.data || [],
        };
      } else if (userRole === 'clinic') {
        const [shiftsRes, bookingsRes] = await Promise.all([
          supabase.from('shifts').select('id, is_filled, shift_date').eq('clinic_id', profileId || ''),
          supabase.from('bookings').select('id, status, shift_id, shift:shifts(start_time, end_time, shift_date), hourly_rate').eq('clinic_id', profileId || ''),
        ]);
        const activeShifts = shiftsRes.data?.filter(s => !s.is_filled) || [];
        const pendingBookings = bookingsRes.data?.filter(b => b.status === 'requested') || [];
        const localDate = (d: string) => { const [y, m, day] = d.split('-').map(Number); return new Date(y, m - 1, day); };
        const monthlySpend = bookingsRes.data
          ?.filter(b => { const sd = (b.shift as any)?.shift_date; if (!sd) return false; const d = localDate(sd); return b.status === 'completed' && d >= localDate(monthStart) && d <= localDate(monthEnd); })
          .reduce((sum, b) => {
            const s = b.shift as any;
            const hrs = s ? calcHours(s.start_time, s.end_time) : 8;
            return sum + hrs * (b.hourly_rate || 0);
          }, 0) || 0;
        const monthBookings = bookingsRes.data?.filter(b => { const sd = (b.shift as any)?.shift_date; if (!sd) return false; const d = localDate(sd); return d >= localDate(monthStart) && d <= localDate(monthEnd); }) || [];
        const fillRate = monthBookings.length > 0 ? Math.round(100 * (monthBookings.filter(b => b.status === 'completed').length / monthBookings.length)) : 0;
        return {
          postedShifts: shiftsRes.data?.length || 0,
          activeShifts: activeShifts.length,
          pendingApplicants: pendingBookings.length,
          monthlySpend,
          fillRate,
        };
      }
      return null;
    },
    enabled: !!user && !!profileId,
    staleTime: 2 * 60 * 1000,
  });

  // Active bookings for professional
  const { data: activeBookings, isLoading: abLoading, refetch: refetchAB } = useQuery({
    queryKey: ['active-bookings', profileId, userRole],
    enabled: userRole === 'professional' && !!profileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, status, shift:shifts(id, title, role_required, shift_date, start_time, end_time, clinic:clinics(name))')
        .eq('professional_id', profileId || '')
        .in('status', ['accepted', 'confirmed', 'checked_in', 'checked_out'])
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
    staleTime: 60 * 1000,
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
        // Clinic: show own recent shifts
        const { data } = await supabase
          .from('shifts')
          .select('id, title, role_required, shift_date, start_time, end_time, hourly_rate, is_filled, is_urgent')
          .eq('clinic_id', profileId)
          .order('shift_date', { ascending: true })
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
    onBookingUpdate: () => { refetchStats(); refetchRecent(); refetchAB(); },
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchRecent(), refetchAB()]);
    setRefreshing(false);
  }, [refetchStats, refetchRecent, refetchAB]);

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
            <Pressable onPress={() => router.push('/(tabs)/profile')} style={{ marginLeft: Spacing.sm }}>
              <Text style={{ color: colors.warning, fontWeight: '600', fontSize: Typography.sizes.sm }}>{'View →'}</Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statsLoading ? (
          <>
            <SkeletonStatCard colors={colors} />
            <SkeletonStatCard colors={colors} />
            <SkeletonStatCard colors={colors} />
            <SkeletonStatCard colors={colors} />
          </>
        ) : userRole === 'professional' ? (
          <>
            <StatCard icon="cash" label={t('dashboard.monthlyEarnings')} value={formatCurrency(stats?.monthlyEarnings || 0)} color={colors.success} colors={colors} />
            <StatCard icon="checkmark-circle" label={t('dashboard.completedShifts')} value={`${stats?.completedShifts || 0}`} color={colors.primary} colors={colors} />
            <StatCard icon="star" label={t('dashboard.averageRating')} value={stats?.avgRating != null ? `${(stats.avgRating as number).toFixed(1)}★` : 'N/A'} color={colors.warning} colors={colors} />
            <StatCard icon="clipboard" label={t('dashboard.activeBookings')} value={`${stats?.activeBookings || 0}`} color={colors.accent} colors={colors} />
          </>
        ) : (
          <>
            <StatCard icon="flash" label={t('dashboard.activeShifts')} value={`${stats?.activeShifts || 0}`} color={colors.accent} colors={colors} />
            <StatCard icon="people" label={t('dashboard.applicants')} value={`${stats?.pendingApplicants || 0}`} color={colors.warning} colors={colors} />
            <StatCard icon="cash" label={t('dashboard.monthlySpend')} value={formatCurrency(stats?.monthlySpend || 0)} color={colors.error} colors={colors} />
            <StatCard icon="stats-chart" label={t('dashboard.fillRate')} value={`${stats?.fillRate || 0}%`} color={colors.info} colors={colors} />
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
        {userRole === 'professional' && (
          <QuickAction
            icon="clipboard" label={t('dashboard.myBookings')}
            color={colors.accent} bgColor={colors.accent + '12'} onPress={() => router.push('/(tabs)/bookings')}
            colors={colors}
          />
        )}
        <QuickAction
          icon="person" label={t('dashboard.myProfile')}
          color={colors.info} bgColor={colors.info + '12'} onPress={() => router.push('/(tabs)/profile')}
          colors={colors}
        />
        {userRole === 'clinic' && (
          <QuickAction
            icon="add-circle"
            label={t('dashboard.createShift')}
            color={colors.success}
            bgColor={colors.success + '12'}
            onPress={() => router.push('/(tabs)/shifts')}
            colors={colors}
          />
        )}
      </View>

      {/* Invitations & Active Bookings (Professional) */}
      {userRole === 'professional' && stats?.invitations && stats.invitations.length > 0 && (
        <>
          <SectionHeader title={t('dashboard.invitations')} />
          {stats.invitations.map((inv: any) => (
            <InvitationCard key={inv.id} inv={inv} colors={colors} t={t} onRespond={() => refetchStats()} />
          ))}
        </>
      )}

      {/* Active Bookings (Professional) */}
      {userRole === 'professional' && (
        <>
          <SectionHeader title={t('booking.activeShifts')} />
          {abLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: Spacing.lg }}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : activeBookings && activeBookings.length > 0 ? (
            activeBookings.map((b: any) => {
              const shift = b.shift as any;
              return (
                <Card key={b.id} variant="outlined" style={styles.shiftCard}>
                  <View style={styles.shiftRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.shiftTitle, { color: colors.text }]} numberOfLines={1}>
                        {shift?.title || shift?.role_required || 'Shift'}
                      </Text>
                      {shift?.clinic?.name && (
                        <Text style={[styles.shiftMetaText, { color: colors.textSecondary }]}>{shift.clinic.name}</Text>
                      )}
                      {shift?.shift_date && (
                        <View style={styles.shiftMeta}>
                          <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                          <Text style={[styles.shiftMetaText, { color: colors.textSecondary }]}>{formatDate(shift.shift_date)}</Text>
                        </View>
                      )}
                    </View>
                    <Badge label={b.status} variant={b.status === 'confirmed' ? 'success' : 'primary'} />
                  </View>
                </Card>
              );
            })
          ) : (
            <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.sm }}>
              <Text style={{ color: colors.textTertiary, fontSize: Typography.sizes.sm }}>{t('booking.noActiveBookings')}</Text>
            </View>
          )}
        </>
      )}

      {/* Recent Items */}
      <SectionHeader
        title={userRole === 'professional' ? t('dashboard.availableShifts') : t('dashboard.recentShifts')}
        actionLabel={t('dashboard.viewAll')}
        onAction={() => router.push('/(tabs)/shifts')}
      />

      {recentLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      ) : recentItems && recentItems.length > 0 ? (
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

function InvitationCard({ inv, colors, t, onRespond }: any) {
  const [accepting, setAccepting] = React.useState(false);
  const [declining, setDeclining] = React.useState(false);
  const shift = inv.shift as any;
  const clinic = inv.clinic as any;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { error: invErr } = await supabase
        .from('shift_invitations')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', inv.id);
      if (invErr) throw invErr;
      const { error: bookErr } = await supabase.from('bookings').insert({
        shift_id: inv.shift_id,
        professional_id: inv.professional_id,
        clinic_id: inv.clinic_id,
        status: 'requested',
      });
      if (bookErr) throw bookErr;
      Toast.show({ type: 'success', text1: t('shifts.invitations.accepted'), text2: t('shifts.invitations.acceptedDesc') });
      onRespond?.();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      const { error } = await supabase
        .from('shift_invitations')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', inv.id);
      if (error) throw error;
      Toast.show({ type: 'info', text1: t('shifts.invitations.declined') });
      onRespond?.();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
    } finally {
      setDeclining(false);
    }
  };

  return (
    <Card variant="outlined" style={[styles.shiftCard, { borderColor: colors.primary + '40' }]}>
      {/* Clinic + badge */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Ionicons name="business" size={16} color={colors.primary} />
        <Text style={{ color: colors.text, fontWeight: '600', flex: 1 }} numberOfLines={1}>{clinic?.name || 'Clinic'}</Text>
        <Badge label={t('shifts.invitations.invitation')} variant="primary" size="sm" />
      </View>
      {/* Shift info */}
      {shift && (
        <>
          <Text style={{ color: colors.text, fontSize: Typography.sizes.base, fontWeight: '600', marginBottom: 6 }} numberOfLines={1}>
            {shift.title || shift.role_required}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="calendar-outline" size={13} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>{formatDate(shift.shift_date)}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={13} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>{shift.start_time} – {shift.end_time}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="cash-outline" size={13} color={colors.textTertiary} />
              <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }}>{formatCurrency(shift.hourly_rate)}/hr</Text>
            </View>
            {shift.location_address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
                <Text style={{ color: colors.textSecondary, fontSize: Typography.sizes.sm }} numberOfLines={1}>{shift.location_address}</Text>
              </View>
            )}
          </View>
        </>
      )}
      {/* Accept / Decline */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          title={accepting ? '...' : t('shifts.invitations.accept')}
          onPress={handleAccept}
          disabled={accepting || declining}
          variant="primary"
          size="sm"
          style={{ flex: 1 }}
        />
        <Button
          title={declining ? '...' : t('shifts.invitations.decline')}
          onPress={handleDecline}
          disabled={accepting || declining}
          variant="outline"
          size="sm"
          style={{ flex: 1 }}
        />
      </View>
    </Card>
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

function SkeletonStatCard({ colors }: any) {
  return (
    <Card variant="elevated" style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: colors.skeleton }]} />
      <View style={{ width: 28, height: 18, backgroundColor: colors.skeleton, borderRadius: 4, marginBottom: 4 }} />
      <View style={{ width: 44, height: 10, backgroundColor: colors.skeleton, borderRadius: 4 }} />
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, gap: Spacing.sm, marginBottom: Spacing.xl },
  statCard: { width: '47%', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm },
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

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/SkeletonLoader';
import { spacing, typography, borderRadius, colors as themeColors } from '@/constants/theme';
import { formatShiftDate, formatShiftTime, formatHourlyRate } from '@/lib/utils';

export default function DashboardScreen() {
  const { user, userRole } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      if (userRole === 'professional') {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        return data;
      } else {
        const { data } = await supabase.from('clinics').select('*').eq('user_id', user.id).single();
        return data;
      }
    },
    enabled: !!user,
  });

  // Fetch active bookings count
  const { data: activeBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['activeBookings', user?.id, userRole],
    queryFn: async () => {
      if (!user || !profile) return [];
      if (userRole === 'professional') {
        const { data } = await supabase
          .from('bookings')
          .select('*, shifts(*)')
          .eq('professional_id', profile.id)
          .in('status', ['accepted', 'confirmed', 'checked_in'])
          .order('created_at', { ascending: false })
          .limit(5);
        return data || [];
      } else {
        const { data } = await supabase
          .from('shifts')
          .select('*, bookings(count)')
          .eq('clinic_id', profile.id)
          .eq('is_filled', false)
          .order('shift_date', { ascending: true })
          .limit(5);
        return data || [];
      }
    },
    enabled: !!user && !!profile,
  });

  // Fetch unread notifications count
  const { data: unreadCount } = useQuery({
    queryKey: ['unreadNotifications', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      return count || 0;
    },
    enabled: !!user,
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
    await queryClient.invalidateQueries({ queryKey: ['activeBookings'] });
    await queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    setRefreshing(false);
  }, [queryClient]);

  const displayName = userRole === 'professional'
    ? (profile as any)?.full_name
    : (profile as any)?.name;
  const avatarUrl = userRole === 'professional'
    ? (profile as any)?.avatar_url
    : (profile as any)?.logo_url;
  const verificationStatus = (profile as any)?.verification_status;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar uri={avatarUrl} name={displayName || 'User'} size={48} />
            <View style={styles.headerText}>
              <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
                Welcome back
              </Text>
              <Text style={[typography.h3, { color: colors.text }]} numberOfLines={1}>
                {displayName || 'User'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(app)/settings')}
            style={[styles.notifButton, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {(unreadCount ?? 0) > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: colors.badge }]}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Verification Banner */}
        {verificationStatus && verificationStatus !== 'verified' && (
          <Card style={[styles.verificationBanner, { backgroundColor: colors.warningLight }]}>
            <View style={styles.bannerRow}>
              <Ionicons name="shield-outline" size={20} color={colors.warning} />
              <Text style={[typography.bodySmMedium, { color: colors.warning, marginLeft: spacing.sm, flex: 1 }]}>
                {verificationStatus === 'pending'
                  ? 'Your profile is pending verification'
                  : 'Your verification was not approved'}
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="briefcase-outline"
            label={userRole === 'clinic' ? 'Active Shifts' : 'Active Bookings'}
            value={String((activeBookings || []).length)}
            colors={colors}
          />
          <StatCard
            icon="star-outline"
            label="Rating"
            value={userRole === 'professional' ? ((profile as any)?.rating_avg?.toFixed(1) || '—') : '—'}
            colors={colors}
          />
          <StatCard
            icon={userRole === 'clinic' ? 'people-outline' : 'cash-outline'}
            label={userRole === 'clinic' ? 'Applicants' : 'Rate'}
            value={userRole === 'professional' ? ((profile as any)?.hourly_rate ? formatHourlyRate((profile as any).hourly_rate) : '—') : '—'}
            colors={colors}
          />
        </View>

        {/* Active Bookings / Shifts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.h4, { color: colors.text }]}>
              {userRole === 'clinic' ? 'Recent Shifts' : 'Active Bookings'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/shifts')}>
              <Text style={[typography.bodySmMedium, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {bookingsLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (activeBookings || []).length === 0 ? (
            <EmptyState
              icon={userRole === 'clinic' ? 'briefcase-outline' : 'calendar-outline'}
              title={userRole === 'clinic' ? 'No active shifts' : 'No active bookings'}
              description={
                userRole === 'clinic'
                  ? 'Post your first shift to find qualified professionals'
                  : 'Browse available shifts and apply to get started'
              }
              actionLabel={userRole === 'clinic' ? 'Post a Shift' : 'Find Shifts'}
              onAction={() => router.push('/(app)/(tabs)/shifts')}
            />
          ) : (
            (activeBookings || []).map((item: any) => (
              <Card
                key={item.id}
                variant="default"
                onPress={() => {
                  if (userRole === 'professional' && item.shifts) {
                    router.push(`/(app)/shift/${item.shifts.id}`);
                  } else {
                    router.push(`/(app)/shift/${item.id}`);
                  }
                }}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.bookingCard}>
                  <View style={styles.bookingCardHeader}>
                    <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                      {userRole === 'professional' ? item.shifts?.title : item.title}
                    </Text>
                    <Badge
                      text={userRole === 'professional' ? item.status : (item.is_urgent ? 'Urgent' : 'Open')}
                      variant={
                        userRole === 'professional'
                          ? item.status === 'accepted' || item.status === 'confirmed' ? 'success' : 'accent'
                          : item.is_urgent ? 'warning' : 'accent'
                      }
                    />
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                      {formatShiftDate(userRole === 'professional' ? item.shifts?.shift_date : item.shift_date)}
                    </Text>
                    <View style={{ width: spacing.base }} />
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                      {formatShiftTime(
                        userRole === 'professional' ? item.shifts?.start_time : item.start_time,
                        userRole === 'professional' ? item.shifts?.end_time : item.end_time
                      )}
                    </Text>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="cash-outline" size={14} color={colors.primary} />
                    <Text style={[typography.captionMedium, { color: colors.primary, marginLeft: 4 }]}>
                      {formatHourlyRate(userRole === 'professional' ? item.shifts?.hourly_rate : item.hourly_rate)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, colors: c }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; colors: any }) {
  return (
    <View style={[statStyles.card, { backgroundColor: c.surface, borderColor: c.cardBorder }]}>
      <Ionicons name={icon} size={22} color={c.primary} />
      <Text style={[typography.h3, { color: c.text, marginTop: spacing.xs }]}>{value}</Text>
      <Text style={[typography.caption, { color: c.textSecondary, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  verificationBanner: {
    marginBottom: spacing.base,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  section: {},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  bookingCard: {
    gap: spacing.sm,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

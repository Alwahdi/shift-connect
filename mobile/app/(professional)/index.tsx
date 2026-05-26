import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingCard } from '@/src/components/bookings/BookingCard';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { StatsCard } from '@/src/components/common/StatsCard';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { useNotifications } from '@/src/hooks/useNotifications';
import { supabase } from '@/src/lib/supabase';
import { shiftDurationHours } from '@/src/lib/shiftUtils';

export default function ProfessionalDashboardScreen() {
  const queryClient = useQueryClient();
  const { profile, refreshAuthState, user } = useAuth();
  const bookingsQuery = useBookings({ role: 'professional', entityId: profile?.id });
  const notifQuery = useNotifications(user?.id);

  const bookings = bookingsQuery.data ?? [];
  const upcoming = useMemo(() => bookings.filter((item) => ['requested', 'confirmed', 'checked_in'].includes(String(item.status))), [bookings]);
  const completed = useMemo(() => bookings.filter((item) => item.status === 'completed' || item.status === 'checked_out'), [bookings]);
  const earnings = completed.reduce(
    (sum, item) =>
      sum +
      (item.shift?.hourly_rate ?? 0) *
        shiftDurationHours(item.shift?.start_time ?? '09:00', item.shift?.end_time ?? '17:00'),
    0,
  );
  const unreadCount = useMemo(
    () => (notifQuery.data ?? []).filter((notification) => !notification.is_read).length,
    [notifQuery.data],
  );

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }, [queryClient]);

  const toggleAvailability = async (value: boolean) => {
    if (!profile) {
      return;
    }

    try {
      const { error } = await supabase.from('profiles').update({ is_available: value }).eq('id', profile.id);
      if (error) {
        throw error;
      }
      await refreshAuthState();
    } catch (error) {
      Alert.alert('Unable to update availability', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  if (!profile || bookingsQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading your dashboard..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={bookingsQuery.isFetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.grow}>
            <Text style={styles.kicker}>Professional dashboard</Text>
            <Text style={styles.title}>Hi, {profile.full_name}</Text>
            <Text style={styles.description}>Stay on top of your upcoming shifts and profile visibility.</Text>
          </View>
          <Link href="/notifications" asChild>
            <Pressable style={styles.bellBtn}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
              {unreadCount > 0 ? (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
                </View>
              ) : null}
            </Pressable>
          </Link>
        </View>

        <Card style={styles.availabilityCard}>
          <View style={styles.availabilityRow}>
            <View style={styles.grow}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Text style={styles.sectionDescription}>{profile.is_available ? 'You are visible to clinics.' : 'You are hidden from active availability searches.'}</Text>
            </View>
            <Switch value={Boolean(profile.is_available)} onValueChange={toggleAvailability} trackColor={{ true: theme.colors.primary }} />
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <StatsCard title="Upcoming shifts" value={String(upcoming.length)} icon="calendar-outline" />
          <StatsCard title="Total earnings" value={`$${earnings.toFixed(0)}`} icon="cash-outline" tint={theme.colors.success} />
          <StatsCard title="Rating" value={profile.rating_avg ? profile.rating_avg.toFixed(1) : 'New'} icon="star-outline" tint={theme.colors.warning} />
          <StatsCard title="Completed" value={String(completed.length)} icon="checkmark-done-outline" tint={theme.colors.accent} />
        </View>

        <Card style={styles.quickAction}>
          <Text style={styles.sectionTitle}>Quick action</Text>
          <Text style={styles.sectionDescription}>Browse fresh shifts that match your specialty and pay expectations.</Text>
          <Button title="Browse shifts" onPress={() => router.push('/(professional)/browse')} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming bookings</Text>
          <Link href="/(professional)/bookings" style={styles.link}>View all</Link>
        </View>

        <View style={styles.list}>
          {upcoming.length ? upcoming.slice(0, 4).map((booking) => <BookingCard key={booking.id} booking={booking} />) : <EmptyState title="No upcoming shifts" description="Browse shifts and apply to build your upcoming schedule." />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.lg, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md },
  kicker: { color: theme.colors.primary, fontWeight: '700' },
  title: { color: theme.colors.text, fontSize: theme.typography.sizes.xxl, fontWeight: '800', marginTop: 4 },
  description: { color: theme.colors.muted, marginTop: 6 },
  availabilityCard: { gap: theme.spacing.sm },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  grow: { flex: 1 },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.lg },
  sectionDescription: { color: theme.colors.muted, marginTop: 4, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  quickAction: { gap: theme.spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: theme.colors.primary, fontWeight: '700' },
  list: { gap: theme.spacing.md },
  bellBtn: { position: 'relative', padding: theme.spacing.sm },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '700', lineHeight: 12 },
});

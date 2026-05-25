import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { StatsCard } from '@/src/components/common/StatsCard';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { CreateShiftSheet } from '@/src/components/shifts/CreateShiftSheet';
import { ShiftCard } from '@/src/components/shifts/ShiftCard';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useShifts } from '@/src/hooks/useShifts';
import { shiftDurationHours } from '@/src/lib/shiftUtils';

export default function ClinicDashboardScreen() {
  const { clinic, user } = useAuth();
  const queryClient = useQueryClient();
  const [createVisible, setCreateVisible] = useState(false);
  const shiftsQuery = useShifts({ mode: 'clinic', clinicId: clinic?.id, pageSize: 5 });
  const bookingsQuery = useBookings({ role: 'clinic', entityId: clinic?.id });
  const notifQuery = useNotifications(user?.id);

  const shifts = useMemo(() => shiftsQuery.data?.pages.flat() ?? [], [shiftsQuery.data]);
  const bookings = bookingsQuery.data ?? [];
  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'requested'),
    [bookings],
  );
  const unreadCount = useMemo(
    () => (notifQuery.data ?? []).filter((notification) => !notification.is_read).length,
    [notifQuery.data],
  );

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['shifts'] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }, [queryClient]);

  if (!clinic || shiftsQuery.isLoading || bookingsQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading clinic dashboard..." />;
  }

  const activeShifts = shifts.filter((shift) => !shift.is_filled).length;
  const monthlySpend = bookings
    .filter((booking) => ['completed', 'checked_out'].includes(String(booking.status)))
    .reduce((sum, booking) => {
      const rate = booking.shift?.hourly_rate ?? 0;
      return (
        sum +
        rate * shiftDurationHours(booking.shift?.start_time ?? '09:00', booking.shift?.end_time ?? '17:00')
      );
    }, 0);
  const fillRate = shifts.length ? `${Math.round((shifts.filter((shift) => shift.is_filled).length / shifts.length) * 100)}%` : '0%';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={shiftsQuery.isFetching || bookingsQuery.isFetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>Clinic dashboard</Text>
            <Text style={styles.title}>Welcome, {clinic.name}</Text>
            <Text style={styles.description}>Monitor current staffing activity and post new shifts quickly.</Text>
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

        {clinic.verification_status !== 'verified' ? (
          <Card style={styles.banner}>
            <Text style={styles.bannerTitle}>Verification in progress</Text>
            <Text style={styles.bannerText}>Your clinic can post shifts, but verified status helps professionals respond faster.</Text>
          </Card>
        ) : null}

        <View style={styles.statsGrid}>
          <StatsCard title="Active shifts" value={String(activeShifts)} icon="calendar-outline" />
          <StatsCard title="Monthly spend" value={`$${monthlySpend.toFixed(0)}`} icon="cash-outline" tint={theme.colors.success} />
          <StatsCard title="Avg rating" value={clinic.rating_avg ? clinic.rating_avg.toFixed(1) : 'New'} icon="star-outline" tint={theme.colors.warning} />
          <StatsCard title="Fill rate" value={fillRate} icon="people-outline" tint={theme.colors.accent} />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent shifts</Text>
          <Link href="/(clinic)/shifts" style={styles.link}>View all</Link>
        </View>

        <View style={styles.list}>
          {shifts.length ? shifts.map((shift) => <ShiftCard key={shift.id} shift={shift} clinicName={clinic.name} />) : <EmptyState title="No shifts yet" description="Post your first shift to start receiving professional applications." />}
        </View>

        {pendingBookings.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Pending applications</Text>
              <Link href="/(clinic)/bookings" style={styles.link}>Review →</Link>
            </View>
            <View style={styles.list}>
              {pendingBookings.slice(0, 3).map((booking) => (
                <Card key={booking.id} style={styles.pendingCard}>
                  <Text style={styles.pendingName}>{booking.professional?.full_name ?? 'Professional'}</Text>
                  <Text style={styles.pendingShift}>{booking.shift?.title ?? 'Shift'}</Text>
                </Card>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.fabWrap}>
        <Button size="fab" onPress={() => setCreateVisible(true)} leftIcon={<Ionicons name="add" size={24} color={theme.colors.white} />} />
      </View>

      <CreateShiftSheet
        visible={createVisible}
        clinicId={clinic.id}
        onClose={() => setCreateVisible(false)}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['shifts'] });
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: FLOATING_TAB_BOTTOM_INSET,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  kicker: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    marginTop: 4,
  },
  description: {
    color: theme.colors.muted,
    marginTop: 6,
    maxWidth: 260,
  },
  banner: {
    backgroundColor: '#FFF5E5',
    borderColor: '#FCD7A5',
    gap: theme.spacing.xs,
  },
  bannerTitle: {
    color: theme.colors.warning,
    fontWeight: '700',
  },
  bannerText: {
    color: theme.colors.text,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: theme.typography.sizes.lg,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  list: {
    gap: theme.spacing.md,
  },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pendingName: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  pendingShift: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.sm,
  },
  fabWrap: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 96,
  },
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

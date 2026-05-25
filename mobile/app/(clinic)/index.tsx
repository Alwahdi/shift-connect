import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { EmptyState } from '@/src/components/common/EmptyState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { StatsCard } from '@/src/components/common/StatsCard';
import { CreateShiftSheet } from '@/src/components/shifts/CreateShiftSheet';
import { ShiftCard } from '@/src/components/shifts/ShiftCard';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { ASSUMED_SHIFT_HOURS, theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { useShifts } from '@/src/hooks/useShifts';

export default function ClinicDashboardScreen() {
  const { clinic } = useAuth();
  const queryClient = useQueryClient();
  const [createVisible, setCreateVisible] = useState(false);
  const shiftsQuery = useShifts({ mode: 'clinic', clinicId: clinic?.id, pageSize: 5 });
  const bookingsQuery = useBookings({ role: 'clinic', entityId: clinic?.id });

  const shifts = useMemo(() => shiftsQuery.data?.pages.flat() ?? [], [shiftsQuery.data]);
  const bookings = bookingsQuery.data ?? [];

  if (!clinic || shiftsQuery.isLoading || bookingsQuery.isLoading) {
    return <LoadingSpinner fullScreen label="Loading clinic dashboard..." />;
  }

  const activeShifts = shifts.filter((shift) => !shift.is_filled).length;
  const monthlySpend = bookings.filter((booking) => ['completed', 'checked_out'].includes(String(booking.status))).reduce((sum, booking) => {
    const rate = booking.shift?.hourly_rate ?? 0;
    return sum + rate * ASSUMED_SHIFT_HOURS;
  }, 0);
  const fillRate = shifts.length ? `${Math.round((shifts.filter((shift) => shift.is_filled).length / shifts.length) * 100)}%` : '0%';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Clinic dashboard</Text>
            <Text style={styles.title}>Welcome, {clinic.name}</Text>
            <Text style={styles.description}>Monitor current staffing activity and post new shifts quickly.</Text>
          </View>
          <Link href="/notifications" asChild>
            <Button variant="outline" size="sm" leftIcon={<Ionicons name="notifications-outline" size={18} color={theme.colors.primary} />} title="Alerts" />
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
  fabWrap: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: 96,
  },
});

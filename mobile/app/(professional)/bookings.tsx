import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookingCard } from '@/src/components/bookings/BookingCard';
import { RatingModal } from '@/src/components/bookings/RatingModal';
import { Button } from '@/src/components/common/Button';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { useBookings } from '@/src/hooks/useBookings';
import { useExistingRating } from '@/src/hooks/useRatings';
import { supabase } from '@/src/lib/supabase';
import type { Booking } from '@/src/types';

type RatingTarget = { bookingId: string; revieweeId: string; revieweeName: string };

function RatingButtonWrapper({
  booking,
  reviewerId,
}: {
  booking: Booking;
  reviewerId: string;
}) {
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const existingRating = useExistingRating({ bookingId: booking.id, reviewerId });

  if (existingRating.data) return <BookingCard booking={booking} />;

  return (
    <>
      <BookingCard
        booking={booking}
        onRate={() =>
          setRatingTarget({
            bookingId: booking.id,
            revieweeId: booking.clinic_id,
            revieweeName: booking.clinic?.name ?? 'Clinic',
          })
        }
      />
      {ratingTarget ? (
        <RatingModal
          visible={Boolean(ratingTarget)}
          bookingId={ratingTarget.bookingId}
          reviewerId={reviewerId}
          revieweeId={ratingTarget.revieweeId}
          revieweeName={ratingTarget.revieweeName}
          onClose={() => setRatingTarget(null)}
        />
      ) : null}
    </>
  );
}

export default function ProfessionalBookingsScreen() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const query = useBookings({ role: 'professional', entityId: profile?.id });

  const bookings = query.data ?? [];
  const visible = useMemo(
    () =>
      bookings.filter((booking) =>
        tab === 'upcoming'
          ? ['requested', 'confirmed', 'checked_in'].includes(String(booking.status))
          : ['completed', 'checked_out', 'cancelled', 'declined'].includes(String(booking.status)),
      ),
    [bookings, tab],
  );

  const updateStatus = async (booking: Booking, status: 'checked_in' | 'checked_out') => {
    try {
      const payload =
        status === 'checked_in'
          ? { status, check_in_time: new Date().toISOString() }
          : { status, check_out_time: new Date().toISOString() };
      const { error } = await supabase.from('bookings').update(payload).eq('id', booking.id);
      if (error) throw error;
      Alert.alert(status === 'checked_in' ? 'Checked in' : 'Checked out', 'Booking status updated.');
      query.refetch().catch(() => undefined);
    } catch (error) {
      Alert.alert('Unable to update booking', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const cancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel booking',
      'Are you sure you want to cancel this booking? This cannot be undone.',
      [
        { text: 'Keep booking', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled', cancellation_reason: 'Cancelled by professional' })
                .eq('id', booking.id);
              if (error) throw error;
              Alert.alert('Booking cancelled', 'Your booking has been cancelled.');
              query.refetch().catch(() => undefined);
            } catch (error) {
              Alert.alert('Unable to cancel', error instanceof Error ? error.message : 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const onRefresh = useCallback(() => { query.refetch().catch(() => undefined); }, [query]);

  if (!profile || query.isLoading) {
    return <LoadingSpinner fullScreen label="Loading bookings..." />;
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={query.isFetching && !query.isLoading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Your bookings</Text>
            <View style={styles.tabs}>
              <Button title="Upcoming" variant={tab === 'upcoming' ? 'primary' : 'outline'} size="sm" onPress={() => setTab('upcoming')} />
              <Button title="Past" variant={tab === 'past' ? 'primary' : 'outline'} size="sm" onPress={() => setTab('past')} />
            </View>
            {query.isError ? <ErrorState onRetry={onRefresh} /> : null}
          </View>
        }
        ListEmptyComponent={
          !query.isError ? (
            <EmptyState
              title="Nothing here yet"
              description="Your bookings will appear here once you apply or complete a shift."
            />
          ) : null
        }
        renderItem={({ item: booking }) => {
          const isPast = ['completed', 'checked_out'].includes(String(booking.status));
          if (isPast && profile) {
            return (
              <RatingButtonWrapper booking={booking} reviewerId={profile.id} />
            );
          }
          return (
            <BookingCard
              booking={booking}
              onCheckIn={booking.status === 'confirmed' ? () => updateStatus(booking, 'checked_in') : undefined}
              onCheckOut={booking.status === 'checked_in' ? () => updateStatus(booking, 'checked_out') : undefined}
              onCancel={tab === 'upcoming' ? () => cancelBooking(booking) : undefined}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  header: { gap: theme.spacing.md, marginBottom: theme.spacing.sm },
  title: { color: theme.colors.text, fontWeight: '800', fontSize: theme.typography.sizes.xxl },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm },
  separator: { height: theme.spacing.md },
});

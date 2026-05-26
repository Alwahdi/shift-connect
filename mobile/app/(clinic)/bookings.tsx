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

type Tab = 'active' | 'completed' | 'all';
const TABS: Tab[] = ['active', 'completed', 'all'];

type RatingTarget = { bookingId: string; revieweeId: string; revieweeName: string };

function RateBookingCard({
  booking,
  reviewerId,
  onDecline,
}: {
  booking: Booking;
  reviewerId: string;
  onDecline: (booking: Booking) => void;
}) {
  const [ratingTarget, setRatingTarget] = useState<RatingTarget | null>(null);
  const existingRating = useExistingRating({ bookingId: booking.id, reviewerId });

  return (
    <>
      <BookingCard
        booking={booking}
        onRate={
          !existingRating.data && ['completed', 'checked_out'].includes(String(booking.status))
            ? () =>
                setRatingTarget({
                  bookingId: booking.id,
                  revieweeId: booking.professional_id,
                  revieweeName: booking.professional?.full_name ?? 'Professional',
                })
            : undefined
        }
        onCancel={
          ['requested', 'confirmed'].includes(String(booking.status)) ? () => onDecline(booking) : undefined
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

export default function ClinicBookingsScreen() {
  const { clinic } = useAuth();
  const [tab, setTab] = useState<Tab>('active');
  const query = useBookings({ role: 'clinic', entityId: clinic?.id });

  const bookings = query.data ?? [];

  const visible = useMemo(() => {
    if (tab === 'active') return bookings.filter((b) => ['requested', 'confirmed', 'checked_in'].includes(String(b.status)));
    if (tab === 'completed') return bookings.filter((b) => ['completed', 'checked_out', 'cancelled', 'declined'].includes(String(b.status)));
    return bookings;
  }, [bookings, tab]);

  const declineBooking = (booking: Booking) => {
    Alert.alert(
      'Decline applicant',
      `Decline ${booking.professional?.full_name ?? 'this applicant'}? This cannot be undone.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('bookings')
                .update({ status: 'declined' })
                .eq('id', booking.id);
              if (error) throw error;
              Alert.alert('Applicant declined', 'The booking has been declined.');
              query.refetch().catch(() => undefined);
            } catch (error) {
              Alert.alert('Unable to decline', error instanceof Error ? error.message : 'Please try again.');
            }
          },
        },
      ],
    );
  };

  const onRefresh = useCallback(() => { query.refetch().catch(() => undefined); }, [query]);

  if (!clinic || query.isLoading) {
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
            <Text style={styles.title}>All bookings</Text>
            <Text style={styles.description}>Track every application, confirmed staff, and completed shift in one place.</Text>
            <View style={styles.tabs}>
              {TABS.map((t) => (
                <Button
                  key={t}
                  title={t[0].toUpperCase() + t.slice(1)}
                  variant={tab === t ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setTab(t)}
                />
              ))}
            </View>
            {query.isError ? <ErrorState onRetry={onRefresh} /> : null}
          </View>
        }
        ListEmptyComponent={
          !query.isError ? (
            <EmptyState
              title="No bookings found"
              description="Bookings will appear here once professionals apply to your shifts."
            />
          ) : null
        }
        renderItem={({ item: booking }) => (
          <RateBookingCard
            booking={booking}
            reviewerId={clinic.id}
            onDecline={declineBooking}
          />
        )}
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
  description: { color: theme.colors.muted, marginTop: 4, lineHeight: 20 },
  tabs: { flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' },
  separator: { height: theme.spacing.md },
});

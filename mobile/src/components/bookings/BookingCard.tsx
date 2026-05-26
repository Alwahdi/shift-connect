import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { theme } from '@/src/constants/theme';
import type { Booking } from '@/src/types';

const getBadgeVariant = (status: string | null | undefined) => {
  switch (status) {
    case 'confirmed':
    case 'completed':
      return 'success';
    case 'checked_in':
      return 'accent';
    case 'cancelled':
    case 'declined':
      return 'error';
    default:
      return 'warning';
  }
};

const formatTime = (iso: string | null) => {
  if (!iso) return null;
  try {
    return format(new Date(iso), 'MMM d, h:mm a');
  } catch {
    return null;
  }
};

export function BookingCard({
  booking,
  onCheckIn,
  onCheckOut,
  onCancel,
  onRate,
}: {
  booking: Booking;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onCancel?: () => void;
  onRate?: () => void;
}) {
  const dateLabel = booking.shift?.shift_date ? format(new Date(booking.shift.shift_date), 'EEE, MMM d') : 'Date unavailable';
  const checkInLabel = formatTime(booking.check_in_time);
  const checkOutLabel = formatTime(booking.check_out_time);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.grow}>
          <Text style={styles.title}>{booking.shift?.title ?? 'Shift booking'}</Text>
          <Text style={styles.subtitle}>{booking.clinic?.name ?? booking.professional?.full_name ?? 'Shift-Connect'}</Text>
        </View>
        <Badge label={(booking.status ?? 'pending').replace('_', ' ')} variant={getBadgeVariant(booking.status)} />
      </View>

      <Text style={styles.meta}>{dateLabel} • {booking.shift?.start_time?.slice(0, 5)} – {booking.shift?.end_time?.slice(0, 5)}</Text>

      {checkInLabel ? <Text style={styles.timeInfo}>✔ Checked in: {checkInLabel}</Text> : null}
      {checkOutLabel ? <Text style={styles.timeInfo}>✔ Checked out: {checkOutLabel}</Text> : null}

      <View style={styles.actions}>
        {booking.status === 'confirmed' ? <Button title="Check In" variant="secondary" onPress={onCheckIn} /> : null}
        {booking.status === 'checked_in' ? <Button title="Check Out" onPress={onCheckOut} /> : null}
        {onCancel && ['requested', 'confirmed'].includes(String(booking.status)) ? (
          <Button title="Cancel" variant="danger" onPress={onCancel} />
        ) : null}
        {onRate && ['completed', 'checked_out'].includes(String(booking.status)) ? (
          <Button title="Rate" variant="outline" onPress={onRate} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  grow: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: theme.typography.sizes.md,
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 2,
  },
  meta: {
    color: theme.colors.text,
  },
  timeInfo: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
});

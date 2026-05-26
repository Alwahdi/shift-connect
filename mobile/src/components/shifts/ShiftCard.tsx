import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/src/components/common/Badge';
import { Card } from '@/src/components/common/Card';
import { theme } from '@/src/constants/theme';
import type { Shift } from '@/src/types';

const formatShiftDate = (date: string) => {
  try {
    return format(new Date(date), 'EEE, MMM d');
  } catch {
    return date;
  }
};

export function ShiftCard({ shift, clinicName, onPress }: { shift: Shift; clinicName?: string; onPress?: () => void }) {
  const statusLabel = shift.is_filled ? 'Filled' : shift.is_urgent ? 'Urgent' : 'Open';
  const statusVariant = shift.is_filled ? 'muted' : shift.is_urgent ? 'warning' : 'success';

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.grow}>
            <Text style={styles.title}>{shift.title}</Text>
            <Text style={styles.subtitle}>{clinicName ?? shift.role_required}</Text>
          </View>
          <Badge label={statusLabel} variant={statusVariant} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.accent} />
            <Text style={styles.metaText}>{formatShiftDate(shift.shift_date)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.accent} />
            <Text style={styles.metaText}>{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={16} color={theme.colors.muted} />
            <Text style={styles.metaText}>{shift.role_required}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={16} color={theme.colors.success} />
            <Text style={styles.rate}>${shift.hourly_rate}/hr</Text>
          </View>
        </View>

        {shift.location_address ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={theme.colors.muted} />
            <Text numberOfLines={1} style={styles.metaText}>{shift.location_address}</Text>
          </View>
        ) : null}

        {typeof shift.applicantCount === 'number' ? <Text style={styles.footer}>{shift.applicantCount} applicants</Text> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  grow: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    maxWidth: '100%',
  },
  metaText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
  },
  rate: {
    color: theme.colors.success,
    fontWeight: '700',
  },
  footer: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
  },
});

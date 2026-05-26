import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/common/Card';
import { theme } from '@/src/constants/theme';

const ICON_BACKGROUND_ALPHA = '15';

export function StatsCard({ title, value, icon, tint }: { title: string; value: string; icon: keyof typeof Ionicons.glyphMap; tint?: string }) {
  const color = tint ?? theme.colors.primary;
  const iconWrapStyle = useMemo(() => ({ backgroundColor: `${color}${ICON_BACKGROUND_ALPHA}` }), [color]);

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, iconWrapStyle]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '47%',
    gap: theme.spacing.sm,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
  },
});

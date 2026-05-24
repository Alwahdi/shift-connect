import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Card } from '@/src/components/common/Card';
import { theme } from '@/src/constants/theme';

type Props = {
  name: string;
  avatarUrl?: string | null;
  preview: string;
  timestamp?: string | null;
  unreadCount?: number;
  onPress: () => void;
};

export function ConversationItem({ name, avatarUrl, preview, timestamp, unreadCount, onPress }: Props) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <Avatar uri={avatarUrl} name={name} />
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.time}>{timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : ''}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
        </View>
        {unreadCount ? <Badge label={String(unreadCount)} variant="primary" /> : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontWeight: '700',
    flex: 1,
  },
  time: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
  },
  preview: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.sm,
  },
});

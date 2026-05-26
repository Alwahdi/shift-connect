import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/components/common/Button';
import { theme } from '@/src/constants/theme';

type Props = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'We ran into an issue loading this content. Please try again.',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle-outline" size={28} color={theme.colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry ? (
        <Button title="Try again" variant="outline" onPress={onRetry} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: '#FEEBEC',
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEEBEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});

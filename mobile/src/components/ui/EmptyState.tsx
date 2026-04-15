import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, typography } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={[typography.h4, { color: colors.text, textAlign: 'center', marginTop: spacing.base }]}>
        {title}
      </Text>
      {description && (
        <Text
          style={[
            typography.bodySm,
            { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, maxWidth: 280 },
          ]}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.xl }}>
          <Button title={actionLabel} onPress={onAction} size="sm" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

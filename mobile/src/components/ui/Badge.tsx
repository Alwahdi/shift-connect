import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, borderRadius, typography, colors as themeColors } from '@/constants/theme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'accent' | 'primary';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'sm',
  icon,
}) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: colors.successLight, text: colors.success };
      case 'warning': return { bg: colors.warningLight, text: colors.warning };
      case 'destructive': return { bg: colors.destructiveLight, text: colors.destructive };
      case 'accent': return { bg: colors.accentLight, text: colors.accent };
      case 'primary': return { bg: colors.primaryLight, text: colors.primary };
      default: return { bg: colors.surface, text: colors.textSecondary };
    }
  };

  const badgeColors = getColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 2 : spacing.xs,
        },
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          isSmall ? typography.caption : typography.captionMedium,
          { color: badgeColors.text, fontWeight: '600' },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
});

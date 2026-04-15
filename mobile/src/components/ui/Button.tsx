import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, borderRadius, typography, TOUCH_TARGET_SIZE, colors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors: theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = (): string => {
    if (disabled) return theme.border;
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.primaryLight;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'destructive': return theme.destructive;
      default: return theme.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.textTertiary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return theme.primary;
      case 'outline': return theme.primary;
      case 'ghost': return theme.text;
      case 'destructive': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'outline') return disabled ? theme.border : theme.primary;
    return 'transparent';
  };

  const sizeStyles: Record<ButtonSize, { height: number; paddingHorizontal: number; text: TextStyle }> = {
    sm: { height: 36, paddingHorizontal: spacing.md, text: typography.buttonSm },
    md: { height: TOUCH_TARGET_SIZE, paddingHorizontal: spacing.lg, text: typography.button },
    lg: { height: 52, paddingHorizontal: spacing.xl, text: typography.button },
  };

  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        variant === 'outline' && styles.outlined,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              sizeStyle.text,
              { color: getTextColor() },
              icon && { marginLeft: spacing.sm },
              iconRight && { marginRight: spacing.sm },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {iconRight && <>{iconRight}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
});

import React, { useRef } from 'react';
import {
  Pressable, Text, StyleSheet, ActivityIndicator, View,
  Animated, ViewStyle, TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing, Typography, TouchTargets } from '@/config/theme';

interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress, title, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon, fullWidth = false, style, textStyle,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePress = () => {
    if (!isDisabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary': return { backgroundColor: isDisabled ? colors.border : colors.primary };
      case 'secondary': return { backgroundColor: isDisabled ? colors.border : colors.surface };
      case 'outline': return { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: isDisabled ? colors.border : colors.primary };
      case 'ghost': return { backgroundColor: 'transparent' };
      case 'destructive': return { backgroundColor: isDisabled ? colors.border : colors.error };
      default: return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = (): string => {
    if (isDisabled) return colors.textTertiary;
    switch (variant) {
      case 'primary': case 'destructive': return '#FFFFFF';
      case 'secondary': return colors.text;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return '#FFFFFF';
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 16, minHeight: TouchTargets.min };
      case 'md': return { paddingVertical: 12, paddingHorizontal: 24, minHeight: TouchTargets.comfortable };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 32, minHeight: TouchTargets.large };
      default: return { paddingVertical: 12, paddingHorizontal: 24, minHeight: TouchTargets.comfortable };
    }
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'sm': return Typography.sizes.sm;
      case 'md': return Typography.sizes.base;
      case 'lg': return Typography.sizes.lg;
      default: return Typography.sizes.base;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.base,
          getVariantStyle(),
          getSizeStyle(),
          fullWidth && { width: '100%' },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  text: {
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
});

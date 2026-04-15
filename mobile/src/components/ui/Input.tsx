import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';
import { spacing, borderRadius, typography } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  isPassword,
  style,
  ...props
}, ref) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? colors.destructive
    : isFocused
    ? colors.inputFocusBorder
    : colors.inputBorder;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[typography.label, { color: colors.text, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.inputBackground,
            borderColor,
          },
          isFocused && styles.focused,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.textTertiary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            typography.body,
            { color: colors.text },
            leftIcon && { paddingLeft: 0 },
            (rightIcon || isPassword) && { paddingRight: 0 },
            style,
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={!onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[typography.caption, { color: colors.destructive, marginTop: spacing.xs }]}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text style={[typography.caption, { color: colors.textTertiary, marginTop: spacing.xs }]}>
          {hint}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  focused: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  leftIcon: {
    marginLeft: spacing.md,
  },
  rightIcon: {
    paddingHorizontal: spacing.md,
  },
});

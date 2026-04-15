import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export default function Input({ label, error, leftIcon, rightIcon, containerStyle, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, focused && styles.focused, error && styles.errorBorder]}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, leftIcon && { paddingLeft: 0 }, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          {...props}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.base },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.text, marginBottom: spacing.xs },
  inputWrapper: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.DEFAULT, backgroundColor: colors.white, minHeight: 48,
  },
  focused: { borderColor: colors.primary, borderWidth: 1.5 },
  errorBorder: { borderColor: colors.error },
  input: { flex: 1, fontSize: typography.sizes.base, color: colors.text, paddingHorizontal: spacing.base, paddingVertical: spacing.md },
  icon: { paddingHorizontal: spacing.md },
  error: { fontSize: typography.sizes.xs, color: colors.error, marginTop: spacing.xs },
});

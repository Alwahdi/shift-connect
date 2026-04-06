/**
 * Badge component for React Native.
 */
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; fg: string }> = {
  default: { bg: "#663C6D", fg: "#FFFFFF" },
  secondary: { bg: "#F1F5F9", fg: "#64748B" },
  success: { bg: "#2D9A6E15", fg: "#2D9A6E" },
  warning: { bg: "#F59E0B15", fg: "#F59E0B" },
  destructive: { bg: "#DC262615", fg: "#DC2626" },
  outline: { bg: "transparent", fg: "#2D1F33" },
};

export function Badge({ variant = "default", children }: BadgeProps) {
  const { bg, fg } = VARIANT_STYLES[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        variant === "outline" && styles.outline,
      ]}
    >
      <Text style={[styles.text, { color: fg }]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: "flex-start",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});

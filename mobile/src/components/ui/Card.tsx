import React from "react";
import { View, Pressable, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, borderRadius, shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export default function Card({ children, onPress, style, noPadding }: CardProps) {
  const content = (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, ...shadows.sm },
  padding: { padding: spacing.base },
});

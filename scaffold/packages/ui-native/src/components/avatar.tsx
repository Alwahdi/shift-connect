/**
 * Avatar component using expo-image with initials fallback.
 */
import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Image } from "expo-image";

export interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ uri, name, size = 44, style }: AvatarProps) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: size, height: size, borderRadius }, style]}
        contentFit="cover"
        placeholder={{ blurhash: "LBF~L^~p00x]00R*9F-;00NG%M" }}
        transition={200}
        accessibilityLabel={name ? `Avatar of ${name}` : "Avatar"}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius },
        style,
      ]}
      accessibilityLabel={name ? `Avatar of ${name}` : "Avatar"}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#663C6D20",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#663C6D",
    fontWeight: "700",
  },
});

import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, typography } from "@/constants/theme";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showVerification?: boolean;
}

const SIZES = { sm: 32, md: 44, lg: 64, xl: 88 };

export default function Avatar({ uri, name, size = "md", showVerification }: AvatarProps) {
  const s = SIZES[size];
  const initials = name ? name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() : "?";
  const fontSize = s * 0.35;

  return (
    <View style={{ width: s, height: s }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: s, height: s, borderRadius: s / 2 }} />
      ) : (
        <View style={[styles.placeholder, { width: s, height: s, borderRadius: s / 2 }]}>
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
      {showVerification && (
        <View style={styles.verifyBadge}>
          <MaterialCommunityIcons name="check-decagram" size={s * 0.28} color={colors.success} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { backgroundColor: colors.primaryBg, justifyContent: "center", alignItems: "center" },
  initials: { color: colors.primary, fontWeight: typography.weights.semibold },
  verifyBadge: { position: "absolute", bottom: -2, right: -2, backgroundColor: colors.white, borderRadius: 10, padding: 1 },
});

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, typography } from "@/constants/theme";

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.white} />
      <Text style={styles.text}>SyndeoCare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.primary },
  text: { color: colors.white, fontSize: typography.sizes["2xl"], fontWeight: typography.weights.bold, marginTop: 16 },
});

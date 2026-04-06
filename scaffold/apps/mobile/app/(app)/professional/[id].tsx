/**
 * View professional profile (read-only).
 */
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function ProfessionalProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const { data: professional, isLoading } = useQuery({
    queryKey: ["professional", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!professional) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: themeColors.mutedForeground }}>Professional not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {(professional.full_name ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: themeColors.foreground }]}>
          {professional.full_name}
        </Text>
        <Text style={[styles.email, { color: themeColors.mutedForeground }]}>
          {professional.email}
        </Text>
      </View>

      {/* Info */}
      <View style={[styles.section, { backgroundColor: themeColors.card }]}>
        {professional.phone && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>📞 Phone</Text>
            <Text style={[styles.infoValue, { color: themeColors.foreground }]}>{professional.phone}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>✅ Status</Text>
          <Text style={[styles.infoValue, { color: themeColors.foreground }]}>
            {professional.verification_status}
          </Text>
        </View>
      </View>

      {/* Message button */}
      <Pressable
        style={[styles.messageBtn, { backgroundColor: colors.primary }]}
        onPress={() => {
          // In production, find or create conversation then navigate
          Alert.alert("Message", "Conversation feature");
        }}
        accessibilityRole="button"
      >
        <Text style={styles.messageBtnText}>💬 Send Message</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing["3xl"] },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarSection: { alignItems: "center", gap: spacing.sm },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: typography.fontSize["4xl"], fontWeight: typography.fontWeight.bold, color: colors.primaryForeground },
  name: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold },
  email: { fontSize: typography.fontSize.sm },
  section: { padding: spacing.md, borderRadius: borderRadius.lg, gap: spacing.sm },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 36 },
  infoLabel: { fontSize: typography.fontSize.sm },
  infoValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
  messageBtn: {
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  messageBtnText: { color: colors.primaryForeground, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
});

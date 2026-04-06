/**
 * Admin system configuration screen.
 *
 * Management sections for job roles, certifications, and document types.
 */
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

function ConfigSection({
  emoji,
  title,
  description,
  onPress,
}: {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
}) {
  const { themeColors } = useTheme();

  return (
    <Pressable
      style={[styles.section, { backgroundColor: themeColors.card }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.sectionEmoji}>{emoji}</Text>
      <View style={styles.sectionContent}>
        <Text style={[styles.sectionTitle, { color: themeColors.foreground }]}>
          {title}
        </Text>
        <Text
          style={[styles.sectionDesc, { color: themeColors.mutedForeground }]}
        >
          {description}
        </Text>
      </View>
      <Text style={[styles.arrow, { color: themeColors.mutedForeground }]}>
        ›
      </Text>
    </Pressable>
  );
}

export default function AdminConfigScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <ConfigSection
        emoji="💼"
        title="Job Roles"
        description="Manage available healthcare job roles and specialties"
        onPress={() => {}}
      />

      <ConfigSection
        emoji="🎓"
        title="Certifications"
        description="Configure required certification types for professionals"
        onPress={() => {}}
      />

      <ConfigSection
        emoji="📋"
        title="Document Types"
        description="Define document requirements for verification"
        onPress={() => {}}
      />

      <ConfigSection
        emoji="📍"
        title="Service Areas"
        description="Configure geographic service areas and regions"
        onPress={() => {}}
      />

      <ConfigSection
        emoji="💰"
        title="Pay Rates"
        description="Set minimum and maximum hourly rate ranges"
        onPress={() => {}}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    minHeight: 72,
  },
  sectionEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: "center",
  },
  sectionContent: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionDesc: {
    fontSize: typography.fontSize.sm,
  },
  arrow: {
    fontSize: typography.fontSize.xl,
  },
});

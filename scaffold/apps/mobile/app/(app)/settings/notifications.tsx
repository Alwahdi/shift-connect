/**
 * Notification settings screen.
 *
 * Toggle switches for push and email notifications.
 */
import { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [shiftAlerts, setShiftAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.content}>
        <Text
          style={[styles.heading, { color: themeColors.foreground }]}
          accessibilityRole="header"
        >
          {t("settings.notifications")}
        </Text>

        <View
          style={[styles.section, { backgroundColor: themeColors.card }]}
        >
          <View
            style={[styles.row, { borderBottomColor: themeColors.border }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: themeColors.foreground }]}>
                Push Notifications
              </Text>
              <Text
                style={[
                  styles.rowDescription,
                  { color: themeColors.mutedForeground },
                ]}
              >
                Receive push notifications on your device
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: themeColors.border, true: colors.primary }}
              thumbColor={colors.primaryForeground}
              accessibilityLabel="Toggle push notifications"
              accessibilityRole="switch"
            />
          </View>

          <View
            style={[styles.row, { borderBottomColor: themeColors.border }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: themeColors.foreground }]}>
                Email Notifications
              </Text>
              <Text
                style={[
                  styles.rowDescription,
                  { color: themeColors.mutedForeground },
                ]}
              >
                Receive email updates and summaries
              </Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: themeColors.border, true: colors.primary }}
              thumbColor={colors.primaryForeground}
              accessibilityLabel="Toggle email notifications"
              accessibilityRole="switch"
            />
          </View>

          <View
            style={[styles.row, { borderBottomColor: themeColors.border }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: themeColors.foreground }]}>
                Shift Alerts
              </Text>
              <Text
                style={[
                  styles.rowDescription,
                  { color: themeColors.mutedForeground },
                ]}
              >
                Get notified about new matching shifts
              </Text>
            </View>
            <Switch
              value={shiftAlerts}
              onValueChange={setShiftAlerts}
              trackColor={{ false: themeColors.border, true: colors.primary }}
              thumbColor={colors.primaryForeground}
              accessibilityLabel="Toggle shift alerts"
              accessibilityRole="switch"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: themeColors.foreground }]}>
                Message Alerts
              </Text>
              <Text
                style={[
                  styles.rowDescription,
                  { color: themeColors.mutedForeground },
                ]}
              >
                Get notified about new messages
              </Text>
            </View>
            <Switch
              value={messageAlerts}
              onValueChange={setMessageAlerts}
              trackColor={{ false: themeColors.border, true: colors.primary }}
              thumbColor={colors.primaryForeground}
              accessibilityLabel="Toggle message alerts"
              accessibilityRole="switch"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  heading: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: TOUCH_TARGET_SIZE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  rowDescription: {
    fontSize: typography.fontSize.sm,
  },
});

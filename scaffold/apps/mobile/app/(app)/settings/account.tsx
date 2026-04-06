/**
 * Account settings screen.
 *
 * Change password form and delete account with confirmation.
 */
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function AccountSettingsScreen() {
  const { t } = useTranslation();
  const { updatePassword, signOut } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(t("common.error"), "Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), "Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t("common.error"), "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(newPassword);
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), error.message);
    } else {
      Alert.alert("Success", "Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.functions.invoke("delete-account");
            setLoading(false);

            if (error) {
              Alert.alert(t("common.error"), "Failed to delete account. Please try again.");
            } else {
              await signOut();
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[styles.heading, { color: themeColors.foreground }]}
          accessibilityRole="header"
        >
          {t("settings.account")}
        </Text>

        {/* Change Password Section */}
        <View
          style={[styles.section, { backgroundColor: themeColors.card }]}
        >
          <Text
            style={[styles.sectionTitle, { color: themeColors.foreground }]}
          >
            Change Password
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.foreground }]}>
              New Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: themeColors.border,
                  color: themeColors.foreground,
                  backgroundColor: themeColors.background,
                },
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={themeColors.mutedForeground}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="New password"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: themeColors.foreground }]}>
              Confirm Password
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: themeColors.border,
                  color: themeColors.foreground,
                  backgroundColor: themeColors.background,
                },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={themeColors.mutedForeground}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              accessibilityLabel="Confirm new password"
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Update password"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.buttonText}>
              {loading ? t("common.loading") : "Update Password"}
            </Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View
          style={[styles.section, { backgroundColor: themeColors.card }]}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.destructive }]}
          >
            Danger Zone
          </Text>
          <Text
            style={[
              styles.dangerDescription,
              { color: themeColors.mutedForeground },
            ]}
          >
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </Text>
          <Pressable
            style={[styles.deleteButton, { borderColor: colors.destructive }]}
            onPress={handleDeleteAccount}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Delete account"
          >
            <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>
              Delete Account
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
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
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  input: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  button: {
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  dangerDescription: {
    fontSize: typography.fontSize.sm,
  },
  deleteButton: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});

/**
 * Signup screen.
 *
 * Registration with email, password, and role selection.
 */
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useAuth, type AppRole } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const { themeColors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password || !confirmPassword || !role) {
      Alert.alert(t("common.error"), "Please fill in all fields and select a role.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert(t("common.error"), "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, role);
    setLoading(false);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("common.error"), error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: "/(auth)/verify-otp", params: { email: email.trim() } });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={[styles.heading, { color: themeColors.foreground }]}
            accessibilityRole="header"
          >
            {t("auth.createAccount")}
          </Text>

          {/* Role selection */}
          <Text style={[styles.label, { color: themeColors.foreground }]}>
            {t("auth.selectRole")}
          </Text>
          <View style={styles.roleRow}>
            {(["professional", "clinic"] as AppRole[]).map((r) => (
              <Pressable
                key={r}
                style={[
                  styles.roleCard,
                  {
                    borderColor: role === r ? colors.primary : themeColors.border,
                    backgroundColor: role === r ? colors.primary + "10" : themeColors.card,
                  },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRole(r);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: role === r }}
                accessibilityLabel={t(`auth.${r}`)}
              >
                <Text style={styles.roleEmoji}>
                  {r === "professional" ? "🩺" : "🏥"}
                </Text>
                <Text
                  style={[
                    styles.roleLabel,
                    { color: role === r ? colors.primary : themeColors.foreground },
                  ]}
                >
                  {t(`auth.${r}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fields */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: themeColors.foreground }]}>
              {t("auth.email")}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.foreground, backgroundColor: themeColors.card }]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={themeColors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: themeColors.foreground }]}>
              {t("auth.password")}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.foreground, backgroundColor: themeColors.card }]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={themeColors.mutedForeground}
              secureTextEntry
              textContentType="newPassword"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: themeColors.foreground }]}>
              {t("auth.confirmPassword")}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: themeColors.border, color: themeColors.foreground, backgroundColor: themeColors.card }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={themeColors.mutedForeground}
              secureTextEntry
              textContentType="newPassword"
            />
          </View>

          <Pressable
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              (loading || !role) && styles.buttonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading || !role}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {loading ? t("common.loading") : t("auth.createAccount")}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: themeColors.mutedForeground }]}>
              {t("auth.alreadyHaveAccount")}{" "}
            </Text>
            <Link href="/(auth)" asChild>
              <Pressable accessibilityRole="link">
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  {t("auth.login")}
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  heading: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
  },
  roleRow: { flexDirection: "row", gap: spacing.md },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 100,
    justifyContent: "center",
  },
  roleEmoji: { fontSize: 32 },
  roleLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, textAlign: "center" },
  field: { gap: spacing.xs },
  label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
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
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryForeground, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.md },
  footerText: { fontSize: typography.fontSize.sm },
  linkText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
});

/**
 * Login screen.
 *
 * Email + password authentication with links to signup and password reset.
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
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { themeColors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("common.error"), "Please fill in all fields.");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("common.error"), error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.brand, { color: colors.primary }]}>
              SyndeoCare
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.mutedForeground }]}
            >
              Healthcare Staffing Platform
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                {t("auth.email")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: themeColors.border,
                    color: themeColors.foreground,
                    backgroundColor: themeColors.card,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={themeColors.mutedForeground}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                accessibilityLabel={t("auth.email")}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                {t("auth.password")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: themeColors.border,
                    color: themeColors.foreground,
                    backgroundColor: themeColors.card,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={themeColors.mutedForeground}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                accessibilityLabel={t("auth.password")}
              />
            </View>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: colors.primary },
                loading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t("auth.login")}
            >
              <Text style={styles.buttonText}>
                {loading ? t("common.loading") : t("auth.login")}
              </Text>
            </Pressable>

            <Pressable
              style={styles.forgotLink}
              onPress={() =>
                Alert.alert("Reset Password", "Enter your email to reset.")
              }
              accessibilityRole="link"
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {t("auth.forgotPassword")}
              </Text>
            </Pressable>
          </View>

          {/* Signup link */}
          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: themeColors.mutedForeground }]}
            >
              {t("auth.dontHaveAccount")}{" "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable accessibilityRole="link">
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  {t("auth.signup")}
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
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: { alignItems: "center", marginBottom: spacing["2xl"] },
  brand: { fontSize: typography.fontSize["4xl"], fontWeight: typography.fontWeight.bold },
  subtitle: { fontSize: typography.fontSize.base, marginTop: spacing.xs },
  form: { gap: spacing.md },
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
  buttonText: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  forgotLink: { alignSelf: "center", paddingVertical: spacing.sm },
  linkText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: { fontSize: typography.fontSize.sm },
});

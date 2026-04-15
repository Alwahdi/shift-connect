import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignIn() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Toast.show({ type: "error", text1: t("auth.errors.loginFailed"), text2: error.message });
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="medical-bag" size={40} color={colors.white} />
            </View>
            <Text style={styles.brand}>SyndeoCare</Text>
          </View>

          {/* Header */}
          <Text style={styles.title}>{t("auth.welcomeBack")}</Text>
          <Text style={styles.subtitle}>{t("auth.signInSubtitle")}</Text>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t("auth.email")}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color={colors.textTertiary} />}
            />
            <Input
              label={t("auth.password")}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color={colors.textTertiary} />}
              rightIcon={
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textTertiary} />
                </Pressable>
              }
            />

            <Button onPress={handleSignIn} loading={loading} fullWidth style={{ marginTop: spacing.sm }}>
              {t("auth.signIn")}
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("auth.noAccount")} </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Pressable><Text style={styles.link}>{t("auth.signUp")}</Text></Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.xl },
  logoSection: { alignItems: "center", marginTop: spacing["2xl"], marginBottom: spacing.xl },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  brand: { fontSize: typography.sizes["2xl"], fontWeight: typography.weights.bold, color: colors.primary, marginTop: spacing.md },
  title: { fontSize: typography.sizes["3xl"], fontWeight: typography.weights.bold, color: colors.text, textAlign: "center" },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  form: { gap: spacing.xs },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.textSecondary, fontSize: typography.sizes.base },
  link: { color: colors.primary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.base },
});

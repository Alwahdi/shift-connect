import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, borderRadius, typography, shadows } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type Role = "professional" | "clinic";

export default function SignUp() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!role || !name.trim() || !email.trim() || password.length < 6) return;
    setLoading(true);
    const metadata = role === "professional" ? { full_name: name.trim() } : { organization_name: name.trim(), contact_name: name.trim() };
    const { error } = await signUp(email.trim(), password, role, metadata);
    setLoading(false);
    if (error) {
      Toast.show({ type: "error", text1: t("auth.errors.signupFailed"), text2: error.message });
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{t("auth.joinSyndeoCare")}</Text>
          <Text style={styles.subtitle}>{t("auth.selectRole")}</Text>

          {/* Role Selection */}
          <View style={styles.roleRow}>
            <Pressable style={[styles.roleCard, role === "professional" && styles.roleSelected]} onPress={() => setRole("professional")}>
              <MaterialCommunityIcons name="stethoscope" size={32} color={role === "professional" ? colors.primary : colors.textSecondary} />
              <Text style={[styles.roleTitle, role === "professional" && { color: colors.primary }]}>{t("auth.imProfessional")}</Text>
              <Text style={styles.roleDesc}>{t("auth.professionalDesc")}</Text>
            </Pressable>
            <Pressable style={[styles.roleCard, role === "clinic" && styles.roleSelected]} onPress={() => setRole("clinic")}>
              <MaterialCommunityIcons name="hospital-building" size={32} color={role === "clinic" ? colors.primary : colors.textSecondary} />
              <Text style={[styles.roleTitle, role === "clinic" && { color: colors.primary }]}>{t("auth.imClinic")}</Text>
              <Text style={styles.roleDesc}>{t("auth.clinicDesc")}</Text>
            </Pressable>
          </View>

          {role && (
            <View style={styles.form}>
              <Input
                label={role === "professional" ? t("auth.fullName") : t("auth.organizationName")}
                value={name} onChangeText={setName} placeholder={role === "professional" ? "John Doe" : "Your Clinic Name"}
                leftIcon={<MaterialCommunityIcons name="account-outline" size={20} color={colors.textTertiary} />}
              />
              <Input
                label={t("auth.email")} value={email} onChangeText={setEmail} placeholder="you@example.com"
                keyboardType="email-address" autoCapitalize="none"
                leftIcon={<MaterialCommunityIcons name="email-outline" size={20} color={colors.textTertiary} />}
              />
              <Input
                label={t("auth.password")} value={password} onChangeText={setPassword} placeholder="••••••••"
                secureTextEntry={!showPassword}
                leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color={colors.textTertiary} />}
                rightIcon={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textTertiary} />
                  </Pressable>
                }
              />
              <Text style={styles.hint}>{t("auth.passwordHint")}</Text>
              <Button onPress={handleSignUp} loading={loading} fullWidth style={{ marginTop: spacing.md }}>{t("auth.createAccount")}</Button>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("auth.hasAccount")} </Text>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable><Text style={styles.link}>{t("auth.signIn")}</Text></Pressable>
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
  title: { fontSize: typography.sizes["3xl"], fontWeight: typography.weights.bold, color: colors.text, textAlign: "center", marginTop: spacing.xl },
  subtitle: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
  roleRow: { gap: spacing.md, marginBottom: spacing.xl },
  roleCard: {
    padding: spacing.lg, borderRadius: borderRadius.xl, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.border,
    alignItems: "center", gap: spacing.sm, ...shadows.sm,
  },
  roleSelected: { borderColor: colors.primary, backgroundColor: colors.primaryBg },
  roleTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text, textAlign: "center" },
  roleDesc: { fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: "center" },
  form: { gap: spacing.xs },
  hint: { fontSize: typography.sizes.xs, color: colors.textTertiary },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: spacing.xl },
  footerText: { color: colors.textSecondary, fontSize: typography.sizes.base },
  link: { color: colors.primary, fontWeight: typography.weights.semibold, fontSize: typography.sizes.base },
});

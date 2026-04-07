/**
 * OTP verification screen.
 *
 * 6-digit code input with auto-advance, resend timer, and haptic feedback.
 */
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  TOUCH_TARGET_SIZE,
} from "@/constants/theme";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (next.every((d) => d !== "")) {
      verifyCode(next.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.functions.invoke("verify-otp", {
        body: { email, code },
      });
      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(app)/(tabs)");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t("common.error"), t("auth.invalidOtp"));
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const supabase = getSupabaseClient();
      await supabase.functions.invoke("send-otp-email", {
        body: { email },
      });
      setResendTimer(RESEND_COOLDOWN);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert(t("common.error"), t("common.error"));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.heading, { color: themeColors.foreground }]}>
          {t("auth.enterOtp")}
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.mutedForeground }]}>
          {t("auth.otpSent", { email })}
        </Text>

        {/* OTP Inputs */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpInput,
                {
                  borderColor: digit ? colors.primary : themeColors.border,
                  color: themeColors.foreground,
                  backgroundColor: themeColors.card,
                },
              ]}
              value={digit}
              onChangeText={(v) => handleChange(v, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textContentType="oneTimeCode"
              selectTextOnFocus
              accessibilityLabel={`Digit ${i + 1}`}
            />
          ))}
        </View>

        {/* Resend */}
        <Pressable
          onPress={resendOtp}
          disabled={resendTimer > 0}
          style={styles.resendButton}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.resendText,
              { color: resendTimer > 0 ? themeColors.mutedForeground : colors.primary },
            ]}
          >
            {resendTimer > 0
              ? t("auth.resendIn", { seconds: resendTimer })
              : t("auth.resendCode")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  heading: { fontSize: typography.fontSize["2xl"], fontWeight: typography.fontWeight.bold, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.fontSize.base, textAlign: "center", marginBottom: spacing["2xl"] },
  otpRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    textAlign: "center",
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  resendButton: { minHeight: TOUCH_TARGET_SIZE, justifyContent: "center" },
  resendText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
});

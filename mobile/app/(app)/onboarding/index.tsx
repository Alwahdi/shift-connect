import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const STEPS_PRO = ["personalInfo", "qualificationsStep", "documentsStep", "complete"];
const STEPS_CLINIC = ["organizationInfo", "locationStep", "documentsStep", "complete"];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, userRole, refreshOnboardingStatus } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Professional fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  // Clinic fields
  const [clinicName, setClinicName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const steps = userRole === "professional" ? STEPS_PRO : STEPS_CLINIC;
  const isLast = step === steps.length - 1;
  const isComplete = step === steps.length - 1;

  const handleNext = async () => {
    if (isComplete) {
      // Save and complete
      setSaving(true);
      try {
        if (userRole === "professional") {
          await supabase.from("profiles").update({ full_name: fullName, phone, bio, hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null, onboarding_completed: true }).eq("user_id", user!.id);
        } else {
          await supabase.from("clinics").update({ name: clinicName, phone, description, address, onboarding_completed: true }).eq("user_id", user!.id);
        }
        await refreshOnboardingStatus();
        router.replace("/(app)/(tabs)/home");
      } catch (e: any) {
        Toast.show({ type: "error", text1: "Error", text2: e.message });
      } finally { setSaving(false); }
      return;
    }
    setStep(s => s + 1);
  };

  const renderStep = () => {
    if (userRole === "professional") {
      switch (step) {
        case 0: return (
          <>
            <Text style={styles.stepTitle}>{t("onboarding.personalInfo")}</Text>
            <Text style={styles.stepDesc}>{t("onboarding.letsStart")}</Text>
            <Input label={t("auth.fullName")} value={fullName} onChangeText={setFullName} placeholder="Your full name" />
            <Input label={t("profile.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+966..." />
            <Input label={t("profile.bio")} value={bio} onChangeText={setBio} multiline numberOfLines={3} placeholder="Tell us about yourself..." style={{ height: 80, textAlignVertical: "top" }} />
          </>
        );
        case 1: return (
          <>
            <Text style={styles.stepTitle}>{t("onboarding.qualificationsStep")}</Text>
            <Input label={`${t("profile.hourlyRate")} ($)`} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder="50" />
            <Text style={styles.hint}>You can add specialties and qualifications from your profile later.</Text>
          </>
        );
        case 2: return (
          <>
            <Text style={styles.stepTitle}>{t("onboarding.documentsStep")}</Text>
            <Text style={styles.hint}>Document uploads will be available from your profile. You can skip this for now and upload later.</Text>
          </>
        );
        case 3: return (
          <>
            <View style={styles.completeIcon}><MaterialCommunityIcons name="check-circle" size={72} color={colors.success} /></View>
            <Text style={styles.completeTitle}>{t("onboarding.youreAllSet")}</Text>
            <Text style={styles.completeDesc}>{t("onboarding.profileReview")}</Text>
          </>
        );
      }
    } else {
      switch (step) {
        case 0: return (
          <>
            <Text style={styles.stepTitle}>{t("onboarding.organizationInfo")}</Text>
            <Input label={t("profile.clinicName")} value={clinicName} onChangeText={setClinicName} placeholder="Your clinic name" />
            <Input label={t("profile.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+966..." />
            <Input label={t("profile.description")} value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="About your facility..." style={{ height: 80, textAlignVertical: "top" }} />
          </>
        );
        case 1: return (
          <>
            <Text style={styles.stepTitle}>{t("onboarding.locationStep")}</Text>
            <Input label={t("profile.address")} value={address} onChangeText={setAddress} placeholder="Full address" />
          </>
        );
        case 2: return (
          <>
            <Text style={styles.stepTitle}>{t("onboarding.documentsStep")}</Text>
            <Text style={styles.hint}>Document uploads will be available from your profile settings.</Text>
          </>
        );
        case 3: return (
          <>
            <View style={styles.completeIcon}><MaterialCommunityIcons name="check-circle" size={72} color={colors.success} /></View>
            <Text style={styles.completeTitle}>{t("onboarding.youreAllSet")}</Text>
            <Text style={styles.completeDesc}>{t("onboarding.profileReview")}</Text>
          </>
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {steps.map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.progressText}>Step {step + 1} of {steps.length}</Text>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {renderStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.nav}>
          {step > 0 && !isComplete && (
            <Button variant="outline" onPress={() => setStep(s => s - 1)}>{t("common.back")}</Button>
          )}
          <View style={{ flex: 1 }} />
          <Button onPress={handleNext} loading={saving}>
            {isComplete ? t("onboarding.goToDashboard") : t("common.next")}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  progressRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingTop: spacing.lg },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 24 },
  progressText: { textAlign: "center", fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: spacing.sm },
  scroll: { padding: spacing.xl, paddingTop: spacing.xl },
  stepTitle: { fontSize: typography.sizes["2xl"], fontWeight: typography.weights.bold, color: colors.text, marginBottom: spacing.sm },
  stepDesc: { fontSize: typography.sizes.base, color: colors.textSecondary, marginBottom: spacing.xl },
  hint: { fontSize: typography.sizes.sm, color: colors.textTertiary, lineHeight: 20, marginTop: spacing.sm },
  completeIcon: { alignItems: "center", marginBottom: spacing.lg, marginTop: spacing["2xl"] },
  completeTitle: { fontSize: typography.sizes["2xl"], fontWeight: typography.weights.bold, color: colors.text, textAlign: "center" },
  completeDesc: { fontSize: typography.sizes.base, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm },
  nav: { flexDirection: "row", padding: spacing.base, gap: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.border, backgroundColor: colors.white },
});

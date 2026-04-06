/**
 * Professional onboarding screen.
 *
 * Multi-step form: Personal Info → Qualifications → Document Upload → Review.
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
import { router } from "expo-router";
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

const TOTAL_STEPS = 4;

interface FormData {
  fullName: string;
  phone: string;
  specialty: string;
  bio: string;
  qualifications: string;
  certifications: string;
  licenseNumber: string;
}

function ProgressIndicator({ step, total }: { step: number; total: number }) {
  const { themeColors } = useTheme();

  return (
    <View style={progressStyles.container}>
      <Text
        style={[progressStyles.label, { color: themeColors.mutedForeground }]}
      >
        Step {step} of {total}
      </Text>
      <View
        style={[progressStyles.track, { backgroundColor: themeColors.muted }]}
      >
        <View
          style={[
            progressStyles.fill,
            {
              backgroundColor: colors.primary,
              width: `${(step / total) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function ProfessionalOnboardingScreen() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: (profile && "full_name" in profile ? profile.full_name : "") ?? "",
    phone: profile?.phone ?? "",
    specialty: "",
    bio: "",
    qualifications: "",
    certifications: "",
    licenseNumber: "",
  });

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName,
        phone: form.phone,
        specialty: form.specialty,
        bio: form.bio,
        qualifications: form.qualifications
          .split(",")
          .map((q) => q.trim())
          .filter(Boolean),
        certifications: form.certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        license_number: form.licenseNumber,
        onboarding_completed: true,
      })
      .eq("id", profile?.id ?? "");
    setLoading(false);

    if (error) {
      Alert.alert(t("common.error"), error.message);
    } else {
      await refreshProfile();
      router.replace("/(app)/(tabs)");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text
              style={[styles.stepTitle, { color: themeColors.foreground }]}
              accessibilityRole="header"
            >
              Personal Information
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Full Name
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
                value={form.fullName}
                onChangeText={(v) => updateField("fullName", v)}
                placeholder="Your full name"
                placeholderTextColor={themeColors.mutedForeground}
                accessibilityLabel="Full name"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Phone Number
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
                value={form.phone}
                onChangeText={(v) => updateField("phone", v)}
                placeholder="+966 5XX XXX XXXX"
                placeholderTextColor={themeColors.mutedForeground}
                keyboardType="phone-pad"
                accessibilityLabel="Phone number"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Specialty
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
                value={form.specialty}
                onChangeText={(v) => updateField("specialty", v)}
                placeholder="e.g. Dental Hygienist"
                placeholderTextColor={themeColors.mutedForeground}
                accessibilityLabel="Specialty"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Bio
              </Text>
              <TextInput
                style={[
                  styles.inputMultiline,
                  {
                    borderColor: themeColors.border,
                    color: themeColors.foreground,
                    backgroundColor: themeColors.card,
                  },
                ]}
                value={form.bio}
                onChangeText={(v) => updateField("bio", v)}
                placeholder="Tell clinics about yourself..."
                placeholderTextColor={themeColors.mutedForeground}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Bio"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text
              style={[styles.stepTitle, { color: themeColors.foreground }]}
              accessibilityRole="header"
            >
              Qualifications
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Qualifications
              </Text>
              <Text
                style={[
                  styles.hint,
                  { color: themeColors.mutedForeground },
                ]}
              >
                Separate multiple with commas
              </Text>
              <TextInput
                style={[
                  styles.inputMultiline,
                  {
                    borderColor: themeColors.border,
                    color: themeColors.foreground,
                    backgroundColor: themeColors.card,
                  },
                ]}
                value={form.qualifications}
                onChangeText={(v) => updateField("qualifications", v)}
                placeholder="e.g. BSc Dental Hygiene, CPR Certified"
                placeholderTextColor={themeColors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Qualifications"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Certifications
              </Text>
              <TextInput
                style={[
                  styles.inputMultiline,
                  {
                    borderColor: themeColors.border,
                    color: themeColors.foreground,
                    backgroundColor: themeColors.card,
                  },
                ]}
                value={form.certifications}
                onChangeText={(v) => updateField("certifications", v)}
                placeholder="e.g. SCFHS License, BLS Certification"
                placeholderTextColor={themeColors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Certifications"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                License Number
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
                value={form.licenseNumber}
                onChangeText={(v) => updateField("licenseNumber", v)}
                placeholder="Professional license number"
                placeholderTextColor={themeColors.mutedForeground}
                accessibilityLabel="License number"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text
              style={[styles.stepTitle, { color: themeColors.foreground }]}
              accessibilityRole="header"
            >
              Document Upload
            </Text>
            <Text
              style={[
                styles.uploadDescription,
                { color: themeColors.mutedForeground },
              ]}
            >
              Upload supporting documents for verification. You can add
              documents from your profile after completing onboarding.
            </Text>
            <Pressable
              style={[
                styles.uploadArea,
                {
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.muted,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Upload document"
            >
              <Text style={styles.uploadEmoji}>📄</Text>
              <Text
                style={[
                  styles.uploadText,
                  { color: themeColors.mutedForeground },
                ]}
              >
                Tap to upload documents
              </Text>
              <Text
                style={[
                  styles.uploadHint,
                  { color: themeColors.mutedForeground },
                ]}
              >
                PDF, JPG, or PNG (max 10MB)
              </Text>
            </Pressable>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text
              style={[styles.stepTitle, { color: themeColors.foreground }]}
              accessibilityRole="header"
            >
              Review
            </Text>
            <Text
              style={[
                styles.reviewDescription,
                { color: themeColors.mutedForeground },
              ]}
            >
              Please review your information before submitting.
            </Text>
            <View
              style={[
                styles.reviewCard,
                { backgroundColor: themeColors.muted },
              ]}
            >
              <ReviewRow label="Name" value={form.fullName} />
              <ReviewRow label="Phone" value={form.phone} />
              <ReviewRow label="Specialty" value={form.specialty} />
              <ReviewRow label="Bio" value={form.bio || "—"} />
              <ReviewRow
                label="Qualifications"
                value={form.qualifications || "—"}
              />
              <ReviewRow
                label="Certifications"
                value={form.certifications || "—"}
              />
              <ReviewRow
                label="License"
                value={form.licenseNumber || "—"}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ProgressIndicator step={currentStep} total={TOTAL_STEPS} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>
      <View
        style={[styles.footer, { borderTopColor: themeColors.border }]}
      >
        {currentStep > 1 && (
          <Pressable
            style={[styles.backButton, { borderColor: themeColors.border }]}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text
              style={[styles.backButtonText, { color: themeColors.foreground }]}
            >
              Back
            </Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled,
            currentStep === 1 && styles.fullWidth,
          ]}
          onPress={currentStep === TOTAL_STEPS ? handleComplete : handleNext}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={
            currentStep === TOTAL_STEPS ? "Complete onboarding" : "Next step"
          }
          accessibilityState={{ disabled: loading }}
        >
          <Text style={styles.nextButtonText}>
            {loading
              ? t("common.loading")
              : currentStep === TOTAL_STEPS
                ? "Complete"
                : "Next"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const { themeColors } = useTheme();

  return (
    <View style={styles.reviewRow}>
      <Text
        style={[styles.reviewLabel, { color: themeColors.mutedForeground }]}
      >
        {label}
      </Text>
      <Text style={[styles.reviewValue, { color: themeColors.foreground }]}>
        {value}
      </Text>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepContent: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  stepTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  hint: {
    fontSize: typography.fontSize.xs,
  },
  input: {
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  inputMultiline: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
  },
  uploadDescription: {
    fontSize: typography.fontSize.sm,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  uploadEmoji: {
    fontSize: 40,
  },
  uploadText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  uploadHint: {
    fontSize: typography.fontSize.xs,
  },
  reviewDescription: {
    fontSize: typography.fontSize.sm,
  },
  reviewCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewRow: {
    gap: spacing.xs,
  },
  reviewLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: "uppercase",
  },
  reviewValue: {
    fontSize: typography.fontSize.base,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flex: 1,
    minHeight: TOUCH_TARGET_SIZE,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  nextButton: {
    flex: 1,
    minHeight: TOUCH_TARGET_SIZE,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    flex: 2,
  },
  nextButtonText: {
    color: colors.primaryForeground,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

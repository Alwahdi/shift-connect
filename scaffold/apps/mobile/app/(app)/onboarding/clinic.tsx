/**
 * Clinic onboarding screen.
 *
 * Multi-step form: Clinic Info → Address & Contact → Review.
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

const TOTAL_STEPS = 3;

interface ClinicFormData {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
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

export default function ClinicOnboardingScreen() {
  const { t } = useTranslation();
  const { profile, refreshProfile } = useAuth();
  const { themeColors } = useTheme();
  const supabase = getSupabaseClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ClinicFormData>({
    name: (profile && "name" in profile ? profile.name : "") ?? "",
    description: "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    address: "",
    city: "",
  });

  const updateField = (field: keyof ClinicFormData, value: string) => {
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
      .from("clinics")
      .update({
        name: form.name,
        description: form.description,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
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
              Clinic Information
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Clinic Name
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
                value={form.name}
                onChangeText={(v) => updateField("name", v)}
                placeholder="Your clinic name"
                placeholderTextColor={themeColors.mutedForeground}
                accessibilityLabel="Clinic name"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Description
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
                value={form.description}
                onChangeText={(v) => updateField("description", v)}
                placeholder="Describe your clinic..."
                placeholderTextColor={themeColors.mutedForeground}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessibilityLabel="Description"
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
              Address & Contact
            </Text>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Address
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
                value={form.address}
                onChangeText={(v) => updateField("address", v)}
                placeholder="Street address"
                placeholderTextColor={themeColors.mutedForeground}
                accessibilityLabel="Address"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                City
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
                value={form.city}
                onChangeText={(v) => updateField("city", v)}
                placeholder="City"
                placeholderTextColor={themeColors.mutedForeground}
                accessibilityLabel="City"
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: themeColors.foreground }]}>
                Phone
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
                Email
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
                value={form.email}
                onChangeText={(v) => updateField("email", v)}
                placeholder="clinic@example.com"
                placeholderTextColor={themeColors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email"
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
              Review
            </Text>
            <Text
              style={[
                styles.reviewDescription,
                { color: themeColors.mutedForeground },
              ]}
            >
              Please review your clinic information before submitting.
            </Text>
            <View
              style={[
                styles.reviewCard,
                { backgroundColor: themeColors.muted },
              ]}
            >
              <ReviewRow label="Clinic Name" value={form.name} />
              <ReviewRow
                label="Description"
                value={form.description || "—"}
              />
              <ReviewRow label="Address" value={form.address || "—"} />
              <ReviewRow label="City" value={form.city || "—"} />
              <ReviewRow label="Phone" value={form.phone || "—"} />
              <ReviewRow label="Email" value={form.email || "—"} />
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

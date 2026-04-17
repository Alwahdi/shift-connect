import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input } from '@/components/ui';
import { Spacing, Typography, BorderRadius, Shadows } from '@/config/theme';

type UserRole = 'professional' | 'clinic';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole(selectedRole);
    setStep('details');
  };

  const handleSignUp = async () => {
    setError('');
    if (!email.trim()) { setError(t('auth.emailRequired')); return; }
    if (password.length < 6) { setError(t('auth.passwordTooShort')); return; }
    if (password !== confirmPassword) { setError(t('auth.passwordMismatch')); return; }
    if (!role) return;

    setLoading(true);
    try {
      const result = await signUp(email.trim().toLowerCase(), password, role, {});
      if (result.error) {
        setError(t('auth.signUpError'));
      } else if (result.needsEmailConfirmation) {
        setError('');
        router.replace('/');
      } else {
        router.replace('/');
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable
          onPress={() => step === 'details' ? setStep('role') : router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        {step === 'role' ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{t('auth.createAccount')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('auth.selectRole')}</Text>
            </View>

            {/* Role Selection Cards */}
            <View style={styles.roleCards}>
              <Pressable
                onPress={() => handleRoleSelect('professional')}
                style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.md]}
              >
                <View style={[styles.roleIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="person" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.text }]}>{t('auth.professional')}</Text>
                <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>{t('auth.professionalDesc')}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={styles.roleArrow} />
              </Pressable>

              <Pressable
                onPress={() => handleRoleSelect('clinic')}
                style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.md]}
              >
                <View style={[styles.roleIconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <Ionicons name="business" size={32} color={colors.accent} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.text }]}>{t('auth.clinic')}</Text>
                <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>{t('auth.clinicDesc')}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} style={styles.roleArrow} />
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{t('auth.hasAccount')} </Text>
              <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
                <Text style={[styles.footerLink, { color: colors.primary }]}>{t('auth.signIn')}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{t('auth.createAccount')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('auth.signUpSubtitle')}</Text>
            </View>

            <View style={styles.form}>
              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.errorLight }]}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              <Input
                label={t('auth.email')}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="mail-outline"
              />

              <Input
                label={t('auth.password')}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <Input
                label={t('auth.confirmPassword')}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
              />

              <Button
                title={t('auth.createAccount')}
                onPress={handleSignUp}
                loading={loading}
                fullWidth
                size="lg"
              />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl },
  backButton: { marginBottom: Spacing.lg, width: 44, height: 44, justifyContent: 'center' },
  header: { marginBottom: Spacing['2xl'] },
  title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.bold, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sizes.md },
  roleCards: { gap: Spacing.base },
  roleCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xl,
    borderWidth: 1, position: 'relative',
  },
  roleIconContainer: {
    width: 56, height: 56, borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  roleTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, marginBottom: Spacing.xs },
  roleDesc: { fontSize: Typography.sizes.sm, lineHeight: 20 },
  roleArrow: { position: 'absolute', right: Spacing.xl, top: Spacing.xl },
  form: { gap: Spacing.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
  },
  errorText: { fontSize: Typography.sizes.sm, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
  footerText: { fontSize: Typography.sizes.base },
  footerLink: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
});

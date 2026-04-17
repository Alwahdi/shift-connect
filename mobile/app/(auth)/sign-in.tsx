import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';

export default function SignInScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    if (!email.trim()) { setError(t('auth.emailRequired')); return; }
    if (!password) { setError(t('auth.passwordRequired')); return; }

    setLoading(true);
    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.error) {
        setError(t('auth.signInError'));
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.welcomeBack')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('auth.welcomeSubtitle')}</Text>
        </View>

        {/* Form */}
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

          <Button
            title={t('auth.signIn')}
            onPress={handleSignIn}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('auth.noAccount')}{' '}
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-up')}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>{t('auth.signUp')}</Text>
          </Pressable>
        </View>
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
  form: { gap: Spacing.xs },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
  },
  errorText: { fontSize: Typography.sizes.sm, flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing['2xl'] },
  footerText: { fontSize: Typography.sizes.base },
  footerLink: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
});

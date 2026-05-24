import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import type { AppRole } from '@/src/types';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required.'),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type FormValues = z.infer<typeof schema>;

const roleOptions: Array<{ role: Extract<AppRole, 'professional' | 'clinic'>; label: string; description: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { role: 'professional', label: "I'm a Professional", description: 'Find shifts, apply quickly, and manage your bookings.', icon: 'medkit-outline' },
  { role: 'clinic', label: "I'm a Clinic", description: 'Post shifts, review applicants, and coordinate staffing.', icon: 'business-outline' },
];

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [role, setRole] = useState<Extract<AppRole, 'professional' | 'clinic'>>('professional');
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await signUp({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
      role,
    });

    if (result.error) {
      Alert.alert('Unable to create account', result.error.message.includes('registered') ? 'That email is already registered.' : result.error.message);
      return;
    }

    if (result.requiresEmailConfirmation) {
      Alert.alert('Check your email', 'Please confirm your email address, then sign in to continue.');
      router.replace('/(auth)/sign-in');
      return;
    }

    router.replace(role === 'professional' ? '/onboarding/professional' : '/onboarding/clinic');
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.kicker}>Create your account</Text>
            <Text style={styles.title}>Join the Shift-Connect network</Text>
            <Text style={styles.description}>Choose your role to unlock the right tools and onboarding flow.</Text>
          </View>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Choose your role</Text>
            {roleOptions.map((option) => (
              <Pressable key={option.role} onPress={() => setRole(option.role)} style={[styles.roleCard, role === option.role && styles.roleCardActive]}>
                <View style={[styles.roleIcon, role === option.role && styles.roleIconActive]}>
                  <Ionicons name={option.icon} size={22} color={role === option.role ? theme.colors.white : theme.colors.primary} />
                </View>
                <View style={styles.roleContent}>
                  <Text style={styles.roleTitle}>{option.label}</Text>
                  <Text style={styles.roleDescription}>{option.description}</Text>
                </View>
                <Ionicons name={role === option.role ? 'radio-button-on' : 'radio-button-off'} size={22} color={theme.colors.primary} />
              </Pressable>
            ))}

            <Controller control={control} name="fullName" render={({ field }) => <Input label="Full name" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />} />
            <Controller control={control} name="email" render={({ field }) => <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />} />
            <Controller control={control} name="password" render={({ field }) => <Input label="Password" secureTextEntry secureToggle value={field.value} onChangeText={field.onChange} error={errors.password?.message} helperText="Use at least 8 characters." />} />

            <Button title="Sign Up" fullWidth loading={isSubmitting} onPress={onSubmit} />
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Link href="/(auth)/sign-in" style={styles.link}>Sign in</Link>
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  hero: {
    gap: theme.spacing.sm,
  },
  kicker: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.muted,
    lineHeight: 22,
  },
  card: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: theme.typography.sizes.md,
  },
  roleCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  roleCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F4EEF6',
  },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEE8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconActive: {
    backgroundColor: theme.colors.primary,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  roleDescription: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  footerText: {
    color: theme.colors.muted,
    textAlign: 'center',
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});

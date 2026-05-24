import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const { error } = await signIn(values.email.trim(), values.password);

    if (error) {
      Alert.alert('Unable to sign in', error.message === 'Invalid login credentials' ? 'Email or password is incorrect.' : error.message);
      return;
    }

    router.replace('/');
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.kicker}>Shift-Connect</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.description}>Sign in to manage shifts, bookings, and conversations.</Text>
          </View>

          <Card style={styles.card}>
            <Controller control={control} name="email" render={({ field }) => <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />} />
            <Controller control={control} name="password" render={({ field }) => <Input label="Password" secureTextEntry secureToggle value={field.value} onChangeText={field.onChange} error={errors.password?.message} />} />
            <Button title="Sign In" fullWidth loading={isSubmitting} onPress={onSubmit} />
            <Text style={styles.footerText}>
              New to Shift-Connect?{' '}
              <Link href="/(auth)/sign-up" style={styles.link}>Create an account</Link>
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
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  hero: {
    gap: theme.spacing.sm,
  },
  kicker: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: theme.typography.sizes.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
  },
  description: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.md,
    lineHeight: 24,
  },
  card: {
    gap: theme.spacing.md,
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

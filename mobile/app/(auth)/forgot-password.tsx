import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { supabase } from '@/src/lib/supabase';

const schema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email.trim());
      if (error) {
        throw error;
      }
      setSent(true);
    } catch (error) {
      Alert.alert(
        'Unable to send reset email',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  });

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Card style={styles.card}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>📬</Text>
            </View>
            <Text style={styles.title}>Check your inbox</Text>
            <Text style={styles.description}>
              We sent a password reset link to your email. Follow the instructions to create a new
              password and sign in.
            </Text>
            <Button
              title="Back to sign in"
              variant="outline"
              fullWidth
              onPress={() => router.replace('/(auth)/sign-in')}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.kicker}>Shift-Connect</Text>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.description}>
              Enter your registered email and we will send you a secure reset link.
            </Text>
          </View>

          <Card style={styles.card}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  label="Email address"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={errors.email?.message}
                />
              )}
            />
            <Button title="Send reset link" fullWidth loading={isSubmitting} onPress={onSubmit} />
            <Button
              title="Back to sign in"
              variant="ghost"
              fullWidth
              onPress={() => router.back()}
            />
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
    lineHeight: 22,
  },
  card: {
    gap: theme.spacing.md,
  },
  successIcon: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  successEmoji: {
    fontSize: 40,
  },
});

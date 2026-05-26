import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

const schema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  phone: z.string().min(8, 'Phone number is required.'),
  address: z.string().min(5, 'Address is required.'),
  description: z.string().min(20, 'Add a short clinic description.'),
});

type FormValues = z.infer<typeof schema>;

export default function ClinicOnboardingScreen() {
  const { user, clinic, refreshAuthState } = useAuth();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: clinic?.name ?? String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''),
      phone: clinic?.phone ?? '',
      address: clinic?.address ?? '',
      description: clinic?.description ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: clinic?.name ?? String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''),
      phone: clinic?.phone ?? '',
      address: clinic?.address ?? '',
      description: clinic?.description ?? '',
    });
  }, [clinic, reset, user?.user_metadata]);

  const submit = handleSubmit(async (values) => {
    if (!user) {
      return;
    }

    try {
      const { error } = await supabase.from('clinics').upsert(
        {
          user_id: user.id,
          email: user.email ?? clinic?.email ?? '',
          name: values.name,
          phone: values.phone,
          address: values.address,
          description: values.description,
          onboarding_completed: true,
          verification_status: clinic?.verification_status ?? 'pending',
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        throw error;
      }

      await refreshAuthState();
      router.replace('/(clinic)');
    } catch (error) {
      Alert.alert('Unable to save onboarding', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Clinic onboarding</Text>
          <Text style={styles.description}>Add the essentials so professionals can recognize and trust your facility.</Text>
        </View>

        <Card style={styles.card}>
          <Controller control={control} name="name" render={({ field }) => <Input label="Clinic name" value={field.value} onChangeText={field.onChange} error={errors.name?.message} />} />
          <Controller control={control} name="phone" render={({ field }) => <Input label="Phone number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />} />
          <Controller control={control} name="address" render={({ field }) => <Input label="Address" value={field.value} onChangeText={field.onChange} error={errors.address?.message} />} />
          <Controller control={control} name="description" render={({ field }) => <Input label="Clinic description" multiline value={field.value} onChangeText={field.onChange} error={errors.description?.message} />} />
          <Button title="Complete onboarding" fullWidth loading={isSubmitting} onPress={submit} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  hero: {
    gap: theme.spacing.sm,
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
});

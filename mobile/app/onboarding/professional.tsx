import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { LoadingSpinner } from '@/src/components/common/LoadingSpinner';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required.'),
  phone: z.string().min(8, 'Phone number is required.'),
  hourly_rate: z.string().min(1, 'Hourly rate is required.'),
  bio: z.string().min(20, 'Tell clinics a bit about your background.'),
});

type FormValues = z.infer<typeof schema>;

const fallbackRoles = ['Registered Nurse', 'LPN/LVN', 'Medical Assistant', 'Dentist', 'Dental Assistant', 'Physiotherapist'];

export default function ProfessionalOnboardingScreen() {
  const { user, profile, refreshAuthState } = useAuth();
  const [options, setOptions] = useState<string[]>(fallbackRoles);
  const [selected, setSelected] = useState<string[]>(profile?.specialties ?? []);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile?.full_name ?? String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''),
      phone: profile?.phone ?? '',
      hourly_rate: profile?.hourly_rate ? String(profile.hourly_rate) : '',
      bio: profile?.bio ?? '',
    },
  });

  useEffect(() => {
    reset({
      full_name: profile?.full_name ?? String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''),
      phone: profile?.phone ?? '',
      hourly_rate: profile?.hourly_rate ? String(profile.hourly_rate) : '',
      bio: profile?.bio ?? '',
    });
    setSelected(profile?.specialties ?? []);
  }, [profile, reset, user?.user_metadata]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const { data } = await supabase.from('job_roles').select('name').eq('is_active', true).order('name');
        if (data?.length) {
          setOptions(data.map((item) => item.name));
        }
      } finally {
        setLoadingOptions(false);
      }
    };

    loadRoles().catch(() => setLoadingOptions(false));
  }, []);

  const submit = handleSubmit(async (values) => {
    if (!user) {
      return;
    }

    if (!selected.length) {
      Alert.alert('Select specialties', 'Choose at least one specialty to continue.');
      return;
    }

    try {
      const { error } = await supabase.from('profiles').upsert(
        {
          user_id: user.id,
          email: user.email ?? profile?.email ?? '',
          full_name: values.full_name,
          phone: values.phone,
          hourly_rate: Number(values.hourly_rate),
          bio: values.bio,
          specialties: selected,
          onboarding_completed: true,
          is_available: true,
          verification_status: profile?.verification_status ?? 'pending',
        },
        { onConflict: 'user_id' },
      );

      if (error) {
        throw error;
      }

      await refreshAuthState();
      router.replace('/(professional)');
    } catch (error) {
      Alert.alert('Unable to save onboarding', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  if (loadingOptions) {
    return <LoadingSpinner fullScreen label="Preparing your onboarding..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Professional onboarding</Text>
          <Text style={styles.description}>Complete your profile so clinics can discover and book you.</Text>
        </View>

        <Card style={styles.card}>
          <Controller control={control} name="full_name" render={({ field }) => <Input label="Full name" value={field.value} onChangeText={field.onChange} error={errors.full_name?.message} />} />
          <Controller control={control} name="phone" render={({ field }) => <Input label="Phone number" keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={errors.phone?.message} />} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <Text style={styles.sectionDescription}>Pick every role you actively work in.</Text>
            <View style={styles.pills}>
              {options.map((item) => {
                const active = selected.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => setSelected((current) => (active ? current.filter((value) => value !== item) : [...current, item]))}
                    style={[styles.pill, active && styles.pillActive]}>
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Controller control={control} name="hourly_rate" render={({ field }) => <Input label="Hourly rate (USD)" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.hourly_rate?.message} />} />
          <Controller control={control} name="bio" render={({ field }) => <Input label="Professional bio" multiline value={field.value} onChangeText={field.onChange} error={errors.bio?.message} />} />

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
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  sectionDescription: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
  },
  pillTextActive: {
    color: theme.colors.white,
    fontWeight: '700',
  },
});

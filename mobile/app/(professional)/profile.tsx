import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { FLOATING_TAB_BOTTOM_INSET } from '@/src/components/navigation/FloatingTabBar';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required.'),
  phone: z.string().min(8, 'Phone number is required.'),
  bio: z.string().min(20, 'Bio is required.'),
  hourly_rate: z.string().min(1, 'Hourly rate is required.').refine((v) => Number(v) > 0, 'Rate must be greater than 0.'),
  avatar_url: z.string().optional(),
});

const documentSchema = z.object({
  document_type: z.enum(['id', 'license', 'certification', 'other']),
  name: z.string().min(2, 'Document name is required.'),
  file_url: z.string().url('Provide a valid document URL.'),
  expiry_date: z.string().optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Please confirm your password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type DocumentValues = z.infer<typeof documentSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

const fallbackRoles = ['Registered Nurse', 'LPN/LVN', 'Medical Assistant', 'Dentist', 'Dental Assistant', 'Physiotherapist'];
const documentTypeOptions = ['id', 'license', 'certification', 'other'] as const;

export default function ProfessionalProfileScreen() {
  const { profile, user, refreshAuthState, signOut } = useAuth();
  const [selected, setSelected] = useState<string[]>(profile?.specialties ?? []);

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => signOut().catch(() => undefined),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your professional account and all associated data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your bookings, messages, and profile data will be removed.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (profile?.id) {
                        await supabase.from('profiles').delete().eq('id', profile.id);
                      }
                      await signOut();
                    } catch {
                      Alert.alert('Error', 'Unable to delete account. Please contact support.');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      bio: profile?.bio ?? '',
      hourly_rate: profile?.hourly_rate ? String(profile.hourly_rate) : '',
      avatar_url: profile?.avatar_url ?? '',
    },
  });
  const documentForm = useForm<DocumentValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { document_type: 'certification', name: '', file_url: '', expiry_date: '' },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    setSelected(profile?.specialties ?? []);
  }, [profile?.specialties]);

  if (!profile || !user) {
    return null;
  }

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: values.full_name,
        phone: values.phone,
        bio: values.bio,
        hourly_rate: Number(values.hourly_rate),
        avatar_url: values.avatar_url || null,
        specialties: selected,
      }).eq('id', profile.id);
      if (error) {
        throw error;
      }
      await refreshAuthState();
      Alert.alert('Profile updated', 'Your professional profile has been saved.');
    } catch (error) {
      Alert.alert('Unable to save profile', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  const toggleAvailability = async (value: boolean) => {
    try {
      const { error } = await supabase.from('profiles').update({ is_available: value }).eq('id', profile.id);
      if (error) {
        throw error;
      }
      await refreshAuthState();
    } catch (error) {
      Alert.alert('Unable to update availability', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const addDocument = documentForm.handleSubmit(async (values) => {
    try {
      const { error } = await supabase.from('documents').insert({
        user_id: user.id,
        document_type: values.document_type,
        name: values.name,
        file_url: values.file_url,
        expiry_date: values.expiry_date || null,
        status: 'pending',
      });
      if (error) {
        throw error;
      }
      documentForm.reset();
      Alert.alert('Document added', 'Your certification document is now pending review.');
    } catch (error) {
      Alert.alert('Unable to add document', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  const changePassword = passwordForm.handleSubmit(async (values) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) throw error;
      passwordForm.reset();
      Alert.alert('Password updated', 'Your password has been changed successfully.');
    } catch (error) {
      Alert.alert('Unable to change password', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.headerCard}>
          <Avatar uri={profile.avatar_url} name={profile.full_name} size={72} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{profile.full_name}</Text>
            <Text style={styles.meta}>{profile.specialties?.join(', ') || 'Add your specialties'}</Text>
            <Text style={styles.meta}>${profile.hourly_rate ?? 0}/hr • {profile.rating_avg?.toFixed(1) ?? 'New'}★</Text>
            <Badge label={profile.verification_status ?? 'pending'} variant={profile.verification_status === 'verified' ? 'success' : 'warning'} />
          </View>
        </Card>

        <Card style={styles.section}>
          <View style={styles.availabilityRow}>
            <View style={styles.grow}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <Text style={styles.sectionDescription}>Control whether clinics see you as ready for work.</Text>
            </View>
            <Switch value={Boolean(profile.is_available)} onValueChange={toggleAvailability} trackColor={{ true: theme.colors.primary }} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Edit profile</Text>
          <Controller control={profileForm.control} name="full_name" render={({ field }) => <Input label="Full name" value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.full_name?.message} />} />
          <Controller control={profileForm.control} name="phone" render={({ field }) => <Input label="Phone" value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.phone?.message} />} />
          <Controller control={profileForm.control} name="bio" render={({ field }) => <Input label="Bio" multiline value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.bio?.message} />} />
          <Controller control={profileForm.control} name="hourly_rate" render={({ field }) => <Input label="Hourly rate" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.hourly_rate?.message} />} />
          <Controller control={profileForm.control} name="avatar_url" render={({ field }) => <Input label="Avatar URL" autoCapitalize="none" value={field.value ?? ''} onChangeText={field.onChange} />} />

          <Text style={styles.sectionSubtitle}>Specialties</Text>
          <View style={styles.pills}>
            {fallbackRoles.map((item) => {
              const active = selected.includes(item);
              return (
                <Pressable key={item} onPress={() => setSelected((current) => (active ? current.filter((value) => value !== item) : [...current, item]))} style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <Button title="Save changes" fullWidth onPress={saveProfile} loading={profileForm.formState.isSubmitting} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications & documents</Text>
          <Text style={styles.sectionDescription}>Submit a secure URL for each certification you want reviewed.</Text>
          <Text style={styles.sectionSubtitle}>Document type</Text>
          <View style={styles.pills}>
            {documentTypeOptions.map((option) => {
              const active = documentForm.watch('document_type') === option;
              return (
                <Pressable key={option} onPress={() => documentForm.setValue('document_type', option)} style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{option.replace('_', ' ')}</Text>
                </Pressable>
              );
            })}
          </View>
          <Controller control={documentForm.control} name="name" render={({ field }) => <Input label="Document name" value={field.value} onChangeText={field.onChange} error={documentForm.formState.errors.name?.message} />} />
          <Controller control={documentForm.control} name="file_url" render={({ field }) => <Input label="Document URL" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={documentForm.formState.errors.file_url?.message} />} />
          <Controller control={documentForm.control} name="expiry_date" render={({ field }) => <Input label="Expiry date (optional)" value={field.value ?? ''} onChangeText={field.onChange} />} />
          <Button title="Submit document" variant="secondary" fullWidth onPress={addDocument} loading={documentForm.formState.isSubmitting} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Change password</Text>
          <Controller control={passwordForm.control} name="newPassword" render={({ field }) => <Input label="New password" secureTextEntry value={field.value} onChangeText={field.onChange} error={passwordForm.formState.errors.newPassword?.message} />} />
          <Controller control={passwordForm.control} name="confirmPassword" render={({ field }) => <Input label="Confirm new password" secureTextEntry value={field.value} onChangeText={field.onChange} error={passwordForm.formState.errors.confirmPassword?.message} />} />
          <Button title="Update password" variant="secondary" fullWidth onPress={changePassword} loading={passwordForm.formState.isSubmitting} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Button title="Sign out" variant="danger" fullWidth onPress={handleSignOut} />
          <View style={styles.danger}>
            <Text style={styles.dangerTitle}>Danger zone</Text>
            <Text style={styles.dangerText}>Permanently delete your professional account and all data associated with it.</Text>
            <Button title="Delete account" variant="ghost" fullWidth onPress={handleDeleteAccount} />
          </View>
        </Card>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: FLOATING_TAB_BOTTOM_INSET },
  headerCard: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  headerText: { flex: 1, gap: 4 },
  name: { color: theme.colors.text, fontSize: theme.typography.sizes.xl, fontWeight: '800' },
  meta: { color: theme.colors.muted },
  section: { gap: theme.spacing.md },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.lg },
  sectionSubtitle: { color: theme.colors.text, fontWeight: '700' },
  sectionDescription: { color: theme.colors.muted, lineHeight: 20 },
  availabilityRow: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  grow: { flex: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  pill: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: theme.radii.round, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.card },
  pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  pillText: { color: theme.colors.text },
  pillTextActive: { color: theme.colors.white, fontWeight: '700' },
  danger: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.md, gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  dangerTitle: { color: theme.colors.error, fontWeight: '700' },
  dangerText: { color: theme.colors.muted, fontSize: theme.typography.sizes.sm, lineHeight: 18 },
});

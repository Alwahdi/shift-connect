import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { Avatar } from '@/src/components/common/Avatar';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/lib/supabase';

const profileSchema = z.object({
  name: z.string().min(2, 'Clinic name is required.'),
  phone: z.string().min(8, 'Phone number is required.'),
  address: z.string().min(5, 'Address is required.'),
  description: z.string().min(10, 'Description is required.'),
  logo_url: z.string().optional(),
});

const documentSchema = z.object({
  name: z.string().min(2, 'Document name is required.'),
  file_url: z.string().url('Provide a valid file URL.'),
  expiry_date: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;
type DocumentValues = z.infer<typeof documentSchema>;

export default function ClinicProfileScreen() {
  const { clinic, user, refreshAuthState } = useAuth();
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: clinic?.name ?? '',
      phone: clinic?.phone ?? '',
      address: clinic?.address ?? '',
      description: clinic?.description ?? '',
      logo_url: clinic?.logo_url ?? '',
    },
  });
  const documentForm = useForm<DocumentValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '', file_url: '', expiry_date: '' },
  });

  if (!clinic || !user) {
    return null;
  }

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      const { error } = await supabase.from('clinics').update(values).eq('id', clinic.id);
      if (error) {
        throw error;
      }
      await refreshAuthState();
      Alert.alert('Profile updated', 'Your clinic profile has been saved.');
    } catch (error) {
      Alert.alert('Unable to save profile', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  const uploadDocument = documentForm.handleSubmit(async (values) => {
    try {
      const { error } = await supabase.from('documents').insert({
        user_id: user.id,
        document_type: 'business_license',
        name: values.name,
        file_url: values.file_url,
        expiry_date: values.expiry_date || null,
        status: 'pending',
      });
      if (error) {
        throw error;
      }
      documentForm.reset();
      Alert.alert('Document added', 'Your document is now pending review.');
    } catch (error) {
      Alert.alert('Unable to add document', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.headerCard}>
          <Avatar uri={clinic.logo_url} name={clinic.name} size={72} />
          <View style={styles.headerText}>
            <Text style={styles.name}>{clinic.name}</Text>
            <Text style={styles.meta}>{clinic.email}</Text>
            <Text style={styles.meta}>{clinic.phone ?? 'No phone number added'}</Text>
            <Badge label={clinic.verification_status ?? 'pending'} variant={clinic.verification_status === 'verified' ? 'success' : 'warning'} />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Edit profile</Text>
          <Controller control={profileForm.control} name="name" render={({ field }) => <Input label="Clinic name" value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.name?.message} />} />
          <Controller control={profileForm.control} name="phone" render={({ field }) => <Input label="Phone" value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.phone?.message} />} />
          <Controller control={profileForm.control} name="address" render={({ field }) => <Input label="Address" value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.address?.message} />} />
          <Controller control={profileForm.control} name="description" render={({ field }) => <Input label="Description" multiline value={field.value} onChangeText={field.onChange} error={profileForm.formState.errors.description?.message} />} />
          <Controller control={profileForm.control} name="logo_url" render={({ field }) => <Input label="Logo URL" autoCapitalize="none" value={field.value ?? ''} onChangeText={field.onChange} />} />
          <Button title="Save changes" fullWidth onPress={saveProfile} loading={profileForm.formState.isSubmitting} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Document upload section</Text>
          <Text style={styles.sectionDescription}>Paste secure document URLs from your storage provider to submit verification documents.</Text>
          <Controller control={documentForm.control} name="name" render={({ field }) => <Input label="Document name" value={field.value} onChangeText={field.onChange} error={documentForm.formState.errors.name?.message} />} />
          <Controller control={documentForm.control} name="file_url" render={({ field }) => <Input label="Document URL" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={documentForm.formState.errors.file_url?.message} />} />
          <Controller control={documentForm.control} name="expiry_date" render={({ field }) => <Input label="Expiry date (optional)" value={field.value ?? ''} onChangeText={field.onChange} />} />
          <Button title="Submit document" variant="secondary" fullWidth onPress={uploadDocument} loading={documentForm.formState.isSubmitting} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { padding: theme.spacing.lg, gap: theme.spacing.md },
  headerCard: { flexDirection: 'row', gap: theme.spacing.md, alignItems: 'center' },
  headerText: { flex: 1, gap: 4 },
  name: { color: theme.colors.text, fontSize: theme.typography.sizes.xl, fontWeight: '800' },
  meta: { color: theme.colors.muted },
  section: { gap: theme.spacing.md },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: theme.typography.sizes.lg },
  sectionDescription: { color: theme.colors.muted, lineHeight: 20 },
});

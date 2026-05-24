import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { supabase } from '@/src/lib/supabase';

const schema = z.object({
  title: z.string().min(2, 'Title is required.'),
  role_required: z.string().min(2, 'Role is required.'),
  shift_date: z.string().min(8, 'Date is required.'),
  start_time: z.string().min(4, 'Start time is required.'),
  end_time: z.string().min(4, 'End time is required.'),
  hourly_rate: z.string().min(1, 'Hourly rate is required.'),
  location_address: z.string().min(2, 'Location is required.'),
  description: z.string().min(10, 'Description is required.'),
  required_certifications: z.string().optional(),
  max_applicants: z.string().optional(),
  proposal_deadline: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  clinicId: string | undefined;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateShiftSheet({ visible, clinicId, onClose, onCreated }: Props) {
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      role_required: '',
      shift_date: '',
      start_time: '',
      end_time: '',
      hourly_rate: '',
      location_address: '',
      description: '',
      required_certifications: '',
      max_applicants: '10',
      proposal_deadline: '',
    },
  });
  const [urgent, setUrgent] = React.useState(false);

  const submit = handleSubmit(async (values) => {
    if (!clinicId) {
      Alert.alert('Unable to create shift', 'Clinic profile is missing.');
      return;
    }

    try {
      const { error } = await supabase.from('shifts').insert({
        clinic_id: clinicId,
        title: values.title,
        role_required: values.role_required,
        shift_date: values.shift_date,
        start_time: values.start_time,
        end_time: values.end_time,
        hourly_rate: Number(values.hourly_rate),
        location_address: values.location_address,
        description: values.description,
        is_urgent: urgent,
        is_filled: false,
        max_applicants: values.max_applicants ? Number(values.max_applicants) : null,
        proposal_deadline: values.proposal_deadline || null,
        required_certifications: values.required_certifications
          ? values.required_certifications.split(',').map((item) => item.trim()).filter(Boolean)
          : null,
      });

      if (error) {
        throw error;
      }

      reset();
      setUrgent(false);
      onCreated?.();
      onClose();
      Alert.alert('Shift created', 'Your shift is now live.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      Alert.alert('Unable to create shift', message);
    }
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Create shift</Text>
            <Button title="Close" variant="ghost" onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <Card style={styles.formCard}>
              <Controller control={control} name="title" render={({ field }) => <Input label="Shift title" value={field.value} onChangeText={field.onChange} error={errors.title?.message} />} />
              <Controller control={control} name="role_required" render={({ field }) => <Input label="Role required" value={field.value} onChangeText={field.onChange} error={errors.role_required?.message} />} />
              <Controller control={control} name="shift_date" render={({ field }) => <Input label="Shift date (YYYY-MM-DD)" value={field.value} onChangeText={field.onChange} error={errors.shift_date?.message} />} />
              <View style={styles.row}>
                <Controller control={control} name="start_time" render={({ field }) => <Input label="Start (HH:MM)" value={field.value} onChangeText={field.onChange} error={errors.start_time?.message} />} />
                <Controller control={control} name="end_time" render={({ field }) => <Input label="End (HH:MM)" value={field.value} onChangeText={field.onChange} error={errors.end_time?.message} />} />
              </View>
              <Controller control={control} name="hourly_rate" render={({ field }) => <Input label="Hourly rate" keyboardType="numeric" value={field.value} onChangeText={field.onChange} error={errors.hourly_rate?.message} />} />
              <Controller control={control} name="location_address" render={({ field }) => <Input label="Location" value={field.value} onChangeText={field.onChange} error={errors.location_address?.message} />} />
              <Controller control={control} name="description" render={({ field }) => <Input label="Description" multiline value={field.value} onChangeText={field.onChange} error={errors.description?.message} />} />
              <Controller control={control} name="required_certifications" render={({ field }) => <Input label="Required certifications (comma separated)" value={field.value ?? ''} onChangeText={field.onChange} />} />
              <Controller control={control} name="max_applicants" render={({ field }) => <Input label="Max applicants" keyboardType="numeric" value={field.value ?? ''} onChangeText={field.onChange} />} />
              <Controller control={control} name="proposal_deadline" render={({ field }) => <Input label="Proposal deadline (ISO date optional)" value={field.value ?? ''} onChangeText={field.onChange} />} />

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchTitle}>Urgent shift</Text>
                  <Text style={styles.switchHelp}>Highlight this shift for faster responses.</Text>
                </View>
                <Switch value={urgent} onValueChange={setUrgent} trackColor={{ true: theme.colors.primary }} />
              </View>

              <Button title="Create Shift" fullWidth onPress={submit} loading={isSubmitting} />
            </Card>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingTop: theme.spacing.md,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.lg,
  },
  formCard: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  switchTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  switchHelp: {
    color: theme.colors.muted,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
});

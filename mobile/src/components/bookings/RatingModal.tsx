import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/src/components/common/Button';
import { Card } from '@/src/components/common/Card';
import { Input } from '@/src/components/common/Input';
import { theme } from '@/src/constants/theme';
import { useSubmitRating } from '@/src/hooks/useRatings';

const schema = z.object({
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  visible: boolean;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeName: string;
  onClose: () => void;
};

export function RatingModal({ visible, bookingId, reviewerId, revieweeId, revieweeName, onClose }: Props) {
  const [stars, setStars] = useState(5);
  const mutation = useSubmitRating();

  const { control, handleSubmit, formState: { isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { comment: '' },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        bookingId,
        reviewerId,
        revieweeId,
        rating: stars,
        comment: values.comment ?? '',
      });
      Alert.alert('Thank you!', `Your rating for ${revieweeName} has been submitted.`);
      reset();
      setStars(5);
      onClose();
    } catch (error) {
      Alert.alert('Unable to submit rating', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate {revieweeName}</Text>
            <Button title="Cancel" variant="ghost" onPress={onClose} />
          </View>

          <Card style={styles.card}>
            <Text style={styles.label}>How was your experience?</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable key={value} onPress={() => setStars(value)} style={styles.starBtn} hitSlop={4}>
                  <Ionicons
                    name={value <= stars ? 'star' : 'star-outline'}
                    size={36}
                    color={value <= stars ? theme.colors.warning : theme.colors.border}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={styles.ratingLabel}>{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][stars]}</Text>

            <Controller
              control={control}
              name="comment"
              render={({ field }) => (
                <Input
                  label="Leave a comment (optional)"
                  multiline
                  value={field.value ?? ''}
                  onChangeText={field.onChange}
                  placeholder="Share what made this experience stand out…"
                />
              )}
            />

            <Button title="Submit rating" fullWidth loading={isSubmitting} onPress={submit} />
          </Card>
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
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
  },
  card: {
    marginHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  label: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  stars: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  starBtn: {
    padding: theme.spacing.xs,
  },
  ratingLabel: {
    color: theme.colors.warning,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: theme.typography.sizes.md,
  },
});

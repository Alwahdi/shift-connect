import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';

const TOTAL_STEPS = 4;

export default function ClinicOnboarding() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, refreshOnboardingStatus } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [clinicName, setClinicName] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [description, setDescription] = useState('');
  const [taxId, setTaxId] = useState('');

  // Step 2
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // Step 3
  const [documents, setDocuments] = useState<{ name: string; uri: string }[]>([]);

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step === 1) {
      if (!clinicName.trim()) { Toast.show({ type: 'error', text1: t('onboarding.clinicName') + ' ' + t('common.required') }); return; }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setLoading(true);
      try {
        if (!user) throw new Error('Not authenticated');

        const { error: clinicError } = await supabase.from('clinics').upsert({
          user_id: user.id,
          name: clinicName.trim(),
          email: clinicEmail.trim(),
          phone: clinicPhone.trim(),
          description: description.trim(),
          tax_id: taxId.trim(),
          address: address.trim(),
          settings: { website: website.trim() },
          onboarding_completed: true,
        }, { onConflict: 'user_id' });

        if (clinicError) throw clinicError;

        for (const doc of documents) {
          const ext = (doc.uri.split('.').pop() || 'jpg').toLowerCase();
          const fileName = `${user.id}/${Date.now()}.${ext}`;
          const formData = new FormData();
          formData.append('file', { uri: doc.uri, name: fileName, type: `image/${ext}` } as any);
          const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, formData, { contentType: `image/${ext}` });
          if (uploadError) throw uploadError;
          const { error: docInsertError } = await supabase.from('documents').insert({
            user_id: user.id,
            document_type: 'other',
            name: doc.name,
            file_url: fileName,
            status: 'pending',
          });
          if (docInsertError) throw docInsertError;
        }

        await refreshOnboardingStatus();
        setStep(4);
      } catch (err: any) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) setStep(step - 1);
  };

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => [...prev, { name: `Document ${prev.length + 1}`, uri: result.assets[0].uri }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Toast.show({ type: 'error', text1: t('common.error') });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step < 4 && (
          <View style={styles.progressContainer}>
            <Pressable onPress={handleBack} disabled={step === 1} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={step > 1 ? colors.text : 'transparent'} />
            </Pressable>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${(step / TOTAL_STEPS) * 100}%` }]} />
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                {t('onboarding.step', { current: step, total: TOTAL_STEPS })}
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.clinicProfile')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.letsGetStarted')}</Text>
            <Input label={t('onboarding.clinicName')} value={clinicName} onChangeText={setClinicName} leftIcon="business-outline" placeholder="Al Raha Medical Center" />
            <Input label={t('onboarding.clinicEmail')} value={clinicEmail} onChangeText={setClinicEmail} leftIcon="mail-outline" placeholder="info@clinic.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label={t('onboarding.clinicPhone')} value={clinicPhone} onChangeText={setClinicPhone} leftIcon="call-outline" placeholder="+966 XX XXX XXXX" keyboardType="phone-pad" />
            <Input label={t('onboarding.description')} value={description} onChangeText={setDescription} leftIcon="document-text-outline" placeholder="Tell us about your facility..." multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
            <Input label={t('onboarding.taxId')} value={taxId} onChangeText={setTaxId} leftIcon="card-outline" placeholder="Tax ID Number" />
            <Button title={t('common.next')} onPress={handleNext} fullWidth size="lg" />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.location')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.address')}</Text>
            <Input label={t('onboarding.address')} value={address} onChangeText={setAddress} leftIcon="location-outline" placeholder="Street, City, Country" />
            <Input label={t('onboarding.website')} value={website} onChangeText={setWebsite} leftIcon="globe-outline" placeholder="https://www.clinic.com" keyboardType="url" autoCapitalize="none" />
            <Button title={t('common.next')} onPress={handleNext} fullWidth size="lg" />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.documents')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('onboarding.businessLicense')} & {t('onboarding.insurance')}
            </Text>
            {documents.map((doc, index) => (
              <Card key={index} variant="outlined" style={styles.docCard}>
                <View style={styles.docRow}>
                  <Ionicons name="document-attach" size={20} color={colors.accent} />
                  <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                  <Pressable onPress={() => setDocuments(prev => prev.filter((_, i) => i !== index))} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </Pressable>
                </View>
              </Card>
            ))}
            <Pressable onPress={pickDocument} style={[styles.uploadArea, { borderColor: colors.accent, backgroundColor: colors.accent + '08' }]}>
              <Ionicons name="cloud-upload-outline" size={32} color={colors.accent} />
              <Text style={[styles.uploadText, { color: colors.accent }]}>{t('profile.uploadDocument')}</Text>
              <Text style={[styles.uploadHint, { color: colors.textTertiary }]}>{t('onboarding.businessLicense')}, {t('onboarding.insurance')}</Text>
            </Pressable>
            <Button title={loading ? t('common.loading') : t('common.submit')} onPress={handleNext} loading={loading} fullWidth size="lg" />
          </View>
        )}

        {step === 4 && (
          <View style={styles.completeContainer}>
            <View style={[styles.completeIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>
            <Text style={[styles.completeTitle, { color: colors.text }]}>{t('onboarding.complete')}</Text>
            <Text style={[styles.completeDesc, { color: colors.textSecondary }]}>{t('onboarding.completeDesc')}</Text>
            <Button title={t('onboarding.goToDashboard')} onPress={() => router.replace('/(tabs)/dashboard')} fullWidth size="lg" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.xl },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl, gap: Spacing.sm },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  progressBarContainer: { flex: 1 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  stepText: { fontSize: Typography.sizes.xs, marginTop: 4, textAlign: 'center' },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.sizes.base, marginBottom: Spacing.xl, lineHeight: 22 },
  docCard: { marginBottom: Spacing.sm },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  docName: { flex: 1, fontSize: Typography.sizes.sm },
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['2xl'], marginBottom: Spacing.xl,
  },
  uploadText: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, marginTop: Spacing.sm },
  uploadHint: { fontSize: Typography.sizes.xs, marginTop: 4 },
  completeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing['5xl'] },
  completeIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  completeTitle: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  completeDesc: { fontSize: Typography.sizes.base, textAlign: 'center', lineHeight: 22, marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.xl },
});

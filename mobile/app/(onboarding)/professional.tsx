import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
  Pressable, Animated, Alert,
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
const SPECIALTIES = ['Registered Nurse', 'Licensed Practical Nurse', 'Certified Nursing Assistant', 'Medical Doctor', 'Dentist', 'Pharmacist', 'Physical Therapist', 'Radiologic Technician', 'Respiratory Therapist', 'Medical Lab Technician'];

export default function ProfessionalOnboarding() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user, refreshOnboardingStatus } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Step 1: Profile
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Step 2: Qualifications
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // Step 3: Documents
  const [documents, setDocuments] = useState<{ name: string; uri: string }[]>([]);

  // On mount: load existing partial data and resume at the right step
  useEffect(() => {
    if (!user) return;
    const loadExisting = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, phone, bio, location_address, hourly_rate, specialties')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setBio(data.bio || '');
          setLocation(data.location_address || '');
          setHourlyRate(data.hourly_rate ? String(data.hourly_rate) : '');
          setSelectedSpecialties(data.specialties || []);

          if (data.specialties?.length > 0) {
            setStep(3); // profile + specialties done, needs documents
          } else if (data.full_name?.trim()) {
            setStep(2); // profile done, needs specialties
          }
        }
      } catch {
        // No existing record — start from step 1
      } finally {
        setInitializing(false);
      }
    };
    loadExisting();
  }, [user]);

  const saveStep1 = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      email: user.email ?? '',
      full_name: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      location_address: location.trim(),
      hourly_rate: parseFloat(hourlyRate) || 0,
    }, { onConflict: 'user_id' });
    if (error) throw error;
  };

  const saveStep2 = async () => {
    if (!user) return;
    const { error } = await supabase.from('profiles')
      .update({ specialties: selectedSpecialties })
      .eq('user_id', user.id);
    if (error) throw error;
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (step === 1) {
      if (!fullName.trim()) { Toast.show({ type: 'error', text1: t('onboarding.fullName') + ' ' + t('common.required') }); return; }
      setLoading(true);
      try {
        await saveStep1();
        setStep(2);
      } catch (err: any) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      setLoading(true);
      try {
        await saveStep2();
        setStep(3);
      } catch (err: any) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: err.message });
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      if (documents.length === 0) {
        Toast.show({ type: 'error', text1: t('documents.missingDocuments'), text2: t('documents.missingDocumentsDesc') });
        return;
      }
      setLoading(true);
      try {
        if (!user) throw new Error('Not authenticated');

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

        // Only mark onboarding complete after documents are successfully uploaded
        const { error: completeError } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', user.id);
        if (completeError) throw completeError;

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

  const toggleSpecialty = (specialty: string) => {
    Haptics.selectionAsync();
    setSelectedSpecialties(prev =>
      prev.includes(specialty) ? prev.filter(s => s !== specialty) : [...prev, specialty]
    );
  };

  const pickDocument = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setDocuments(prev => [...prev, { name: `Document ${prev.length + 1}`, uri: result.assets[0].uri }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Toast.show({ type: 'error', text1: t('common.error') });
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="hourglass-outline" size={32} color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.base, paddingBottom: insets.bottom + Spacing['2xl'] }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        {step < 4 && (
          <View style={styles.progressContainer}>
            <Pressable onPress={handleBack} disabled={step === 1} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={step > 1 ? colors.text : 'transparent'} />
            </Pressable>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(step / TOTAL_STEPS) * 100}%` }]} />
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                {t('onboarding.step', { current: step, total: TOTAL_STEPS })}
              </Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.professionalProfile')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.letsGetStarted')}</Text>

            <Input label={t('onboarding.fullName')} value={fullName} onChangeText={setFullName} leftIcon="person-outline" placeholder="John Doe" />
            <Input label={t('onboarding.phone')} value={phone} onChangeText={setPhone} leftIcon="call-outline" placeholder="+966 5X XXX XXXX" keyboardType="phone-pad" />
            <Input label={t('onboarding.bio')} value={bio} onChangeText={setBio} leftIcon="document-text-outline" placeholder="Brief professional background..." multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: 'top' }} />
            <Input label={t('onboarding.location')} value={location} onChangeText={setLocation} leftIcon="location-outline" placeholder="Riyadh, Saudi Arabia" />
            <Input label={t('onboarding.hourlyRate')} value={hourlyRate} onChangeText={setHourlyRate} leftIcon="cash-outline" placeholder="150" keyboardType="numeric" />

            <Button title={t('common.next')} onPress={handleNext} fullWidth size="lg" />
          </View>
        )}

        {/* Step 2: Qualifications */}
        {step === 2 && (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.qualifications')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.selectSpecialties')}</Text>

            <View style={styles.chipGrid}>
              {SPECIALTIES.map((specialty) => {
                const isSelected = selectedSpecialties.includes(specialty);
                return (
                  <Pressable
                    key={specialty}
                    onPress={() => toggleSpecialty(specialty)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    <Text style={[styles.chipText, { color: isSelected ? '#FFF' : colors.text }]}>
                      {specialty}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Button title={t('common.next')} onPress={handleNext} fullWidth size="lg" />
          </View>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t('onboarding.documents')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('onboarding.documentTypes')}</Text>
            <Text style={[styles.requiredNote, { color: colors.error }]}>* {t('common.required')}</Text>

            {documents.map((doc, index) => (
              <Card key={index} variant="outlined" style={styles.docCard}>
                <View style={styles.docRow}>
                  <Ionicons name="document-attach" size={20} color={colors.primary} />
                  <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                  <Pressable onPress={() => setDocuments(prev => prev.filter((_, i) => i !== index))} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </Pressable>
                </View>
              </Card>
            ))}

            <Pressable
              onPress={pickDocument}
              style={[styles.uploadArea, { borderColor: colors.primary, backgroundColor: colors.primary + '08' }]}
            >
              <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.primary }]}>{t('profile.uploadDocument')}</Text>
              <Text style={[styles.uploadHint, { color: colors.textTertiary }]}>ID, License, Certifications</Text>
            </Pressable>

            <Button title={loading ? t('common.loading') : t('common.submit')} onPress={handleNext} loading={loading} disabled={documents.length === 0} fullWidth size="lg" />
          </View>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <View style={styles.completeContainer}>
            <View style={[styles.completeIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>
            <Text style={[styles.completeTitle, { color: colors.text }]}>{t('onboarding.complete')}</Text>
            <Text style={[styles.completeDesc, { color: colors.textSecondary }]}>{t('onboarding.completeDesc')}</Text>
            <Button
              title={t('onboarding.goToDashboard')}
              onPress={() => router.replace('/(tabs)/dashboard')}
              fullWidth
              size="lg"
            />
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
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  chipText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  docCard: { marginBottom: Spacing.sm },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  docName: { flex: 1, fontSize: Typography.sizes.sm },
  uploadArea: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: BorderRadius.lg,
    alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.xl,
  },
  uploadText: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, marginTop: Spacing.sm },
  uploadHint: { fontSize: Typography.sizes.xs, marginTop: 4 },
  requiredNote: { fontSize: Typography.sizes.xs, marginBottom: Spacing.sm },
  completeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing['5xl'] },
  completeIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  completeTitle: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.bold, marginBottom: Spacing.sm },
  completeDesc: { fontSize: Typography.sizes.base, textAlign: 'center', lineHeight: 22, marginBottom: Spacing['2xl'], paddingHorizontal: Spacing.xl },
});

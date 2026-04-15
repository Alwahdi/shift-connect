import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/src/components/Screen';
import { SurfaceCard } from '@/src/components/SurfaceCard';
import { useAuth, type SupportedRole } from '@/src/providers/AuthProvider';
import { getPalette, radius, spacing, typography } from '@/src/constants/theme';

export default function AuthScreen() {
  const palette = getPalette(useColorScheme());
  const { signIn, signUp, activatePreview, isDemoMode } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [role, setRole] = useState<SupportedRole>('professional');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (mode === 'signup' && !name.trim())) {
      Alert.alert('Missing details', 'Please complete the required fields to continue.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const result = await signIn(email.trim(), password.trim());
        if (result.error) {
          Alert.alert('Sign in failed', result.error);
          return;
        }
      } else {
        const result = await signUp({ email: email.trim(), password: password.trim(), role, name: name.trim(), organizationName: organizationName.trim() });
        if (result.error) {
          Alert.alert('Sign up failed', result.error);
          return;
        }
        if (result.needsEmailConfirmation) {
          Alert.alert('Check your inbox', 'Confirm your email, then sign in from the app.');
        }
      }
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = async (previewRole: SupportedRole) => {
    setSubmitting(true);
    try {
      await activatePreview(previewRole);
      router.replace('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={[styles.hero, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <View style={[styles.logo, { backgroundColor: palette.primary }]}> 
          <Ionicons name="medical" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.eyebrow, { color: palette.secondaryDeep }]}>Shift Connect Mobile</Text>
          <Text style={[styles.title, { color: palette.text }]}>A polished Expo experience for professionals and clinics.</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>Built for fast staffing, clean workflows, and mobile-first confidence — with admin intentionally kept on web.</Text>
        </View>
      </View>

      <SurfaceCard>
        <View style={styles.modeRow}>
          {(['signup', 'login'] as const).map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.modeButton, { backgroundColor: mode === item ? palette.primary : palette.surfaceMuted }]}> 
              <Text style={[styles.modeText, { color: mode === item ? '#FFFFFF' : palette.text }]}>{item === 'signup' ? 'Create account' : 'Sign in'}</Text>
            </Pressable>
          ))}
        </View>

        {mode === 'signup' ? (
          <View style={styles.roleRow}>
            {(['professional', 'clinic'] as const).map((item) => (
              <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleButton, { borderColor: role === item ? palette.primary : palette.border, backgroundColor: role === item ? palette.backgroundAlt : palette.surface }]}> 
                <Text style={[styles.roleTitle, { color: palette.text }]}>{item === 'professional' ? 'Professional' : 'Clinic'}</Text>
                <Text style={[styles.roleDescription, { color: palette.textMuted }]}>{item === 'professional' ? 'Find flexible shifts and premium matches.' : 'Fill urgent openings with verified talent.'}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <TextInput placeholder="Email" placeholderTextColor={palette.textMuted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceMuted }]} />
        <TextInput placeholder="Password" placeholderTextColor={palette.textMuted} secureTextEntry value={password} onChangeText={setPassword} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceMuted }]} />
        {mode === 'signup' ? (
          <>
            <TextInput placeholder={role === 'clinic' ? 'Contact name' : 'Full name'} placeholderTextColor={palette.textMuted} value={name} onChangeText={setName} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceMuted }]} />
            {role === 'clinic' ? <TextInput placeholder="Clinic name" placeholderTextColor={palette.textMuted} value={organizationName} onChangeText={setOrganizationName} style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.surfaceMuted }]} /> : null}
          </>
        ) : null}

        <Pressable disabled={submitting} onPress={handleSubmit} style={[styles.primaryButton, { backgroundColor: palette.primary }]}> 
          {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>{mode === 'signup' ? 'Continue to mobile app' : 'Open dashboard'}</Text>}
        </Pressable>

        <Text style={[styles.helperText, { color: palette.textMuted }]}>Use your existing Shift Connect credentials when Supabase environment variables are configured.</Text>
      </SurfaceCard>

      <SurfaceCard>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Preview the app instantly</Text>
        <Text style={[styles.helperText, { color: palette.textMuted }]}>Expo Go will still work even without backend keys. Preview mode lets you explore both supported mobile roles.</Text>
        <View style={styles.previewRow}>
          <Pressable onPress={() => handlePreview('professional')} disabled={submitting} style={[styles.previewButton, { backgroundColor: palette.secondaryDeep }]}> 
            <Text style={styles.previewButtonText}>Preview professional</Text>
          </Pressable>
          <Pressable onPress={() => handlePreview('clinic')} disabled={submitting} style={[styles.previewButton, { backgroundColor: palette.primaryDeep }]}> 
            <Text style={styles.previewButtonText}>Preview clinic</Text>
          </Pressable>
        </View>
        {isDemoMode ? <Text style={[styles.demoTag, { color: palette.warning }]}>Preview mode is active because Expo public Supabase keys are not set.</Text> : null}
      </SurfaceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: 8 },
  eyebrow: { fontSize: typography.small, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: typography.title, fontWeight: '800', lineHeight: 36 },
  subtitle: { fontSize: typography.body, lineHeight: 22 },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, paddingVertical: 12, borderRadius: radius.pill, alignItems: 'center' },
  modeText: { fontSize: typography.body, fontWeight: '700' },
  roleRow: { gap: spacing.sm },
  roleButton: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: 6 },
  roleTitle: { fontSize: typography.body, fontWeight: '700' },
  roleDescription: { fontSize: typography.small, lineHeight: 18 },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: typography.body },
  primaryButton: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  primaryButtonText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '800' },
  helperText: { fontSize: typography.small, lineHeight: 19 },
  sectionTitle: { fontSize: typography.h3, fontWeight: '700' },
  previewRow: { gap: spacing.sm },
  previewButton: { minHeight: 50, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  previewButtonText: { color: '#FFFFFF', fontSize: typography.body, fontWeight: '800' },
  demoTag: { fontSize: typography.small, fontWeight: '700' },
});

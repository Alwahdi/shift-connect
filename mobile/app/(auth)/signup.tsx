import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, AppRole } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { spacing, typography, borderRadius, colors as themeColors } from '@/constants/theme';

type Step = 'role' | 'details';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!role || !validate()) return;
    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, role, {
        full_name: fullName.trim(),
      });
      if (result.error) {
        Alert.alert('Sign Up Failed', result.error.message);
      } else if (result.needsEmailConfirmation) {
        Alert.alert(
          'Check Your Email',
          'We sent a confirmation link to your email. Please verify to continue.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => step === 'details' ? setStep('role') : router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {step === 'role' ? (
            <>
              <View style={styles.header}>
                <Text style={[typography.h1, { color: colors.text }]}>Join SyndeoCare</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                  How would you like to get started?
                </Text>
              </View>

              <View style={styles.roleCards}>
                <RoleCard
                  icon="person-outline"
                  title="Healthcare Professional"
                  description="Find shifts, build your career, and connect with top facilities"
                  selected={role === 'professional'}
                  onPress={() => setRole('professional')}
                  colors={colors}
                />
                <RoleCard
                  icon="business-outline"
                  title="Healthcare Facility"
                  description="Post shifts, find qualified professionals, and manage staffing"
                  selected={role === 'clinic'}
                  onPress={() => setRole('clinic')}
                  colors={colors}
                />
              </View>

              <Button
                title="Continue"
                onPress={() => setStep('details')}
                disabled={!role}
                size="lg"
                fullWidth
                style={{ marginTop: spacing.xl }}
              />
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={[typography.h2, { color: colors.text }]}>Create Account</Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  {role === 'professional' ? 'Professional' : 'Facility'} account
                </Text>
              </View>

              <View style={styles.form}>
                <Input
                  label={role === 'professional' ? 'Full Name' : 'Organization Name'}
                  placeholder={role === 'professional' ? 'Dr. John Smith' : 'City General Hospital'}
                  value={fullName}
                  onChangeText={setFullName}
                  leftIcon="person-outline"
                  error={errors.fullName}
                  autoCapitalize="words"
                />
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="mail-outline"
                  error={errors.email}
                />
                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  isPassword
                  leftIcon="lock-closed-outline"
                  error={errors.password}
                />
                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  isPassword
                  leftIcon="lock-closed-outline"
                  error={errors.confirmPassword}
                />
                <Button
                  title="Create Account"
                  onPress={handleSignUp}
                  loading={loading}
                  size="lg"
                  fullWidth
                />
              </View>
            </>
          )}

          <View style={styles.footer}>
            <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={[typography.bodySmMedium, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RoleCard({
  icon,
  title,
  description,
  selected,
  onPress,
  colors: c,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        roleStyles.card,
        {
          backgroundColor: selected ? c.primaryLight : c.card,
          borderColor: selected ? c.primary : c.cardBorder,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      <View style={[roleStyles.iconCircle, { backgroundColor: selected ? c.primary : c.surface }]}>
        <Ionicons name={icon} size={28} color={selected ? '#FFFFFF' : c.textSecondary} />
      </View>
      <Text style={[typography.h4, { color: c.text, marginTop: spacing.md }]}>{title}</Text>
      <Text style={[typography.bodySm, { color: c.textSecondary, marginTop: spacing.xs }]}>
        {description}
      </Text>
      {selected && (
        <View style={roleStyles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color={c.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const roleStyles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.base,
    position: 'relative',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  backButton: {
    marginTop: spacing.base,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  roleCards: {
    gap: spacing.base,
  },
  form: {
    gap: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
});

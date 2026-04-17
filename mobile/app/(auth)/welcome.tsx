import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
import { Spacing, Typography, BorderRadius } from '@/config/theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={[styles.logoContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="medical" size={56} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.primary }]}>SyndeoCare</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Healthcare Staffing, Simplified
        </Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {[
          { icon: 'search-outline' as const, title: 'Find Shifts Instantly', desc: 'Browse healthcare shifts near you' },
          { icon: 'shield-checkmark-outline' as const, title: 'Verified Professionals', desc: 'All credentials reviewed and verified' },
          { icon: 'chatbubbles-outline' as const, title: 'Real-Time Messaging', desc: 'Communicate directly with facilities' },
        ].map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name={feature.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Button
          title={t('auth.signIn')}
          onPress={() => router.push('/(auth)/sign-in')}
          fullWidth
          size="lg"
        />
        <View style={{ height: Spacing.md }} />
        <Button
          title={t('auth.createAccount')}
          onPress={() => router.push('/(auth)/sign-up')}
          variant="outline"
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  hero: { alignItems: 'center', paddingTop: Spacing['3xl'], paddingBottom: Spacing.xl },
  logoContainer: {
    width: 100, height: 100, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg,
  },
  appName: { fontSize: Typography.sizes['4xl'], fontWeight: Typography.weights.bold, marginBottom: Spacing.xs },
  tagline: { fontSize: Typography.sizes.md, textAlign: 'center' },
  features: { flex: 1, justifyContent: 'center', gap: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, marginLeft: Spacing.md },
  featureTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, marginBottom: 2 },
  featureDesc: { fontSize: Typography.sizes.sm },
  actions: { paddingTop: Spacing.lg },
});

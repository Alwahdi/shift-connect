import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { spacing, typography, colors } from '@/constants/theme';

export default function WelcomeScreen() {
  const { user, userRole, isOnboardingComplete, isLoading } = useAuth();
  const { colors: theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user && userRole) {
      if (!isOnboardingComplete) {
        router.replace(`/(onboarding)/${userRole}`);
      } else {
        router.replace('/(app)/(tabs)');
      }
    }
  }, [user, userRole, isOnboardingComplete, isLoading]);

  if (isLoading || user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary[500] }]}>
            <Text style={styles.logoText}>S</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[700]]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.logoCircleLarge}>
            <Text style={styles.logoTextLarge}>S</Text>
          </View>
          <Text style={styles.appName}>SyndeoCare</Text>
          <Text style={styles.tagline}>Healthcare Staffing, Simplified</Text>
        </View>

        <View style={styles.features}>
          <FeatureItem icon="🏥" text="Connect with top healthcare facilities" />
          <FeatureItem icon="⚡" text="Find shifts that match your schedule" />
          <FeatureItem icon="💬" text="Real-time messaging with employers" />
          <FeatureItem icon="⭐" text="Build your professional reputation" />
        </View>

        <View style={styles.buttons}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/signup')}
            variant="secondary"
            size="lg"
            fullWidth
            textStyle={{ color: colors.primary[600] }}
            style={{ backgroundColor: '#FFFFFF' }}
          />
          <View style={{ height: spacing.md }} />
          <Button
            title="I already have an account"
            onPress={() => router.push('/(auth)/login')}
            variant="ghost"
            size="lg"
            fullWidth
            textStyle={{ color: 'rgba(255,255,255,0.9)' }}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: 50,
  },
  heroSection: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoTextLarge: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
  },
  features: {
    gap: spacing.base,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    flex: 1,
  },
  buttons: {
    gap: spacing.sm,
  },
});

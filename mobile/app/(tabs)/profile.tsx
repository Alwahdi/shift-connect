import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, Card, Badge, Divider, Button } from '@/components/ui';
import { Spacing, Typography } from '@/config/theme';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { userRole, signOut, user } = useAuth();
  const { displayName, avatarUrl, verificationStatus, profile } = useProfile();
  const { language, toggleLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(t('auth.signOut'), t('profile.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'), style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified': return <Badge label={t('profile.verified')} variant="success" />;
      case 'pending': return <Badge label={t('profile.pendingVerification')} variant="warning" />;
      case 'rejected': return <Badge label={t('profile.rejected')} variant="error" />;
      default: return null;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + Spacing.base, paddingBottom: Spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Avatar uri={avatarUrl} name={displayName} size={80} />
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{displayName || 'User'}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <Badge label={userRole === 'professional' ? t('auth.professional') : t('auth.clinic')} variant="primary" />
            {getVerificationBadge()}
          </View>
        </View>
      </View>

      {/* Profile Stats */}
      {profile && (
        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            {profile.rating_avg !== undefined && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{(profile.rating_avg || 0).toFixed(1)}</Text>
                <View style={styles.statLabelRow}>
                  <Ionicons name="star" size={12} color={colors.warning} />
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('dashboard.averageRating')}</Text>
                </View>
              </View>
            )}
            {profile.rating_count !== undefined && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{profile.rating_count || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t('profile.ratings')}</Text>
              </View>
            )}
          </View>
        </Card>
      )}

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.title')}</Text>

        <Card variant="outlined" padding="none">
          <SettingsRow
            icon="moon-outline" label={t('settings.darkMode')} colors={colors}
            trailing={
              <Pressable
                onPress={() => { toggleTheme(); Haptics.selectionAsync(); }}
                style={[styles.toggle, { backgroundColor: isDark ? colors.primary : colors.border }]}
              >
                <View style={[styles.toggleKnob, { transform: [{ translateX: isDark ? 18 : 0 }] }]} />
              </Pressable>
            }
          />
          <Divider spacing={0} />
          <SettingsRow
            icon="language-outline" label={t('settings.language')} colors={colors}
            trailing={
              <Pressable onPress={() => { toggleLanguage(); Haptics.selectionAsync(); }}>
                <Text style={[styles.languageValue, { color: colors.primary }]}>
                  {language === 'en' ? t('settings.english') : t('settings.arabic')}
                </Text>
              </Pressable>
            }
          />
          <Divider spacing={0} />
          <SettingsRow icon="notifications-outline" label={t('settings.notifications')} colors={colors} showArrow />
          <Divider spacing={0} />
          <SettingsRow icon="help-circle-outline" label={t('settings.help')} colors={colors} showArrow />
          <Divider spacing={0} />
          <SettingsRow icon="information-circle-outline" label={t('settings.about')} colors={colors} showArrow />
        </Card>
      </View>

      {/* Sign Out */}
      <View style={styles.signOutContainer}>
        <Button
          title={t('auth.signOut')}
          variant="destructive"
          onPress={handleSignOut}
          fullWidth
          icon={<Ionicons name="log-out-outline" size={18} color="#FFF" />}
        />
      </View>

      <Text style={[styles.version, { color: colors.textTertiary }]}>{t('settings.version')} 1.0.0</Text>
    </ScrollView>
  );
}

function SettingsRow({ icon, label, colors, trailing, showArrow, onPress }: any) {
  return (
    <Pressable
      style={styles.settingsRow}
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={colors.textSecondary} />
      <Text style={[styles.settingsLabel, { color: colors.text }]}>{label}</Text>
      {trailing || (showArrow && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: 'center', paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  profileInfo: { alignItems: 'center', marginTop: Spacing.md },
  name: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, marginBottom: 4 },
  email: { fontSize: Typography.sizes.sm, marginBottom: Spacing.sm },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm },
  statsCard: { marginHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: Typography.sizes.xs },
  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.base, gap: Spacing.md },
  settingsLabel: { flex: 1, fontSize: Typography.sizes.base },
  toggle: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center', paddingHorizontal: 3 },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  languageValue: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  signOutContainer: { paddingHorizontal: Spacing.xl, marginTop: Spacing.sm },
  version: { textAlign: 'center', fontSize: Typography.sizes.xs, marginTop: Spacing.xl },
});

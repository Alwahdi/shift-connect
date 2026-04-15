import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/useProfile";
import { colors, spacing, borderRadius, typography, shadows } from "@/constants/theme";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, userRole, signOut } = useAuth();
  const { displayName, avatarUrl, verificationStatus, profileId, profile, refetch } = useProfile();
  const [profileData, setProfileData] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      if (userRole === "professional") {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        setProfileData(data);
      } else {
        const { data } = await supabase.from("clinics").select("*").eq("user_id", user.id).single();
        setProfileData(data);
      }
      const { data: docs } = await supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setDocuments(docs || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [user, userRole]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const onRefresh = useCallback(async () => { setRefreshing(true); await fetchProfile(); await refetch(); setRefreshing(false); }, [fetchProfile, refetch]);

  const handleSignOut = () => {
    Alert.alert(t("auth.signOut"), "Are you sure you want to sign out?", [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("auth.signOut"), style: "destructive", onPress: async () => { await signOut(); router.replace("/(auth)/sign-in"); } },
    ]);
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Avatar uri={avatarUrl} name={displayName} size="xl" showVerification={verificationStatus === "verified"} />
          <Text style={styles.name}>{displayName || t("profile.myProfile")}</Text>
          <View style={styles.badgeRow}>
            <Badge variant="default">{userRole === "professional" ? "Professional" : "Clinic"}</Badge>
            {verificationStatus && (
              <Badge variant={verificationStatus === "verified" ? "success" : verificationStatus === "rejected" ? "error" : "warning"}>
                {t(`profile.${verificationStatus}`)}
              </Badge>
            )}
          </View>
          {profileData?.created_at && <Text style={styles.memberSince}>{t("profile.memberSince")} {format(parseISO(profileData.created_at), "MMM yyyy")}</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="star" size={18} color={colors.warning} />
            <Text style={styles.statVal}>{profileData?.rating_avg?.toFixed(1) || "—"}</Text>
            <Text style={styles.statLabel}>{t("dashboard.rating")}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <MaterialCommunityIcons name="message-text" size={18} color={colors.teal} />
            <Text style={styles.statVal}>{profileData?.rating_count || 0}</Text>
            <Text style={styles.statLabel}>{t("profile.reviews")}</Text>
          </View>
        </View>

        {/* Edit button */}
        <Button variant="outline" onPress={() => router.push("/(app)/profile/edit")}
          icon={<MaterialCommunityIcons name="pencil" size={16} color={colors.primary} />}
          style={{ marginHorizontal: spacing.base, marginBottom: spacing.lg }}>
          {t("profile.editProfile")}
        </Button>

        {/* Bio/Description */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t("profile.bio")}</Text>
          <Text style={styles.sectionText}>{(userRole === "professional" ? profileData?.bio : profileData?.description) || "No description added."}</Text>
        </Card>

        {/* Contact */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{profileData?.email || user?.email}</Text>
          </View>
          {profileData?.phone && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profileData.phone}</Text>
            </View>
          )}
        </Card>

        {/* Professional details */}
        {userRole === "professional" && profileData?.specialties?.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t("profile.specialties")}</Text>
            <View style={styles.chipRow}>
              {profileData.specialties.map((s: string) => <Badge key={s} variant="info">{s}</Badge>)}
            </View>
          </Card>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>{t("profile.documents")}</Text>
            {documents.map((d: any) => (
              <View key={d.id} style={styles.docRow}>
                <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.docName} numberOfLines={1}>{d.name}</Text>
                <Badge variant={d.status === "verified" ? "success" : d.status === "rejected" ? "error" : "warning"} size="sm">{d.status}</Badge>
              </View>
            ))}
          </Card>
        )}

        {/* Settings link */}
        <Pressable style={styles.settingsRow} onPress={() => router.push("/(app)/notifications")}>
          <MaterialCommunityIcons name="bell-outline" size={20} color={colors.text} />
          <Text style={styles.settingsText}>{t("notifications.title")}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
        </Pressable>

        {/* Sign out */}
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{t("auth.signOut")}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerSection: { alignItems: "center", paddingTop: spacing.xl, paddingBottom: spacing.lg },
  name: { fontSize: typography.sizes["2xl"], fontWeight: typography.weights.bold, color: colors.text, marginTop: spacing.md },
  badgeRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  memberSince: { fontSize: typography.sizes.sm, color: colors.textTertiary, marginTop: spacing.xs },
  statsRow: { flexDirection: "row", backgroundColor: colors.white, marginHorizontal: spacing.base, marginBottom: spacing.lg, padding: spacing.base, borderRadius: borderRadius.lg, ...shadows.sm },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statVal: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text },
  statLabel: { fontSize: typography.sizes.xs, color: colors.textSecondary },
  divider: { width: 1, height: 40, backgroundColor: colors.border },
  section: { marginHorizontal: spacing.base, marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.sm },
  sectionText: { fontSize: typography.sizes.base, color: colors.textSecondary, lineHeight: 22 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  infoText: { fontSize: typography.sizes.base, color: colors.text },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  docRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  docName: { flex: 1, fontSize: typography.sizes.base, color: colors.text },
  settingsRow: { flexDirection: "row", alignItems: "center", backgroundColor: colors.white, marginHorizontal: spacing.base, padding: spacing.base, borderRadius: borderRadius.lg, gap: spacing.md, marginTop: spacing.sm, ...shadows.sm },
  settingsText: { flex: 1, fontSize: typography.sizes.base, color: colors.text, fontWeight: typography.weights.medium },
  signOutBtn: { alignItems: "center", paddingVertical: spacing.lg, marginTop: spacing.base },
  signOutText: { fontSize: typography.sizes.base, color: colors.error, fontWeight: typography.weights.semibold },
});

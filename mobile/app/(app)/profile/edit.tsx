import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { colors, spacing, borderRadius, typography } from "@/constants/theme";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      if (userRole === "professional") {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (data) { setFullName(data.full_name || ""); setPhone(data.phone || ""); setBio(data.bio || ""); setHourlyRate(data.hourly_rate?.toString() || ""); setAvatarUri(data.avatar_url); }
      } else {
        const { data } = await supabase.from("clinics").select("*").eq("user_id", user.id).single();
        if (data) { setClinicName(data.name || ""); setPhone(data.phone || ""); setDescription(data.description || ""); setAddress(data.address || ""); setAvatarUri(data.logo_url); }
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (userRole === "professional") {
        await supabase.from("profiles").update({ full_name: fullName, phone, bio, hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null }).eq("user_id", user!.id);
      } else {
        await supabase.from("clinics").update({ name: clinicName, phone, description, address }).eq("user_id", user!.id);
      }
      Toast.show({ type: "success", text1: "Profile updated!" });
      router.back();
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.message });
    } finally { setSaving(false); }
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}><MaterialCommunityIcons name="close" size={24} color={colors.text} /></Pressable>
          <Text style={styles.headerTitle}>{t("profile.editProfile")}</Text>
          <Button variant="primary" size="sm" onPress={handleSave} loading={saving}>{t("common.save")}</Button>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable style={styles.avatarSection} onPress={pickImage}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> : (
              <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="camera" size={28} color={colors.textTertiary} /></View>
            )}
            <View style={styles.cameraIcon}><MaterialCommunityIcons name="camera" size={12} color={colors.white} /></View>
          </Pressable>

          {userRole === "professional" ? (
            <>
              <Input label={t("auth.fullName")} value={fullName} onChangeText={setFullName} />
              <Input label={t("profile.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label={t("profile.bio")} value={bio} onChangeText={setBio} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} />
              <Input label={`${t("profile.hourlyRate")} ($)`} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
            </>
          ) : (
            <>
              <Input label={t("profile.clinicName")} value={clinicName} onChangeText={setClinicName} />
              <Input label={t("profile.phone")} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label={t("profile.description")} value={description} onChangeText={setDescription} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: "top" }} />
              <Input label={t("profile.address")} value={address} onChangeText={setAddress} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.base, paddingVertical: spacing.md, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.text },
  scroll: { padding: spacing.base },
  avatarSection: { alignSelf: "center", marginBottom: spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceSecondary, justifyContent: "center", alignItems: "center" },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.white },
});

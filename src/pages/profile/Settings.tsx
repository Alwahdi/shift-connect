import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings as SettingsIcon, Palette, Bell, Globe, Shield, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserPreferences {
  language: string;
  theme: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_in_app: boolean;
  email_new_jobs: boolean;
  email_new_messages: boolean;
  email_booking_updates: boolean;
  email_digest: string;
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: language,
    theme: theme,
    notifications_email: true,
    notifications_push: true,
    notifications_in_app: true,
    email_new_jobs: true,
    email_new_messages: true,
    email_booking_updates: true,
    email_digest: "daily",
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching preferences:", error);
      }

      if (data) {
        setPreferences({
          language: data.language || language,
          theme: data.theme || theme,
          notifications_email: data.notifications_email ?? true,
          notifications_push: data.notifications_push ?? true,
          notifications_in_app: data.notifications_in_app ?? true,
          email_new_jobs: data.email_new_jobs ?? true,
          email_new_messages: data.email_new_messages ?? true,
          email_booking_updates: data.email_booking_updates ?? true,
          email_digest: data.email_digest || "daily",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      // Apply theme and language changes
      setTheme(preferences.theme as "light" | "dark" | "system");
      setLanguage(preferences.language as "en" | "ar");

      toast({
        title: t("settings.saved"),
        description: t("settings.savedDesc"),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      toast({
        title: t("settings.accountDeleted"),
        description: t("settings.accountDeletedDesc"),
      });

      // Sign out and redirect
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10 max-w-3xl" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <SettingsIcon className="h-8 w-8" />
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("settings.appearance")}
            </CardTitle>
            <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme" className="text-base">
                  {t("settings.theme")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("settings.themeDesc")}</p>
              </div>
              <Select
                value={preferences.theme}
                onValueChange={(v) => setPreferences({ ...preferences, theme: v })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("common.light")}</SelectItem>
                  <SelectItem value="dark">{t("common.dark")}</SelectItem>
                  <SelectItem value="system">{t("common.system")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="language" className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t("settings.language")}
                </Label>
                <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
              </div>
              <Select
                value={preferences.language}
                onValueChange={(v) => setPreferences({ ...preferences, language: v })}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("settings.notifications")}
            </CardTitle>
            <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{t("settings.pushNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.pushNotificationsDesc")}</p>
              </div>
              <Switch
                checked={preferences.notifications_push}
                onCheckedChange={(v) => setPreferences({ ...preferences, notifications_push: v })}
              />
            </div>

            <Separator />

            {/* In-App Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">{t("settings.inAppNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("settings.inAppNotificationsDesc")}</p>
              </div>
              <Switch
                checked={preferences.notifications_in_app}
                onCheckedChange={(v) => setPreferences({ ...preferences, notifications_in_app: v })}
              />
            </div>

            <Separator />

            {/* Email Notifications Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base">{t("settings.emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.emailNotificationsDesc")}</p>
                </div>
                <Switch
                  checked={preferences.notifications_email}
                  onCheckedChange={(v) => setPreferences({ ...preferences, notifications_email: v })}
                />
              </div>

              {preferences.notifications_email && (
                <div className="ms-4 space-y-4 pt-2 border-s-2 ps-4">
                  <div className="flex items-center justify-between">
                    <Label>{t("settings.emailNewJobs")}</Label>
                    <Switch
                      checked={preferences.email_new_jobs}
                      onCheckedChange={(v) => setPreferences({ ...preferences, email_new_jobs: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("settings.emailNewMessages")}</Label>
                    <Switch
                      checked={preferences.email_new_messages}
                      onCheckedChange={(v) => setPreferences({ ...preferences, email_new_messages: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("settings.emailBookingUpdates")}</Label>
                    <Switch
                      checked={preferences.email_booking_updates}
                      onCheckedChange={(v) => setPreferences({ ...preferences, email_booking_updates: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>{t("settings.emailDigest")}</Label>
                    <Select
                      value={preferences.email_digest}
                      onValueChange={(v) => setPreferences({ ...preferences, email_digest: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t("settings.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("settings.weekly")}</SelectItem>
                        <SelectItem value="never">{t("settings.never")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("settings.account")}
            </CardTitle>
            <CardDescription>{t("settings.accountDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("settings.email")}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full min-h-[48px]">
                  <Trash2 className="h-4 w-4 me-2" />
                  {t("settings.deleteAccount")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("settings.deleteAccountTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("settings.deleteAccountDesc")}
                    <span className="block mt-2 text-destructive font-medium">
                      {t("settings.deleteAccountConfirm")}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="min-h-[44px]">{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount} 
                    className="bg-destructive text-destructive-foreground min-h-[44px]"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 me-2" />
                    )}
                    {t("settings.confirmDelete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={savePreferences} disabled={saving} className="w-full" size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
              {t("common.saving")}
            </>
          ) : (
            t("settings.saveChanges")
          )}
        </Button>
      </div>
    </div>
  );
}

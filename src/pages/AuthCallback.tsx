import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

/**
 * OAuth Callback Handler
 * This page handles the redirect from OAuth providers (Google, etc.)
 * and properly sets up the user session before redirecting to the app.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL hash (OAuth providers return tokens in the hash)
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth callback error:", sessionError);
          setError(sessionError.message);
          toast({
            variant: "destructive",
            title: t("auth.errors.loginFailed"),
            description: sessionError.message,
          });
          setTimeout(() => navigate("/auth"), 2000);
          return;
        }

        if (data.session) {
          // Successfully authenticated
          toast({
            title: t("auth.success.welcomeBack"),
            description: t("auth.success.loggedIn"),
          });

          // Check user role and redirect accordingly
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id)
            .single();

          if (roleData?.role) {
            // Check if onboarding is complete
            if (roleData.role === "professional") {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("onboarding_completed")
                .eq("user_id", data.session.user.id)
                .single();

              if (profileData?.onboarding_completed) {
                navigate("/dashboard/professional");
              } else {
                navigate("/onboarding/professional");
              }
            } else if (roleData.role === "clinic") {
              const { data: clinicData } = await supabase
                .from("clinics")
                .select("onboarding_completed")
                .eq("user_id", data.session.user.id)
                .single();

              if (clinicData?.onboarding_completed) {
                navigate("/dashboard/clinic");
              } else {
                navigate("/onboarding/clinic");
              }
            } else if (roleData.role === "admin" || roleData.role === "super_admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          } else {
            // New user - needs to select role
            navigate("/auth?mode=signup");
          }
        } else {
          // No session - redirect to auth
          navigate("/auth");
        }
      } catch (err) {
        console.error("Unexpected auth callback error:", err);
        setError("An unexpected error occurred");
        setTimeout(() => navigate("/auth"), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, t]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gradient-hero gap-4">
        <div className="text-white text-lg">{error}</div>
        <div className="text-white/70 text-sm">{t("common.redirecting")}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-hero gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-white" />
      <div className="text-white/80 text-lg">{t("auth.verifying")}...</div>
    </div>
  );
};

export default AuthCallback;

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, User, Building2, Users, ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { FormField, InputWithIcon } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { RoleSelector } from "@/components/ui/role-selector";
import { FormFeedback, FormFeedbackContainer } from "@/components/ui/form-feedback";

type UserRole = "professional" | "clinic";
type AuthMode = "login" | "signup";

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user, userRole, isOnboardingComplete, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const emailSchema = z.string().email(t("auth.errors.invalidEmail"));
  const passwordSchema = z.string().min(6, t("auth.errors.passwordMin"));

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [step, setStep] = useState<"role" | "details">(
    searchParams.get("role") ? "details" : "role"
  );
  const [role, setRole] = useState<UserRole | null>(
    (searchParams.get("role") as UserRole) || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      if (!isOnboardingComplete) {
        if (userRole === "professional") {
          navigate("/onboarding/professional");
        } else if (userRole === "clinic") {
          navigate("/onboarding/clinic");
        }
      } else {
        if (userRole === "professional") {
          navigate("/dashboard/professional");
        } else if (userRole === "clinic") {
          navigate("/dashboard/clinic");
        } else if (userRole === "admin" || userRole === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    }
  }, [user, userRole, isOnboardingComplete, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(formData.email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (mode === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = t("auth.errors.nameRequired");
      }
      if (role === "clinic" && !formData.organizationName.trim()) {
        newErrors.organizationName = t("auth.errors.orgNameRequired");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          const errorMessage = error.message === "Invalid login credentials" 
            ? t("auth.errors.invalidCredentials")
            : error.message;
          setFormError(errorMessage);
        } else {
          setIsSuccess(true);
          toast({
            title: t("auth.success.welcomeBack"),
            description: t("auth.success.loggedIn"),
          });
        }
      } else {
        if (!role) {
          toast({
            variant: "destructive",
            title: t("auth.errors.selectRole"),
            description: t("auth.howToGetStarted"),
          });
          setIsLoading(false);
          return;
        }

        const { error, needsOnboarding, needsEmailConfirmation } = await signUp(formData.email, formData.password, role, {
          name: formData.name,
          organizationName: formData.organizationName,
        });

        if (error) {
          let message = error.message;
          if (error.message.includes("already registered")) {
            message = t("auth.errors.emailExists");
          }
          setFormError(message);
        } else if (needsEmailConfirmation) {
          toast({
            title: t("auth.verification.checkEmail"),
            description: t("auth.verification.clickLink"),
          });
          navigate("/verify-email", { state: { email: formData.email } });
        } else {
          toast({
            title: t("auth.success.accountCreated"),
            description: t("auth.success.completeProfile"),
          });
          
          if (needsOnboarding) {
            if (role === "professional") {
              navigate("/onboarding/professional");
            } else {
              navigate("/onboarding/clinic");
            }
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: "https://syndeocare.vercel.app/auth/callback",
      },
    });
    if (error) {
      toast({
        variant: "destructive",
        title: t("auth.errors.loginFailed"),
        description: error.message,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Language Switcher */}
        <div className="flex justify-end mb-6">
          <LanguageSwitcher variant="text" />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img 
            src="/syndeocare-logo-white.png" 
            alt="SyndeoCare Logo" 
            className="h-14 w-auto object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback to text if image fails
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        {/* Card */}
        <div className="bg-card backdrop-blur-sm rounded-3xl border border-border/50 shadow-2xl p-7 md:p-9">
          {mode === "login" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("auth.welcomeBack")}</h1>
                <p className="text-muted-foreground">{t("auth.signInToContinue")}</p>
              </div>

              {/* Inline error feedback */}
              <FormFeedbackContainer>
                {formError && (
                  <FormFeedback
                    variant="error"
                    title={t("auth.errors.loginFailed")}
                    message={formError}
                    onDismiss={() => setFormError(null)}
                    className="mb-5"
                  />
                )}
              </FormFeedbackContainer>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  label={t("auth.email")}
                  htmlFor="email"
                  error={errors.email}
                  required
                >
                  <InputWithIcon icon={Mail}>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormError(null); // Clear error on change
                      }}
                      className="h-13 text-base"
                    />
                  </InputWithIcon>
                </FormField>

                <FormField
                  label={t("auth.password")}
                  htmlFor="password"
                  error={errors.password}
                  required
                >
                  <PasswordInput
                    id="password"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setFormError(null);
                    }}
                    className="h-13 text-base"
                  />
                </FormField>

                <LoadingButton 
                  type="submit" 
                  variant="hero" 
                  className="w-full h-13 text-base font-semibold" 
                  isLoading={isLoading}
                  isSuccess={isSuccess}
                  loadingText={t("auth.signingIn")}
                  successText={t("auth.success.loggedIn")}
                >
                  {t("auth.signIn")}
                </LoadingButton>

                {/* Divider */}
                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">{t("auth.orContinueWith")}</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-13 text-base font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 me-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t("auth.continueWithGoogle")}
                </Button>
              </form>

              <div className="mt-8 text-center text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <button 
                  onClick={() => { setMode("signup"); setStep("role"); }}
                  className="text-primary font-semibold hover:underline"
                >
                  {t("common.signUp")}
                </button>
              </div>
            </>
          ) : step === "role" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("auth.joinSyndeoCare")}</h1>
                <p className="text-muted-foreground">{t("auth.howToGetStarted")}</p>
              </div>

              <RoleSelector
                options={[
                  {
                    id: "professional",
                    icon: Users,
                    title: t("auth.imProfessional"),
                    description: t("auth.professionalDesc"),
                    gradient: "gradient-primary",
                  },
                  {
                    id: "clinic",
                    icon: Building2,
                    title: t("auth.imClinic"),
                    description: t("auth.clinicDesc"),
                    gradient: "gradient-accent",
                  },
                ]}
                selectedId={role}
                onSelect={(id) => handleRoleSelect(id as UserRole)}
              />

              <div className="mt-8 text-center text-muted-foreground">
                {t("auth.haveAccount")}{" "}
                <button 
                  onClick={() => setMode("login")}
                  className="text-primary font-semibold hover:underline min-h-[44px] inline-flex items-center"
                >
                  {t("auth.signIn")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => setStep("role")}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="w-4 h-4 rtl-flip" />
                  {t("common.back")}
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {role === "professional" ? t("auth.professionalSignUp") : t("auth.clinicSignUp")}
                </h1>
                <p className="text-muted-foreground">{t("auth.createAccountToStart")}</p>
              </div>

              {/* Inline error feedback */}
              <FormFeedbackContainer>
                {formError && (
                  <FormFeedback
                    variant="error"
                    title={t("auth.errors.signupFailed")}
                    message={formError}
                    onDismiss={() => setFormError(null)}
                    className="mb-5"
                  />
                )}
              </FormFeedbackContainer>

              <form onSubmit={handleSubmit} className="space-y-5">
                {role === "clinic" && (
                  <FormField
                    label={t("auth.organizationName")}
                    htmlFor="organizationName"
                    error={errors.organizationName}
                    required
                  >
                    <InputWithIcon icon={Building2}>
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder={t("auth.clinicNamePlaceholder")}
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className="h-13 text-base"
                      />
                    </InputWithIcon>
                  </FormField>
                )}

                <FormField
                  label={role === "professional" ? t("auth.fullName") : t("auth.contactName")}
                  htmlFor="name"
                  error={errors.name}
                  required
                >
                  <InputWithIcon icon={User}>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("auth.namePlaceholder")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-13 text-base"
                    />
                  </InputWithIcon>
                </FormField>

                <FormField
                  label={t("auth.email")}
                  htmlFor="email"
                  error={errors.email}
                  required
                >
                  <InputWithIcon icon={Mail}>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setFormError(null);
                      }}
                      className="h-13 text-base"
                    />
                  </InputWithIcon>
                </FormField>

                <FormField
                  label={t("auth.password")}
                  htmlFor="password"
                  error={errors.password}
                  required
                >
                  <PasswordInput
                    id="password"
                    placeholder={t("auth.createPasswordPlaceholder")}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setFormError(null);
                    }}
                    className="h-13 text-base"
                    showStrength
                  />
                </FormField>

                <LoadingButton 
                  type="submit" 
                  variant="hero" 
                  className="w-full h-13 text-base font-semibold" 
                  isLoading={isLoading}
                  loadingText={t("auth.creatingAccount")}
                >
                  {t("auth.createAccount")}
                  <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                </LoadingButton>

                {/* Divider */}
                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">{t("auth.orContinueWith")}</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-13 text-base font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 me-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t("auth.continueWithGoogle")}
                </Button>
              </form>

              <div className="mt-8 text-center text-muted-foreground">
                {t("auth.haveAccount")}{" "}
                <button 
                  onClick={() => setMode("login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {t("auth.signIn")}
                </button>
              </div>

              <p className="mt-6 text-xs text-center text-muted-foreground leading-relaxed">
                {t("auth.termsAgreement")}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
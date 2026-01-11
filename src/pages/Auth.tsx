import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, User, Building2, Users, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          toast({
            variant: "destructive",
            title: t("auth.errors.loginFailed"),
            description: error.message === "Invalid login credentials" 
              ? t("auth.errors.invalidCredentials")
              : error.message,
          });
        } else {
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
          
          toast({
            variant: "destructive",
            title: t("auth.errors.signupFailed"),
            description: message,
          });
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
          <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center shadow-xl">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-3xl text-white drop-shadow-lg">SyndeoCare</span>
        </Link>

        {/* Card */}
        <div className="bg-card backdrop-blur-sm rounded-3xl border border-border/50 shadow-2xl p-7 md:p-9">
          {mode === "login" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t("auth.welcomeBack")}</h1>
                <p className="text-muted-foreground">{t("auth.signInToContinue")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`ps-12 h-13 text-base ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`ps-12 pe-12 h-13 text-base ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" variant="hero" className="w-full h-13 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("auth.signIn")}
                </Button>

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

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect("professional")}
                  className="w-full p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 text-start group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-foreground text-lg mb-1.5">{t("auth.imProfessional")}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("auth.professionalDesc")}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("clinic")}
                  className="w-full p-6 rounded-2xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all duration-200 text-start group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-foreground text-lg mb-1.5">{t("auth.imClinic")}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("auth.clinicDesc")}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center text-muted-foreground">
                {t("auth.haveAccount")}{" "}
                <button 
                  onClick={() => setMode("login")}
                  className="text-primary font-semibold hover:underline"
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {role === "clinic" && (
                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="text-sm font-medium">{t("auth.organizationName")}</Label>
                    <div className="relative">
                      <Building2 className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder={t("auth.clinicNamePlaceholder")}
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className={`ps-12 h-13 text-base ${errors.organizationName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.organizationName && <p className="text-sm text-destructive">{errors.organizationName}</p>}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">{role === "professional" ? t("auth.fullName") : t("auth.contactName")}</Label>
                  <div className="relative">
                    <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t("auth.namePlaceholder")}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`ps-12 h-13 text-base ${errors.name ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">{t("auth.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`ps-12 h-13 text-base ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">{t("auth.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.createPasswordPlaceholder")}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`ps-12 pe-12 h-13 text-base ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" variant="hero" className="w-full h-13 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {t("auth.createAccount")}
                      <ArrowRight className="w-5 h-5 ms-2 rtl-flip" />
                    </>
                  )}
                </Button>

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
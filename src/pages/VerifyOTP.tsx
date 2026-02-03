import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import syndeoCareLogo from "@/assets/syndeocare-logo-white.png";

interface LocationState {
  email: string;
  password?: string;
  role?: "professional" | "clinic";
  name?: string;
  organizationName?: string;
}

const VerifyOTP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const state = location.state as LocationState | null;
  const email = state?.email || "";
  
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/auth");
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError(t("auth.otp.invalid"));
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: verifyError } = await supabase.functions.invoke("verify-otp", {
        body: { email, code: otp },
      });

      if (verifyError || data?.error) {
        const errorMessage = data?.error || verifyError?.message || t("auth.otp.invalid");
        
        if (data?.maxAttemptsReached) {
          setError(t("auth.otp.maxAttempts"));
          setOtp("");
          setCanResend(true);
          setResendCountdown(0);
        } else {
          setError(errorMessage);
          setOtp("");
        }
        return;
      }

      // OTP verified successfully
      setIsSuccess(true);
      
      // If we have signup data, complete the registration
      if (state?.password && state?.role) {
        // Sign up with Supabase Auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: state.password,
          options: {
            data: {
              name: state.name,
              organizationName: state.organizationName,
              role: state.role,
              email_verified: true,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (signUpData.user) {
          // Create user role
          await supabase
            .from("user_roles")
            .insert({ user_id: signUpData.user.id, role: state.role });

          // Create profile or clinic based on role
          if (state.role === "professional") {
            await supabase
              .from("profiles")
              .insert({
                user_id: signUpData.user.id,
                email: email,
                full_name: state.name || email.split("@")[0],
                onboarding_completed: false,
              });
          } else {
            await supabase
              .from("clinics")
              .insert({
                user_id: signUpData.user.id,
                email: email,
                name: state.organizationName || state.name || email.split("@")[0],
                onboarding_completed: false,
              });
          }

          toast({
            title: t("auth.success.accountCreated"),
            description: t("auth.success.completeProfile"),
          });

          // Navigate to onboarding
          setTimeout(() => {
            if (state.role === "professional") {
              navigate("/onboarding/professional");
            } else {
              navigate("/onboarding/clinic");
            }
          }, 1500);
        }
      } else {
        // Just email verification, redirect to auth
        toast({
          title: t("auth.success.emailVerified"),
          description: t("auth.success.canNowLogin"),
        });
        
        setTimeout(() => {
          navigate("/auth", { state: { emailVerified: true, email } });
        }, 1500);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || t("common.error"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-otp-email", {
        body: { email, type: "signup" },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message);
      }

      toast({
        title: t("auth.otp.codeSent"),
        description: t("auth.otp.checkEmail"),
      });

      setResendCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch (err: any) {
      if (err.message?.includes("wait")) {
        setError(t("auth.otp.waitToResend"));
      } else {
        setError(err.message || t("common.error"));
      }
    } finally {
      setIsResending(false);
    }
  };

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !isVerifying && !isSuccess) {
      handleVerify();
    }
  }, [otp]);

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-10 md:py-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 end-0 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 start-0 w-72 md:w-[30rem] h-72 md:h-[30rem] bg-primary/15 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Language Switcher */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 me-2" />
            {t("common.back")}
          </Button>
          <LanguageSwitcher variant="text" />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            src={syndeoCareLogo} 
            alt="SyndeoCare Logo" 
            className="h-14 w-auto object-contain drop-shadow-lg transition-transform"
          />
        </Link>

        {/* Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-card/95 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl p-7 md:p-9"
        >
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t("auth.success.emailVerified")}
              </h2>
              <p className="text-muted-foreground">
                {t("auth.success.redirecting")}
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mt-4" />
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {t("auth.otp.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("auth.otp.subtitle")}
                </p>
                <p className="text-sm text-primary font-medium mt-2">
                  {email}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              {/* OTP Input */}
              <div className="flex justify-center mb-8">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isVerifying}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6 || isVerifying}
                className="w-full h-13 text-base font-semibold mb-6"
                variant="hero"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin me-2" />
                    {t("auth.otp.verifying")}
                  </>
                ) : (
                  t("auth.otp.verify")
                )}
              </Button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  {t("auth.otp.didntReceive")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className="text-primary"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t("auth.otp.sending")}
                    </>
                  ) : canResend ? (
                    <>
                      <RefreshCw className="w-4 h-4 me-2" />
                      {t("auth.otp.resend")}
                    </>
                  ) : (
                    t("auth.otp.resendIn", { seconds: resendCountdown })
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;

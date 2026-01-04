import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, Eye, EyeOff, User, Building2, Users, ArrowRight, Check } from "lucide-react";

type UserRole = "professional" | "clinic";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"role" | "details">(
    searchParams.get("role") ? "details" : "role"
  );
  const [role, setRole] = useState<UserRole | null>(
    (searchParams.get("role") as UserRole) || null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
  });

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep("details");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup:", { role, ...formData });
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl text-foreground">SyndeoCare</span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-8">
          {step === "role" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">Join SyndeoCare</h1>
                <p className="text-muted-foreground">How would you like to get started?</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect("professional")}
                  className="w-full p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">I'm a Professional</h3>
                      <p className="text-sm text-muted-foreground">
                        Find flexible shifts at top healthcare facilities near you.
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("clinic")}
                  className="w-full p-6 rounded-xl border-2 border-border hover:border-accent transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">I'm a Clinic</h3>
                      <p className="text-sm text-muted-foreground">
                        Staff your facility with verified healthcare professionals.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {role === "professional" ? "Professional Sign Up" : "Clinic Sign Up"}
                </h1>
                <p className="text-muted-foreground">Create your account to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {role === "clinic" && (
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="organizationName"
                        type="text"
                        placeholder="Your Clinic Name"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">{role === "professional" ? "Full Name" : "Contact Name"}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-secondary rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success" />
                    Free to create account
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success" />
                    {role === "professional" ? "Quick verification process" : "Start posting shifts today"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-success" />
                    Cancel anytime
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full" size="lg">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="w-full text-sm text-muted-foreground hover:text-primary"
                >
                  ← Choose different role
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

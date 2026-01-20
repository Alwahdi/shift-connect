import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { FormField, InputWithIcon } from "@/components/ui/form-field";
import { PasswordInput } from "@/components/ui/password-input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Mail, User, Phone, Building2, MapPin, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const meta: Meta = {
  title: "Patterns/Forms",
  parameters: {
    layout: "centered",
  },
};

export default meta;

/**
 * ## Login Form
 * Standard authentication pattern with email and password.
 */
export const LoginForm: StoryObj = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Logged in successfully!");
      }, 1500);
    };

    return (
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-brand mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your SyndeoCare account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email" htmlFor="login-email" required>
              <InputWithIcon icon={Mail}>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </InputWithIcon>
            </FormField>
            
            <FormField label="Password" htmlFor="login-password" required>
              <PasswordInput 
                id="login-password" 
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </FormField>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Button variant="link" className="px-0 h-auto text-sm">
                Forgot password?
              </Button>
            </div>

            <LoadingButton 
              type="submit" 
              className="w-full" 
              variant="hero"
              isLoading={isLoading}
              loadingText="Signing in..."
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </LoadingButton>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="px-1 h-auto">Sign up</Button>
          </p>
        </CardFooter>
      </Card>
    );
  },
};

/**
 * ## Registration Form
 * Multi-field signup with validation states.
 */
export const RegistrationForm: StoryObj = {
  render: () => {
    const [step, setStep] = useState(1);
    
    return (
      <Card className="w-[450px]">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            {step === 1 && "Step 1: Personal information"}
            {step === 2 && "Step 2: Professional details"}
            {step === 3 && "Step 3: Security"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" htmlFor="firstName" required>
                  <Input id="firstName" placeholder="John" />
                </FormField>
                <FormField label="Last Name" htmlFor="lastName" required>
                  <Input id="lastName" placeholder="Doe" />
                </FormField>
              </div>
              <FormField label="Email" htmlFor="reg-email" required>
                <InputWithIcon icon={Mail}>
                  <Input id="reg-email" type="email" placeholder="you@example.com" />
                </InputWithIcon>
              </FormField>
              <FormField label="Phone" htmlFor="phone" hint="We'll send verification code">
                <InputWithIcon icon={Phone}>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </InputWithIcon>
              </FormField>
            </>
          )}
          
          {step === 2 && (
            <>
              <FormField label="Role" htmlFor="role" required>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">Registered Nurse</SelectItem>
                    <SelectItem value="dental">Dental Hygienist</SelectItem>
                    <SelectItem value="assistant">Medical Assistant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Years of Experience" htmlFor="experience" required>
                <RadioGroup defaultValue="1-3" className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="0-1" id="exp-1" />
                    <Label htmlFor="exp-1" className="font-normal">0-1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="1-3" id="exp-2" />
                    <Label htmlFor="exp-2" className="font-normal">1-3</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="3-5" id="exp-3" />
                    <Label htmlFor="exp-3" className="font-normal">3-5</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="5+" id="exp-4" />
                    <Label htmlFor="exp-4" className="font-normal">5+</Label>
                  </div>
                </RadioGroup>
              </FormField>
              <FormField label="Bio" htmlFor="bio" hint="Tell clinics about yourself">
                <Textarea 
                  id="bio" 
                  placeholder="Brief description of your experience and skills..."
                  className="min-h-[100px]"
                />
              </FormField>
            </>
          )}
          
          {step === 3 && (
            <>
              <FormField label="Password" htmlFor="reg-password" required>
                <PasswordInput 
                  id="reg-password" 
                  placeholder="Create a strong password"
                  showStrength
                />
              </FormField>
              <FormField label="Confirm Password" htmlFor="confirm-password" required>
                <PasswordInput 
                  id="confirm-password" 
                  placeholder="Confirm your password"
                />
              </FormField>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Checkbox id="terms" />
                  <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                    I agree to the <Button variant="link" className="px-0 h-auto">Terms of Service</Button> and{" "}
                    <Button variant="link" className="px-0 h-auto">Privacy Policy</Button>
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="newsletter" />
                  <Label htmlFor="newsletter" className="text-sm font-normal cursor-pointer">
                    Receive email updates about new opportunities
                  </Label>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button 
            variant="hero" 
            onClick={() => step < 3 ? setStep(step + 1) : toast.success("Account created!")}
            className="flex-1"
          >
            {step === 3 ? "Create Account" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  },
};

/**
 * ## Contact Form
 * Simple contact/inquiry pattern.
 */
export const ContactForm: StoryObj = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Get in Touch</CardTitle>
        <CardDescription>Have questions? We'd love to hear from you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField label="Name" htmlFor="contact-name" required>
          <InputWithIcon icon={User}>
            <Input id="contact-name" placeholder="Your name" />
          </InputWithIcon>
        </FormField>
        <FormField label="Email" htmlFor="contact-email" required>
          <InputWithIcon icon={Mail}>
            <Input id="contact-email" type="email" placeholder="you@example.com" />
          </InputWithIcon>
        </FormField>
        <FormField label="Subject" htmlFor="subject" required>
          <Select>
            <SelectTrigger id="subject">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Inquiry</SelectItem>
              <SelectItem value="support">Technical Support</SelectItem>
              <SelectItem value="billing">Billing Question</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Message" htmlFor="message" required>
          <Textarea 
            id="message" 
            placeholder="How can we help you?"
            className="min-h-[120px]"
          />
        </FormField>
      </CardContent>
      <CardFooter>
        <Button variant="hero" className="w-full">
          Send Message
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * ## Validation States
 * Demonstrating error, success, and hint states.
 */
export const ValidationStates: StoryObj = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField 
            label="Email (Error)" 
            htmlFor="val-error" 
            error="Please enter a valid email address"
            required
          >
            <InputWithIcon icon={Mail}>
              <Input 
                id="val-error" 
                type="email" 
                defaultValue="invalid-email"
                className="border-destructive focus-visible:ring-destructive"
              />
            </InputWithIcon>
          </FormField>

          <FormField 
            label="Email (Success)" 
            htmlFor="val-success" 
            hint="✓ Email is available"
            required
          >
            <InputWithIcon icon={Mail}>
              <Input 
                id="val-success" 
                type="email" 
                defaultValue="user@example.com"
                className="border-success focus-visible:ring-success"
              />
            </InputWithIcon>
          </FormField>

          <FormField 
            label="Password" 
            htmlFor="val-hint" 
            hint="Must be at least 8 characters"
            required
          >
            <PasswordInput id="val-hint" showStrength />
          </FormField>

          <FormField 
            label="Phone (Optional)" 
            htmlFor="val-optional" 
            hint="For SMS notifications"
          >
            <InputWithIcon icon={Phone}>
              <Input id="val-optional" type="tel" placeholder="+1 (555) 000-0000" />
            </InputWithIcon>
          </FormField>
        </CardContent>
      </Card>
    </div>
  ),
};

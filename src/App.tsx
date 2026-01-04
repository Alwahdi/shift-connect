import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import VerifyCallback from "./pages/VerifyCallback";
import ForProfessionals from "./pages/ForProfessionals";
import ForClinics from "./pages/ForClinics";
import About from "./pages/About";
import ProfessionalOnboarding from "./pages/onboarding/ProfessionalOnboarding";
import ClinicOnboarding from "./pages/onboarding/ClinicOnboarding";
import ProfessionalDashboard from "./pages/dashboard/ProfessionalDashboard";
import ClinicDashboard from "./pages/dashboard/ClinicDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProfessionalProfile from "./pages/profile/ProfessionalProfile";
import ClinicProfile from "./pages/profile/ClinicProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/verify-callback" element={<VerifyCallback />} />
              <Route path="/for-professionals" element={<ForProfessionals />} />
              <Route path="/for-clinics" element={<ForClinics />} />
              <Route path="/about" element={<About />} />
              <Route path="/onboarding/professional" element={<ProfessionalOnboarding />} />
              <Route path="/onboarding/clinic" element={<ClinicOnboarding />} />
              <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
              <Route path="/dashboard/clinic" element={<ClinicDashboard />} />
              <Route path="/profile/professional" element={<ProfessionalProfile />} />
              <Route path="/profile/clinic" element={<ClinicProfile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

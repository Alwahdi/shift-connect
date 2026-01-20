import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
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
import ViewProfessionalProfile from "./pages/profile/ViewProfessionalProfile";
import ViewClinicProfile from "./pages/profile/ViewClinicProfile";
import ShiftSearch from "./pages/shifts/ShiftSearch";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <main id="main-content" className="pb-16 md:pb-0">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
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
                  <Route path="/professional/:id" element={<ViewProfessionalProfile />} />
                  <Route path="/clinic/:id" element={<ViewClinicProfile />} />
                  <Route path="/shifts" element={<ShiftSearch />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <MobileBottomNav />
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

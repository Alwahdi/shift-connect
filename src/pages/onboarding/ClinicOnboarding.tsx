import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Building2, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Globe,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import DocumentUploadCard from "@/components/onboarding/DocumentUploadCard";
import AvatarUpload from "@/components/onboarding/AvatarUpload";
import LocationPicker from "@/components/location/LocationPicker";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

type Step = "organization" | "location" | "documents" | "complete";

interface DocumentUpload {
  type: "business_license" | "insurance";
  nameKey: string;
  descKey: string;
  required: boolean;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  status?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

const ClinicOnboarding = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, userRole, isLoading: authLoading, refreshOnboardingStatus } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>("organization");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    tax_id: "",
  });
  
  const [locationData, setLocationData] = useState({
    address: "",
    location_lat: null as number | null,
    location_lng: null as number | null,
    website: "",
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "business_license", nameKey: "documents.businessLicense", descKey: "documents.businessLicenseDesc", required: true, file: null, uploading: false, uploaded: false },
    { type: "insurance", nameKey: "documents.insurance", descKey: "documents.insuranceDesc", required: true, file: null, uploading: false, uploaded: false },
  ]);

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "organization", label: t("onboarding.steps.organization"), icon: Building2 },
    { key: "location", label: t("onboarding.steps.location"), icon: MapPin },
    { key: "documents", label: t("onboarding.steps.documents"), icon: FileText },
    { key: "complete", label: t("onboarding.steps.complete"), icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "clinic")) {
      navigate("/auth");
      return;
    }

    const fetchClinic = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("clinics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setClinicId(data.id);
        setLogoUrl(data.logo_url);
        setOrgData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          description: data.description || "",
          tax_id: data.tax_id || "",
        });
        setLocationData({
          address: data.address || "",
          location_lat: data.location_lat,
          location_lng: data.location_lng,
          website: (data.settings as any)?.website || "",
        });
        
        if (data.onboarding_completed) {
          navigate("/dashboard/clinic");
        }
      }

      // Fetch existing documents
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id);

      if (docs) {
        setExistingDocs(docs);
        setDocuments(prev => prev.map(doc => {
          const existing = docs.find(d => d.document_type === doc.type);
          if (existing) {
            return {
              ...doc,
              uploaded: true,
              status: existing.status as "pending" | "verified" | "rejected",
              rejectionReason: existing.rejection_reason || undefined,
            };
          }
          return doc;
        }));
      }
    };

    fetchClinic();
  }, [user, userRole, authLoading, navigate]);

  const handleFileSelect = (index: number, file: File) => {
    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], file, uploaded: false };
    setDocuments(newDocs);
  };

  const uploadDocument = async (index: number) => {
    const doc = documents[index];
    if (!doc.file || !user || !clinicId) return;

    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], uploading: true };
    setDocuments(newDocs);

    try {
      const fileExt = doc.file.name.split(".").pop();
      const fileName = `${user.id}/${doc.type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, doc.file);

      if (uploadError) throw uploadError;

      const existingDoc = existingDocs.find(d => d.document_type === doc.type);
      
      if (existingDoc) {
        const { error: dbError } = await supabase
          .from("documents")
          .update({
            file_url: fileName,
            status: "pending",
            rejection_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDoc.id);

        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            document_type: doc.type,
            name: t(doc.nameKey),
            file_url: fileName,
            status: "pending",
          });

        if (dbError) throw dbError;
      }

      newDocs[index] = { ...newDocs[index], uploading: false, uploaded: true, status: "pending", file: null };
      setDocuments(newDocs);

      toast({
        title: t("documents.documentUploaded"),
        description: t("documents.documentUploadedDesc", { name: t(doc.nameKey) }),
      });
    } catch (error: any) {
      newDocs[index] = { ...newDocs[index], uploading: false };
      setDocuments(newDocs);
      toast({
        variant: "destructive",
        title: t("documents.uploadFailed"),
        description: error.message,
      });
    }
  };

  const handleLogoUpload = async (url: string) => {
    if (!user) return;
    setLogoUrl(url);
    
    await supabase
      .from("clinics")
      .update({ logo_url: url })
      .eq("user_id", user.id);
  };

  const handleLocationChange = (location: { address: string; lat: number | null; lng: number | null }) => {
    setLocationData({
      ...locationData,
      address: location.address,
      location_lat: location.lat,
      location_lng: location.lng,
    });
  };

  const saveOrganization = async () => {
    if (!user || !orgData.name.trim()) {
      toast({
        variant: "destructive",
        title: t("auth.errors.orgNameRequired"),
        description: t("onboarding.fields.orgName"),
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("clinics")
        .update({
          name: orgData.name.trim(),
          email: orgData.email.trim(),
          phone: orgData.phone.trim(),
          description: orgData.description.trim(),
          tax_id: orgData.tax_id.trim(),
          logo_url: logoUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStep("location");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveLocation = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("clinics")
        .update({
          address: locationData.address.trim(),
          location_lat: locationData.location_lat,
          location_lng: locationData.location_lng,
          settings: { website: locationData.website.trim() },
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStep("documents");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    const requiredDocs = documents.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => d.uploaded);
    
    if (uploadedRequired.length < requiredDocs.length) {
      toast({
        variant: "destructive",
        title: t("documents.missingDocuments"),
        description: t("documents.missingDocumentsDesc"),
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("clinics")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (error) throw error;
      
      await refreshOnboardingStatus();
      setCurrentStep("complete");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const requiredDocsUploaded = documents.filter(d => d.required && d.uploaded).length;
  const totalRequiredDocs = documents.filter(d => d.required).length;

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">SyndeoCare.ai</span>
            </div>
            <LanguageSwitcher variant="text" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <OnboardingProgress steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "organization" && (
            <motion.div
              key="organization"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.clinic.orgTitle")}</h2>
              <p className="text-muted-foreground mb-6">{t("onboarding.clinic.orgDesc")}</p>

              <div className="space-y-5">
                {/* Logo Upload */}
                <div className="flex justify-center pb-4">
                  <AvatarUpload
                    userId={user?.id || ""}
                    currentAvatarUrl={logoUrl}
                    onUpload={handleLogoUpload}
                    name={orgData.name}
                    size="lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">{t("onboarding.fields.orgName")} *</Label>
                  <div className="relative">
                    <Building2 className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder={t("onboarding.fields.orgNamePlaceholder")}
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      className="ps-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("onboarding.fields.contactEmail")}</Label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("onboarding.fields.contactEmailPlaceholder")}
                        value={orgData.email}
                        onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                        className="ps-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("onboarding.fields.phone")}</Label>
                    <div className="relative">
                      <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder={t("onboarding.fields.phonePlaceholder")}
                        value={orgData.phone}
                        onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                        className="ps-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">{t("onboarding.fields.taxId")} ({t("common.optional")})</Label>
                  <Input
                    id="tax_id"
                    placeholder={t("onboarding.fields.taxIdPlaceholder")}
                    value={orgData.tax_id}
                    onChange={(e) => setOrgData({ ...orgData, tax_id: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("onboarding.fields.description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("onboarding.fields.descriptionPlaceholder")}
                    value={orgData.description}
                    onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full bg-accent hover:bg-accent/90"
                  size="lg"
                  onClick={saveOrganization}
                  disabled={isSubmitting || !orgData.name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t("common.continue")}
                      <ArrowRight className={`w-5 h-5 ${isRTL ? "me-2 rotate-180" : "ms-2"}`} />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "location" && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.clinic.locationTitle")}</h2>
              <p className="text-muted-foreground mb-6">{t("onboarding.clinic.locationDesc")}</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>{t("onboarding.fields.fullAddress")}</Label>
                  <LocationPicker
                    value={{
                      address: locationData.address,
                      lat: locationData.location_lat,
                      lng: locationData.location_lng,
                    }}
                    onChange={handleLocationChange}
                    placeholder={t("onboarding.fields.fullAddressPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">{t("onboarding.fields.website")} ({t("common.optional")})</Label>
                  <div className="relative">
                    <Globe className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder={t("onboarding.fields.websitePlaceholder")}
                      value={locationData.website}
                      onChange={(e) => setLocationData({ ...locationData, website: e.target.value })}
                      className="ps-10"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("organization")}
                    className="flex-1"
                  >
                    <ArrowLeft className={`w-4 h-4 ${isRTL ? "ms-2 rotate-180" : "me-2"}`} />
                    {t("common.back")}
                  </Button>
                  <Button
                    onClick={saveLocation}
                    disabled={isSubmitting}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {t("common.continue")}
                        <ArrowRight className={`w-5 h-5 ${isRTL ? "me-2 rotate-180" : "ms-2"}`} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "documents" && (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.clinic.documentsTitle")}</h2>
              <p className="text-muted-foreground mb-6">{t("onboarding.clinic.documentsDesc")}</p>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <DocumentUploadCard
                    key={doc.type}
                    type={doc.type}
                    name={t(doc.nameKey)}
                    description={t(doc.descKey)}
                    required={doc.required}
                    file={doc.file}
                    uploading={doc.uploading}
                    uploaded={doc.uploaded}
                    status={doc.status}
                    rejectionReason={doc.rejectionReason}
                    onFileSelect={(file) => handleFileSelect(index, file)}
                    onUpload={() => uploadDocument(index)}
                    onRemove={() => {
                      const newDocs = [...documents];
                      newDocs[index] = { ...newDocs[index], file: null };
                      setDocuments(newDocs);
                    }}
                  />
                ))}

                <p className="text-sm text-muted-foreground text-center pt-2">
                  {requiredDocsUploaded}/{totalRequiredDocs} {t("documents.required").toLowerCase()}
                </p>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("location")}
                    className="flex-1"
                  >
                    <ArrowLeft className={`w-4 h-4 ${isRTL ? "ms-2 rotate-180" : "me-2"}`} />
                    {t("common.back")}
                  </Button>
                  <Button
                    onClick={completeOnboarding}
                    disabled={isSubmitting || requiredDocsUploaded < totalRequiredDocs}
                    className="flex-1 bg-accent hover:bg-accent/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t("onboarding.complete")
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl border border-border p-8 shadow-card text-center"
            >
              <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.clinic.completeTitle")}</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {t("onboarding.clinic.completeDesc")}
              </p>
              <Button size="lg" className="bg-accent hover:bg-accent/90" onClick={() => navigate("/dashboard/clinic")}>
                {t("onboarding.clinic.goToDashboard")}
                <ArrowRight className={`w-5 h-5 ${isRTL ? "me-2 rotate-180" : "ms-2"}`} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClinicOnboarding;
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  User, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Phone,
  DollarSign,
  Briefcase,
  X,
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

type Step = "profile" | "qualifications" | "documents" | "complete";

interface DocumentUpload {
  type: "id" | "license" | "certification";
  nameKey: string;
  descKey: string;
  required: boolean;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  status?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

const ProfessionalOnboarding = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, userRole, isLoading: authLoading, refreshOnboardingStatus } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    location_address: "",
    location_lat: null as number | null,
    location_lng: null as number | null,
    hourly_rate: "",
  });
  
  const [qualifications, setQualifications] = useState({
    specialties: [] as string[],
    qualifications: [] as string[],
    newSpecialty: "",
    newQualification: "",
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "id", nameKey: "documents.governmentId", descKey: "documents.governmentIdDesc", required: true, file: null, uploading: false, uploaded: false },
    { type: "license", nameKey: "documents.professionalLicense", descKey: "documents.professionalLicenseDesc", required: true, file: null, uploading: false, uploaded: false },
    { type: "certification", nameKey: "documents.certifications", descKey: "documents.certificationsDesc", required: false, file: null, uploading: false, uploaded: false },
  ]);

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: t("onboarding.steps.profile"), icon: User },
    { key: "qualifications", label: t("onboarding.steps.qualifications"), icon: Briefcase },
    { key: "documents", label: t("onboarding.steps.documents"), icon: FileText },
    { key: "complete", label: t("onboarding.steps.complete"), icon: CheckCircle2 },
  ];

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "professional")) {
      navigate("/auth");
      return;
    }

    const fetchProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfileId(data.id);
        setAvatarUrl(data.avatar_url);
        setProfileData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          location_address: data.location_address || "",
          location_lat: data.location_lat,
          location_lng: data.location_lng,
          hourly_rate: data.hourly_rate?.toString() || "",
        });
        setQualifications({
          ...qualifications,
          specialties: data.specialties || [],
          qualifications: data.qualifications || [],
        });
        
        if (data.onboarding_completed) {
          navigate("/dashboard/professional");
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

    fetchProfile();
  }, [user, userRole, authLoading, navigate]);

  const handleFileSelect = (index: number, file: File) => {
    const newDocs = [...documents];
    newDocs[index] = { ...newDocs[index], file, uploaded: false };
    setDocuments(newDocs);
  };

  const uploadDocument = async (index: number) => {
    const doc = documents[index];
    if (!doc.file || !user) return;

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

  const handleAvatarUpload = async (url: string) => {
    if (!user) return;
    setAvatarUrl(url);
    
    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("user_id", user.id);
  };

  const handleLocationChange = (location: { address: string; lat: number | null; lng: number | null }) => {
    setProfileData({
      ...profileData,
      location_address: location.address,
      location_lat: location.lat,
      location_lng: location.lng,
    });
  };

  const saveProfile = async () => {
    if (!user || !profileData.full_name.trim()) {
      toast({
        variant: "destructive",
        title: t("auth.errors.nameRequired"),
        description: t("onboarding.fields.fullName"),
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name.trim(),
          phone: profileData.phone.trim(),
          bio: profileData.bio.trim(),
          location_address: profileData.location_address.trim(),
          location_lat: profileData.location_lat,
          location_lng: profileData.location_lng,
          hourly_rate: profileData.hourly_rate ? parseFloat(profileData.hourly_rate) : null,
          avatar_url: avatarUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStep("qualifications");
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

  const saveQualifications = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          specialties: qualifications.specialties,
          qualifications: qualifications.qualifications,
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
        .from("profiles")
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

  const addSpecialty = () => {
    if (qualifications.newSpecialty.trim()) {
      setQualifications({
        ...qualifications,
        specialties: [...qualifications.specialties, qualifications.newSpecialty.trim()],
        newSpecialty: "",
      });
    }
  };

  const addQualification = () => {
    if (qualifications.newQualification.trim()) {
      setQualifications({
        ...qualifications,
        qualifications: [...qualifications.qualifications, qualifications.newQualification.trim()],
        newQualification: "",
      });
    }
  };

  const removeItem = (type: "specialties" | "qualifications", index: number) => {
    setQualifications({
      ...qualifications,
      [type]: qualifications[type].filter((_, i) => i !== index),
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/syndeocare-logo.png" 
                alt="SyndeoCare" 
                className="h-9 w-auto object-contain"
              />
            </Link>
            <LanguageSwitcher variant="text" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <OnboardingProgress steps={steps} currentStep={currentStep} />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.professional.profileTitle")}</h2>
              <p className="text-muted-foreground mb-6">{t("onboarding.professional.profileDesc")}</p>

              <div className="space-y-5">
                {/* Profile Picture Upload */}
                <div className="flex justify-center pb-4">
                  <AvatarUpload
                    userId={user?.id || ""}
                    currentAvatarUrl={avatarUrl}
                    onUpload={handleAvatarUpload}
                    name={profileData.full_name}
                    size="lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">{t("onboarding.fields.fullName")} *</Label>
                  <div className="relative">
                    <User className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="full_name"
                      placeholder={t("onboarding.fields.fullNamePlaceholder")}
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
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
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="ps-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("onboarding.fields.location")}</Label>
                  <LocationPicker
                    value={{
                      address: profileData.location_address,
                      lat: profileData.location_lat,
                      lng: profileData.location_lng,
                    }}
                    onChange={handleLocationChange}
                    placeholder={t("onboarding.fields.locationPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">{t("onboarding.fields.hourlyRate")}</Label>
                  <div className="relative">
                    <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="hourly_rate"
                      type="number"
                      placeholder={t("onboarding.fields.hourlyRatePlaceholder")}
                      value={profileData.hourly_rate}
                      onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                      className="ps-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("onboarding.fields.bio")}</Label>
                  <Textarea
                    id="bio"
                    placeholder={t("onboarding.fields.bioPlaceholder")}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full min-h-[48px]"
                  size="lg"
                  onClick={saveProfile}
                  disabled={isSubmitting || !profileData.full_name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {t("common.continue")}
                      <ArrowRight className={`w-5 h-5 ${isRTL ? "me-2 rotate-180" : "ms-2"}`} aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "qualifications" && (
            <motion.div
              key="qualifications"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.professional.qualificationsTitle")}</h2>
              <p className="text-muted-foreground mb-6">{t("onboarding.professional.qualificationsDesc")}</p>

              <div className="space-y-6">
                {/* Specialties */}
                <div className="space-y-3">
                  <Label>{t("onboarding.fields.specialties")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("onboarding.fields.addSpecialty")}
                      value={qualifications.newSpecialty}
                      onChange={(e) => setQualifications({ ...qualifications, newSpecialty: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                    />
                    <Button type="button" variant="secondary" onClick={addSpecialty}>
                      {t("common.apply")}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2" role="list" aria-label={t("onboarding.fields.specialties")}>
                    {qualifications.specialties.map((item, i) => (
                      <span
                        key={i}
                        role="listitem"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {item}
                        <button 
                          onClick={() => removeItem("specialties", i)}
                          aria-label={`Remove ${item}`}
                          className="p-0.5 hover:bg-primary/20 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-3">
                  <Label>{t("onboarding.fields.qualifications")}</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t("onboarding.fields.addQualification")}
                      value={qualifications.newQualification}
                      onChange={(e) => setQualifications({ ...qualifications, newQualification: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addQualification())}
                    />
                    <Button type="button" variant="secondary" onClick={addQualification}>
                      {t("common.apply")}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2" role="list" aria-label={t("onboarding.fields.qualifications")}>
                    {qualifications.qualifications.map((item, i) => (
                      <span
                        key={i}
                        role="listitem"
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-secondary text-foreground text-sm"
                      >
                        {item}
                        <button 
                          onClick={() => removeItem("qualifications", i)}
                          aria-label={`Remove ${item}`}
                          className="p-0.5 hover:bg-muted rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("profile")}
                    className="flex-1 min-h-[48px]"
                  >
                    <ArrowLeft className={`w-4 h-4 ${isRTL ? "ms-2 rotate-180" : "me-2"}`} aria-hidden="true" />
                    {t("common.back")}
                  </Button>
                  <Button
                    onClick={saveQualifications}
                    disabled={isSubmitting}
                    className="flex-1 min-h-[48px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {t("common.continue")}
                        <ArrowRight className={`w-5 h-5 ${isRTL ? "me-2 rotate-180" : "ms-2"}`} aria-hidden="true" />
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
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.professional.documentsTitle")}</h2>
              <p className="text-muted-foreground mb-6">{t("onboarding.professional.documentsDesc")}</p>

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
                    onClick={() => setCurrentStep("qualifications")}
                    className="flex-1 min-h-[48px]"
                  >
                    <ArrowLeft className={`w-4 h-4 ${isRTL ? "ms-2 rotate-180" : "me-2"}`} aria-hidden="true" />
                    {t("common.back")}
                  </Button>
                  <Button
                    onClick={completeOnboarding}
                    disabled={isSubmitting || requiredDocsUploaded < totalRequiredDocs}
                    className="flex-1 min-h-[48px]"
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
              <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{t("onboarding.professional.completeTitle")}</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                {t("onboarding.professional.completeDesc")}
              </p>
              <Button size="lg" className="min-h-[48px]" onClick={() => navigate("/dashboard/professional")}>
                {t("onboarding.professional.goToDashboard")}
                <ArrowRight className={`w-5 h-5 ${isRTL ? "me-2 rotate-180" : "ms-2"}`} aria-hidden="true" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProfessionalOnboarding;
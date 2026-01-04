import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

type Step = "profile" | "qualifications" | "documents" | "complete";

interface DocumentUpload {
  type: "id" | "license" | "certification";
  name: string;
  description: string;
  required: boolean;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  status?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

const ProfessionalOnboarding = () => {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading, refreshOnboardingStatus } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    location_address: "",
    hourly_rate: "",
  });
  
  const [qualifications, setQualifications] = useState({
    specialties: [] as string[],
    qualifications: [] as string[],
    newSpecialty: "",
    newQualification: "",
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "id", name: "Government ID", description: "Passport, driver's license, or national ID", required: true, file: null, uploading: false, uploaded: false },
    { type: "license", name: "Professional License", description: "Your nursing or healthcare license", required: true, file: null, uploading: false, uploaded: false },
    { type: "certification", name: "Certifications", description: "ACLS, BLS, or other certifications", required: false, file: null, uploading: false, uploaded: false },
  ]);

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "qualifications", label: "Qualifications", icon: Briefcase },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "complete", label: "Complete", icon: CheckCircle2 },
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
        setProfileData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          location_address: data.location_address || "",
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
        // Update document state with existing uploads
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

      // Check if document of this type already exists
      const existingDoc = existingDocs.find(d => d.document_type === doc.type);
      
      if (existingDoc) {
        // Update existing document
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
        // Create new document record
        const { error: dbError } = await supabase
          .from("documents")
          .insert({
            user_id: user.id,
            document_type: doc.type,
            name: doc.name,
            file_url: fileName,
            status: "pending",
          });

        if (dbError) throw dbError;
      }

      newDocs[index] = { ...newDocs[index], uploading: false, uploaded: true, status: "pending", file: null };
      setDocuments(newDocs);

      toast({
        title: "Document uploaded",
        description: `${doc.name} has been uploaded for verification.`,
      });
    } catch (error: any) {
      newDocs[index] = { ...newDocs[index], uploading: false };
      setDocuments(newDocs);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    }
  };

  const saveProfile = async () => {
    if (!user || !profileData.full_name.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your full name.",
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
          hourly_rate: profileData.hourly_rate ? parseFloat(profileData.hourly_rate) : null,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStep("qualifications");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving profile",
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
        title: "Error saving qualifications",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    // Check required documents
    const requiredDocs = documents.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => d.uploaded);
    
    if (uploadedRequired.length < requiredDocs.length) {
      toast({
        variant: "destructive",
        title: "Required documents missing",
        description: "Please upload all required documents before completing.",
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
        title: "Error completing onboarding",
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">SyndeoCare</span>
            </div>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Complete Your Profile</h2>
              <p className="text-muted-foreground mb-6">Tell us about yourself so clinics can find you.</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="full_name"
                      placeholder="John Doe"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="San Francisco, CA"
                      value={profileData.location_address}
                      onChange={(e) => setProfileData({ ...profileData, location_address: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Preferred Hourly Rate ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="hourly_rate"
                      type="number"
                      placeholder="55"
                      value={profileData.hourly_rate}
                      onChange={(e) => setProfileData({ ...profileData, hourly_rate: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell clinics about your experience and what makes you a great healthcare professional..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={saveProfile}
                  disabled={isSubmitting || !profileData.full_name.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === "qualifications" && (
            <motion.div
              key="qualifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Qualifications</h2>
              <p className="text-muted-foreground mb-6">Add your specialties and qualifications.</p>

              <div className="space-y-6">
                {/* Specialties */}
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Critical Care, Pediatrics"
                      value={qualifications.newSpecialty}
                      onChange={(e) => setQualifications({ ...qualifications, newSpecialty: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                    />
                    <Button type="button" onClick={addSpecialty} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {qualifications.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {specialty}
                        <button onClick={() => removeItem("specialties", index)} className="hover:text-primary/70">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {qualifications.specialties.length === 0 && (
                      <span className="text-sm text-muted-foreground">No specialties added yet</span>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-3">
                  <Label>Qualifications & Certifications</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., RN, BSN, ACLS"
                      value={qualifications.newQualification}
                      onChange={(e) => setQualifications({ ...qualifications, newQualification: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQualification())}
                    />
                    <Button type="button" onClick={addQualification} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {qualifications.qualifications.map((qual, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-foreground text-sm"
                      >
                        {qual}
                        <button onClick={() => removeItem("qualifications", index)} className="hover:text-muted-foreground">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {qualifications.qualifications.length === 0 && (
                      <span className="text-sm text-muted-foreground">No qualifications added yet</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setCurrentStep("profile")}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={saveQualifications}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Upload Documents</h2>
              <p className="text-muted-foreground mb-6">
                Upload your verification documents. Required documents are marked with a red badge.
              </p>

              <div className="space-y-4 mb-6">
                {documents.map((doc, index) => (
                  <DocumentUploadCard
                    key={doc.type}
                    type={doc.type}
                    name={doc.name}
                    description={doc.description}
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
              </div>

              <div className="p-4 rounded-lg bg-secondary mb-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Progress:</strong> {requiredDocsUploaded}/{totalRequiredDocs} required documents uploaded
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={() => setCurrentStep("qualifications")}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={completeOnboarding}
                  disabled={isSubmitting || requiredDocsUploaded < totalRequiredDocs}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Complete Setup
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-10 h-10 text-success" />
              </motion.div>

              <h2 className="text-2xl font-bold text-foreground mb-2">You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                Your profile is complete and your documents are under review. 
                Once verified, you'll be able to apply for shifts.
              </p>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
                <p className="text-sm text-warning">
                  <strong>Note:</strong> Document verification usually takes 1-2 business days. 
                  We'll notify you once your profile is fully verified.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("/dashboard/professional")}
                className="w-full"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProfessionalOnboarding;

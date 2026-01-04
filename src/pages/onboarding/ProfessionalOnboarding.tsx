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
  Upload,
  X,
  Loader2,
  Phone,
  DollarSign,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = "profile" | "qualifications" | "documents" | "complete";

interface DocumentUpload {
  type: "id" | "license" | "certification";
  name: string;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

const ProfessionalOnboarding = () => {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  
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
    { type: "id", name: "Government ID", file: null, uploading: false, uploaded: false },
    { type: "license", name: "Professional License", file: null, uploading: false, uploaded: false },
    { type: "certification", name: "Certification", file: null, uploading: false, uploaded: false },
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
    if (!doc.file || !user || !profileId) return;

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

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // Create document record
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

      newDocs[index] = { ...newDocs[index], uploading: false, uploaded: true, url: publicUrl };
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
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          bio: profileData.bio,
          location_address: profileData.location_address,
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
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (error) throw error;
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep === step.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : steps.findIndex(s => s.key === currentStep) > index
                      ? "border-success bg-success text-success-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 mx-2 transition-colors ${
                      steps.findIndex(s => s.key === currentStep) > index
                        ? "bg-success"
                        : "bg-border"
                    }`}
                    style={{ width: "60px" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span
                key={step.key}
                className={`text-xs ${
                  currentStep === step.key ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

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
                  <Label htmlFor="full_name">Full Name</Label>
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
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={saveProfile}
                  disabled={isSubmitting || !profileData.full_name}
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
                        <button onClick={() => removeItem("specialties", index)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
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
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-sm"
                      >
                        {qual}
                        <button onClick={() => removeItem("qualifications", index)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
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
                    variant="hero"
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
                Upload your credentials for verification. These will be reviewed by our team.
              </p>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div
                    key={doc.type}
                    className={`p-4 rounded-xl border-2 border-dashed transition-colors ${
                      doc.uploaded
                        ? "border-success bg-success/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            doc.uploaded ? "bg-success/10" : "bg-primary/10"
                          }`}
                        >
                          {doc.uploaded ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <FileText className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.file ? doc.file.name : "PDF, JPG, or PNG"}
                          </p>
                        </div>
                      </div>
                      
                      {doc.uploaded ? (
                        <span className="text-sm text-success font-medium">Uploaded</span>
                      ) : doc.file ? (
                        <Button
                          size="sm"
                          onClick={() => uploadDocument(index)}
                          disabled={doc.uploading}
                        >
                          {doc.uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </>
                          )}
                        </Button>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(index, e.target.files[0])}
                          />
                          <span className="text-sm text-primary font-medium hover:underline">
                            Select file
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                <p className="text-sm text-muted-foreground text-center">
                  You can skip document upload for now and add them later from your dashboard.
                </p>

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
                    variant="hero"
                    className="flex-1"
                    size="lg"
                    onClick={completeOnboarding}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
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
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">You're All Set!</h2>
              <p className="text-muted-foreground mb-6">
                Your profile is complete. Our team will review your documents and verify your account.
                You'll receive a notification once verified.
              </p>
              <Button
                variant="hero"
                size="lg"
                onClick={() => navigate("/dashboard/professional")}
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

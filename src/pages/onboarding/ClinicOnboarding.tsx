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
  Upload,
  Loader2,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = "organization" | "location" | "documents" | "complete";

interface DocumentUpload {
  type: "business_license" | "insurance";
  name: string;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

const ClinicOnboarding = () => {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>("organization");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  const [orgData, setOrgData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    tax_id: "",
  });
  
  const [locationData, setLocationData] = useState({
    address: "",
    website: "",
  });
  
  const [documents, setDocuments] = useState<DocumentUpload[]>([
    { type: "business_license", name: "Business License", file: null, uploading: false, uploaded: false },
    { type: "insurance", name: "Liability Insurance", file: null, uploading: false, uploaded: false },
  ]);

  const steps: { key: Step; label: string; icon: React.ElementType }[] = [
    { key: "organization", label: "Organization", icon: Building2 },
    { key: "location", label: "Location", icon: MapPin },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "complete", label: "Complete", icon: CheckCircle2 },
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
        setOrgData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          description: data.description || "",
          tax_id: data.tax_id || "",
        });
        setLocationData({
          address: data.address || "",
          website: (data.settings as any)?.website || "",
        });
        
        if (data.onboarding_completed) {
          navigate("/dashboard/clinic");
        }
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

      newDocs[index] = { ...newDocs[index], uploading: false, uploaded: true };
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

  const saveOrganization = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("clinics")
        .update({
          name: orgData.name,
          email: orgData.email,
          phone: orgData.phone,
          description: orgData.description,
          tax_id: orgData.tax_id,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStep("location");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving organization",
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
          address: locationData.address,
          settings: { website: locationData.website },
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setCurrentStep("documents");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving location",
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
        .from("clinics")
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
              <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground" />
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
                      ? "border-accent bg-accent text-accent-foreground"
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
                  currentStep === step.key ? "text-accent font-medium" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === "organization" && (
            <motion.div
              key="organization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Organization Details</h2>
              <p className="text-muted-foreground mb-6">Tell us about your healthcare facility.</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Bay Area Medical Center"
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@clinic.com"
                        value={orgData.email}
                        onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
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
                        value={orgData.phone}
                        onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID / EIN (Optional)</Label>
                  <Input
                    id="tax_id"
                    placeholder="XX-XXXXXXX"
                    value={orgData.tax_id}
                    onChange={(e) => setOrgData({ ...orgData, tax_id: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell professionals about your facility, the type of care you provide, and what makes you a great place to work..."
                    value={orgData.description}
                    onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button
                  variant="accent"
                  className="w-full"
                  size="lg"
                  onClick={saveOrganization}
                  disabled={isSubmitting || !orgData.name}
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

          {currentStep === "location" && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Location & Contact</h2>
              <p className="text-muted-foreground mb-6">Where is your facility located?</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Textarea
                      id="address"
                      placeholder="123 Medical Center Drive&#10;San Francisco, CA 94102"
                      value={locationData.address}
                      onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://www.yourclinic.com"
                      value={locationData.website}
                      onChange={(e) => setLocationData({ ...locationData, website: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setCurrentStep("organization")}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="accent"
                    className="flex-1"
                    size="lg"
                    onClick={saveLocation}
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Business Documents</h2>
              <p className="text-muted-foreground mb-6">
                Upload your business credentials for verification.
              </p>

              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div
                    key={doc.type}
                    className={`p-4 rounded-xl border-2 border-dashed transition-colors ${
                      doc.uploaded
                        ? "border-success bg-success/5"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            doc.uploaded ? "bg-success/10" : "bg-accent/10"
                          }`}
                        >
                          {doc.uploaded ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <FileText className="w-5 h-5 text-accent" />
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
                          variant="accent"
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
                          <span className="text-sm text-accent font-medium hover:underline">
                            Select file
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}

                <p className="text-sm text-muted-foreground text-center">
                  You can skip document upload for now and add them later.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={() => setCurrentStep("location")}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    variant="accent"
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
                Your clinic profile is complete. Our team will review your documents and verify your account.
                You can start posting shifts right away!
              </p>
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate("/dashboard/clinic")}
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

export default ClinicOnboarding;

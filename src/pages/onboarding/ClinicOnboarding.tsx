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

type Step = "organization" | "location" | "documents" | "complete";

interface DocumentUpload {
  type: "business_license" | "insurance";
  name: string;
  description: string;
  required: boolean;
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
  status?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
}

const ClinicOnboarding = () => {
  const navigate = useNavigate();
  const { user, userRole, isLoading: authLoading, refreshOnboardingStatus } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<Step>("organization");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  
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
    { type: "business_license", name: "Business License", description: "Your healthcare facility license", required: true, file: null, uploading: false, uploaded: false },
    { type: "insurance", name: "Liability Insurance", description: "Professional liability insurance certificate", required: true, file: null, uploading: false, uploaded: false },
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

  const saveOrganization = async () => {
    if (!user || !orgData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your organization name.",
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
          address: locationData.address.trim(),
          settings: { website: locationData.website.trim() },
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
        .from("clinics")
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">SyndeoCare.ai</span>
            </div>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Organization Details</h2>
              <p className="text-muted-foreground mb-6">Tell us about your healthcare facility.</p>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
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
                  className="w-full bg-accent hover:bg-accent/90"
                  size="lg"
                  onClick={saveOrganization}
                  disabled={isSubmitting || !orgData.name.trim()}
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
                    className="flex-1 bg-accent hover:bg-accent/90"
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
                  onClick={() => setCurrentStep("location")}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90"
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
                Your clinic profile is complete and your documents are under review. 
                Once verified, you'll be able to post shifts.
              </p>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 mb-6">
                <p className="text-sm text-warning">
                  <strong>Note:</strong> Document verification usually takes 1-2 business days. 
                  We'll notify you once your clinic is fully verified.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("/dashboard/clinic")}
                className="w-full bg-accent hover:bg-accent/90"
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

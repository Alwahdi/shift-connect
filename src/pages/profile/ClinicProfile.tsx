import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  Save,
  X,
  Loader2,
  Camera,
  ArrowLeft,
  Shield
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DocumentUploadCard from "@/components/onboarding/DocumentUploadCard";
import { useTranslation } from "react-i18next";

interface Clinic {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  description: string | null;
  address: string | null;
  tax_id: string | null;
  verification_status: string;
  logo_url: string | null;
  onboarding_completed: boolean;
  settings: any;
}

interface Document {
  id: string;
  document_type: string;
  name: string;
  file_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
}

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
  documentId?: string;
}

const ClinicProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    address: "",
    tax_id: "",
    website: "",
  });

  const [documentUploads, setDocumentUploads] = useState<DocumentUpload[]>([
    { type: "business_license", name: t("documents.businessLicense"), description: t("documents.businessLicenseDesc"), required: true, file: null, uploading: false, uploaded: false },
    { type: "insurance", name: t("documents.insurance"), description: t("documents.insuranceDesc"), required: true, file: null, uploading: false, uploaded: false },
  ]);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "clinic")) {
      navigate("/auth");
      return;
    }

    fetchClinicData();
  }, [user, userRole, authLoading, navigate]);

  const fetchClinicData = async () => {
    if (!user) return;

    try {
      // Fetch clinic
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (clinicData) {
        setClinic(clinicData);
        setFormData({
          name: clinicData.name || "",
          email: clinicData.email || "",
          phone: clinicData.phone || "",
          description: clinicData.description || "",
          address: clinicData.address || "",
          tax_id: clinicData.tax_id || "",
          website: (clinicData.settings as any)?.website || "",
        });
      }

      // Fetch documents
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (docsData) {
        setDocuments(docsData);
        setDocumentUploads(prev => prev.map(doc => {
          const existing = docsData.find(d => d.document_type === doc.type);
          if (existing) {
            return {
              ...doc,
              uploaded: true,
              status: existing.status as "pending" | "verified" | "rejected",
              rejectionReason: existing.rejection_reason || undefined,
              documentId: existing.id,
            };
          }
          return doc;
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClinic = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("clinics")
        .update({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          tax_id: formData.tax_id.trim(),
          settings: { website: formData.website.trim() },
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: t("profile.clinicUpdated"),
        description: t("profile.clinicUpdatedDesc"),
      });

      setIsEditing(false);
      fetchClinicData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("clinics")
        .update({ logo_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: t("profile.photoUploaded"),
        description: t("profile.photoUploadedDesc"),
      });

      fetchClinicData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("documents.uploadFailed"),
        description: error.message,
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFileSelect = (index: number, file: File) => {
    const newDocs = [...documentUploads];
    newDocs[index] = { ...newDocs[index], file, uploaded: false };
    setDocumentUploads(newDocs);
  };

  const uploadDocument = async (index: number) => {
    const doc = documentUploads[index];
    if (!doc.file || !user) return;

    const newDocs = [...documentUploads];
    newDocs[index] = { ...newDocs[index], uploading: true };
    setDocumentUploads(newDocs);

    try {
      const fileExt = doc.file.name.split(".").pop();
      const fileName = `${user.id}/${doc.type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, doc.file);

      if (uploadError) throw uploadError;

      if (doc.documentId) {
        const { error: dbError } = await supabase
          .from("documents")
          .update({
            file_url: fileName,
            status: "pending",
            rejection_reason: null,
          })
          .eq("id", doc.documentId);

        if (dbError) throw dbError;
      } else {
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
      setDocumentUploads(newDocs);

      toast({
        title: t("documents.documentUploaded"),
        description: t("documents.documentUploadedDesc", { name: doc.name }),
      });

      fetchClinicData();
    } catch (error: any) {
      newDocs[index] = { ...newDocs[index], uploading: false };
      setDocumentUploads(newDocs);
      toast({
        variant: "destructive",
        title: t("documents.uploadFailed"),
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    navigate("/logout");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" />{t("common.verified")}</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t("common.rejected")}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t("common.pending")}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const verifiedDocs = documentUploads.filter(d => d.status === "verified").length;
  const pendingDocs = documentUploads.filter(d => d.status === "pending").length;
  const totalDocs = documentUploads.filter(d => d.uploaded).length;

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back button */}
        <Link 
          to="/dashboard/clinic" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("nav.backToDashboard")}
        </Link>

        {/* Clinic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-card mb-6"
        >
          <div className="flex items-start gap-6 flex-wrap">
            {/* Logo */}
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-2xl">
                <AvatarImage src={clinic?.logo_url || undefined} alt={clinic?.name || "Clinic"} className="object-cover" />
                <AvatarFallback className="w-24 h-24 rounded-2xl gradient-accent text-accent-foreground text-2xl font-semibold">
                  {clinic?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "CL"}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingLogo}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {isUploadingLogo ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{clinic?.name || "Your Clinic"}</h1>
                {getStatusBadge(clinic?.verification_status || "pending")}
              </div>
              <p className="text-muted-foreground mb-3">{clinic?.email}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {clinic?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {clinic.address}
                  </span>
                )}
                {formData.website && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {formData.website}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
                <p className="text-xs text-muted-foreground">{t("profile.documents")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{verifiedDocs}</p>
                <p className="text-xs text-muted-foreground">{t("common.verified")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{pendingDocs}</p>
                <p className="text-xs text-muted-foreground">{t("common.pending")}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Alert */}
        {clinic?.verification_status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-warning" />
              <div>
                <h3 className="font-medium text-foreground">{t("profile.verificationPending")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("profile.verificationPendingDesc")}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t("profile.tabs.clinicDetails")}</TabsTrigger>
            <TabsTrigger value="documents">
              {t("profile.tabs.documents")}
              {pendingDocs > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                  {pendingDocs}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">{t("profile.organizationInfo")}</h2>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t("common.edit")}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: clinic?.name || "",
                        email: clinic?.email || "",
                        phone: clinic?.phone || "",
                        description: clinic?.description || "",
                        address: clinic?.address || "",
                        tax_id: clinic?.tax_id || "",
                        website: (clinic?.settings as any)?.website || "",
                      });
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      {t("common.cancel")}
                    </Button>
                    <Button size="sm" onClick={handleSaveClinic} disabled={isSaving} className="bg-accent hover:bg-accent/90">
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("common.save")}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("onboarding.fields.orgName")}</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("profile.phone")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_id">{t("onboarding.fields.taxId")}</Label>
                    <Input
                      id="tax_id"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">{t("onboarding.fields.website")}</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("profile.address")}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10 min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("onboarding.fields.description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    placeholder={t("onboarding.fields.descriptionPlaceholder")}
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{t("profile.documents")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("documents.pendingVerification")}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {documentUploads.map((doc, index) => (
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
                      const newDocs = [...documentUploads];
                      newDocs[index] = { ...newDocs[index], file: null };
                      setDocumentUploads(newDocs);
                    }}
                  />
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">
                  <strong>{t("common.note")}:</strong> {t("profile.documentsNote")}
                </p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ClinicProfile;

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
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Edit2,
  Save,
  X,
  Upload,
  Loader2,
  Camera,
  ArrowLeft,
  Shield,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DocumentUploadCard from "@/components/onboarding/DocumentUploadCard";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  location_address: string | null;
  hourly_rate: number | null;
  specialties: string[] | null;
  qualifications: string[] | null;
  verification_status: string;
  avatar_url: string | null;
  onboarding_completed: boolean;
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
  type: "id" | "license" | "certification";
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

const ProfessionalProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userRole, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    bio: "",
    location_address: "",
    hourly_rate: "",
    specialties: [] as string[],
    qualifications: [] as string[],
    newSpecialty: "",
    newQualification: "",
  });

  const [documentUploads, setDocumentUploads] = useState<DocumentUpload[]>([
    { type: "id", name: "Government ID", description: "Passport, driver's license, or national ID", required: true, file: null, uploading: false, uploaded: false },
    { type: "license", name: "Professional License", description: "Your nursing or healthcare license", required: true, file: null, uploading: false, uploaded: false },
    { type: "certification", name: "Certifications", description: "ACLS, BLS, or other certifications", required: false, file: null, uploading: false, uploaded: false },
  ]);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "professional")) {
      navigate("/auth");
      return;
    }

    fetchProfileData();
  }, [user, userRole, authLoading, navigate]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          location_address: profileData.location_address || "",
          hourly_rate: profileData.hourly_rate?.toString() || "",
          specialties: profileData.specialties || [],
          qualifications: profileData.qualifications || [],
          newSpecialty: "",
          newQualification: "",
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
        // Update document uploads with existing docs
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

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          bio: formData.bio.trim(),
          location_address: formData.location_address.trim(),
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
          specialties: formData.specialties,
          qualifications: formData.qualifications,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });

      setIsEditing(false);
      fetchProfileData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error saving profile",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been changed.",
      });

      fetchProfileData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setIsUploadingAvatar(false);
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

      // Check if document exists and update or insert
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
        title: "Document uploaded",
        description: `${doc.name} has been uploaded for verification.`,
      });

      fetchProfileData();
    } catch (error: any) {
      newDocs[index] = { ...newDocs[index], uploading: false };
      setDocumentUploads(newDocs);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    }
  };

  const addSpecialty = () => {
    if (formData.newSpecialty.trim()) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, formData.newSpecialty.trim()],
        newSpecialty: "",
      });
    }
  };

  const addQualification = () => {
    if (formData.newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...formData.qualifications, formData.newQualification.trim()],
        newQualification: "",
      });
    }
  };

  const removeItem = (type: "specialties" | "qualifications", index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const verifiedDocs = documentUploads.filter(d => d.status === "verified").length;
  const pendingDocs = documentUploads.filter(d => d.status === "pending").length;
  const totalDocs = documentUploads.filter(d => d.uploaded).length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader type="professional" onSignOut={handleSignOut} avatarUrl={profile?.avatar_url} name={profile?.full_name} />
      
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back button */}
        <Link 
          to="/dashboard/professional" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-card mb-6"
        >
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-2xl">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "User"} className="object-cover" />
                <AvatarFallback className="w-24 h-24 rounded-2xl gradient-primary text-primary-foreground text-2xl font-semibold">
                  {profile?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "PR"}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "Your Name"}</h1>
                {getStatusBadge(profile?.verification_status || "pending")}
              </div>
              <p className="text-muted-foreground mb-3">{profile?.email}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile?.location_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location_address}
                  </span>
                )}
                {profile?.hourly_rate && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    ${profile.hourly_rate}/hr
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalDocs}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{verifiedDocs}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{pendingDocs}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verification Alert */}
        {profile?.verification_status === "pending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-warning" />
              <div>
                <h3 className="font-medium text-foreground">Verification Pending</h3>
                <p className="text-sm text-muted-foreground">
                  Your profile and documents are being reviewed. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
            <TabsTrigger value="documents">
              Documents
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
                <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        full_name: profile?.full_name || "",
                        phone: profile?.phone || "",
                        bio: profile?.bio || "",
                        location_address: profile?.location_address || "",
                        hourly_rate: profile?.hourly_rate?.toString() || "",
                      });
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
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
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location_address}
                        onChange={(e) => setFormData({ ...formData, location_address: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={formData.hourly_rate}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell clinics about your experience..."
                  />
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Qualifications Tab */}
          <TabsContent value="qualifications">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-2xl border border-border p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Specialties & Qualifications</h2>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        ...formData,
                        specialties: profile?.specialties || [],
                        qualifications: profile?.qualifications || [],
                      });
                    }}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Specialties */}
                <div className="space-y-3">
                  <Label>Specialties</Label>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Critical Care, Pediatrics"
                        value={formData.newSpecialty}
                        onChange={(e) => setFormData({ ...formData, newSpecialty: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                      />
                      <Button type="button" onClick={addSpecialty} variant="outline">
                        Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {specialty}
                        {isEditing && (
                          <button onClick={() => removeItem("specialties", index)} className="hover:text-primary/70">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {formData.specialties.length === 0 && (
                      <span className="text-sm text-muted-foreground">No specialties added</span>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-3">
                  <Label>Qualifications & Certifications</Label>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., RN, BSN, ACLS"
                        value={formData.newQualification}
                        onChange={(e) => setFormData({ ...formData, newQualification: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQualification())}
                      />
                      <Button type="button" onClick={addQualification} variant="outline">
                        Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.qualifications.map((qual, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-foreground text-sm"
                      >
                        {qual}
                        {isEditing && (
                          <button onClick={() => removeItem("qualifications", index)} className="hover:text-muted-foreground">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {formData.qualifications.length === 0 && (
                      <span className="text-sm text-muted-foreground">No qualifications added</span>
                    )}
                  </div>
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
                  <h2 className="text-lg font-semibold text-foreground">Verification Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage your verification documents
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
                  <strong>Note:</strong> All documents are securely stored and only accessible to you and our verification team.
                  Verification typically takes 1-2 business days.
                </p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfessionalProfile;

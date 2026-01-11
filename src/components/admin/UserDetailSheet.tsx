import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  Loader2,
  Briefcase,
  MessageSquare,
  ExternalLink,
  Download,
  AlertTriangle,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import AdminNotes from "./AdminNotes";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  verification_status: string;
  onboarding_completed: boolean;
  created_at: string;
  specialties: string[] | null;
  qualifications: string[] | null;
  bio?: string;
  location_address?: string;
  hourly_rate?: number;
}

interface Clinic {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  verification_status: string;
  onboarding_completed: boolean;
  created_at: string;
  address: string | null;
  description?: string;
  tax_id?: string;
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

interface UserDetailSheetProps {
  type: "professional" | "clinic";
  user: Profile | Clinic;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (status: "verified" | "rejected") => void;
  onDocumentVerify: (docId: string, status: "verified" | "rejected", reason?: string) => void;
}

const UserDetailSheet = ({ 
  type, 
  user, 
  isOpen, 
  onClose, 
  onVerify,
  onDocumentVerify 
}: UserDetailSheetProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { toast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      setActiveTab("info");
      setSelectedDocument(null);
    }
  }, [user.user_id, isOpen]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.user_id)
      .order("created_at", { ascending: false });

    if (data) setDocuments(data);
    setIsLoading(false);
  };

  const handleViewDocument = async (doc: Document) => {
    setSelectedDocument(doc);
    setShowRejectForm(false);
    setRejectionReason("");
    
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_url, 3600);

      if (error) throw error;
      setDocumentUrl(data.signedUrl);
    } catch (error) {
      console.error("Error fetching document:", error);
      setDocumentUrl(null);
    }
  };

  const handleVerify = async (status: "verified" | "rejected") => {
    setIsVerifying(true);
    await onVerify(status);
    setIsVerifying(false);
  };

  const handleDocumentVerify = async (status: "verified" | "rejected") => {
    if (!selectedDocument) return;
    
    if (status === "rejected" && !rejectionReason.trim()) {
      setShowRejectForm(true);
      return;
    }

    setIsVerifying(true);
    await onDocumentVerify(selectedDocument.id, status, rejectionReason || undefined);
    setSelectedDocument(null);
    setDocumentUrl(null);
    setRejectionReason("");
    setShowRejectForm(false);
    fetchDocuments();
    setIsVerifying(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="w-3 h-3 me-1" />{t("common.verified")}</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 me-1" />{t("common.rejected")}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 me-1" />{t("common.pending")}</Badge>;
    }
  };

  const isProfessional = type === "professional";
  const profile = user as Profile;
  const clinic = user as Clinic;

  const isPdf = selectedDocument?.file_url.toLowerCase().endsWith(".pdf");
  const isImage = selectedDocument ? /\.(jpg|jpeg|png|webp)$/i.test(selectedDocument.file_url) : false;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side={isRTL ? "left" : "right"} 
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            {isProfessional ? (
              <User className="w-5 h-5 text-primary" />
            ) : (
              <Building2 className="w-5 h-5 text-accent" />
            )}
            {isProfessional ? profile.full_name : clinic.name}
          </SheetTitle>
          {/* Status Banner */}
          <div className={`p-3 rounded-lg mt-2 ${
            user.verification_status === "verified" 
              ? "bg-success/10 border border-success/20" 
              : user.verification_status === "rejected"
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-warning/10 border border-warning/20"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("profile.verificationStatus")}</span>
              {getStatusBadge(user.verification_status)}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="text-xs sm:text-sm">
              <User className="w-4 h-4 me-1 hidden sm:block" />
              {t("admin.userDetail.info")}
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 me-1 hidden sm:block" />
              {t("admin.userDetail.documents")}
              {documents.filter(d => d.status === "pending").length > 0 && (
                <span className="ms-1 px-1.5 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                  {documents.filter(d => d.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 me-1 hidden sm:block" />
              {t("admin.userDetail.notes")}
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-4">
            {/* Basic Info */}
            <div className="bg-secondary rounded-lg p-4">
              <h4 className="font-medium text-foreground mb-3">{t("profile.personalInfo")}</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.phone}</span>
                  </div>
                )}
                {(isProfessional ? profile.location_address : clinic.address) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {isProfessional ? profile.location_address : clinic.address}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t("admin.userDetail.joined")} {new Date(user.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional-specific info */}
            {isProfessional && (
              <>
                {profile.bio && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">{t("profile.bio")}</h4>
                    <p className="text-muted-foreground text-sm">{profile.bio}</p>
                  </div>
                )}

                {profile.hourly_rate && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">{t("profile.hourlyRate")}</h4>
                    <p className="text-2xl font-bold text-primary">${profile.hourly_rate}{t("common.perHour")}</p>
                  </div>
                )}

                {profile.specialties && profile.specialties.length > 0 && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {t("profile.specialties")}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.specialties.map((specialty, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.qualifications && profile.qualifications.length > 0 && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-3">{t("profile.qualifications")}</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.qualifications.map((qual, i) => (
                        <Badge key={i} variant="outline" className="bg-success/5 text-success border-success/20">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Clinic-specific info */}
            {!isProfessional && (
              <>
                {clinic.description && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">{t("profile.clinicInfo")}</h4>
                    <p className="text-muted-foreground text-sm">{clinic.description}</p>
                  </div>
                )}

                {clinic.tax_id && (
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">{t("onboarding.fields.taxId")}</h4>
                    <p className="text-foreground font-mono">{clinic.tax_id}</p>
                  </div>
                )}
              </>
            )}

            {/* Verification Actions */}
            {user.verification_status === "pending" && (
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleVerify("rejected")}
                  disabled={isVerifying}
                >
                  <XCircle className="w-4 h-4 me-2" />
                  {t("common.reject")}
                </Button>
                <Button
                  className="flex-1 bg-success hover:bg-success/90"
                  onClick={() => handleVerify("verified")}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 me-2" />
                      {t("common.verify")} {isProfessional ? t("admin.roles.professional") : t("admin.roles.clinic")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            {selectedDocument ? (
              <div className="space-y-4">
                {/* Back button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedDocument(null);
                    setDocumentUrl(null);
                  }}
                >
                  ← {t("common.back")}
                </Button>

                {/* Document Info */}
                <div className="bg-secondary rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("admin.table.document")}</p>
                      <p className="font-medium text-foreground">{selectedDocument.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("admin.table.type")}</p>
                      <p className="font-medium text-foreground capitalize">
                        {selectedDocument.document_type.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("admin.table.status")}</p>
                      {getStatusBadge(selectedDocument.status)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("admin.table.uploaded")}</p>
                      <p className="font-medium text-foreground">
                        {new Date(selectedDocument.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                <div className="border border-border rounded-lg overflow-hidden bg-muted/30 min-h-[300px] flex items-center justify-center">
                  {documentUrl ? (
                    <>
                      {isImage && (
                        <img
                          src={documentUrl}
                          alt={selectedDocument.name}
                          className="max-w-full max-h-[400px] object-contain"
                        />
                      )}
                      {isPdf && (
                        <iframe
                          src={documentUrl}
                          className="w-full h-[400px]"
                          title={selectedDocument.name}
                        />
                      )}
                      {!isImage && !isPdf && (
                        <div className="text-center p-8">
                          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">{t("admin.userDetail.previewUnavailable")}</p>
                          <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                              <Download className="w-4 h-4 me-2" />
                              {t("admin.userDetail.download")}
                            </Button>
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Open in new tab */}
                {documentUrl && (
                  <div className="text-center">
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4 me-2" />
                        {t("admin.userDetail.openNewTab")}
                      </Button>
                    </a>
                  </div>
                )}

                {/* Document Actions */}
                {selectedDocument.status === "pending" && (
                  <div className="border-t border-border pt-4">
                    {showRejectForm ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder={t("admin.userDetail.rejectionReason")}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowRejectForm(false)}
                            disabled={isVerifying}
                          >
                            {t("common.cancel")}
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleDocumentVerify("rejected")}
                            disabled={!rejectionReason.trim() || isVerifying}
                          >
                            {isVerifying ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 me-2" />
                                {t("admin.userDetail.confirmReject")}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowRejectForm(true)}
                          disabled={isVerifying}
                        >
                          <XCircle className="w-4 h-4 me-2" />
                          {t("common.reject")}
                        </Button>
                        <Button
                          className="flex-1 bg-success hover:bg-success/90"
                          onClick={() => handleDocumentVerify("verified")}
                          disabled={isVerifying}
                        >
                          {isVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 me-2" />
                              {t("admin.userDetail.verifyDoc")}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Already reviewed */}
                {selectedDocument.status !== "pending" && (
                  <div className={`text-center p-4 rounded-lg ${
                    selectedDocument.status === "verified" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {selectedDocument.status === "verified" ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">{t("admin.userDetail.docVerified")}</span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <XCircle className="w-5 h-5" />
                          <span className="font-medium">{t("admin.userDetail.docRejected")}</span>
                        </div>
                        {selectedDocument.rejection_reason && (
                          <p className="text-sm opacity-80">{selectedDocument.rejection_reason}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.status === "pending" 
                            ? "bg-warning/10" 
                            : doc.status === "verified"
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            doc.status === "pending" 
                              ? "text-warning" 
                              : doc.status === "verified"
                              ? "text-success"
                              : "text-destructive"
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {doc.document_type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(doc.status)}
                        <Button size="sm" variant={doc.status === "pending" ? "default" : "outline"}>
                          {doc.status === "pending" ? t("common.review") : t("common.view")}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">{t("admin.userDetail.noDocuments")}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-4">
            <AdminNotes 
              targetUserId={user.user_id} 
              targetType={type} 
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default UserDetailSheet;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  Heart, 
  Users, 
  Building2, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Eye,
  Shield,
  LogOut,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DocumentViewer from "@/components/admin/DocumentViewer";
import UserDetailsModal from "@/components/admin/UserDetailsModal";

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
}

interface Document {
  id: string;
  user_id: string;
  document_type: string;
  name: string;
  file_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  user_name?: string;
  user_role?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const [professionals, setProfessionals] = useState<Profile[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ type: "professional" | "clinic"; data: Profile | Clinic } | null>(null);

  const [stats, setStats] = useState({
    totalProfessionals: 0,
    totalClinics: 0,
    pendingVerifications: 0,
    pendingDocuments: 0,
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "admin")) {
      navigate("/auth");
      return;
    }

    fetchData();
  }, [user, userRole, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch professionals
      const { data: profData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profData) setProfessionals(profData);

      // Fetch clinics
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("*")
        .order("created_at", { ascending: false });

      if (clinicData) setClinics(clinicData);

      // Fetch documents with user info
      const { data: docData } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (docData) {
        // Enrich documents with user names
        const enrichedDocs = await Promise.all(
          docData.map(async (doc) => {
            // Check if professional
            const { data: prof } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", doc.user_id)
              .single();

            if (prof) {
              return { ...doc, user_name: prof.full_name, user_role: "professional" };
            }

            // Check if clinic
            const { data: clinic } = await supabase
              .from("clinics")
              .select("name")
              .eq("user_id", doc.user_id)
              .single();

            if (clinic) {
              return { ...doc, user_name: clinic.name, user_role: "clinic" };
            }

            return { ...doc, user_name: "Unknown", user_role: "unknown" };
          })
        );
        setDocuments(enrichedDocs);
      }

      // Calculate stats
      setStats({
        totalProfessionals: profData?.length || 0,
        totalClinics: clinicData?.length || 0,
        pendingVerifications: 
          (profData?.filter(p => p.verification_status === "pending").length || 0) +
          (clinicData?.filter(c => c.verification_status === "pending").length || 0),
        pendingDocuments: docData?.filter(d => d.status === "pending").length || 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async (type: "professional" | "clinic", userId: string, status: "verified" | "rejected") => {
    try {
      const table = type === "professional" ? "profiles" : "clinics";
      const { error } = await supabase
        .from(table)
        .update({ verification_status: status })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: status === "verified" ? "User Verified" : "User Rejected",
        description: `The ${type} has been ${status}.`,
      });

      fetchData();
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleVerifyDocument = async (docId: string, status: "verified" | "rejected", reason?: string) => {
    try {
      const updateData: any = { 
        status, 
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };
      
      if (reason) {
        updateData.rejection_reason = reason;
      }

      const { error } = await supabase
        .from("documents")
        .update(updateData)
        .eq("id", docId);

      if (error) throw error;

      toast({
        title: status === "verified" ? "Document Verified" : "Document Rejected",
        description: `The document has been ${status}.`,
      });

      fetchData();
      setSelectedDocument(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
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

  const filteredProfessionals = professionals.filter(p =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClinics = clinics.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDocuments = documents.filter(d => d.status === "pending");

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Shield className="w-4 h-4 text-background" />
              </div>
              <span className="font-bold text-lg text-foreground">Admin Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Professionals", value: stats.totalProfessionals, icon: Users, color: "primary" },
            { label: "Clinics", value: stats.totalClinics, icon: Building2, color: "accent" },
            { label: "Pending Verifications", value: stats.pendingVerifications, icon: Clock, color: "warning" },
            { label: "Pending Documents", value: stats.pendingDocuments, icon: FileText, color: "destructive" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="professionals">Professionals</TabsTrigger>
            <TabsTrigger value="clinics">Clinics</TabsTrigger>
            <TabsTrigger value="documents">
              Documents
              {stats.pendingDocuments > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                  {stats.pendingDocuments}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Pending Actions */}
            {(stats.pendingDocuments > 0 || stats.pendingVerifications > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-warning/10 border border-warning/20 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h3 className="font-semibold text-foreground">Action Required</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {stats.pendingDocuments > 0 && (
                    <p>• {stats.pendingDocuments} document(s) awaiting review</p>
                  )}
                  {stats.pendingVerifications > 0 && (
                    <p>• {stats.pendingVerifications} user(s) awaiting verification</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Recent Signups */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border p-4 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Recent Professionals
                </h3>
                <div className="space-y-3">
                  {professionals.slice(0, 5).map((prof) => (
                    <div
                      key={prof.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer"
                      onClick={() => setSelectedUser({ type: "professional", data: prof })}
                    >
                      <div>
                        <p className="font-medium text-foreground">{prof.full_name}</p>
                        <p className="text-sm text-muted-foreground">{prof.email}</p>
                      </div>
                      {getStatusBadge(prof.verification_status)}
                    </div>
                  ))}
                  {professionals.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No professionals yet</p>
                  )}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-4 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  Recent Clinics
                </h3>
                <div className="space-y-3">
                  {clinics.slice(0, 5).map((clinic) => (
                    <div
                      key={clinic.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer"
                      onClick={() => setSelectedUser({ type: "clinic", data: clinic })}
                    >
                      <div>
                        <p className="font-medium text-foreground">{clinic.name}</p>
                        <p className="text-sm text-muted-foreground">{clinic.email}</p>
                      </div>
                      {getStatusBadge(clinic.verification_status)}
                    </div>
                  ))}
                  {clinics.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No clinics yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Documents */}
            {pendingDocuments.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4 shadow-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-warning" />
                  Documents Awaiting Review
                </h3>
                <div className="space-y-3">
                  {pendingDocuments.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.user_name} • {doc.document_type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Professionals Tab */}
          <TabsContent value="professionals" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Onboarding</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfessionals.map((prof) => (
                      <tr key={prof.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="p-4 font-medium text-foreground">{prof.full_name}</td>
                        <td className="p-4 text-muted-foreground">{prof.email}</td>
                        <td className="p-4">{getStatusBadge(prof.verification_status)}</td>
                        <td className="p-4">
                          {prof.onboarding_completed ? (
                            <Badge className="bg-success/10 text-success border-success/20">Complete</Badge>
                          ) : (
                            <Badge variant="secondary">Incomplete</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser({ type: "professional", data: prof })}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProfessionals.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No professionals found
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Clinics Tab */}
          <TabsContent value="clinics" className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Onboarding</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClinics.map((clinic) => (
                      <tr key={clinic.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="p-4 font-medium text-foreground">{clinic.name}</td>
                        <td className="p-4 text-muted-foreground">{clinic.email}</td>
                        <td className="p-4">{getStatusBadge(clinic.verification_status)}</td>
                        <td className="p-4">
                          {clinic.onboarding_completed ? (
                            <Badge className="bg-success/10 text-success border-success/20">Complete</Badge>
                          ) : (
                            <Badge variant="secondary">Incomplete</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser({ type: "clinic", data: clinic })}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredClinics.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No clinics found
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Document</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Submitted</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-t border-border hover:bg-secondary/30">
                        <td className="p-4 font-medium text-foreground">{doc.name}</td>
                        <td className="p-4">
                          <div>
                            <p className="text-foreground">{doc.user_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{doc.user_role}</p>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground capitalize">{doc.document_type.replace("_", " ")}</td>
                        <td className="p-4">{getStatusBadge(doc.status)}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {documents.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No documents uploaded yet
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onVerify={(status, reason) => handleVerifyDocument(selectedDocument.id, status, reason)}
        />
      )}

      {selectedUser && (
        <UserDetailsModal
          type={selectedUser.type}
          user={selectedUser.data}
          onClose={() => setSelectedUser(null)}
          onVerify={(status) => handleVerifyUser(selectedUser.type, selectedUser.data.user_id, status)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

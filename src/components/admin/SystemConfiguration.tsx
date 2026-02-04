import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { Briefcase, FileText, Award, Settings2 } from "lucide-react";
import JobRolesManagement from "./JobRolesManagement";
import DocumentTypesManagement from "./DocumentTypesManagement";
import CertificationsManagement from "./CertificationsManagement";

const SystemConfiguration = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("job-roles");

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{t("admin.config.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("admin.config.subtitle")}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger 
            value="job-roles" 
            className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">{t("admin.config.jobRoles")}</span>
            <span className="sm:hidden">{t("admin.config.roles")}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="document-types" 
            className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{t("admin.config.documentTypes")}</span>
            <span className="sm:hidden">{t("admin.config.docs")}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="certifications" 
            className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">{t("admin.config.certifications")}</span>
            <span className="sm:hidden">{t("admin.config.certs")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="job-roles">
          <JobRolesManagement />
        </TabsContent>

        <TabsContent value="document-types">
          <DocumentTypesManagement />
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;

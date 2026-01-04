import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, FileText, User } from "lucide-react";

interface OnboardingBannerProps {
  type: "professional" | "clinic";
  onboardingComplete: boolean;
  verificationStatus: string;
  pendingDocuments: number;
  totalDocuments: number;
}

const OnboardingBanner = ({
  type,
  onboardingComplete,
  verificationStatus,
  pendingDocuments,
  totalDocuments,
}: OnboardingBannerProps) => {
  if (onboardingComplete && verificationStatus === "verified" && pendingDocuments === 0) {
    return null;
  }

  const getContent = () => {
    if (!onboardingComplete) {
      return {
        icon: User,
        title: "Complete Your Profile",
        description: `Finish setting up your ${type === "professional" ? "profile" : "clinic"} to get started.`,
        action: "Complete Setup",
        link: type === "professional" ? "/onboarding/professional" : "/onboarding/clinic",
        color: "warning",
      };
    }

    if (totalDocuments === 0) {
      return {
        icon: FileText,
        title: "Upload Required Documents",
        description: "Upload your verification documents to become eligible for shifts.",
        action: "Upload Documents",
        link: type === "professional" ? "/onboarding/professional" : "/onboarding/clinic",
        color: "destructive",
      };
    }

    if (pendingDocuments > 0) {
      return {
        icon: Clock,
        title: "Documents Under Review",
        description: `${pendingDocuments} document(s) are being reviewed by our team.`,
        action: null,
        link: null,
        color: "warning",
      };
    }

    if (verificationStatus === "pending") {
      return {
        icon: Clock,
        title: "Profile Under Review",
        description: "Your profile is being reviewed by our team. This usually takes 1-2 business days.",
        action: null,
        link: null,
        color: "warning",
      };
    }

    if (verificationStatus === "rejected") {
      return {
        icon: AlertCircle,
        title: "Verification Issue",
        description: "There was an issue with your verification. Please review and resubmit.",
        action: "View Details",
        link: type === "professional" ? "/onboarding/professional" : "/onboarding/clinic",
        color: "destructive",
      };
    }

    return null;
  };

  const content = getContent();
  if (!content) return null;

  const IconComponent = content.icon;
  const colorClasses = {
    warning: "bg-warning/10 border-warning/20 text-warning",
    destructive: "bg-destructive/10 border-destructive/20 text-destructive",
    primary: "bg-primary/10 border-primary/20 text-primary",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-4 rounded-xl border ${colorClasses[content.color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-current/10`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-medium text-foreground">{content.title}</h3>
          <p className="text-sm text-muted-foreground">{content.description}</p>
        </div>
        {content.action && content.link && (
          <Button asChild size="sm" variant="outline">
            <Link to={content.link}>
              {content.action}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default OnboardingBanner;

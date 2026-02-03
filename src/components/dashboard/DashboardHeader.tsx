import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import syndeoCarelogo from "@/assets/syndeocare-logo.png";

interface DashboardHeaderProps {
  type: "professional" | "clinic" | "admin";
  onSignOut: () => void;
  avatarUrl?: string | null;
  name?: string;
}

const DashboardHeader = ({ type, onSignOut, avatarUrl, name }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  
  const getConfig = () => {
    switch (type) {
      case "professional":
        return {
          avatarGradient: "bg-primary",
          profileLink: "/profile/professional",
        };
      case "clinic":
        return {
          avatarGradient: "bg-accent",
          profileLink: "/profile/clinic",
        };
      case "admin":
        return {
          avatarGradient: "bg-foreground",
          profileLink: "/admin",
        };
    }
  };

  const config = getConfig();
  
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : type === "admin" ? "AD" : type === "clinic" ? "CL" : "PR";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 min-h-[44px]">
            <img 
              src={syndeoCarelogo} 
              alt="SyndeoCare Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="icon" />
            {type !== "admin" && <NotificationCenter />}
            <button 
              onClick={onSignOut}
              className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] justify-center"
              aria-label={t("common.logOut")}
            >
              <LogOut className="w-5 h-5" />
            </button>
            <Link to={config.profileLink}>
              <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                <AvatarImage src={avatarUrl || undefined} alt={name || "User"} />
                <AvatarFallback className={`${config.avatarGradient} text-white text-xs font-medium`}>
                  {avatarUrl ? null : initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

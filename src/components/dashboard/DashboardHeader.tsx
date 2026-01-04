import { Link } from "react-router-dom";
import { Heart, Bell, LogOut, User, Building2, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  type: "professional" | "clinic" | "admin";
  onSignOut: () => void;
  avatarUrl?: string | null;
  name?: string;
}

const DashboardHeader = ({ type, onSignOut, avatarUrl, name }: DashboardHeaderProps) => {
  const getConfig = () => {
    switch (type) {
      case "professional":
        return {
          gradient: "gradient-primary",
          avatarGradient: "bg-primary",
          icon: Heart,
          avatarIcon: User,
        };
      case "clinic":
        return {
          gradient: "gradient-accent",
          avatarGradient: "bg-accent",
          icon: Heart,
          avatarIcon: Building2,
        };
      case "admin":
        return {
          gradient: "bg-foreground",
          avatarGradient: "bg-foreground",
          icon: Shield,
          avatarIcon: Shield,
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;
  const AvatarIcon = config.avatarIcon;
  
  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : type === "admin" ? "AD" : type === "clinic" ? "CL" : "PR";

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${config.gradient} flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${type === "admin" ? "text-background" : `text-${type === "clinic" ? "accent" : "primary"}-foreground`}`} />
            </div>
            <span className="font-bold text-lg text-foreground">
              {type === "admin" ? "Admin Dashboard" : "SyndeoCare.ai"}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {type !== "admin" && (
              <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </button>
            )}
            <button 
              onClick={onSignOut}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl || undefined} alt={name || "User"} />
              <AvatarFallback className={`${config.avatarGradient} text-white text-xs font-medium`}>
                {avatarUrl ? null : initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
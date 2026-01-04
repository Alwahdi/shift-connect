import { Link } from "react-router-dom";
import { Heart, Bell, LogOut, User, Building2, Shield } from "lucide-react";

interface DashboardHeaderProps {
  type: "professional" | "clinic" | "admin";
  onSignOut: () => void;
}

const DashboardHeader = ({ type, onSignOut }: DashboardHeaderProps) => {
  const getConfig = () => {
    switch (type) {
      case "professional":
        return {
          gradient: "gradient-primary",
          icon: Heart,
          avatarIcon: User,
        };
      case "clinic":
        return {
          gradient: "gradient-accent",
          icon: Heart,
          avatarIcon: Building2,
        };
      case "admin":
        return {
          gradient: "bg-foreground",
          icon: Shield,
          avatarIcon: Shield,
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;
  const AvatarIcon = config.avatarIcon;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${config.gradient} flex items-center justify-center`}>
              <IconComponent className={`w-4 h-4 ${type === "admin" ? "text-background" : `text-${type === "clinic" ? "accent" : "primary"}-foreground`}`} />
            </div>
            <span className="font-bold text-lg text-foreground">
              {type === "admin" ? "Admin Dashboard" : "SyndeoCare"}
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
            <div className={`w-8 h-8 rounded-full ${config.gradient} flex items-center justify-center`}>
              <AvatarIcon className={`w-4 h-4 ${type === "admin" ? "text-background" : `text-${type === "clinic" ? "accent" : "primary"}-foreground`}`} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

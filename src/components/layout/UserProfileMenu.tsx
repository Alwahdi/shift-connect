import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  LogOut,
  Building2,
  LayoutDashboard,
  Shield,
  ChevronDown,
} from "lucide-react";
import { VerificationBadge } from "@/components/ui/verification-badge";

interface UserProfile {
  full_name?: string;
  name?: string;
  avatar_url?: string | null;
  logo_url?: string | null;
  verification_status?: "pending" | "verified" | "rejected" | null;
}

export const UserProfileMenu = () => {
  const { t } = useTranslation();
  const { user, userRole, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user || !userRole) return;

    const fetchProfile = async () => {
      try {
        if (userRole === "professional" || userRole === "admin" || userRole === "super_admin") {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, avatar_url, verification_status")
            .eq("user_id", user.id)
            .single();
          
          if (data) {
            setProfile({ 
              full_name: data.full_name, 
              avatar_url: data.avatar_url,
              verification_status: data.verification_status as any
            });
          }
        } else if (userRole === "clinic") {
          const { data } = await supabase
            .from("clinics")
            .select("name, logo_url, verification_status")
            .eq("user_id", user.id)
            .single();
          
          if (data) {
            setProfile({ 
              name: data.name, 
              logo_url: data.logo_url,
              verification_status: data.verification_status as any
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user, userRole]);

  if (!user) return null;

  const displayName = profile?.full_name || profile?.name || user.email?.split("@")[0] || "User";
  const avatarUrl = profile?.avatar_url || profile?.logo_url;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const getProfileLink = () => {
    if (userRole === "clinic") return "/profile/clinic";
    if (userRole === "admin" || userRole === "super_admin") return "/admin";
    return "/profile/professional";
  };

  const getDashboardLink = () => {
    if (userRole === "clinic") return "/dashboard/clinic";
    if (userRole === "admin" || userRole === "super_admin") return "/admin";
    return "/dashboard/professional";
  };

  const ProfileIcon = userRole === "clinic" ? Building2 : userRole === "admin" || userRole === "super_admin" ? Shield : User;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 h-10">
          <div className="relative">
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            {profile?.verification_status && (
              <div className="absolute -bottom-0.5 -end-0.5">
                <VerificationBadge status={profile.verification_status} size="sm" />
              </div>
            )}
          </div>
          <span className="hidden md:block max-w-[120px] truncate text-sm font-medium">
            {displayName}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {profile?.verification_status && (
                <VerificationBadge status={profile.verification_status} size="sm" />
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to={getDashboardLink()} className="flex items-center cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("nav.dashboard")}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to={getProfileLink()} className="flex items-center cursor-pointer">
            <ProfileIcon className="mr-2 h-4 w-4" />
            {t("nav.profile")}
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        
        {(userRole === "admin" || userRole === "super_admin") && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              {t("nav.adminPanel")}
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("common.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

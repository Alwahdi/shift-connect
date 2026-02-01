import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Search, User, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
  const { user, userRole, isOnboardingComplete } = useAuth();

  // Only show for authenticated users who completed onboarding
  if (!user || !isOnboardingComplete) {
    return null;
  }

  const getDashboardPath = () => {
    if (userRole === "admin" || userRole === "super_admin") return "/admin";
    if (userRole === "clinic") return "/dashboard/clinic";
    return "/dashboard/professional";
  };

  const getProfilePath = () => {
    if (userRole === "clinic") return "/profile/clinic";
    return "/profile/professional";
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: getDashboardPath(),
    },
    {
      label: "Shifts",
      icon: Search,
      path: "/shifts",
    },
    {
      label: "Messages",
      icon: MessageCircle,
      path: "/messages",
    },
    {
      label: "Profile",
      icon: User,
      path: getProfilePath(),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-center justify-around px-2 safe-area-inset-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] min-h-[48px] rounded-lg text-muted-foreground transition-colors",
              "hover:text-foreground hover:bg-muted/50",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            activeClassName="text-primary bg-primary/10"
            aria-label={item.label}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

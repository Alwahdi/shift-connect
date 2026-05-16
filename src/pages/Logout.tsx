import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Logout = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const runLogout = async () => {
      try {
        await signOut();

        // Clear any stale auth cache keys from previous sessions/builds.
        Object.keys(localStorage).forEach((key) => {
          if (/^sb-.*-auth-token$/.test(key)) {
            localStorage.removeItem(key);
          }
        });
      } finally {
        navigate("/auth", { replace: true });
      }
    };

    runLogout();
  }, [navigate, signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Signing out...</span>
      </div>
    </div>
  );
};

export default Logout;

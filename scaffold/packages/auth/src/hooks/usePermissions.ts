/**
 * @syndeocare/auth — usePermissions Hook
 *
 * Fetches admin permissions for the current user.
 * Returns null for non-admin users.
 */
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "../provider";

export interface AdminPermissions {
  can_verify_professionals: boolean;
  can_verify_clinics: boolean;
  can_verify_documents: boolean;
  can_manage_admins: boolean;
  can_view_analytics: boolean;
}

export function usePermissions(supabase: SupabaseClient) {
  const { user, userRole } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || (userRole !== "admin" && userRole !== "super_admin")) {
      setPermissions(null);
      return;
    }

    setIsLoading(true);

    // Super admins have all permissions
    if (userRole === "super_admin") {
      setPermissions({
        can_verify_professionals: true,
        can_verify_clinics: true,
        can_verify_documents: true,
        can_manage_admins: true,
        can_view_analytics: true,
      });
      setIsLoading(false);
      return;
    }

    supabase
      .from("admin_permissions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setPermissions(
          data
            ? {
                can_verify_professionals: data.can_verify_professionals ?? false,
                can_verify_clinics: data.can_verify_clinics ?? false,
                can_verify_documents: data.can_verify_documents ?? false,
                can_manage_admins: data.can_manage_admins ?? false,
                can_view_analytics: data.can_view_analytics ?? false,
              }
            : null
        );
        setIsLoading(false);
      });
  }, [user, userRole, supabase]);

  return { permissions, isLoading };
}

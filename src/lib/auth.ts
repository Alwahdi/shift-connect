import { supabase } from "@/integrations/supabase/client";

export type AppUserRole = "professional" | "clinic" | "admin" | "super_admin";

const ROLE_PRIORITY: AppUserRole[] = ["super_admin", "admin", "professional", "clinic"];

export const isAdminRole = (role: AppUserRole | null | undefined): role is "admin" | "super_admin" =>
  role === "admin" || role === "super_admin";

export const resolvePrimaryUserRole = (roles: AppUserRole[]): AppUserRole | null => {
  if (roles.length === 0) {
    return null;
  }

  const prioritizedRole = ROLE_PRIORITY.find((role) => roles.includes(role));
  return prioritizedRole ?? roles[0];
};

export const fetchPrimaryUserRole = async (userId: string): Promise<AppUserRole | null> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return resolvePrimaryUserRole((data ?? []).map(({ role }) => role as AppUserRole));
};

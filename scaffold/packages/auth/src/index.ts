/**
 * @syndeocare/auth — Public API
 */
export { AuthProvider, useAuth } from "./provider";
export { RequireAuth } from "./guards/RequireAuth";
export { RequireRole } from "./guards/RequireRole";
export { RequireOnboarding } from "./guards/RequireOnboarding";
export { usePermissions, type AdminPermissions } from "./hooks/usePermissions";
export type {
  AppRole,
  AuthState,
  AuthActions,
  AuthContextValue,
  UserProfile,
  ClinicProfile,
} from "./types";

export const SITE_CONFIG = {
  name: "SyndeoCare",
  tagline: "Healthcare Staffing, Simplified",
  description: "Connect healthcare professionals with facilities seamlessly",
  supportEmail: "support@syndeocare.ai",
  supportPhone: "+966-55-000-0000",
} as const;

export const AUTH_CONFIG = {
  minPasswordLength: 6,
} as const;

export const API_CONFIG = {
  defaultPageSize: 20,
  maxFileSize: 10 * 1024 * 1024,
  allowedDocumentTypes: ["pdf", "jpg", "jpeg", "png"],
  allowedAvatarTypes: ["jpg", "jpeg", "png", "webp"],
} as const;

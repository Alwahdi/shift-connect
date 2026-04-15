export const SITE_CONFIG = {
  name: "SyndeoCare",
  tagline: "Healthcare Staffing, Simplified",
  supportEmail: "support@syndeocare.ai",
} as const;

export const AUTH_CONFIG = { minPasswordLength: 6 } as const;

export const API_CONFIG = {
  defaultPageSize: 20,
  maxFileSize: 10 * 1024 * 1024,
  allowedDocumentTypes: ["pdf", "jpg", "jpeg", "png"],
} as const;

export const ROLE_OPTIONS = [
  "Registered Nurse", "Licensed Practical Nurse", "Dental Hygienist",
  "Dental Assistant", "Medical Assistant", "Radiologic Technologist",
  "Pharmacy Technician", "Physical Therapist", "Occupational Therapist",
] as const;

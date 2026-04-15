export const APP_CONFIG = {
  name: 'SyndeoCare',
  tagline: 'Healthcare Staffing, Simplified',
  version: '1.0.0',
  supportEmail: 'support@syndeocare.ai',
  website: 'https://syndeocare.ai',
};

export const AUTH_CONFIG = {
  minPasswordLength: 6,
  maxLoginAttempts: 5,
};

export const API_CONFIG = {
  pageSize: 20,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
};

export const BOOKING_STATUSES = {
  requested: { label: 'Requested', color: 'warning' },
  accepted: { label: 'Accepted', color: 'success' },
  declined: { label: 'Declined', color: 'destructive' },
  confirmed: { label: 'Confirmed', color: 'success' },
  checked_in: { label: 'Checked In', color: 'accent' },
  checked_out: { label: 'Checked Out', color: 'primary' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'destructive' },
  no_show: { label: 'No Show', color: 'destructive' },
} as const;

export const VERIFICATION_STATUSES = {
  pending: { label: 'Pending', color: 'warning' },
  verified: { label: 'Verified', color: 'success' },
  rejected: { label: 'Rejected', color: 'destructive' },
} as const;

// Enums
export enum AppRole {
  PROFESSIONAL = 'professional',
  CLINIC = 'clinic',
  ADMIN = 'admin',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum BookingStatus {
  REQUESTED = 'requested',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum DocumentType {
  ID = 'id',
  LICENSE = 'license',
  CERTIFICATION = 'certification',
  BUSINESS_LICENSE = 'business_license',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

export enum NotificationType {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

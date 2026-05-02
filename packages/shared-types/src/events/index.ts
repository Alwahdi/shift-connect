import { AppRole, BookingStatus, DocumentType, PaymentStatus, VerificationStatus } from '../enums';

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface KafkaEvent<T = unknown> {
  eventId: string;
  timestamp: string;
  version: string;
  source: string;
  payload: T;
}

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  role: AppRole;
  fullName: string;
}

export interface UserRegisteredEvent extends KafkaEvent<UserRegisteredPayload> {
  source: 'auth-service';
}

export const KAFKA_TOPICS = {
  // Auth
  AUTH_USER_REGISTERED: 'syndeocare.auth.user-registered',
  AUTH_OTP_REQUESTED: 'syndeocare.auth.otp-requested',

  // Bookings
  BOOKINGS_CREATED: 'syndeocare.bookings.booking-created',
  BOOKINGS_STATUS_CHANGED: 'syndeocare.bookings.booking-status-changed',

  // Payments
  PAYMENTS_COMPLETED: 'syndeocare.payments.payment-completed',
  PAYMENTS_FAILED: 'syndeocare.payments.payment-failed',

  // Notifications
  NOTIFICATIONS_EMAIL_SEND: 'syndeocare.notifications.email-send',

  // Dead-letter topics
  DLT_AUTH: 'syndeocare.auth.dead-letter',
  DLT_BOOKINGS: 'syndeocare.bookings.dead-letter',
  DLT_PAYMENTS: 'syndeocare.payments.dead-letter',
  DLT_NOTIFICATIONS: 'syndeocare.notifications.dead-letter',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface BookingCreatedPayload {
  bookingId: string;
  shiftId: string;
  professionalId: string;
  clinicId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
}

export interface BookingCreatedEvent extends KafkaEvent<BookingCreatedPayload> {
  source: 'bookings-service';
}

export interface BookingStatusChangedPayload {
  bookingId: string;
  previousStatus: BookingStatus;
  newStatus: BookingStatus;
  professionalId: string;
  clinicId: string;
  reason?: string;
}

export interface BookingStatusChangedEvent
  extends KafkaEvent<BookingStatusChangedPayload> {
  source: 'bookings-service';
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface PaymentCompletedPayload {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  professionalId: string;
  clinicId: string;
}

export interface PaymentCompletedEvent
  extends KafkaEvent<PaymentCompletedPayload> {
  source: 'payments-service';
}

export interface PaymentFailedPayload {
  paymentId: string;
  bookingId: string;
  reason: string;
  clinicId: string;
}

export interface PaymentFailedEvent extends KafkaEvent<PaymentFailedPayload> {
  source: 'payments-service';
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface EmailSendPayload {
  to: string;
  subject: string;
  templateId: string;
  templateData: Record<string, unknown>;
}

export interface EmailSendEvent extends KafkaEvent<EmailSendPayload> {
  source: string;
}

// ─── Re-exports from enums ────────────────────────────────────────────────────

export { AppRole, BookingStatus, DocumentType, PaymentStatus, VerificationStatus };

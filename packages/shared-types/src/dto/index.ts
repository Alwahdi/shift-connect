import { z } from 'zod';
import { AppRole, BookingStatus, DocumentType, VerificationStatus } from '../enums';

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export const RegisterDto = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(2).max(100),
  role: z.nativeEnum(AppRole).refine(
    (v) => v !== AppRole.ADMIN,
    { message: 'Role must be professional or clinic' },
  ),
  phone: z.string().optional(),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const SendOtpDto = z.object({
  email: z.string().email(),
});

export const VerifyOtpDto = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterDtoType = z.infer<typeof RegisterDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
export type SendOtpDtoType = z.infer<typeof SendOtpDto>;
export type VerifyOtpDtoType = z.infer<typeof VerifyOtpDto>;
export type RefreshTokenDtoType = z.infer<typeof RefreshTokenDto>;

// ─── Profile DTOs ─────────────────────────────────────────────────────────────

export const UpdateProfileDto = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  bio: z.string().max(2000).optional(),
  specialties: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  hourlyRate: z.number().positive().optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  locationAddress: z.string().optional(),
  maxTravelDistanceKm: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
});

export const UpdateClinicDto = z.object({
  name: z.string().min(2).max(200).optional(),
  phone: z.string().optional(),
  description: z.string().max(2000).optional(),
  address: z.string().optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  taxId: z.string().optional(),
});

export type UpdateProfileDtoType = z.infer<typeof UpdateProfileDto>;
export type UpdateClinicDtoType = z.infer<typeof UpdateClinicDto>;

// ─── Booking DTOs ─────────────────────────────────────────────────────────────

export const CreateShiftDto = z.object({
  title: z.string().min(2).max(200),
  roleRequired: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  shiftDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  hourlyRate: z.number().positive(),
  requiredCertifications: z.array(z.string()).optional(),
  locationAddress: z.string().optional(),
  locationLat: z.number().min(-90).max(90).optional(),
  locationLng: z.number().min(-180).max(180).optional(),
  isUrgent: z.boolean().default(false),
  maxApplicants: z.number().int().positive().default(10),
});

export const UpdateBookingStatusDto = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z.string().max(500).optional(),
});

export type CreateShiftDtoType = z.infer<typeof CreateShiftDto>;
export type UpdateBookingStatusDtoType = z.infer<typeof UpdateBookingStatusDto>;

// ─── Shared response types ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

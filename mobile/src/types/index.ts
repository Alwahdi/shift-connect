export type UserRole = "professional" | "clinic";
export type VerificationStatus = "pending" | "verified" | "rejected";
export type BookingStatus = "pending" | "accepted" | "declined" | "confirmed" | "checked_in" | "checked_out" | "completed" | "cancelled";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  hourly_rate: number | null;
  specialties: string[] | null;
  qualifications: string[] | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  verification_status: VerificationStatus | null;
  onboarding_completed: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  is_available: boolean | null;
  created_at: string;
}

export interface Clinic {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  tax_id: string | null;
  location_lat: number | null;
  location_lng: number | null;
  verification_status: VerificationStatus | null;
  onboarding_completed: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string;
}

export interface Shift {
  id: string;
  clinic_id: string;
  title: string;
  role_required: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  location_address: string | null;
  description: string | null;
  required_certifications: string[] | null;
  is_urgent: boolean | null;
  is_filled: boolean | null;
  max_applicants: number | null;
  proposal_deadline: string | null;
  created_at: string;
  clinic?: { id: string; name: string; address: string | null; rating_avg: number | null; logo_url: string | null };
}

export interface Booking {
  id: string;
  shift_id: string;
  professional_id: string;
  clinic_id: string;
  status: BookingStatus | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shift?: Shift;
  professional?: Profile;
  clinic?: Clinic;
}

export interface Conversation {
  id: string;
  professional_id: string;
  clinic_id: string;
  booking_id: string | null;
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_read: boolean | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean | null;
  created_at: string;
}

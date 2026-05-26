export type AppRole = 'professional' | 'clinic' | 'admin' | 'super_admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type DocumentType = 'id' | 'license' | 'certification' | 'business_license' | 'insurance' | 'other';
export type BookingStatus =
  | 'pending'
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface RoleRecord {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  hourly_rate: number | null;
  specialties: string[] | null;
  qualifications: string[] | null;
  is_available: boolean | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  rating_avg: number | null;
  rating_count: number | null;
  verification_status: VerificationStatus | null;
  onboarding_completed: boolean | null;
}

export interface Clinic {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  description: string | null;
  logo_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  rating_avg: number | null;
  rating_count: number | null;
  verification_status: VerificationStatus | null;
  onboarding_completed: boolean | null;
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
  description: string | null;
  location_address: string | null;
  is_filled: boolean | null;
  is_urgent: boolean | null;
  required_certifications: string[] | null;
  max_applicants: number | null;
  proposal_deadline: string | null;
  clinic?: Clinic | null;
  applicantCount?: number;
}

export interface Booking {
  id: string;
  shift_id: string;
  clinic_id: string;
  professional_id: string;
  status: BookingStatus | null;
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  shift?: Shift | null;
  clinic?: Clinic | null;
  professional?: Profile | null;
}

export interface Conversation {
  id: string;
  clinic_id: string;
  professional_id: string;
  booking_id: string | null;
  last_message_at: string | null;
  professional?: Profile | null;
  clinic?: Clinic | null;
  lastMessage?: Message | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'clinic' | 'professional';
  content: string;
  file_url: string | null;
  is_read: boolean | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  data: Record<string, unknown> | null;
  is_read: boolean | null;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  user_id: string;
  document_type: DocumentType;
  name: string;
  file_url: string;
  status: VerificationStatus | null;
  expiry_date: string | null;
}

export type Database = {
  public: {
    Tables: {
      user_roles: {
        Row: RoleRecord;
        Insert: Omit<RoleRecord, 'id'> & { id?: string };
        Update: Partial<RoleRecord>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, 'user_id' | 'full_name' | 'email'>;
        Update: Partial<Profile>;
      };
      clinics: {
        Row: Clinic;
        Insert: Partial<Clinic> & Pick<Clinic, 'user_id' | 'name' | 'email'>;
        Update: Partial<Clinic>;
      };
      shifts: {
        Row: Shift;
        Insert: Partial<Shift> & Pick<Shift, 'clinic_id' | 'title' | 'role_required' | 'shift_date' | 'start_time' | 'end_time' | 'hourly_rate'>;
        Update: Partial<Shift>;
      };
      bookings: {
        Row: Booking;
        Insert: Partial<Booking> & Pick<Booking, 'shift_id' | 'clinic_id' | 'professional_id'>;
        Update: Partial<Booking>;
      };
      conversations: {
        Row: Conversation;
        Insert: Partial<Conversation> & Pick<Conversation, 'clinic_id' | 'professional_id'>;
        Update: Partial<Conversation>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & Pick<Message, 'conversation_id' | 'sender_id' | 'sender_type' | 'content'>;
        Update: Partial<Message>;
      };
      notifications: {
        Row: NotificationItem;
        Insert: Partial<NotificationItem> & Pick<NotificationItem, 'user_id' | 'title' | 'message' | 'type'>;
        Update: Partial<NotificationItem>;
      };
      documents: {
        Row: DocumentRecord;
        Insert: Partial<DocumentRecord> & Pick<DocumentRecord, 'user_id' | 'document_type' | 'name' | 'file_url'>;
        Update: Partial<DocumentRecord>;
      };
      job_roles: {
        Row: { id: string; name: string; is_active: boolean | null };
        Insert: { id?: string; name: string; is_active?: boolean | null };
        Update: { id?: string; name?: string; is_active?: boolean | null };
      };
      ratings: {
        Row: { id: string; booking_id: string; reviewer_id: string; reviewee_id: string; rating: number; comment: string | null };
        Insert: { id?: string; booking_id: string; reviewer_id: string; reviewee_id: string; rating: number; comment?: string | null };
        Update: Partial<{ booking_id: string; reviewer_id: string; reviewee_id: string; rating: number; comment: string | null }>;
      };
    };
  };
};

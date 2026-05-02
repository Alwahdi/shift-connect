import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { VerificationStatus } from '@syndeocare/shared-types';

@Entity('profiles')
export class ProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', array: true, default: [] })
  specialties: string[];

  @Column({ type: 'text', array: true, default: [] })
  qualifications: string[];

  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
  locationLat?: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
  locationLng?: number;

  @Column({ name: 'location_address', nullable: true })
  locationAddress?: string;

  @Column({ name: 'max_travel_distance_km', default: 30 })
  maxTravelDistanceKm: number;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'rating_avg', type: 'decimal', precision: 3, scale: 2, default: 0 })
  ratingAvg: number;

  @Column({ name: 'rating_count', default: 0 })
  ratingCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

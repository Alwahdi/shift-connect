import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('shifts')
export class ShiftEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'clinic_id' }) clinicId: string;
  @Column() title: string;
  @Column({ name: 'role_required' }) roleRequired: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Index() @Column({ name: 'shift_date', type: 'date' }) shiftDate: Date;
  @Column({ name: 'start_time', type: 'time' }) startTime: string;
  @Column({ name: 'end_time', type: 'time' }) endTime: string;
  @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2 }) hourlyRate: number;
  @Column({ name: 'required_certifications', type: 'text', array: true, default: [] }) requiredCertifications: string[];
  @Column({ name: 'location_address', nullable: true }) locationAddress?: string;
  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true }) locationLat?: number;
  @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true }) locationLng?: number;
  @Column({ name: 'is_urgent', default: false }) isUrgent: boolean;
  @Column({ name: 'is_filled', default: false }) isFilled: boolean;
  @Column({ name: 'max_applicants', default: 10 }) maxApplicants: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

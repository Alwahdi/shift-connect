import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';
import { BookingStatus } from '@syndeocare/shared-types';

@Entity('bookings')
@Unique(['shiftId', 'professionalId'])
@Unique(['idempotencyKey'])
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'shift_id' }) shiftId: string;
  @Index() @Column({ name: 'professional_id' }) professionalId: string;
  @Index() @Column({ name: 'clinic_id' }) clinicId: string;
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.REQUESTED }) status: BookingStatus;
  /** Client-supplied idempotency key — prevents duplicate bookings from retried requests */
  @Column({ name: 'idempotency_key', nullable: true, unique: true }) idempotencyKey?: string;
  @Column({ name: 'check_in_time', type: 'timestamptz', nullable: true }) checkInTime?: Date;
  @Column({ name: 'check_out_time', type: 'timestamptz', nullable: true }) checkOutTime?: Date;
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true }) cancellationReason?: string;
  @Column({ type: 'text', nullable: true }) notes?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

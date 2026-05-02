import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PaymentStatus } from '@syndeocare/shared-types';

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'booking_id' }) bookingId: string;
  @Index() @Column({ name: 'clinic_id' }) clinicId: string;
  @Index() @Column({ name: 'professional_id' }) professionalId: string;
  @Column({ name: 'stripe_payment_intent_id', nullable: true }) stripePaymentIntentId?: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ default: 'USD' }) currency: string;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }) status: PaymentStatus;
  @Column({ name: 'idempotency_key', unique: true }) idempotencyKey: string;
  @Column({ name: 'failure_reason', nullable: true }) failureReason?: string;
  @Column({ type: 'jsonb', default: {} }) metadata: Record<string, unknown>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { NotificationType } from '@syndeocare/shared-types';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'user_id' }) userId: string;
  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.IN_APP }) type: NotificationType;
  @Column() title: string;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'jsonb', default: {} }) metadata: Record<string, unknown>;
  @Column({ name: 'is_read', default: false }) isRead: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

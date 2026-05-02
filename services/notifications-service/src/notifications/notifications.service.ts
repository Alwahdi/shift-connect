import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationEntity } from './notification.entity';
import { NotificationType } from '@syndeocare/shared-types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
    @InjectQueue('email') private readonly emailQueue: Queue,
  ) {}

  async createInApp(params: {
    userId: string;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
  }): Promise<NotificationEntity> {
    const notif = this.notifRepo.create({
      userId: params.userId,
      type: NotificationType.IN_APP,
      title: params.title,
      body: params.body,
      metadata: params.metadata ?? {},
    });
    return this.notifRepo.save(notif);
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    templateId: string;
    templateData: Record<string, unknown>;
  }): Promise<void> {
    await this.emailQueue.add(
      'send-email',
      params,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );
    this.logger.log(`Email queued to ${params.to}`);
  }

  async findForUser(userId: string, unreadOnly = false) {
    const qb = this.notifRepo
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC')
      .take(50);

    if (unreadOnly) qb.andWhere('n.is_read = false');
    return qb.getMany();
  }

  async markRead(notifId: string, userId: string): Promise<void> {
    await this.notifRepo.update({ id: notifId, userId }, { isRead: true });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notifRepo.update({ userId, isRead: false }, { isRead: true });
  }
}

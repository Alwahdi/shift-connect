import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, KafkaMessage, Producer } from 'kafkajs';
import Redis from 'ioredis';
import { NotificationsService } from '../notifications/notifications.service';
import {
  KAFKA_TOPICS,
  UserRegisteredEvent,
  BookingCreatedEvent,
  BookingStatusChangedEvent,
  PaymentCompletedEvent,
} from '@syndeocare/shared-types';

// TTL for processed event IDs in Redis — 7 days covers any retry window
const IDEMPOTENCY_TTL_SECONDS = 7 * 24 * 60 * 60;
const IDEMPOTENCY_KEY_PREFIX = 'notifications:processed:';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private dltProducer: Producer;
  private redis: Redis;

  constructor(
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    // ── Redis (idempotency store) ──────────────────────────────────────────
    this.redis = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
      lazyConnect: true,
    });
    await this.redis.connect();

    // ── Kafka ─────────────────────────────────────────────────────────────
    const brokers = this.config.get<string | string[]>('KAFKA_BROKERS', 'localhost:9092');
    this.kafka = new Kafka({
      clientId: this.config.get<string>('KAFKA_CLIENT_ID', 'notifications-service'),
      brokers: Array.isArray(brokers) ? brokers : brokers.split(',').map((b) => b.trim()),
    });

    this.consumer = this.kafka.consumer({ groupId: 'notifications-service-group' });
    this.dltProducer = this.kafka.producer();

    await this.consumer.connect();
    await this.dltProducer.connect();

    await this.consumer.subscribe({
      topics: [
        KAFKA_TOPICS.AUTH_USER_REGISTERED,
        KAFKA_TOPICS.BOOKINGS_CREATED,
        KAFKA_TOPICS.BOOKINGS_STATUS_CHANGED,
        KAFKA_TOPICS.PAYMENTS_COMPLETED,
      ],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        await this.processWithIdempotency(topic, partition, message);
      },
    });

    this.logger.log('Kafka consumer connected and listening');
  }

  async onModuleDestroy() {
    await this.consumer?.disconnect();
    await this.dltProducer?.disconnect();
    await this.redis?.quit();
  }

  // ── Idempotency wrapper ──────────────────────────────────────────────────

  private async processWithIdempotency(
    topic: string,
    partition: number,
    message: KafkaMessage,
  ) {
    if (!message.value) return;

    let eventId: string | undefined;
    try {
      const parsed = JSON.parse(message.value.toString());
      eventId = parsed?.eventId as string | undefined;
    } catch {
      this.logger.warn('Failed to parse message; routing to DLT');
      await this.sendToDlt(topic, message, 'Invalid JSON');
      return;
    }

    // Check idempotency — skip already-processed events
    if (eventId) {
      const key = `${IDEMPOTENCY_KEY_PREFIX}${eventId}`;
      const alreadyProcessed = await this.redis.set(key, '1', 'EX', IDEMPOTENCY_TTL_SECONDS, 'NX');
      if (alreadyProcessed === null) {
        // NX returned null → key already existed → duplicate
        this.logger.debug(`Skipping duplicate event ${eventId} on topic ${topic}`);
        return;
      }
    }

    try {
      await this.handleMessage(topic, JSON.parse(message.value.toString()));
    } catch (err) {
      const errMsg = (err as Error).message;
      this.logger.error(`Failed to handle message on ${topic} [eventId=${eventId}]: ${errMsg}`);

      // Revert the idempotency key so the event can be retried after DLT
      if (eventId) {
        await this.redis.del(`${IDEMPOTENCY_KEY_PREFIX}${eventId}`);
      }

      await this.sendToDlt(topic, message, errMsg);
    }
  }

  // ── Dead-letter topic ────────────────────────────────────────────────────

  private async sendToDlt(topic: string, message: KafkaMessage, reason: string) {
    const dltTopic = KAFKA_TOPICS.DLT_NOTIFICATIONS;
    try {
      await this.dltProducer.send({
        topic: dltTopic,
        messages: [
          {
            key: message.key,
            value: JSON.stringify({
              originalTopic: topic,
              originalMessage: message.value?.toString(),
              reason,
              failedAt: new Date().toISOString(),
            }),
            headers: { 'x-original-topic': topic },
          },
        ],
      });
    } catch (dltErr) {
      this.logger.error(`Failed to send to DLT: ${(dltErr as Error).message}`);
    }
  }

  // ── Domain handlers ──────────────────────────────────────────────────────

  private async handleMessage(topic: string, payload: unknown) {
    switch (topic) {
      case KAFKA_TOPICS.AUTH_USER_REGISTERED: {
        const event = payload as UserRegisteredEvent;
        await this.notifications.sendEmail({
          to: event.payload.email,
          subject: 'Welcome to SyndeoCare!',
          templateId: 'welcome',
          templateData: { fullName: event.payload.fullName, role: event.payload.role },
        });
        break;
      }

      case KAFKA_TOPICS.BOOKINGS_CREATED: {
        const event = payload as BookingCreatedEvent;
        await this.notifications.createInApp({
          userId: event.payload.clinicId,
          title: 'New Booking Request',
          body: 'A professional has applied to your shift',
          metadata: { bookingId: event.payload.bookingId },
        });
        break;
      }

      case KAFKA_TOPICS.BOOKINGS_STATUS_CHANGED: {
        const event = payload as BookingStatusChangedEvent;
        await this.notifications.createInApp({
          userId: event.payload.professionalId,
          title: 'Booking Update',
          body: `Your booking status changed to ${event.payload.newStatus}`,
          metadata: { bookingId: event.payload.bookingId, status: event.payload.newStatus },
        });
        break;
      }

      case KAFKA_TOPICS.PAYMENTS_COMPLETED: {
        const event = payload as PaymentCompletedEvent;
        await this.notifications.createInApp({
          userId: event.payload.professionalId,
          title: 'Payment Received',
          body: `Payment of ${event.payload.amount} ${event.payload.currency} processed`,
          metadata: { paymentId: event.payload.paymentId },
        });
        break;
      }

      default:
        this.logger.warn(`Unhandled topic: ${topic}`);
    }
  }
}

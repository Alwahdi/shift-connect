import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, KafkaMessage } from 'kafkajs';
import { NotificationsService } from '../notifications/notifications.service';
import {
  KAFKA_TOPICS,
  UserRegisteredEvent,
  BookingCreatedEvent,
  BookingStatusChangedEvent,
  PaymentCompletedEvent,
} from '@syndeocare/shared-types';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    const brokers = this.config.get<string[]>('KAFKA_BROKERS', ['localhost:9092']);
    this.kafka = new Kafka({
      clientId: this.config.get<string>('KAFKA_CLIENT_ID', 'notifications-service'),
      brokers: Array.isArray(brokers) ? brokers : [brokers],
    });

    this.consumer = this.kafka.consumer({
      groupId: 'notifications-service-group',
    });

    await this.consumer.connect();

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
      eachMessage: async ({ topic, message }) => {
        try {
          await this.handleMessage(topic, message);
        } catch (err) {
          this.logger.error(`Failed to handle message on ${topic}: ${(err as Error).message}`);
          // In production, emit to DLT here
        }
      },
    });

    this.logger.log('Kafka consumer connected and listening');
  }

  async onModuleDestroy() {
    await this.consumer?.disconnect();
  }

  private async handleMessage(topic: string, message: KafkaMessage) {
    if (!message.value) return;
    const payload = JSON.parse(message.value.toString());

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

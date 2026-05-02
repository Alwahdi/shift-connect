import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentEntity } from './payment.entity';
import {
  PaymentStatus,
  KAFKA_TOPICS,
  PaymentCompletedEvent,
  PaymentFailedEvent,
} from '@syndeocare/shared-types';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @Inject('KAFKA_CLIENT')
    private readonly kafka: ClientKafka,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(config.get<string>('STRIPE_SECRET_KEY', ''), {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(params: {
    bookingId: string;
    clinicId: string;
    professionalId: string;
    amount: number; // in cents
    currency?: string;
    idempotencyKey?: string;
  }) {
    const iKey = params.idempotencyKey ?? `payment-${params.bookingId}`;

    const existing = await this.paymentRepo.findOne({ where: { idempotencyKey: iKey } });
    if (existing) throw new ConflictException('Payment already exists for this booking');

    const intent = await this.stripe.paymentIntents.create(
      {
        amount: params.amount,
        currency: params.currency ?? 'usd',
        metadata: { bookingId: params.bookingId },
      },
      { idempotencyKey: iKey },
    );

    const payment = this.paymentRepo.create({
      bookingId: params.bookingId,
      clinicId: params.clinicId,
      professionalId: params.professionalId,
      amount: params.amount / 100,
      currency: params.currency ?? 'USD',
      stripePaymentIntentId: intent.id,
      idempotencyKey: iKey,
    });

    await this.paymentRepo.save(payment);

    return { clientSecret: intent.client_secret, paymentId: payment.id };
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer): Promise<void> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${(err as Error).message}`);
      throw err;
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.markCompleted(intent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.markFailed(intent.id, intent.last_payment_error?.message ?? 'Unknown error');
        break;
      }
      default:
        this.logger.log(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async markCompleted(stripeIntentId: string): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: stripeIntentId },
    });
    if (!payment) return;

    await this.paymentRepo.update(payment.id, { status: PaymentStatus.COMPLETED });

    const kafkaEvent: PaymentCompletedEvent = {
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      version: '1',
      source: 'payments-service',
      payload: {
        paymentId: payment.id,
        bookingId: payment.bookingId,
        amount: payment.amount,
        currency: payment.currency,
        professionalId: payment.professionalId,
        clinicId: payment.clinicId,
      },
    };

    this.kafka.emit(KAFKA_TOPICS.PAYMENTS_COMPLETED, kafkaEvent).subscribe({
      error: (err: Error) => this.logger.error(`Kafka emit failed: ${err.message}`),
    });
  }

  private async markFailed(stripeIntentId: string, reason: string): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: stripeIntentId },
    });
    if (!payment) return;

    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.FAILED,
      failureReason: reason,
    });

    const kafkaEvent: PaymentFailedEvent = {
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      version: '1',
      source: 'payments-service',
      payload: {
        paymentId: payment.id,
        bookingId: payment.bookingId,
        reason,
        clinicId: payment.clinicId,
      },
    };

    this.kafka.emit(KAFKA_TOPICS.PAYMENTS_FAILED, kafkaEvent).subscribe({
      error: (err: Error) => this.logger.error(`Kafka emit failed: ${err.message}`),
    });
  }
}

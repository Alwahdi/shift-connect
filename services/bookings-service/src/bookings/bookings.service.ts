import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { BookingEntity } from './booking.entity';
import { BookingStatus, KAFKA_TOPICS, BookingCreatedEvent, BookingStatusChangedEvent } from '@syndeocare/shared-types';
import { randomUUID } from 'crypto';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.REQUESTED]: [BookingStatus.ACCEPTED, BookingStatus.DECLINED, BookingStatus.CANCELLED],
  [BookingStatus.ACCEPTED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.CHECKED_IN, BookingStatus.CANCELLED],
  [BookingStatus.CHECKED_IN]: [BookingStatus.CHECKED_OUT],
  [BookingStatus.CHECKED_OUT]: [BookingStatus.COMPLETED],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.DECLINED]: [],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.NO_SHOW]: [],
};

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @Inject('KAFKA_CLIENT')
    private readonly kafka: ClientKafka,
  ) {}

  async createBooking(
    professionalId: string,
    shiftId: string,
    clinicId: string,
    idempotencyKey?: string,
  ): Promise<BookingEntity> {
    // Idempotency: if the client provided a key and we already processed it, return existing
    if (idempotencyKey) {
      const byKey = await this.bookingRepo.findOne({ where: { idempotencyKey } });
      if (byKey) {
        this.logger.debug(`Returning existing booking for idempotency key ${idempotencyKey}`);
        return byKey;
      }
    }

    // Natural duplicate check (same professional + same shift)
    const existing = await this.bookingRepo.findOne({ where: { shiftId, professionalId } });
    if (existing) throw new ConflictException('Already applied to this shift');

    const booking = this.bookingRepo.create({ shiftId, professionalId, clinicId, idempotencyKey });
    const saved = await this.bookingRepo.save(booking);

    // Emit Kafka event
    const event: BookingCreatedEvent = {
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      version: '1',
      source: 'bookings-service',
      payload: {
        bookingId: saved.id,
        shiftId: saved.shiftId,
        professionalId: saved.professionalId,
        clinicId: saved.clinicId,
        shiftDate: '',
        startTime: '',
        endTime: '',
        hourlyRate: 0,
      },
    };

    this.kafka.emit(KAFKA_TOPICS.BOOKINGS_CREATED, event).subscribe({
      error: (err: Error) => this.logger.error(`Kafka emit failed: ${err.message}`),
    });

    return saved;
  }

  async updateStatus(
    bookingId: string,
    actorId: string,
    newStatus: BookingStatus,
    reason?: string,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    // Authorization: clinic or professional can update depending on transition
    const isClinic = booking.clinicId === actorId;
    const isProfessional = booking.professionalId === actorId;
    if (!isClinic && !isProfessional) throw new ForbiddenException('Not authorized');

    const allowed = VALID_TRANSITIONS[booking.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${booking.status} to ${newStatus}`,
      );
    }

    const previous = booking.status;
    booking.status = newStatus;
    if (reason) booking.cancellationReason = reason;
    if (newStatus === BookingStatus.CHECKED_IN) booking.checkInTime = new Date();
    if (newStatus === BookingStatus.CHECKED_OUT) booking.checkOutTime = new Date();

    const saved = await this.bookingRepo.save(booking);

    const event: BookingStatusChangedEvent = {
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      version: '1',
      source: 'bookings-service',
      payload: {
        bookingId: saved.id,
        previousStatus: previous,
        newStatus,
        professionalId: saved.professionalId,
        clinicId: saved.clinicId,
        reason,
      },
    };

    this.kafka.emit(KAFKA_TOPICS.BOOKINGS_STATUS_CHANGED, event).subscribe({
      error: (err: Error) => this.logger.error(`Kafka emit failed: ${err.message}`),
    });

    return saved;
  }

  async findForUser(userId: string, role: 'professional' | 'clinic') {
    const where = role === 'clinic' ? { clinicId: userId } : { professionalId: userId };
    return this.bookingRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingEntity } from './booking.entity';
import { ShiftsService } from '../shifts/shifts.service';
import { BookingStatus } from '@syndeocare/shared-types';
import { ShiftEntity } from '../shifts/shift.entity';

// ── Test doubles ──────────────────────────────────────────────────────────────

const mockBookingRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const kafkaEmitMock = { subscribe: jest.fn() };
const mockKafkaClient = {
  emit: jest.fn().mockReturnValue(kafkaEmitMock),
};

const mockShiftsService = {
  findOne: jest.fn(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeBooking(overrides: Partial<BookingEntity> = {}): BookingEntity {
  return {
    id: 'booking-uuid',
    shiftId: 'shift-uuid',
    professionalId: 'pro-uuid',
    clinicId: 'clinic-uuid',
    status: BookingStatus.REQUESTED,
    idempotencyKey: undefined,
    checkInTime: undefined,
    checkOutTime: undefined,
    cancellationReason: undefined,
    notes: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeShift(overrides: Partial<ShiftEntity> = {}): ShiftEntity {
  return {
    id: 'shift-uuid',
    clinicId: 'clinic-uuid',
    title: 'Dental Nurse – Morning',
    roleRequired: 'dental nurse',
    description: 'Morning shift',
    shiftDate: new Date('2026-06-01') as unknown as Date,
    startTime: '08:00',
    endTime: '13:00',
    hourlyRate: 20 as unknown as number,
    requiredCertifications: [],
    locationAddress: '123 Main St',
    locationLat: 51.5 as unknown as number,
    locationLng: -0.1 as unknown as number,
    isUrgent: false,
    isFilled: false,
    maxApplicants: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('BookingsService', () => {
  let service: BookingsService;

  beforeEach(async () => {
    jest.resetAllMocks();
    // Restore kafka emit mock after reset
    mockKafkaClient.emit.mockReturnValue(kafkaEmitMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: getRepositoryToken(BookingEntity), useValue: mockBookingRepo },
        { provide: 'KAFKA_CLIENT', useValue: mockKafkaClient },
        { provide: ShiftsService, useValue: mockShiftsService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
  });

  // ── createBooking ───────────────────────────────────────────────────────────

  describe('createBooking', () => {
    it('creates and returns a booking', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);
      mockShiftsService.findOne.mockResolvedValue(makeShift());
      const saved = makeBooking();
      mockBookingRepo.create.mockReturnValue(saved);
      mockBookingRepo.save.mockResolvedValue(saved);

      const result = await service.createBooking('pro-uuid', 'shift-uuid', 'clinic-uuid');

      expect(result).toEqual(saved);
      expect(mockKafkaClient.emit).toHaveBeenCalledTimes(1);
    });

    it('emits Kafka event with populated shift data', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);
      const shift = makeShift({ hourlyRate: 25 as unknown as number, startTime: '09:00', endTime: '17:00' });
      mockShiftsService.findOne.mockResolvedValue(shift);
      const saved = makeBooking();
      mockBookingRepo.create.mockReturnValue(saved);
      mockBookingRepo.save.mockResolvedValue(saved);

      await service.createBooking('pro-uuid', 'shift-uuid', 'clinic-uuid');

      const emitCall = mockKafkaClient.emit.mock.calls[0];
      const event = emitCall[1] as { payload: { hourlyRate: number; startTime: string; endTime: string } };
      expect(event.payload.hourlyRate).toBe(25);
      expect(event.payload.startTime).toBe('09:00');
      expect(event.payload.endTime).toBe('17:00');
    });

    it('throws ConflictException when professional already applied to the shift', async () => {
      // No idempotencyKey → only ONE findOne call (natural duplicate check)
      mockBookingRepo.findOne.mockResolvedValueOnce(makeBooking()); // duplicate found

      await expect(
        service.createBooking('pro-uuid', 'shift-uuid', 'clinic-uuid'),
      ).rejects.toThrow(ConflictException);
    });

    describe('idempotency key', () => {
      it('returns existing booking when same idempotency key is provided', async () => {
        const existing = makeBooking({ idempotencyKey: 'key-abc' });
        // Idempotency key lookup finds existing booking → service returns it immediately
        mockBookingRepo.findOne.mockResolvedValueOnce(existing);

        const result = await service.createBooking('pro-uuid', 'shift-uuid', 'clinic-uuid', 'key-abc');

        expect(result).toBe(existing);
        expect(mockBookingRepo.save).not.toHaveBeenCalled();
        expect(mockKafkaClient.emit).not.toHaveBeenCalled();
      });

      it('creates new booking when idempotency key is new', async () => {
        mockBookingRepo.findOne
          .mockResolvedValueOnce(null)  // key lookup: no match
          .mockResolvedValueOnce(null); // natural duplicate: no match
        mockShiftsService.findOne.mockResolvedValue(makeShift());
        const saved = makeBooking({ idempotencyKey: 'new-key' });
        mockBookingRepo.create.mockReturnValue(saved);
        mockBookingRepo.save.mockResolvedValue(saved);

        const result = await service.createBooking('pro-uuid', 'shift-uuid', 'clinic-uuid', 'new-key');

        expect(result.idempotencyKey).toBe('new-key');
        expect(mockBookingRepo.save).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ── updateStatus ────────────────────────────────────────────────────────────

  describe('updateStatus', () => {
    it('successfully transitions REQUESTED → ACCEPTED (clinic)', async () => {
      const booking = makeBooking({ status: BookingStatus.REQUESTED });
      mockBookingRepo.findOne.mockResolvedValue(booking);
      const updated = { ...booking, status: BookingStatus.ACCEPTED };
      mockBookingRepo.save.mockResolvedValue(updated);

      const result = await service.updateStatus('booking-uuid', 'clinic-uuid', BookingStatus.ACCEPTED);

      expect(result.status).toBe(BookingStatus.ACCEPTED);
      expect(mockKafkaClient.emit).toHaveBeenCalledTimes(1);
    });

    it('successfully transitions CONFIRMED → CHECKED_IN and sets checkInTime', async () => {
      const booking = makeBooking({ status: BookingStatus.CONFIRMED });
      mockBookingRepo.findOne.mockResolvedValue(booking);
      mockBookingRepo.save.mockImplementation(async (b: BookingEntity) => b);

      const result = await service.updateStatus('booking-uuid', 'pro-uuid', BookingStatus.CHECKED_IN);

      expect(result.checkInTime).toBeInstanceOf(Date);
    });

    it('sets checkOutTime on CHECKED_IN → CHECKED_OUT', async () => {
      const booking = makeBooking({ status: BookingStatus.CHECKED_IN });
      mockBookingRepo.findOne.mockResolvedValue(booking);
      mockBookingRepo.save.mockImplementation(async (b: BookingEntity) => b);

      const result = await service.updateStatus('booking-uuid', 'pro-uuid', BookingStatus.CHECKED_OUT);

      expect(result.checkOutTime).toBeInstanceOf(Date);
    });

    it('stores cancellation reason', async () => {
      const booking = makeBooking({ status: BookingStatus.REQUESTED });
      mockBookingRepo.findOne.mockResolvedValue(booking);
      mockBookingRepo.save.mockImplementation(async (b: BookingEntity) => b);

      const result = await service.updateStatus(
        'booking-uuid',
        'pro-uuid',
        BookingStatus.CANCELLED,
        'No longer available',
      );

      expect(result.cancellationReason).toBe('No longer available');
    });

    it('throws NotFoundException when booking does not exist', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('missing', 'pro-uuid', BookingStatus.ACCEPTED),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when actor is neither clinic nor professional', async () => {
      mockBookingRepo.findOne.mockResolvedValue(makeBooking());

      await expect(
        service.updateStatus('booking-uuid', 'intruder-uuid', BookingStatus.ACCEPTED),
      ).rejects.toThrow(ForbiddenException);
    });

    it.each([
      // [from, to, actor]
      [BookingStatus.COMPLETED, BookingStatus.CANCELLED, 'pro-uuid'],
      [BookingStatus.DECLINED, BookingStatus.ACCEPTED, 'clinic-uuid'],
      [BookingStatus.CANCELLED, BookingStatus.CONFIRMED, 'pro-uuid'],
      [BookingStatus.REQUESTED, BookingStatus.COMPLETED, 'clinic-uuid'],
    ])('throws BadRequestException for invalid transition %s → %s', async (from, to, actor) => {
      mockBookingRepo.findOne.mockResolvedValue(makeBooking({ status: from }));

      await expect(service.updateStatus('booking-uuid', actor, to)).rejects.toThrow(BadRequestException);
    });
  });

  // ── findForUser ─────────────────────────────────────────────────────────────

  describe('findForUser', () => {
    it('queries by professionalId for professional role', async () => {
      mockBookingRepo.find.mockResolvedValue([]);

      await service.findForUser('pro-uuid', 'professional');

      expect(mockBookingRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { professionalId: 'pro-uuid' } }),
      );
    });

    it('queries by clinicId for clinic role', async () => {
      mockBookingRepo.find.mockResolvedValue([]);

      await service.findForUser('clinic-uuid', 'clinic');

      expect(mockBookingRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { clinicId: 'clinic-uuid' } }),
      );
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('returns booking when it exists', async () => {
      const booking = makeBooking();
      mockBookingRepo.findOne.mockResolvedValue(booking);

      const result = await service.findOne('booking-uuid');

      expect(result).toBe(booking);
    });

    it('throws NotFoundException when booking does not exist', async () => {
      mockBookingRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });
});

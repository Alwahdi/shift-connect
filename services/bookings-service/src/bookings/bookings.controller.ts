import { Controller, Get, Post, Patch, Body, Param, Headers, UseGuards, Request, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BookingStatus } from '@syndeocare/shared-types';

export class CreateBookingDto {
  @IsUUID() shiftId: string;
  @IsUUID() clinicId: string;
  /** Optional idempotency key — same key returns the existing booking without creating a duplicate */
  @IsOptional() @IsString() idempotencyKey?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus) status: BookingStatus;
  @IsOptional() @IsString() reason?: string;
}

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiHeader({ name: 'Idempotency-Key', description: 'Optional UUID to prevent duplicate bookings on retry', required: false })
  create(
    @Request() req: any,
    @Body() dto: CreateBookingDto,
    @Headers('idempotency-key') headerKey?: string,
  ) {
    const idempotencyKey = dto.idempotencyKey ?? headerKey;
    return this.bookingsService.createBooking(req.user.sub, dto.shiftId, dto.clinicId, idempotencyKey);
  }

  @Get()
  findMine(@Request() req: any, @Query('role') role: 'professional' | 'clinic' = 'professional') {
    return this.bookingsService.findForUser(req.user.sub, role);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, req.user.sub, dto.status, dto.reason);
  }
}

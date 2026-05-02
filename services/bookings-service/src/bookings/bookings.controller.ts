import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BookingStatus } from '@syndeocare/shared-types';

export class CreateBookingDto {
  @IsUUID() shiftId: string;
  @IsUUID() clinicId: string;
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
  create(@Request() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(req.user.sub, dto.shiftId, dto.clinicId);
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

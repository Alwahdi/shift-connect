import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

export class CreatePaymentIntentDto {
  @IsUUID() bookingId: string;
  @IsUUID() professionalId: string;
  @IsNumber() @Type(() => Number) @Min(1) amount: number;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() idempotencyKey?: string;
}

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  createIntent(@Request() req: any, @Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent({
      ...dto,
      clinicId: req.user.sub,
    });
  }
}

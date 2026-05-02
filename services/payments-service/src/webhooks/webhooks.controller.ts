import { Controller, Post, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    await this.paymentsService.handleStripeWebhook(signature, rawBody);
    return { received: true };
  }
}

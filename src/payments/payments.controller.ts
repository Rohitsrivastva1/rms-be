import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(@Body() createIntentDto: any) {
    return this.paymentsService.createPaymentIntent(createIntentDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async paymentWebhook(@Body() webhookData: any) {
    return this.paymentsService.processWebhook(webhookData);
  }
} 
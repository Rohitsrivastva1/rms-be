import { Controller, Post, Body, Get, Param, UseGuards, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order' })
  @ApiResponse({ status: 201, description: 'Payment order created successfully' })
  async createPaymentOrder(@Body() orderData: any) {
    // First create the order in our system
    const order = await this.ordersService.placeOrder(orderData);
    
    // Then create Razorpay order
    const paymentOrder = await this.paymentsService.createRazorpayOrder({
      ...orderData,
      orderId: order.id,
    });

    return {
      success: true,
      order: order,
      payment: paymentOrder,
    };
  }

  @Post('verify-payment')
  @ApiOperation({ summary: 'Verify payment and update order status' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  async verifyPayment(@Body() paymentData: any) {
    // Verify the payment
    const verification = await this.paymentsService.verifyPayment(paymentData);
    
    // Update order status to confirmed
    await this.ordersService.updateStatus(paymentData.orderId, {
      status: 'confirmed',
      paymentMethod: 'razorpay',
      paymentId: verification.paymentId,
    });

    return {
      success: true,
      verified: true,
      orderId: paymentData.orderId,
      message: 'Payment verified and order confirmed',
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(@Body() webhookData: any, @Headers('x-razorpay-signature') signature: string) {
    // Verify webhook signature in production
    // For now, we'll process the webhook
    const result = await this.paymentsService.handleWebhook(webhookData);
    
    // Update order status based on webhook event
    if (webhookData.event === 'payment.captured') {
      const payment = webhookData.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      if (orderId) {
        await this.ordersService.updateStatus(orderId, {
          status: 'confirmed',
          paymentMethod: 'razorpay',
        });
      }
    }

    return result;
  }

  @Post('refund/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund for a payment' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  async processRefund(
    @Param('paymentId') paymentId: number,
    @Body() refundData: { amount?: number; reason?: string },
  ) {
    const result = await this.paymentsService.processRefund(
      paymentId,
      refundData.amount,
      refundData.reason,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  async getPaymentStatus(@Param('paymentId') paymentId: number) {
    const payment = await this.paymentsService.getPaymentStatus(paymentId);
    return {
      success: true,
      payment,
    };
  }

  @Post('cash-payment')
  @ApiOperation({ summary: 'Place order with cash payment' })
  @ApiResponse({ status: 201, description: 'Order placed with cash payment' })
  async placeCashOrder(@Body() orderData: any) {
    // Create order with cash payment status
    const order = await this.ordersService.placeOrder({
      ...orderData,
      paymentMethod: 'cash',
      status: 'pending_cash_payment',
    });

    return {
      success: true,
      order: order,
      message: 'Order placed with cash payment. Please pay at the counter.',
    };
  }
} 
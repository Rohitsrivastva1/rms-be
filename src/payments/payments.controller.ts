import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';

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
      verified: true,
      orderId: paymentData.orderId,
      message: 'Payment verified and order confirmed',
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
      order: order,
      message: 'Order placed with cash payment. Please pay at the counter.',
    };
  }
} 
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(private configService: ConfigService) {}

  async createRazorpayOrder(orderData: any) {
    const Razorpay = require('razorpay');
    
    const razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });

    const options = {
      amount: orderData.totalAmount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
      notes: {
        orderId: orderData.orderId,
        tableNumber: orderData.tableNumber,
        restaurantId: orderData.restaurantId,
      },
    };

    try {
      const order = await razorpay.orders.create(options);
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: this.configService.get('RAZORPAY_KEY_ID'),
      };
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  async verifyPayment(paymentData: any) {
    const crypto = require('crypto');
    const Razorpay = require('razorpay');
    
    const razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = paymentData;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'))
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return {
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      };
    } else {
      throw new Error('Payment verification failed');
    }
  }
} 
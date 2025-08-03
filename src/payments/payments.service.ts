import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../common/entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPaymentIntent(createIntentDto: any) {
    const { orderId, amount, currency, customerEmail } = createIntentDto;

    // Mock Razorpay integration
    const paymentIntentId = `pi_${Date.now()}`;
    const razorpayOrderId = `order_${Date.now()}`;

    const payment = this.paymentRepository.create({
      orderId,
      paymentIntentId,
      razorpayOrderId,
      amount,
      currency,
      paymentMethod: PaymentMethod.RAZORPAY,
      status: PaymentStatus.PENDING,
      customerEmail,
      restaurantId: 1 // Mock restaurant ID
    });

    await this.paymentRepository.save(payment);

    return {
      paymentIntentId,
      clientSecret: `${paymentIntentId}_secret_${Date.now()}`,
      razorpayOrderId
    };
  }

  async processWebhook(webhookData: any) {
    const { event, payload } = webhookData;

    if (event === 'payment.captured') {
      const paymentData = payload.payment.entity;
      
      const payment = await this.paymentRepository.findOne({
        where: { razorpayOrderId: paymentData.order_id }
      });

      if (payment) {
        payment.status = PaymentStatus.COMPLETED;
        payment.razorpayPaymentId = paymentData.id;
        payment.transactionData = paymentData;
        await this.paymentRepository.save(payment);
      }
    }

    return { message: 'Webhook processed successfully' };
  }
} 
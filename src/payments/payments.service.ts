import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from '../common/entities/payment.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;
  private razorpayInitialized: boolean = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  private initializeRazorpay() {
    if (this.razorpayInitialized) {
      return;
    }

    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      this.logger.warn('Razorpay keys not configured. Payment features will be limited.');
      this.razorpayInitialized = true;
      return;
    }

    try {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      this.razorpayInitialized = true;
      this.logger.log('Razorpay initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Razorpay: ${error.message}`);
      this.razorpayInitialized = true;
    }
  }

  async createRazorpayOrder(orderData: any) {
    this.initializeRazorpay();
    
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
    }

    try {
      const options = {
        amount: Math.round(orderData.totalAmount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
        notes: {
          orderId: orderData.orderId,
          tableNumber: orderData.tableNumber,
          restaurantId: orderData.restaurantId,
        },
      };

      const order = await this.razorpay.orders.create(options);
      
      // Save payment record
      const payment = this.paymentRepository.create({
        orderId: orderData.orderId,
        razorpayOrderId: order.id,
        amount: orderData.totalAmount,
        currency: 'INR',
        paymentMethod: PaymentMethod.RAZORPAY,
        status: PaymentStatus.PENDING,
        restaurantId: orderData.restaurantId,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        transactionData: order,
      });

      await this.paymentRepository.save(payment);

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: this.configService.get('RAZORPAY_KEY_ID'),
        paymentId: payment.id,
      };
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`, error.stack);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  async verifyPayment(paymentData: any) {
    const crypto = require('crypto');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
    
    if (!keySecret) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_SECRET in environment variables.');
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = paymentData;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update payment record
      const payment = await this.paymentRepository.findOne({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (payment) {
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = PaymentStatus.COMPLETED;
        payment.transactionData = {
          ...payment.transactionData,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        };
        await this.paymentRepository.save(payment);
      }

      return {
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      };
    } else {
      this.logger.warn(`Payment verification failed for order: ${razorpay_order_id}`);
      throw new Error('Payment verification failed');
    }
  }

  async handleWebhook(webhookData: any) {
    try {
      const crypto = require('crypto');
      const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
      
      // Verify webhook signature
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(webhookData))
        .digest('hex');

      // In production, verify the signature from headers
      // const receivedSignature = headers['x-razorpay-signature'];
      // if (signature !== receivedSignature) {
      //   throw new Error('Invalid webhook signature');
      // }

      const event = webhookData.event;
      const payload = webhookData.payload;

      this.logger.log(`Received webhook event: ${event}`);

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload.payment.entity);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload.payment.entity);
          break;
        case 'order.paid':
          await this.handleOrderPaid(payload.order.entity);
          break;
        default:
          this.logger.warn(`Unhandled webhook event: ${event}`);
      }

      return { success: true, message: 'Webhook processed' };
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async handlePaymentCaptured(payment: any) {
    const paymentRecord = await this.paymentRepository.findOne({
      where: { razorpayPaymentId: payment.id },
    });

    if (paymentRecord) {
      paymentRecord.status = PaymentStatus.COMPLETED;
      paymentRecord.transactionData = payment;
      await this.paymentRepository.save(paymentRecord);
      this.logger.log(`Payment captured: ${payment.id}`);
    }
  }

  private async handlePaymentFailed(payment: any) {
    const paymentRecord = await this.paymentRepository.findOne({
      where: { razorpayPaymentId: payment.id },
    });

    if (paymentRecord) {
      paymentRecord.status = PaymentStatus.FAILED;
      paymentRecord.transactionData = payment;
      await this.paymentRepository.save(paymentRecord);
      this.logger.log(`Payment failed: ${payment.id}`);
    }
  }

  private async handleOrderPaid(order: any) {
    const paymentRecord = await this.paymentRepository.findOne({
      where: { razorpayOrderId: order.id },
    });

    if (paymentRecord) {
      paymentRecord.status = PaymentStatus.COMPLETED;
      await this.paymentRepository.save(paymentRecord);
      this.logger.log(`Order paid: ${order.id}`);
    }
  }

  async processRefund(paymentId: number, amount?: number, reason?: string) {
    this.initializeRazorpay();
    
    if (!this.razorpay) {
      throw new Error('Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
    }

    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new Error('Only completed payments can be refunded');
      }

      if (!payment.razorpayPaymentId) {
        throw new Error('Razorpay payment ID not found');
      }

      const refundAmount = amount ? Math.round(amount * 100) : undefined; // Convert to paise
      const refundOptions: any = {
        payment_id: payment.razorpayPaymentId,
      };

      if (refundAmount) {
        refundOptions.amount = refundAmount;
      }

      if (reason) {
        refundOptions.notes = { reason };
      }

      const refund = await this.razorpay.payments.refund(refundOptions);

      // Update payment status
      payment.status = PaymentStatus.REFUNDED;
      payment.transactionData = {
        ...payment.transactionData,
        refund: refund,
      };
      await this.paymentRepository.save(payment);

      this.logger.log(`Refund processed: ${refund.id} for payment: ${paymentId}`);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100, // Convert from paise
        status: refund.status,
      };
    } catch (error) {
      this.logger.error(`Refund processing error: ${error.message}`, error.stack);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  async getPaymentStatus(paymentId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      id: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
} 
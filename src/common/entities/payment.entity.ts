import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  UPI = 'upi',
  RAZORPAY = 'razorpay'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_id' })
  @ApiProperty()
  orderId: number;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ name: 'payment_intent_id', nullable: true })
  @ApiProperty()
  paymentIntentId: string;

  @Column({ name: 'razorpay_order_id', nullable: true })
  @ApiProperty()
  razorpayOrderId: string;

  @Column({ name: 'razorpay_payment_id', nullable: true })
  @ApiProperty()
  razorpayPaymentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  amount: number;

  @Column({ default: 'INR' })
  @ApiProperty()
  currency: string;

  @Column({ 
    type: 'enum', 
    enum: PaymentMethod,
    name: 'payment_method'
  })
  @ApiProperty()
  paymentMethod: PaymentMethod;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING,
    name: 'status'
  })
  @ApiProperty()
  status: PaymentStatus;

  @Column({ name: 'customer_email', nullable: true })
  @ApiProperty()
  customerEmail: string;

  @Column({ name: 'customer_phone', nullable: true })
  @ApiProperty()
  customerPhone: string;

  @Column({ name: 'transaction_data', type: 'jsonb', nullable: true })
  @ApiProperty()
  transactionData: any;

  @Column({ name: 'restaurant_id' })
  @ApiProperty()
  restaurantId: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
} 
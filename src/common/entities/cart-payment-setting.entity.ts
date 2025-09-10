import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';

export enum PaymentMethod {
  UPI = 'upi',
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
  CASH = 'cash',
  CARD = 'card',
  WALLET = 'wallet',
}

@Entity('cart_payment_settings')
export class CartPaymentSetting {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.paymentSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  @ApiProperty({ enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'is_enabled', default: true })
  @ApiProperty()
  isEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty()
  settings: any; // Store payment gateway specific settings

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

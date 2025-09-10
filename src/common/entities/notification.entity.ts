import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { User } from './user.entity';

export enum NotificationType {
  ORDER_RECEIVED = 'order_received',
  ORDER_ACCEPTED = 'order_accepted',
  ORDER_COOKING = 'order_cooking',
  ORDER_READY = 'order_ready',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  CART_APPROVED = 'cart_approved',
  CART_SUSPENDED = 'cart_suspended',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'user_id', nullable: true })
  @ApiProperty()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'recipient_phone', length: 20, nullable: true })
  @ApiProperty()
  recipientPhone: string;

  @Column({ name: 'device_token', length: 500, nullable: true })
  @ApiProperty()
  deviceToken: string;

  @Column({ name: 'restaurant_id', nullable: true })
  @ApiProperty()
  restaurantId: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @Column({ length: 255 })
  @ApiProperty()
  title: string;

  @Column({ type: 'text' })
  @ApiProperty()
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  @ApiProperty()
  data: any; // Additional data for the notification

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  @ApiProperty({ enum: NotificationStatus })
  status: NotificationStatus;

  @Column({ name: 'sent_at', nullable: true })
  @ApiProperty()
  sentAt: Date;

  @Column({ name: 'read_at', nullable: true })
  @ApiProperty()
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;
}
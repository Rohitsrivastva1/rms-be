import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  ORDER_RECEIVED = 'order_received',
  ORDER_IN_PROGRESS = 'order_in_progress',
  ORDER_READY = 'order_ready',
  ORDER_SERVED = 'order_served',
  PAYMENT_RECEIVED = 'payment_received',
  FEEDBACK_RECEIVED = 'feedback_received',
  SYSTEM_ALERT = 'system_alert'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'restaurant_id' })
  @ApiProperty()
  restaurantId: number;

  @Column({ name: 'user_id', nullable: true })
  @ApiProperty()
  userId: number;

  @Column({ 
    type: 'enum', 
    enum: NotificationType,
    name: 'type'
  })
  @ApiProperty()
  type: NotificationType;

  @Column()
  @ApiProperty()
  title: string;

  @Column({ type: 'text' })
  @ApiProperty()
  message: string;

  @Column({ name: 'recipient_phone', nullable: true })
  @ApiProperty()
  recipientPhone: string;

  @Column({ name: 'recipient_email', nullable: true })
  @ApiProperty()
  recipientEmail: string;

  @Column({ name: 'device_token', nullable: true })
  @ApiProperty()
  deviceToken: string;

  @Column({ 
    type: 'enum', 
    enum: NotificationStatus, 
    default: NotificationStatus.PENDING,
    name: 'status'
  })
  @ApiProperty()
  status: NotificationStatus;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  @ApiProperty()
  metadata: any;

  @Column({ name: 'sent_at', nullable: true })
  @ApiProperty()
  sentAt: Date;

  @Column({ name: 'error_message', nullable: true })
  @ApiProperty()
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
} 
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from './order.entity';
import { MenuItem } from './menu.entity';

export enum FeedbackStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_id' })
  @ApiProperty()
  orderId: number;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

  @Column({ name: 'customer_name' })
  @ApiProperty()
  customerName: string;

  @Column({ name: 'customer_phone' })
  @ApiProperty()
  customerPhone: string;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  @ApiProperty()
  rating: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  comment: string;

  @Column({ 
    type: 'enum', 
    enum: FeedbackStatus, 
    default: FeedbackStatus.PENDING,
    name: 'status'
  })
  @ApiProperty()
  status: FeedbackStatus;

  @Column({ name: 'dish_ratings', type: 'jsonb', nullable: true })
  @ApiProperty()
  dishRatings: Array<{
    dishId: number;
    dishName: string;
    rating: number;
  }>;

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
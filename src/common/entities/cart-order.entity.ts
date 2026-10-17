import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { CartWorker } from './cart-worker.entity';
import { OrderItem } from './order-item.entity';

export enum CartOrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  COOKING = 'cooking',
  COOKING_DONE = 'cooking_done',
  READY_FOR_PICKUP = 'ready_for_pickup',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('cart_orders')
export class CartOrder {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_number', length: 20, unique: true })
  @ApiProperty()
  orderNumber: string;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'customer_name', length: 100, nullable: true })
  @ApiProperty()
  customerName: string;

  @Column({ name: 'customer_phone', length: 20, nullable: true })
  @ApiProperty()
  customerPhone: string;

  @Column({ name: 'customer_email', length: 100, nullable: true })
  @ApiProperty()
  customerEmail: string;

  @Column({ name: 'car_number', length: 20, nullable: true })
  @ApiProperty()
  carNumber: string; // For events/functions

  @Column({ name: 'seat_number', length: 20, nullable: true })
  @ApiProperty()
  seatNumber: string; // For events/functions

  @Column({ name: 'table_number', length: 20, nullable: true })
  @ApiProperty()
  tableNumber: string; // For table service

  @Column({
    type: 'enum',
    enum: CartOrderStatus,
    default: CartOrderStatus.PENDING,
  })
  @ApiProperty({ enum: CartOrderStatus })
  status: CartOrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  totalAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  finalAmount: number;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  @ApiProperty()
  specialInstructions: string;

  @Column({ name: 'estimated_preparation_time', type: 'int', default: 0 })
  @ApiProperty()
  estimatedPreparationTime: number; // in minutes

  @Column({ name: 'assigned_worker_id', nullable: true })
  @ApiProperty()
  assignedWorkerId: number;

  @ManyToOne(() => CartWorker, { nullable: true })
  @JoinColumn({ name: 'assigned_worker_id' })
  assignedWorker: CartWorker;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

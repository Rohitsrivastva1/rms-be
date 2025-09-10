import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from './restaurant.entity';

export enum OrderStatus {
  RECEIVED = 'received',
  PENDING_PAYMENT = 'pending_payment',
  PENDING_CASH_PAYMENT = 'pending_cash_payment',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_number', length: 20, unique: true })
  @ApiProperty()
  orderNumber: string;

  @Column({ name: 'order_id', length: 20, unique: true, nullable: true })
  @ApiProperty()
  orderId: string;

  @Column({ name: 'table_number', type: 'varchar', length: 50 })
  @ApiProperty()
  tableNumber: string;

  @Column({ name: 'restaurant_id', type: 'int', nullable: true })
  @ApiProperty()
  restaurantId: number;

  @ManyToOne(() => Restaurant, restaurant => restaurant.orders)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ name: 'cart_id', type: 'int', nullable: true })
  @ApiProperty()
  cartId: number;

  @Column({ name: 'customer_name', length: 100, nullable: true })
  @ApiProperty()
  customerName: string;

  @Column({ name: 'customer_phone', length: 20, nullable: true })
  @ApiProperty()
  customerPhone: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.RECEIVED,
  })
  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  totalAmount: number;

  @Column({ name: 'customer_email', length: 100, nullable: true })
  @ApiProperty()
  customerEmail: string;

  @Column({ name: 'car_number', length: 20, nullable: true })
  @ApiProperty()
  carNumber: string;

  @Column({ name: 'seat_number', length: 20, nullable: true })
  @ApiProperty()
  seatNumber: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  finalAmount: number;

  @Column({ name: 'estimated_time', type: 'int', default: 0 })
  @ApiProperty()
  estimatedTime: number;

  @Column({ name: 'assigned_chef_id', type: 'int', nullable: true })
  @ApiProperty()
  assignedChefId: number;

  @Column({ name: 'assigned_chef', type: 'int', nullable: true })
  @ApiProperty()
  assignedChef: number;

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  @ApiProperty()
  specialInstructions: string;

  @Column({ name: 'payment_method', length: 20, nullable: true })
  @ApiProperty()
  paymentMethod: string;

  @Column({ name: 'payment_details', type: 'json', nullable: true })
  @ApiProperty()
  paymentDetails: any;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  @ApiProperty()
  rating: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  feedback: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_id' })
  @ApiProperty()
  orderId: number;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'menu_item_id' })
  @ApiProperty()
  menuItemId: number;

  @Column({ name: 'item_name', length: 100 })
  @ApiProperty()
  itemName: string;

  @Column({ type: 'int' })
  @ApiProperty()
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  notes: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.RECEIVED,
  })
  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
} 
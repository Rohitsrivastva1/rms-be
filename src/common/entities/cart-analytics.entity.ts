import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';

@Entity('cart_analytics')
export class CartAnalytics {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.analytics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ type: 'date' })
  @ApiProperty()
  date: Date;

  @Column({ name: 'total_orders', type: 'int', default: 0 })
  @ApiProperty()
  totalOrders: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  totalRevenue: number;

  @Column({ name: 'total_customers', type: 'int', default: 0 })
  @ApiProperty()
  totalCustomers: number;

  @Column({ name: 'average_order_value', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  averageOrderValue: number;

  @Column({ name: 'peak_hour', type: 'int', nullable: true })
  @ApiProperty()
  peakHour: number; // Hour of the day (0-23)

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

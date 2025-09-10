import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CartOrder } from './cart-order.entity';
import { Cart } from './cart.entity';

@Entity('customer_feedback')
export class CustomerFeedback {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_id' })
  @ApiProperty()
  orderId: number;

  @ManyToOne(() => CartOrder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: CartOrder;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.feedback, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'customer_name', length: 100, nullable: true })
  @ApiProperty()
  customerName: string;

  @Column({ name: 'customer_phone', length: 20, nullable: true })
  @ApiProperty()
  customerPhone: string;

  @Column({ type: 'int', nullable: true })
  @ApiProperty()
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  review: string;

  @Column({ name: 'is_anonymous', default: false })
  @ApiProperty()
  isAnonymous: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CartTable } from './cart-table.entity';
import { Cart } from './cart.entity';

@Entity('cart_seat_sessions')
export class CartSeatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'table_id' })
  tableId: number;

  @ManyToOne(() => CartTable, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'table_id' })
  table: CartTable;

  @Column({ name: 'cart_id' })
  cartId: number;

  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ length: 20, default: 'active' })
  status: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

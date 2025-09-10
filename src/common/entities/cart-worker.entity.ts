import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Cart } from './cart.entity';
import { Order } from './order.entity';

export enum CartWorkerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_BREAK = 'on_break',
}

@Entity('cart_workers')
export class CartWorker {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.workers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'user_id' })
  @ApiProperty()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50, default: 'worker' })
  @ApiProperty()
  role: string; // worker, cashier, manager

  @Column({
    type: 'enum',
    enum: CartWorkerStatus,
    default: CartWorkerStatus.ACTIVE,
  })
  @ApiProperty({ enum: CartWorkerStatus })
  status: CartWorkerStatus;

  @Column({ name: 'assigned_at', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty()
  assignedAt: Date;

  // Note: Orders are handled through CartOrder entity, not the main Order entity
  // @OneToMany(() => CartOrder, order => order.assignedWorker)
  // assignedOrders: CartOrder[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

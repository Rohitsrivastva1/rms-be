import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CartOrder } from './cart-order.entity';
import { MenuItem } from './menu-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'order_id' })
  @ApiProperty()
  orderId: number;

  @ManyToOne(() => CartOrder, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: CartOrder;

  @Column({ name: 'menu_item_id', nullable: true })
  @ApiProperty()
  menuItemId: number;

  @ManyToOne(() => MenuItem, { nullable: true })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

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

  @Column({ name: 'special_instructions', type: 'text', nullable: true })
  @ApiProperty()
  specialInstructions: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;
}

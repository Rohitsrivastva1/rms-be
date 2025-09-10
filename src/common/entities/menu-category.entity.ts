import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { MenuItem } from './menu-item.entity';

@Entity('menu_categories')
export class MenuCategory {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.menuCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  description: string;

  @Column({ name: 'sort_order', default: 0 })
  @ApiProperty()
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  @ApiProperty()
  isActive: boolean;

  @OneToMany(() => MenuItem, menuItem => menuItem.category)
  menuItems: MenuItem[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

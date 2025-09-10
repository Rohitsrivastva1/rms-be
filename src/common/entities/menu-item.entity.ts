import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';
import { MenuCategory } from './menu-category.entity';
import { OrderItem } from './order-item.entity';

export enum MenuCategoryType {
  DRINKS = 'drinks',
  SNACKS = 'snacks',
  MEALS = 'meals',
  DESSERTS = 'desserts',
  BEVERAGES = 'beverages',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.menuItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'category_id', nullable: true })
  @ApiProperty()
  categoryId: number;

  @ManyToOne(() => MenuCategory, category => category.menuItems, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: MenuCategory;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  price: number;

  @Column({ name: 'image_url', length: 500, nullable: true })
  @ApiProperty()
  imageUrl: string;

  // @Column({
  //   type: 'enum',
  //   enum: MenuCategoryType,
  //   nullable: true,
  // })
  // @ApiProperty({ enum: MenuCategoryType })
  // categoryType: MenuCategoryType;

  @Column({ name: 'is_available', default: true })
  @ApiProperty()
  isAvailable: boolean;

  @Column({ name: 'is_vegetarian', default: false })
  @ApiProperty()
  isVegetarian: boolean;

  @Column({ name: 'is_spicy', default: false })
  @ApiProperty()
  isSpicy: boolean;

  @Column({ name: 'preparation_time', default: 0 })
  @ApiProperty()
  preparationTime: number; // in minutes

  @Column({ name: 'sort_order', default: 0 })
  @ApiProperty()
  sortOrder: number;

  @OneToMany(() => OrderItem, orderItem => orderItem.menuItem)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

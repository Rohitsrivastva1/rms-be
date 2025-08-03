import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum MenuCategory {
  APPETIZER = 'appetizer',
  MAIN_COURSE = 'main_course',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
  SIDE_DISH = 'side_dish',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Column({ type: 'text' })
  @ApiProperty()
  description: string;

  @Column({
    type: 'enum',
    enum: MenuCategory,
  })
  @ApiProperty({ enum: MenuCategory })
  category: MenuCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty()
  price: number;

  @Column({ default: true })
  @ApiProperty()
  available: boolean;

  @Column({ default: false })
  @ApiProperty()
  veg: boolean;

  @Column({ name: 'spicy_level', type: 'int', default: 0 })
  @ApiProperty()
  spicyLevel: number;

  @Column({ type: 'simple-array', nullable: true })
  @ApiProperty()
  ingredients: string[];

  @Column({ nullable: true })
  @ApiProperty()
  image: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  @ApiProperty()
  rating: number;

  @Column({ name: 'order_count', type: 'int', default: 0 })
  @ApiProperty()
  orderCount: number;

  @Column({ default: false })
  @ApiProperty()
  popular: boolean;

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
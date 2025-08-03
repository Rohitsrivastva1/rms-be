import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Order } from './order.entity';
import { Table } from './table.entity';

export enum RestaurantStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ length: 20 })
  @ApiProperty()
  phone: string;

  @Column({ type: 'text' })
  @ApiProperty()
  address: string;

  @Column({ length: 50 })
  @ApiProperty()
  cuisine: string;

  @Column({ type: 'int' })
  @ApiProperty()
  capacity: number;

  @Column({
    type: 'enum',
    enum: RestaurantStatus,
    default: RestaurantStatus.PENDING,
  })
  @ApiProperty({ enum: RestaurantStatus })
  status: RestaurantStatus;

  @Column({ nullable: true })
  @ApiProperty()
  logo: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  rating: number;

  @Column({ name: 'total_orders', type: 'int', default: 0 })
  @ApiProperty()
  totalOrders: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 10, scale: 2, default: 0 })
  @ApiProperty()
  totalRevenue: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;

  @OneToMany(() => User, user => user.restaurant)
  users: User[];

  @OneToMany(() => Order, order => order.restaurant)
  orders: Order[];

  @OneToMany(() => Table, table => table.restaurant)
  tables: Table[];
} 
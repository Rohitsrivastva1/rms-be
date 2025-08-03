import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from './restaurant.entity';

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'table_number', type: 'int' })
  @ApiProperty()
  tableNumber: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  @ApiProperty()
  restaurantId: number;

  @ManyToOne(() => Restaurant, restaurant => restaurant.tables)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'int' })
  @ApiProperty()
  capacity: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  @ApiProperty({ enum: TableStatus })
  status: TableStatus;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  @ApiProperty()
  qrCode: string;

  @Column({ name: 'qr_data', type: 'text', nullable: true })
  @ApiProperty()
  qrData: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
} 
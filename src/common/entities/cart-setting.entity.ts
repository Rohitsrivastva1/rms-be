import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cart } from './cart.entity';

@Entity('cart_settings')
export class CartSetting {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ name: 'cart_id' })
  @ApiProperty()
  cartId: number;

  @ManyToOne(() => Cart, cart => cart.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ name: 'setting_key', length: 100 })
  @ApiProperty()
  settingKey: string;

  @Column({ name: 'setting_value', type: 'text', nullable: true })
  @ApiProperty()
  settingValue: string;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

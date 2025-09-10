import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { CartWorker } from './cart-worker.entity';
import { MenuCategory } from './menu-category.entity';
import { MenuItem } from './menu-item.entity';
import { Order } from './order.entity';
import { CartPaymentSetting } from './cart-payment-setting.entity';
import { Notification } from './notification.entity';
import { CartAnalytics } from './cart-analytics.entity';
import { CustomerFeedback } from './customer-feedback.entity';
import { CartSetting } from './cart-setting.entity';

export enum CartStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum CartTheme {
  MODERN = 'modern',
  CLASSIC = 'classic',
  MINIMAL = 'minimal',
  COLORFUL = 'colorful',
  DARK = 'dark',
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ length: 100 })
  @ApiProperty()
  name: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  description: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty()
  location: string;

  @Column({ name: 'qr_code', unique: true })
  @ApiProperty()
  qrCode: string;

  @Column({ name: 'qr_data', type: 'text' })
  @ApiProperty()
  qrData: string;

  @Column({
    type: 'enum',
    enum: CartTheme,
    default: CartTheme.MODERN,
  })
  @ApiProperty({ enum: CartTheme })
  theme: CartTheme;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.PENDING,
  })
  @ApiProperty({ enum: CartStatus })
  status: CartStatus;

  @Column({ name: 'subscription_active', default: false })
  @ApiProperty()
  subscriptionActive: boolean;

  @Column({ name: 'subscription_expires_at', nullable: true })
  @ApiProperty()
  subscriptionExpiresAt: Date;

  @Column({ name: 'owner_id' })
  @ApiProperty()
  ownerId: number;

  @ManyToOne(() => User, user => user.carts)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => CartWorker, cartWorker => cartWorker.cart)
  workers: CartWorker[];

  @OneToMany(() => MenuCategory, menuCategory => menuCategory.cart)
  menuCategories: MenuCategory[];

  @OneToMany(() => MenuItem, menuItem => menuItem.cart)
  menuItems: MenuItem[];

  // Note: Cart orders are handled through CartOrder entity, not the main Order entity
  // @OneToMany(() => CartOrder, order => order.cart)
  // cartOrders: CartOrder[];

  @OneToMany(() => CartPaymentSetting, paymentSetting => paymentSetting.cart)
  paymentSettings: CartPaymentSetting[];

  @OneToMany(() => Notification, notification => notification.cart)
  notifications: Notification[];

  @OneToMany(() => CartAnalytics, analytics => analytics.cart)
  analytics: CartAnalytics[];

  @OneToMany(() => CustomerFeedback, feedback => feedback.cart)
  feedback: CustomerFeedback[];

  @OneToMany(() => CartSetting, setting => setting.cart)
  settings: CartSetting[];

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty()
  updatedAt: Date;
}

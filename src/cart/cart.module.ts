import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from '../common/entities/cart.entity';
import { CartWorker } from '../common/entities/cart-worker.entity';
import { MenuCategory } from '../common/entities/menu-category.entity';
import { MenuItem } from '../common/entities/menu-item.entity';
import { CartOrder } from '../common/entities/cart-order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { CartPaymentSetting } from '../common/entities/cart-payment-setting.entity';
import { Notification } from '../common/entities/notification.entity';
import { CartAnalytics } from '../common/entities/cart-analytics.entity';
import { CustomerFeedback } from '../common/entities/customer-feedback.entity';
import { CartSetting } from '../common/entities/cart-setting.entity';
import { User } from '../common/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartWorker,
      MenuCategory,
      MenuItem,
      CartOrder,
      OrderItem,
      CartPaymentSetting,
      Notification,
      CartAnalytics,
      CustomerFeedback,
      CartSetting,
      User,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}

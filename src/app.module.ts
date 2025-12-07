import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SuperAdminModule } from './superadmin/superadmin.module';
import { TablesModule } from './tables/tables.module';
import { StaffModule } from './staff/staff.module';
import { CartModule } from './cart/cart.module';
import { GatewayModule } from './gateway/gateway.module';
import { User } from './common/entities/user.entity';
import { Restaurant } from './common/entities/restaurant.entity';
import { MenuItem } from './common/entities/menu.entity';
import { Order, OrderItem } from './common/entities/order.entity';
import { Table } from './common/entities/table.entity';
import { Feedback } from './common/entities/feedback.entity';
import { Payment } from './common/entities/payment.entity';
import { Notification } from './common/entities/notification.entity';
import { Cart } from './common/entities/cart.entity';
import { CartWorker } from './common/entities/cart-worker.entity';
import { MenuCategory } from './common/entities/menu-category.entity';
import { MenuItem as CartMenuItem } from './common/entities/menu-item.entity';
import { CartOrder } from './common/entities/cart-order.entity';
import { OrderItem as CartOrderItem } from './common/entities/order-item.entity';
import { CartPaymentSetting } from './common/entities/cart-payment-setting.entity';
import { CartAnalytics } from './common/entities/cart-analytics.entity';
import { CustomerFeedback } from './common/entities/customer-feedback.entity';
import { CartSetting } from './common/entities/cart-setting.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '9695',
      database: process.env.DB_DATABASE || 'rms_db',
      entities: [
        User, 
        Restaurant, 
        MenuItem, 
        Order, 
        OrderItem, 
        Table, 
        Feedback, 
        Payment, 
        Notification,
        Cart,
        CartWorker,
        MenuCategory,
        CartMenuItem,
        CartOrder,
        CartOrderItem,
        CartPaymentSetting,
        CartAnalytics,
        CustomerFeedback,
        CartSetting
      ],
                synchronize: false, // Disabled to prevent schema conflicts
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MenuModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    SuperAdminModule,
    TablesModule,
    StaffModule,
    CartModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

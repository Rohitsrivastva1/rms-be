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
import { User } from './common/entities/user.entity';
import { Restaurant } from './common/entities/restaurant.entity';
import { MenuItem } from './common/entities/menu.entity';
import { Order, OrderItem } from './common/entities/order.entity';
import { Table } from './common/entities/table.entity';
import { Feedback } from './common/entities/feedback.entity';
import { Payment } from './common/entities/payment.entity';
import { Notification } from './common/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port:5432,
      username:  'postgres',
      password: '9695',
      database:  'rms_db',
      entities: [User, Restaurant, MenuItem, Order, OrderItem, Table, Feedback, Payment, Notification],
      synchronize:true, // This will auto-create tables
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

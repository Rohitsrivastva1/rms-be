import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdminController } from './superadmin.controller';
import { SuperAdminService } from './superadmin.service';
import { User } from '../common/entities/user.entity';
import { Restaurant } from '../common/entities/restaurant.entity';
import { Order } from '../common/entities/order.entity';
import { Payment } from '../common/entities/payment.entity';
import { MenuItem } from '../common/entities/menu.entity';
import { Table } from '../common/entities/table.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Restaurant,
      Order,
      Payment,
      MenuItem,
      Table,
    ]),
    AuthModule,
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {} 
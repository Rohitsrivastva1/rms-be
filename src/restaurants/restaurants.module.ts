import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { RestaurantUsersController } from './restaurant-users.controller';
import { RestaurantUsersService } from './restaurant-users.service';
import { Restaurant } from '../common/entities/restaurant.entity';
import { User } from '../common/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, User]), AuthModule],
  controllers: [RestaurantsController, RestaurantUsersController],
  providers: [RestaurantsService, RestaurantUsersService],
  exports: [RestaurantsService, RestaurantUsersService],
})
export class RestaurantsModule {} 
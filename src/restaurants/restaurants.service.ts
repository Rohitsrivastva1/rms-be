import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant, RestaurantStatus } from '../common/entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
  ) {}

  async findAll(query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.restaurantsRepository.createQueryBuilder('restaurant');

    if (status) {
      queryBuilder.andWhere('restaurant.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(restaurant.name ILIKE :search OR restaurant.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [restaurants, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const restaurant = await this.restaurantsRepository.findOne({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async create(createRestaurantDto: any) {
    const restaurant = this.restaurantsRepository.create({
      ...createRestaurantDto,
      status: RestaurantStatus.PENDING,
    });
    return this.restaurantsRepository.save(restaurant);
  }

  async update(id: number, updateRestaurantDto: any) {
    const restaurant = await this.findById(id);
    Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantsRepository.save(restaurant);
  }

  async approve(id: number) {
    const restaurant = await this.findById(id);
    restaurant.status = RestaurantStatus.ACTIVE;
    return this.restaurantsRepository.save(restaurant);
  }

  async suspend(id: number) {
    const restaurant = await this.findById(id);
    restaurant.status = RestaurantStatus.SUSPENDED;
    return this.restaurantsRepository.save(restaurant);
  }

  async delete(id: number) {
    const restaurant = await this.findById(id);
    await this.restaurantsRepository.remove(restaurant);
    return { message: 'Restaurant deleted successfully' };
  }

  async getSuperAdminDashboard() {
    const totalRestaurants = await this.restaurantsRepository.count();
    const pendingVerifications = await this.restaurantsRepository.count({
      where: { status: RestaurantStatus.PENDING }
    });
    const activeRestaurants = await this.restaurantsRepository.count({
      where: { status: RestaurantStatus.ACTIVE }
    });

    // Mock data for trends - in real app, this would come from orders table
    const orderTrend = [
      { day: 'Mon', orders: 45 },
      { day: 'Tue', orders: 52 },
      { day: 'Wed', orders: 48 },
      { day: 'Thu', orders: 61 },
      { day: 'Fri', orders: 73 },
      { day: 'Sat', orders: 89 },
      { day: 'Sun', orders: 67 },
    ];

    const revenueTrend = [
      { day: 'Mon', revenue: 4500 },
      { day: 'Tue', revenue: 5200 },
      { day: 'Wed', revenue: 4800 },
      { day: 'Thu', revenue: 6100 },
      { day: 'Fri', revenue: 7300 },
      { day: 'Sat', revenue: 8900 },
      { day: 'Sun', revenue: 6700 },
    ];

    return {
      totalRestaurants,
      pendingVerifications,
      activeRestaurants,
      orderTrend,
      revenueTrend,
    };
  }

  async getStats(query: any) {
    const { restaurantId } = query;
    
    // Mock data for restaurant statistics
    // In a real application, this would be calculated from actual data
    const tableStatus = [
      { status: 'occupied', count: 8, percentage: 40 },
      { status: 'available', count: 10, percentage: 50 },
      { status: 'reserved', count: 2, percentage: 10 },
    ];

    const activeTables = tableStatus.find(t => t.status === 'occupied')?.count || 0;
    const tableOccupancy = tableStatus.find(t => t.status === 'occupied')?.percentage || 0;

    return {
      tableStatus,
      activeTables,
      tableOccupancy: `${tableOccupancy}%`,
    };
  }
} 
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../common/entities/user.entity';
import { Restaurant, RestaurantStatus } from '../common/entities/restaurant.entity';
import { Order } from '../common/entities/order.entity';
import { Payment } from '../common/entities/payment.entity';
import { MenuItem } from '../common/entities/menu.entity';
import { Table } from '../common/entities/table.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async getDashboard() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get today's orders
    const todayOrders = await this.orderRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    // Get total revenue today
    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);

    // Get recent activity
    const recentOrders = await this.orderRepository.find({
      relations: ['restaurant'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    // Get order trend (last 7 days)
    const orderTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const orders = await this.orderRepository.find({
        where: {
          createdAt: Between(startOfDate, endOfDate),
        },
      });

      orderTrend.push({
        date: date.toISOString().split('T')[0],
        orders: orders.length,
        revenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0),
      });
    }

    return {
      todayStats: {
        totalOrders: todayOrders.length,
        totalRevenue: todayRevenue,
        averageOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0,
      },
      recentActivity: recentOrders.map(order => ({
        id: order.id,
        type: 'order',
        message: `Order #${order.orderId} completed`,
        time: order.createdAt,
        restaurant: order.restaurant?.name || 'Unknown',
        amount: order.totalAmount,
      })),
      orderTrend,
    };
  }

  async getPlatformStats() {
    const totalRestaurants = await this.restaurantRepository.count();
    const activeRestaurants = await this.restaurantRepository.count({
      where: { status: RestaurantStatus.ACTIVE },
    });
    const pendingRestaurants = await this.restaurantRepository.count({
      where: { status: RestaurantStatus.PENDING },
    });
    const suspendedRestaurants = await this.restaurantRepository.count({
      where: { status: RestaurantStatus.SUSPENDED },
    });

    const totalUsers = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const activeUsers = await this.userRepository.count({
      where: { role: UserRole.ADMIN, isActive: true },
    });

    const totalOrders = await this.orderRepository.count();
    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .getRawOne();

    return {
      totalRestaurants,
      activeRestaurants,
      pendingRestaurants,
      suspendedRestaurants,
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue?.total || '0'),
      restaurantGrowth: '+5%', // Mock data for now
      userGrowth: '+2%',
      orderGrowth: '+12%',
      revenueGrowth: '+8%',
    };
  }

  async getUsers(query: any) {
    const { search, role, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereClause,
      relations: ['restaurant'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Filter by search if provided
    const filteredUsers = search
      ? users.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.restaurant?.name.toLowerCase().includes(search.toLowerCase())
        )
      : users;

    return {
      users: filteredUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        restaurant: user.restaurant?.name || null,
        status: user.isActive ? 'active' : 'inactive',
        lastLogin: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
      total: filteredUsers.length,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  async createUser(createUserDto: any) {
    const { name, email, password, phone, role, restaurantId } = createUserDto;

    // Only allow admin and manager roles for super admin
    if (role !== UserRole.ADMIN && role !== UserRole.MANAGER) {
      throw new BadRequestException('Super Admin can only create Admin and Manager accounts');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate restaurant exists if restaurantId is provided
    if (restaurantId) {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new BadRequestException('Restaurant not found');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      restaurantId,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        restaurantId: savedUser.restaurantId,
        status: savedUser.isActive ? 'active' : 'inactive',
      },
    };
  }

  async updateUser(id: number, updateUserDto: any) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fields
    Object.assign(user, updateUserDto);

    // Hash password if provided
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'User updated successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.isActive ? 'active' : 'inactive',
      },
    };
  }

  async deleteUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async getAvailableRestaurants() {
    const restaurants = await this.restaurantRepository.find({
      where: { status: RestaurantStatus.ACTIVE },
      select: ['id', 'name', 'email', 'cuisine'],
    });

    return {
      restaurants: restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        cuisine: restaurant.cuisine,
      })),
    };
  }

  async createRestaurant(createRestaurantDto: any) {
    const { name, email, phone, address, cuisine, capacity, description } = createRestaurantDto;

    // Check if restaurant already exists
    const existingRestaurant = await this.restaurantRepository.findOne({
      where: { email },
    });

    if (existingRestaurant) {
      throw new BadRequestException('Restaurant with this email already exists');
    }

    // Create restaurant
    const restaurant = this.restaurantRepository.create({
      name,
      email,
      phone,
      address,
      cuisine,
      capacity,
      description,
      status: RestaurantStatus.PENDING,
      rating: 0,
      totalOrders: 0,
      totalRevenue: 0,
    });

    const savedRestaurant = await this.restaurantRepository.save(restaurant);

    return {
      success: true,
      message: 'Restaurant created successfully',
      restaurant: {
        id: savedRestaurant.id,
        name: savedRestaurant.name,
        email: savedRestaurant.email,
        status: savedRestaurant.status,
      },
    };
  }

  async getRestaurants(query: any) {
    const { search, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [restaurants, total] = await this.restaurantRepository.findAndCount({
      where: whereClause,
      relations: ['users', 'orders'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Filter by search if provided
    const filteredRestaurants = search
      ? restaurants.filter(restaurant =>
          restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
          restaurant.email.toLowerCase().includes(search.toLowerCase()) ||
          restaurant.cuisine?.toLowerCase().includes(search.toLowerCase())
        )
      : restaurants;

    return {
      restaurants: filteredRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        capacity: restaurant.capacity,
        status: restaurant.status,
        owner: restaurant.users?.find(user => user.role === UserRole.ADMIN)?.name || 'Unknown',
        createdAt: restaurant.createdAt,
        lastOrder: restaurant.orders?.[0]?.createdAt || null,
      })),
      total: filteredRestaurants.length,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  async approveRestaurant(id: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    restaurant.status = RestaurantStatus.ACTIVE;
    await this.restaurantRepository.save(restaurant);

    return {
      success: true,
      message: 'Restaurant approved successfully',
    };
  }

  async suspendRestaurant(id: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    restaurant.status = RestaurantStatus.SUSPENDED;
    await this.restaurantRepository.save(restaurant);

    return {
      success: true,
      message: 'Restaurant suspended successfully',
    };
  }

  async getRevenueReport(query: any) {
    const { period = '30' } = query;
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['restaurant'],
    });

    // Group by date
    const revenueByDate = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = {
          revenue: 0,
          orders: 0,
        };
      }
      revenueByDate[date].revenue += parseFloat(order.totalAmount.toString());
      revenueByDate[date].orders += 1;
    });

    // Convert to array and sort
    const revenueData = Object.entries(revenueByDate).map(([date, data]: [string, any]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));

    revenueData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      period,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0) / orders.length : 0,
      revenueData,
    };
  }

  async getRestaurantReport(query: any) {
    const { period = '30' } = query;
    const days = parseInt(period);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const restaurants = await this.restaurantRepository.find();

    const restaurantPerformance = restaurants.map(restaurant => {
      const periodOrders = restaurant.orders?.filter(order => 
        order.createdAt >= startDate && order.createdAt <= endDate
      ) || [];

      const revenue = periodOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount.toString()), 0);
      const orderCount = periodOrders.length;

      return {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        status: restaurant.status,
        revenue,
        orders: orderCount,
        averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        growth: '+15%', // Mock data for now
      };
    });

    // Sort by revenue
    restaurantPerformance.sort((a, b) => b.revenue - a.revenue);

    return {
      period,
      totalRestaurants: restaurants.length,
      activeRestaurants: restaurants.filter(r => r.status === RestaurantStatus.ACTIVE).length,
      restaurantPerformance,
    };
  }

  async getSettings() {
    // Mock settings for now - in real app, these would come from a settings table
    return {
      platformName: 'Restaurant Management System',
      supportEmail: 'support@rms.com',
      supportPhone: '+91 98765 43210',
      maxRestaurants: 1000,
      maxUsersPerRestaurant: 50,
      orderTimeout: 30,
      paymentMethods: ['cash', 'card', 'upi'],
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      security: {
        passwordMinLength: 8,
        requireTwoFactor: false,
        sessionTimeout: 24,
      },
    };
  }

  async updateSettings(settingsDto: any) {
    // In a real app, this would update a settings table
    // For now, just return success
    return {
      success: true,
      message: 'Settings updated successfully',
      settings: settingsDto,
    };
  }
} 
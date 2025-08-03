import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem, OrderStatus } from '../common/entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async findAll(query: any) {
    const { status, table, date, restaurantId } = query;
    
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (restaurantId) {
      queryBuilder.andWhere('order.restaurantId = :restaurantId', { restaurantId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (table) {
      queryBuilder.andWhere('order.tableNumber = :table', { table });
    }

    if (date) {
      queryBuilder.andWhere('DATE(order.createdAt) = :date', { date });
    }

    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    return { orders };
  }

  async getChefOrders(query: any) {
    const { restaurantId } = query;
    
    const orders = await this.orderRepository.find({
      where: { 
        restaurantId,
        status: OrderStatus.RECEIVED
      },
      relations: ['items'],
      order: { createdAt: 'ASC' }
    });

    return { orders };
  }

  async getChefOrderHistory(query: any) {
    const { restaurantId, startDate, endDate } = query;
    
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.restaurantId = :restaurantId', { restaurantId })
      .andWhere('order.status IN (:...statuses)', { 
        statuses: [OrderStatus.SERVED] 
      });

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const orders = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .getMany();

    return { orders };
  }

  async getOrderStatus(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber: orderId },
      relations: ['items']
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.orderNumber,
      status: order.status,
      estimatedTime: order.estimatedTime,
      timestamp: order.createdAt,
      items: order.items.map(item => ({
        name: item.itemName,
        quantity: item.quantity,
        status: item.status
      }))
    };
  }

  async placeOrder(placeOrderDto: any) {
    const { tableNumber, items, customerName, phone, restaurantId } = placeOrderDto;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // In real app, fetch menu item price from database
      const itemPrice = 450; // Mock price
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItemId: item.id,
        name: `Item ${item.id}`, // In real app, get from menu
        quantity: item.quantity,
        price: itemPrice,
        notes: item.notes || null
      });
    }

    // Create order
    const order = this.orderRepository.create({
      orderNumber: `ORD${Date.now()}`,
      orderId: `ORD${Date.now()}`,
      tableNumber,
      customerName,
      customerPhone: phone,
      totalAmount,
      status: OrderStatus.RECEIVED,
      restaurantId,
      estimatedTime: 15 // Mock estimated time
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        ...item,
        orderId: savedOrder.id
      });
      await this.orderItemRepository.save(orderItem);
    }

    return {
      orderId: savedOrder.orderNumber,
      totalAmount: savedOrder.totalAmount,
      estimatedTime: savedOrder.estimatedTime,
      status: savedOrder.status
    };
  }

  async updateStatus(id: number, updateStatusDto: any) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = updateStatusDto.status;
    if (updateStatusDto.assignedChef) {
      order.assignedChefId = updateStatusDto.assignedChef;
    }

    return this.orderRepository.save(order);
  }

  async submitFeedback(orderId: string, feedbackDto: any) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber: orderId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // In a real application, you would save feedback to a separate table
    return { message: 'Feedback submitted successfully' };
  }

  async getStats(query: any) {
    const { restaurantId } = query;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's orders
    const todayOrders = await this.orderRepository.find({
      where: {
        restaurantId,
        createdAt: today
      }
    });

    // Get yesterday's orders
    const yesterdayOrders = await this.orderRepository.find({
      where: {
        restaurantId,
        createdAt: yesterday
      }
    });

    // Calculate statistics
    const todayRevenue = todayOrders
      .filter(order => order.status === OrderStatus.COMPLETED)
      .reduce((total, order) => total + order.totalAmount, 0);

    const yesterdayRevenue = yesterdayOrders
      .filter(order => order.status === OrderStatus.COMPLETED)
      .reduce((total, order) => total + order.totalAmount, 0);

    const revenueChange = yesterdayRevenue > 0 
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1)
      : '0';

    const kitchenOrders = todayOrders.filter(order => 
      [OrderStatus.RECEIVED, OrderStatus.IN_PROGRESS].includes(order.status)
    ).length;

    // Get status breakdown
    const statusBreakdown = [
      { status: 'pending', count: todayOrders.filter(o => o.status === OrderStatus.RECEIVED).length },
      { status: 'received', count: todayOrders.filter(o => o.status === OrderStatus.RECEIVED).length },
      { status: 'in_progress', count: todayOrders.filter(o => o.status === OrderStatus.IN_PROGRESS).length },
      { status: 'ready', count: todayOrders.filter(o => o.status === OrderStatus.READY).length },
      { status: 'served', count: todayOrders.filter(o => o.status === OrderStatus.SERVED).length },
      { status: 'completed', count: todayOrders.filter(o => o.status === OrderStatus.COMPLETED).length },
    ];

    // Mock hourly data (in a real app, this would be calculated from actual data)
    const hourlyOrders = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      orders: Math.floor(Math.random() * 10)
    }));

    // Mock top items (in a real app, this would be calculated from actual data)
    const topItems = [
      { name: 'Butter Chicken', orders: 15, revenue: 1200 },
      { name: 'Biryani', orders: 12, revenue: 960 },
      { name: 'Naan', orders: 25, revenue: 500 },
      { name: 'Dal Makhani', orders: 8, revenue: 400 },
    ];

    return {
      todayOrders: todayOrders.length,
      todayRevenue: todayRevenue.toFixed(0),
      orderChange: yesterdayOrders.length > 0 
        ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length * 100).toFixed(1)
        : '0',
      revenueChange: `${revenueChange}%`,
      kitchenOrders,
      statusBreakdown,
      hourlyOrders,
      topItems
    };
  }
} 
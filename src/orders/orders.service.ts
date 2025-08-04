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
      // Handle both single status and array of statuses
      if (Array.isArray(status)) {
        queryBuilder.andWhere('order.status IN (:...statuses)', { statuses: status });
      } else {
        queryBuilder.andWhere('order.status = :status', { status });
      }
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
    try {
      const { tableNumber, restaurantId, items, totalAmount, paymentMethod = 'razorpay' } = placeOrderDto;
      
      // Create order with appropriate status based on payment method
      const orderStatus = paymentMethod === 'cash' ? OrderStatus.PENDING_CASH_PAYMENT : OrderStatus.PENDING_PAYMENT;
      
      const order = this.orderRepository.create({
        orderNumber: `ORD-${Date.now()}`,
        tableNumber,
        restaurantId,
        totalAmount,
        status: orderStatus,
        paymentMethod,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      });

      const savedOrder = await this.orderRepository.save(order);
      
      console.log('Order placed:', savedOrder);
      return savedOrder;
    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error('Failed to place order');
    }
  }

  async getCustomerOrderStatus(orderId: number) {
    try {
      console.log('Looking for order with ID:', orderId);
      
      const order = await this.orderRepository.findOne({
        where: { id: orderId }
      });

      console.log('Found order:', order);

      if (!order) {
        throw new Error('Order not found');
      }

      // Calculate estimated time based on status
      let estimatedTime = 15; // Default 15 minutes
      switch (order.status) {
        case OrderStatus.PENDING_PAYMENT:
        case OrderStatus.PENDING_CASH_PAYMENT:
          estimatedTime = 20;
          break;
        case OrderStatus.CONFIRMED:
          estimatedTime = 18;
          break;
        case OrderStatus.IN_PROGRESS:
          estimatedTime = 10;
          break;
        case OrderStatus.READY:
          estimatedTime = 0;
          break;
        case OrderStatus.SERVED:
        case OrderStatus.COMPLETED:
          estimatedTime = 0;
          break;
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        tableNumber: order.tableNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    } catch (error) {
      console.error('Error getting customer order status:', error);
      throw new Error('Failed to get order status');
    }
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

  async findById(id: number) {
    // Mock implementation - in real app, this would query database
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        tableNumber: 'T1',
        customerName: 'John Doe',
        customerPhone: '+91 9876543210',
        status: 'pending',
        totalAmount: 450,
        paymentMethod: 'pending',
        items: [
          { name: 'Butter Chicken', quantity: 1, price: 450 }
        ],
        createdAt: new Date(),
        completedAt: null,
        notes: 'Extra spicy please'
      },
      {
        id: 2,
        orderNumber: 'ORD-002',
        tableNumber: 'T2',
        customerName: 'Jane Smith',
        customerPhone: '+91 9876543211',
        status: 'completed',
        totalAmount: 350,
        paymentMethod: 'cash',
        items: [
          { name: 'Biryani', quantity: 1, price: 350 }
        ],
        createdAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 1800000),
        notes: ''
      }
    ];
    
    const order = mockOrders.find(order => order.id === id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(createOrderDto: any) {
    // Mock implementation - in real app, this would save to database
    const newOrder = {
      id: Date.now(),
      ...createOrderDto,
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Creating order:', newOrder);
    return newOrder;
  }

  async update(id: number, updateOrderDto: any) {
    // Mock implementation - in real app, this would update in database
    const existingOrder = await this.findById(id);
    const updatedOrder = {
      ...existingOrder,
      ...updateOrderDto,
      id: id,
      updatedAt: new Date()
    };
    
    console.log('Updating order:', updatedOrder);
    return updatedOrder;
  }

  async delete(id: number) {
    // Mock implementation - in real app, this would delete from database
    const order = await this.findById(id);
    console.log('Deleting order:', order);
    return { message: 'Order deleted successfully' };
  }

  async assignChef(id: number, assignChefDto: any) {
    // Mock implementation - in real app, this would update in database
    const order = await this.findById(id);
    const updatedOrder = {
      ...order,
      assignedChefId: assignChefDto.chefId,
      updatedAt: new Date()
    };
    
    console.log('Assigning chef to order:', updatedOrder);
    return updatedOrder;
  }

  async findByTable(tableNumber: string) {
    // Mock implementation - in real app, this would query database
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-001',
        tableNumber: 'T1',
        customerName: 'John Doe',
        status: 'pending',
        totalAmount: 450,
        items: [
          { name: 'Butter Chicken', quantity: 1, price: 450 }
        ],
        createdAt: new Date()
      },
      {
        id: 2,
        orderNumber: 'ORD-002',
        tableNumber: 'T1',
        customerName: 'Jane Smith',
        status: 'completed',
        totalAmount: 350,
        items: [
          { name: 'Biryani', quantity: 1, price: 350 }
        ],
        createdAt: new Date(Date.now() - 3600000)
      }
    ];

    const orders = mockOrders.filter(order => order.tableNumber === tableNumber);
    return { orders };
  }
} 
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { CartStatus, CartTheme } from '../common/entities/cart.entity';
import { CartOrderStatus } from '../common/entities/cart-order.entity';
import { NotificationType, NotificationStatus } from '../common/entities/notification.entity';
import { PaymentMethod } from '../common/entities/cart-payment-setting.entity';
import { UserRole, UserStatus } from '../common/entities/user.entity';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartWorker)
    private cartWorkerRepository: Repository<CartWorker>,
    @InjectRepository(MenuCategory)
    private menuCategoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(CartOrder)
    private cartOrderRepository: Repository<CartOrder>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(CartPaymentSetting)
    private cartPaymentSettingRepository: Repository<CartPaymentSetting>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(CartAnalytics)
    private cartAnalyticsRepository: Repository<CartAnalytics>,
    @InjectRepository(CustomerFeedback)
    private customerFeedbackRepository: Repository<CustomerFeedback>,
    @InjectRepository(CartSetting)
    private cartSettingRepository: Repository<CartSetting>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Cart Management
  async createCart(createCartDto: any, ownerId: number) {
    const { name, description, location, theme } = createCartDto;

    // Generate QR code
    const qrData = `https://yourdomain.com/cart/${Date.now()}`;
    const qrCode = await QRCode.toDataURL(qrData);

    const cart = this.cartRepository.create({
      name,
      description,
      location,
      theme: theme || CartTheme.MODERN,
      qrCode,
      qrData,
      ownerId,
      status: CartStatus.PENDING,
    });

    const savedCart = await this.cartRepository.save(cart);
    const origin = process.env.CORS_ORIGIN || 'http://localhost:3001';
    savedCart.qrData = `${origin}/guest/${savedCart.id}`;
    savedCart.qrCode = await QRCode.toDataURL(savedCart.qrData);
    await this.cartRepository.save(savedCart);

    // Create default settings
    await this.createDefaultSettings(savedCart.id);

    return savedCart;
  }

  async getCarts(query: any) {
    const { page = 1, limit = 10, status, search, ownerId } = query;
    const skip = (page - 1) * limit;

    console.log('CartService.getCarts - Query parameters:', query);
    console.log('CartService.getCarts - ownerId:', ownerId);

    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.owner', 'owner')
      .leftJoinAndSelect('cart.workers', 'workers')
      .leftJoinAndSelect('workers.user', 'workerUser');

    // Filter by owner if specified (for cart owners)
    if (ownerId) {
      queryBuilder.andWhere('cart.ownerId = :ownerId', { ownerId });
    }

    if (query.workerId) {
      queryBuilder.andWhere('workers.userId = :workerId', { workerId: query.workerId });
    }

    if (status) {
      queryBuilder.andWhere('cart.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(cart.name ILIKE :search OR cart.description ILIKE :search OR cart.location ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [carts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('cart.createdAt', 'DESC')
      .getManyAndCount();

    return {
      carts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCartById(id: number) {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async updateCart(id: number, updateCartDto: any) {
    const cart = await this.getCartById(id);
    
    Object.assign(cart, updateCartDto);
    return await this.cartRepository.save(cart);
  }

  async approveCart(id: number) {
    const cart = await this.getCartById(id);
    cart.status = CartStatus.ACTIVE;
    
    // TODO: Send notification to cart owner
    // await this.createNotification({
    //   cartId: cart.id,
    //   userId: cart.ownerId,
    //   type: NotificationType.CART_APPROVED,
    //   title: 'Cart Approved',
    //   message: `Your cart "${cart.name}" has been approved and is now active.`,
    // });

    return await this.cartRepository.save(cart);
  }

  async suspendCart(id: number) {
    const cart = await this.getCartById(id);
    cart.status = CartStatus.SUSPENDED;
    
    // TODO: Send notification to cart owner
    // await this.createNotification({
    //   cartId: cart.id,
    //   userId: cart.ownerId,
    //   type: NotificationType.CART_SUSPENDED,
    //   title: 'Cart Suspended',
    //   message: `Your cart "${cart.name}" has been suspended. Please contact support.`,
    // });

    return await this.cartRepository.save(cart);
  }

  // Cart Workers Management
  async addWorker(cartId: number, userId: number, role: string = 'worker') {
    const cart = await this.getCartById(cartId);
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a worker
    const existingWorker = await this.cartWorkerRepository.findOne({
      where: { cartId, userId },
    });

    if (existingWorker) {
      throw new BadRequestException('User is already a worker for this cart');
    }

    const cartWorker = this.cartWorkerRepository.create({
      cartId,
      userId,
      role,
    });

    return await this.cartWorkerRepository.save(cartWorker);
  }

  async removeWorker(cartId: number, userId: number) {
    const worker = await this.cartWorkerRepository.findOne({
      where: { cartId, userId },
    });

    if (!worker) {
      throw new NotFoundException('Worker not found');
    }

    return await this.cartWorkerRepository.remove(worker);
  }

  async getWorkers(cartId: number) {
    const workers = await this.cartWorkerRepository.find({
      where: { cartId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      workers: workers.map((worker) => ({
        id: worker.id,
        userId: worker.userId,
        role: worker.role,
        status: worker.status,
        name: worker.user?.name,
        email: worker.user?.email,
        phone: worker.user?.phone,
      })),
    };
  }

  async inviteWorker(cartId: number, dto: { name?: string; email?: string; password?: string; phone?: string; role?: string }) {
    await this.getCartById(cartId);
    const email = String(dto.email || '').trim().toLowerCase();
    const name = String(dto.name || '').trim();
    const role = dto.role || 'waiter';

    if (!email || !name) {
      throw new BadRequestException('Name and email are required');
    }

    let user = await this.userRepository.findOne({ where: { email } });

    if (user && user.role !== UserRole.CART_WORKER) {
      throw new BadRequestException('That email already belongs to another account');
    }

    if (!user) {
      if (!dto.password || String(dto.password).length < 6) {
        throw new BadRequestException('Password must be at least 6 characters');
      }
      user = await this.userRepository.save(this.userRepository.create({
        name,
        email,
        password: await bcrypt.hash(dto.password, 10),
        phone: dto.phone || null,
        role: UserRole.CART_WORKER,
        status: UserStatus.ACTIVE,
        isActive: true,
      }));
    }

    const worker = await this.addWorker(cartId, user.id, role);
    return {
      id: worker.id,
      userId: user.id,
      role: worker.role,
      status: worker.status,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };
  }

  // Menu Management
  async getMenuCategories(cartId: number) {
    const categories = await this.menuCategoryRepository.find({
      where: { cartId },
      order: { sortOrder: 'ASC', name: 'ASC' }
    });
    return { categories };
  }

  async createMenuCategory(cartId: number, createCategoryDto: any) {
    const { name, description, sortOrder, isActive } = createCategoryDto;

    const category = this.menuCategoryRepository.create({
      cartId,
      name,
      description,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    return await this.menuCategoryRepository.save(category);
  }

  async updateMenuCategory(cartId: number, categoryId: number, updateCategoryDto: any) {
    const category = await this.menuCategoryRepository.findOne({
      where: { id: categoryId, cartId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, updateCategoryDto);
    return await this.menuCategoryRepository.save(category);
  }

  async deleteMenuCategory(cartId: number, categoryId: number) {
    const category = await this.menuCategoryRepository.findOne({
      where: { id: categoryId, cartId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.menuCategoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async getMenuItems(cartId: number) {
    const menuItems = await this.menuItemRepository.find({
      where: { cartId },
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' }
    });
    return { menuItems };
  }

  async createMenuItem(cartId: number, createItemDto: any) {
    const {
      name,
      description,
      price,
      imageUrl,
      categoryId,
      isAvailable,
      isVegetarian,
      isSpicy,
      preparationTime,
      sortOrder,
    } = createItemDto;

    const menuItem = this.menuItemRepository.create({
      cartId,
      categoryId: categoryId ? parseInt(categoryId) : null,
      name,
      description,
      price,
      imageUrl,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isVegetarian: isVegetarian || false,
      isSpicy: isSpicy || false,
      preparationTime: preparationTime || 0,
      sortOrder: sortOrder || 0,
    });

    return await this.menuItemRepository.save(menuItem);
  }

  async updateMenuItem(cartId: number, itemId: number, updateItemDto: any) {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id: itemId, cartId }
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    Object.assign(menuItem, updateItemDto);
    return await this.menuItemRepository.save(menuItem);
  }

  async deleteMenuItem(cartId: number, itemId: number) {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id: itemId, cartId }
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    await this.menuItemRepository.remove(menuItem);
    return { message: 'Menu item deleted successfully' };
  }

  async bulkImportMenuItems(cartId: number, items: any[]) {
    const results = {
      imported: 0,
      errors: [],
      categories: new Map()
    };

    for (const item of items) {
      try {
        let categoryId = null;
        
        // Handle category creation or lookup
        if (item.categoryName) {
          // Check if category already exists
          let category = await this.menuCategoryRepository.findOne({
            where: { 
              cartId, 
              name: item.categoryName 
            }
          });

          if (!category) {
            // Create new category
            category = this.menuCategoryRepository.create({
              cartId,
              name: item.categoryName,
              description: `Auto-created from Excel import`,
              sortOrder: 0,
              isActive: true
            });
            category = await this.menuCategoryRepository.save(category);
          }
          
          categoryId = category.id;
          results.categories.set(item.categoryName, categoryId);
        }

        // Create menu item
        const menuItem = this.menuItemRepository.create({
          cartId,
          categoryId,
          name: item.name,
          description: item.description || '',
          price: item.price,
          imageUrl: item.imageUrl || '',
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          isVegetarian: item.isVegetarian || false,
          isSpicy: item.isSpicy || false,
          preparationTime: item.preparationTime || 0,
          sortOrder: item.sortOrder || 0,
        });

        await this.menuItemRepository.save(menuItem);
        results.imported++;
      } catch (error) {
        results.errors.push({
          item: item.name,
          error: error.message
        });
      }
    }

    return results;
  }

  // Order Management
  async createOrder(cartId: number, createOrderDto: any) {
    const {
      customerName,
      customerPhone,
      customerEmail,
      carNumber,
      seatNumber,
      tableNumber,
      items,
      specialInstructions,
    } = createOrderDto;

    if (!items?.length) {
      throw new BadRequestException('Add at least one dish');
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await this.menuItemRepository.findOne({
        where: { id: item.menuItemId, cartId },
      });

      if (!menuItem) {
        throw new NotFoundException(`Menu item with ID ${item.menuItemId} not found`);
      }

      const quantity = Number(item.quantity) || 0;
      if (quantity < 1) {
        throw new BadRequestException('Each dish needs a quantity');
      }

      const itemTotal = Number(menuItem.price) * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        itemName: menuItem.name,
        quantity,
        unitPrice: Number(menuItem.price),
        totalPrice: itemTotal,
        specialInstructions: item.specialInstructions,
      });
    }

    const order = this.cartOrderRepository.create({
      cartId,
      orderNumber: `SV${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`,
      customerName,
      customerPhone,
      customerEmail,
      carNumber,
      seatNumber,
      tableNumber,
      totalAmount,
      finalAmount: totalAmount,
      specialInstructions,
      status: CartOrderStatus.PENDING,
    });

    const savedOrder = await this.cartOrderRepository.save(order);

    // Create order items
    for (const item of orderItems) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        ...item,
      });
      await this.orderItemRepository.save(orderItem);
    }

    // Send notification to cart workers
    await this.createNotification({
      cartId,
      type: NotificationType.ORDER_RECEIVED,
      title: 'New Order Received',
      message: `New order #${savedOrder.orderNumber} from ${customerName}`,
      data: { orderId: savedOrder.id },
    });

    return this.cartOrderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['items'],
    });
  }

  async getWorkerOrders(cartId: number, userId: number) {
    const assignment = await this.cartWorkerRepository.findOne({
      where: { cartId, userId },
    });
    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this venue');
    }
    return this.getCartOrders(cartId);
  }

  async getCartOrders(cartId: number) {
    const orders = await this.cartOrderRepository.find({
      where: { cartId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return { orders };
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.cartOrderRepository.findOne({
      where: { orderNumber },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      finalAmount: order.finalAmount,
      items: order.items,
    };
  }

  async getPublicVenue(id: number) {
    const cart = await this.getCartById(id);
    if (cart.status === CartStatus.SUSPENDED || cart.status === CartStatus.INACTIVE) {
      throw new NotFoundException('This venue is not taking orders');
    }
    const { categories } = await this.getMenuCategories(id);
    const { menuItems } = await this.getMenuItems(id);
    return {
      id: cart.id,
      name: cart.name,
      description: cart.description,
      location: cart.location,
      categories: categories.filter((category) => category.isActive !== false),
      menuItems: menuItems.filter((item) => item.isAvailable !== false),
    };
  }

  async updateOrderStatus(orderId: number, status: CartOrderStatus, workerId?: number) {
    const order = await this.cartOrderRepository.findOne({
      where: { id: orderId },
      relations: ['cart'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    if (workerId) {
      const assignment = await this.cartWorkerRepository.findOne({
        where: { userId: workerId, cartId: order.cartId },
      });
      if (assignment) {
        order.assignedWorkerId = assignment.id;
      }
    }

    const savedOrder = await this.cartOrderRepository.save(order);

    // Send notification based on status
    let notificationType: NotificationType;
    let title: string;
    let message: string;

    switch (status) {
      case CartOrderStatus.ACCEPTED:
        notificationType = NotificationType.ORDER_ACCEPTED;
        title = 'Order Accepted';
        message = `Your order #${order.orderNumber} has been accepted and is being prepared.`;
        break;
      case CartOrderStatus.COOKING:
        notificationType = NotificationType.ORDER_COOKING;
        title = 'Order Cooking';
        message = `Your order #${order.orderNumber} is being prepared.`;
        break;
      case CartOrderStatus.READY_FOR_PICKUP:
        notificationType = NotificationType.ORDER_READY;
        title = 'Order Ready';
        message = `Your order #${order.orderNumber} is ready for pickup.`;
        break;
      case CartOrderStatus.DELIVERED:
        notificationType = NotificationType.ORDER_DELIVERED;
        title = 'Order Delivered';
        message = `Your order #${order.orderNumber} has been delivered. Thank you!`;
        break;
      case CartOrderStatus.CANCELLED:
        notificationType = NotificationType.ORDER_CANCELLED;
        title = 'Order Cancelled';
        message = `Your order #${order.orderNumber} has been cancelled.`;
        break;
    }

    if (notificationType) {
      await this.createNotification({
        cartId: order.cartId,
        type: notificationType,
        title,
        message,
        data: { orderId: order.id },
      });
    }

    return savedOrder;
  }

  // Analytics
  async getCartAnalytics(cartId: number, dateRange?: { start: Date; end: Date }) {
    const queryBuilder = this.cartAnalyticsRepository
      .createQueryBuilder('analytics')
      .where('analytics.cartId = :cartId', { cartId });

    if (dateRange) {
      queryBuilder.andWhere('analytics.date BETWEEN :start AND :end', {
        start: dateRange.start,
        end: dateRange.end,
      });
    }

    return await queryBuilder
      .orderBy('analytics.date', 'DESC')
      .getMany();
  }

  // Settings
  async createDefaultSettings(cartId: number) {
    const defaultSettings = [
      { settingKey: 'offline_mode_enabled', settingValue: 'true' },
      { settingKey: 'multi_language_support', settingValue: 'false' },
      { settingKey: 'table_service_mode', settingValue: 'false' },
      { settingKey: 'discount_coupons_enabled', settingValue: 'false' },
      { settingKey: 'customer_rating_enabled', settingValue: 'true' },
      { settingKey: 'whatsapp_notifications', settingValue: 'true' },
      { settingKey: 'sms_notifications', settingValue: 'false' },
      { settingKey: 'email_notifications', settingValue: 'true' },
    ];

    for (const setting of defaultSettings) {
      const cartSetting = this.cartSettingRepository.create({
        cartId,
        ...setting,
      });
      await this.cartSettingRepository.save(cartSetting);
    }
  }

  // Notifications
  async createNotification(notificationData: {
    cartId: number;
    userId?: number;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }) {
    try {
      const notification = this.notificationRepository.create({
        ...notificationData,
        status: NotificationStatus.PENDING,
      });
      return await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Notification skipped:', error.message);
      return null;
    }
  }

  // Public Cart Access (for customers)
  async getCartByQR(qrCode: string) {
    const cart = await this.cartRepository.findOne({
      where: { qrCode },
      relations: [
        'menuCategories',
        'menuItems',
        'menuItems.category',
        'paymentSettings',
      ],
    });

    if (!cart || cart.status !== CartStatus.ACTIVE) {
      throw new NotFoundException('Cart not found or inactive');
    }

    return cart;
  }
}

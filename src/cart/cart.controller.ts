import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';
import { CartService } from './cart.service';
import { CartStatus, CartTheme } from '../common/entities/cart.entity';
import { CartOrderStatus } from '../common/entities/cart-order.entity';
import { PaymentMethod } from '../common/entities/cart-payment-setting.entity';

@ApiTags('Cart Management')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Super Admin Routes
  @Get('admin/carts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all carts (Super Admin)' })
  async getCarts(@Query() query: any) {
    return await this.cartService.getCarts(query);
  }

  @Get('admin/carts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cart by ID (Super Admin)' })
  async getCartById(@Param('id') id: number) {
    return await this.cartService.getCartById(id);
  }

  @Post('admin/carts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new cart (Super Admin)' })
  async createCart(@Body() createCartDto: any, @Request() req: any) {
    return await this.cartService.createCart(createCartDto, req.user.userId);
  }

  @Put('admin/carts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart (Super Admin)' })
  async updateCart(@Param('id') id: number, @Body() updateCartDto: any) {
    return await this.cartService.updateCart(id, updateCartDto);
  }

  @Put('admin/carts/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve cart (Super Admin)' })
  async approveCart(@Param('id') id: number) {
    return await this.cartService.approveCart(id);
  }

  @Put('admin/carts/:id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend cart (Super Admin)' })
  async suspendCart(@Param('id') id: number) {
    return await this.cartService.suspendCart(id);
  }

  // Cart Owner Routes
  @Get('owner/carts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get owner carts' })
  async getOwnerCarts(@Request() req: any) {
    console.log('CartController.getOwnerCarts - req.user:', req.user);
    console.log('CartController.getOwnerCarts - req.user.userId:', req.user.userId);
    console.log('CartController.getOwnerCarts - req.query:', req.query);
    
    const query = { ...req.query, ownerId: req.user.userId };
    console.log('CartController.getOwnerCarts - Final query:', query);
    
    return await this.cartService.getCarts(query);
  }

  @Get('owner/carts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get owner cart by ID' })
  async getOwnerCartById(@Param('id') id: number, @Request() req: any) {
    const cart = await this.cartService.getCartById(id);
    if (cart.ownerId !== req.user.userId) {
      throw new Error('Unauthorized access to cart');
    }
    return cart;
  }

  @Post('owner/carts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new cart (Cart Owner)' })
  async createOwnerCart(@Body() createCartDto: any, @Request() req: any) {
    return await this.cartService.createCart(createCartDto, req.user.userId);
  }

  @Put('owner/carts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update owner cart' })
  async updateOwnerCart(@Param('id') id: number, @Body() updateCartDto: any, @Request() req: any) {
    const cart = await this.cartService.getCartById(id);
    if (cart.ownerId !== req.user.userId) {
      throw new Error('Unauthorized access to cart');
    }
    return await this.cartService.updateCart(id, updateCartDto);
  }

  // Cart Worker Routes
  @Get('worker/carts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_WORKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get worker carts' })
  async getWorkerCarts(@Request() req: any) {
    // Implementation to get carts where user is a worker
    return await this.cartService.getCarts({ workerId: req.user.userId });
  }

  @Get('worker/carts/:id/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_WORKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cart orders for worker' })
  async getCartOrders(@Param('id') id: number, @Request() req: any) {
    return await this.cartService.getWorkerOrders(id, req.user.userId);
  }

  @Put('worker/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_WORKER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Worker)' })
  async updateOrderStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: { status: CartOrderStatus },
    @Request() req: any
  ) {
    return await this.cartService.updateOrderStatus(id, updateStatusDto.status, req.user.userId);
  }

  // Public Routes (No Authentication Required)
  @Get('public/qr/:qrCode')
  @ApiOperation({ summary: 'Get cart by QR code (Public)' })
  async getCartByQR(@Param('qrCode') qrCode: string) {
    return await this.cartService.getCartByQR(qrCode);
  }

  @Post('public/orders')
  @ApiOperation({ summary: 'Create order from a claimed seat' })
  async createOrder(@Body() createOrderDto: any, @Headers('x-seat-token') token: string) {
    return await this.cartService.createGuestOrder(token, createOrderDto);
  }

  @Post('public/seats/:seatKey/enter')
  @ApiOperation({ summary: 'Claim a table QR, or resume the guest who already holds it' })
  async enterSeat(@Param('seatKey') seatKey: string, @Body() body: { sessionToken?: string }) {
    return await this.cartService.enterSeat(seatKey, body?.sessionToken);
  }

  @Get('public/seats/:seatKey/bill')
  @ApiOperation({ summary: 'Bill for the guest holding this seat' })
  async seatBill(@Param('seatKey') seatKey: string, @Headers('x-seat-token') token: string) {
    return await this.cartService.seatBill(seatKey, token);
  }

  @Post('public/seats/:seatKey/pay')
  @ApiOperation({ summary: 'Pay the bill and free the seat' })
  async paySeat(@Param('seatKey') seatKey: string, @Headers('x-seat-token') token: string) {
    return await this.cartService.paySeat(seatKey, token);
  }

  @Post('public/seats/:seatKey/leave')
  @ApiOperation({ summary: 'Leave an empty seat' })
  async leaveSeat(@Param('seatKey') seatKey: string, @Headers('x-seat-token') token: string) {
    return await this.cartService.leaveSeat(seatKey, token);
  }

  @Get('public/orders/:orderNumber/status')
  @ApiOperation({ summary: 'Get order status (Public)' })
  async getOrderStatus(@Param('orderNumber') orderNumber: string) {
    return await this.cartService.getOrderByNumber(orderNumber);
  }

  @Get('public/venues/:id')
  @ApiOperation({ summary: 'Get a venue menu for guests' })
  async getPublicVenue(@Param('id') id: number) {
    return await this.cartService.getPublicVenue(id);
  }


  // Menu Management Routes
  @Get('owner/carts/:id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get menu categories' })
  async getMenuCategories(@Param('id') id: number) {
    return await this.cartService.getMenuCategories(id);
  }

  @Post('owner/carts/:id/categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu category' })
  async createMenuCategory(@Param('id') id: number, @Body() createCategoryDto: any) {
    return await this.cartService.createMenuCategory(id, createCategoryDto);
  }

  @Put('owner/carts/:id/categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu category' })
  async updateMenuCategory(@Param('id') id: number, @Param('categoryId') categoryId: number, @Body() updateCategoryDto: any) {
    return await this.cartService.updateMenuCategory(id, categoryId, updateCategoryDto);
  }

  @Delete('owner/carts/:id/categories/:categoryId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu category' })
  async deleteMenuCategory(@Param('id') id: number, @Param('categoryId') categoryId: number) {
    return await this.cartService.deleteMenuCategory(id, categoryId);
  }

  @Get('owner/carts/:id/menu-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get menu items' })
  async getMenuItems(@Param('id') id: number) {
    return await this.cartService.getMenuItems(id);
  }

  @Post('owner/carts/:id/menu-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu item' })
  async createMenuItem(@Param('id') id: number, @Body() createItemDto: any) {
    return await this.cartService.createMenuItem(id, createItemDto);
  }

  @Put('owner/carts/:id/menu-items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item' })
  async updateMenuItem(@Param('id') id: number, @Param('itemId') itemId: number, @Body() updateItemDto: any) {
    return await this.cartService.updateMenuItem(id, itemId, updateItemDto);
  }

  @Delete('owner/carts/:id/menu-items/:itemId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item' })
  async deleteMenuItem(@Param('id') id: number, @Param('itemId') itemId: number) {
    return await this.cartService.deleteMenuItem(id, itemId);
  }

  @Post('owner/carts/:id/menu-items/bulk-import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk import menu items from Excel' })
  async bulkImportMenuItems(@Param('id') id: number, @Body() bulkImportDto: { items: any[] }) {
    return await this.cartService.bulkImportMenuItems(id, bulkImportDto.items);
  }

  @Get('owner/carts/:id/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get venue orders' })
  async getOwnerOrders(@Param('id') id: number) {
    return await this.cartService.getCartOrders(id);
  }

  @Post('owner/carts/:id/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Take an order at the venue' })
  async createOwnerOrder(@Param('id') id: number, @Body() createOrderDto: any) {
    return await this.cartService.createOrder(id, createOrderDto);
  }

  @Put('owner/orders/:orderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (owner)' })
  async updateOwnerOrderStatus(
    @Param('orderId') orderId: number,
    @Body() updateStatusDto: { status: CartOrderStatus },
  ) {
    return await this.cartService.updateOrderStatus(orderId, updateStatusDto.status);
  }

  // Worker Management Routes
  @Get('owner/carts/:id/workers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get venue staff' })
  async getWorkers(@Param('id') id: number) {
    return await this.cartService.getWorkers(id);
  }

  @Post('owner/carts/:id/workers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add worker to cart' })
  async addWorker(@Param('id') id: number, @Body() addWorkerDto: { userId?: number; role?: string; name?: string; email?: string; password?: string; phone?: string }) {
    if (addWorkerDto.email) {
      return await this.cartService.inviteWorker(id, addWorkerDto);
    }
    return await this.cartService.addWorker(id, addWorkerDto.userId, addWorkerDto.role);
  }

  @Delete('owner/carts/:id/workers/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove worker from cart' })
  async removeWorker(@Param('id') id: number, @Param('userId') userId: number) {
    return await this.cartService.removeWorker(id, userId);
  }

  @Get('owner/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open tickets and today revenue' })
  async getOwnerSnapshot(@Request() req: any) {
    return await this.cartService.getOwnerSnapshot(req.user.userId);
  }

  @Put('owner/carts/:id/service')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Open or pause a venue' })
  async setVenueOpen(@Param('id') id: number, @Body() body: { open: boolean }, @Request() req: any) {
    return await this.cartService.setVenueOpen(id, req.user.userId, body.open !== false);
  }

  @Get('owner/carts/:id/tables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List venue tables' })
  async getTables(@Param('id') id: number) {
    return await this.cartService.getTables(id);
  }

  @Post('owner/carts/:id/tables')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a table or a numbered range' })
  async createTable(@Param('id') id: number, @Body() body: { label?: string; seats?: number; from?: number; count?: number }) {
    if (body.count) {
      return await this.cartService.createTableRange(id, body.from, body.count, body.seats);
    }
    return await this.cartService.createTable(id, body);
  }

  @Delete('owner/carts/:id/tables/:tableId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a table' })
  async deleteTable(@Param('id') id: number, @Param('tableId') tableId: number) {
    return await this.cartService.deleteTable(id, tableId);
  }

  @Post('owner/carts/:id/tables/:tableId/release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Free a seat that a guest still holds' })
  async releaseSeat(@Param('id') id: number, @Param('tableId') tableId: number) {
    return await this.cartService.releaseSeat(id, tableId);
  }

  // Analytics Routes
  @Get('owner/carts/:id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CART_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cart analytics' })
  async getCartAnalytics(@Param('id') id: number, @Query() query: any) {
    const dateRange = query.start && query.end ? {
      start: new Date(query.start),
      end: new Date(query.end)
    } : undefined;
    return await this.cartService.getCartAnalytics(id, dateRange);
  }
}

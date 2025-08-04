import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ status: 200, description: 'Order statistics retrieved successfully' })
  async getOrderStats(@Query() query: any) {
    return this.ordersService.getStats(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get orders (admin)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getAdminOrders(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Get('chef')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF)
  @ApiOperation({ summary: 'Get live orders (chef)' })
  @ApiResponse({ status: 200, description: 'Live orders retrieved successfully' })
  async getChefOrders(@Query() query: any) {
    return this.ordersService.getChefOrders(query);
  }

  @Get('chef/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF)
  @ApiOperation({ summary: 'Get order history (chef)' })
  @ApiResponse({ status: 200, description: 'Order history retrieved successfully' })
  async getChefOrderHistory(@Query() query: any) {
    return this.ordersService.getChefOrderHistory(query);
  }

  @Get('customer/:orderId/status')
  @ApiOperation({ summary: 'Get order status (customer)' })
  @ApiResponse({ status: 200, description: 'Order status retrieved successfully' })
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderStatus(orderId);
  }

  @Post('customer')
  @ApiOperation({ summary: 'Place order (customer)' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  async placeOrder(@Body() placeOrderDto: any) {
    return this.ordersService.placeOrder(placeOrderDto);
  }

  @Post()
  @ApiOperation({ summary: 'Place order (public customer endpoint)' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  async placeCustomerOrder(@Body() placeOrderDto: any) {
    return this.ordersService.placeOrder(placeOrderDto);
  }

  @Get('customer/:orderId/status')
  @ApiOperation({ summary: 'Get customer order status' })
  @ApiResponse({ status: 200, description: 'Order status retrieved successfully' })
  async getCustomerOrderStatus(@Param('orderId') orderId: string) {
    return this.ordersService.getCustomerOrderStatus(parseInt(orderId));
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CHEF)
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateOrderStatus(@Param('id') id: number, @Body() updateStatusDto: any) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':orderId/feedback')
  @ApiOperation({ summary: 'Submit feedback (customer)' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  async submitFeedback(@Param('orderId') orderId: string, @Body() feedbackDto: any) {
    return this.ordersService.submitFeedback(orderId, feedbackDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getAllOrders(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  async getOrderById(@Param('id') id: number) {
    return this.ordersService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({ status: 200, description: 'Order updated successfully' })
  async updateOrder(@Param('id') id: number, @Body() updateOrderDto: any) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete order' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  async deleteOrder(@Param('id') id: number) {
    return this.ordersService.delete(id);
  }

  @Patch(':id/assign-chef')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Assign chef to order' })
  @ApiResponse({ status: 200, description: 'Chef assigned successfully' })
  async assignChef(@Param('id') id: number, @Body() assignChefDto: any) {
    return this.ordersService.assignChef(id, assignChefDto);
  }

  @Get('table/:tableNumber')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get orders by table number' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getOrdersByTable(@Param('tableNumber') tableNumber: string) {
    return this.ordersService.findByTable(tableNumber);
  }
} 
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';
import { SuperAdminService } from './superadmin.service';

@ApiTags('SuperAdmin')
@Controller('superadmin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get SuperAdmin dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard() {
    return this.superAdminService.getDashboard();
  }

  @Get('platform-stats')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Platform stats retrieved successfully' })
  async getPlatformStats() {
    return this.superAdminService.getPlatformStats();
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Query() query: any) {
    return this.superAdminService.getUsers(query);
  }

  @Get('restaurants/available')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get available restaurants for user assignment' })
  @ApiResponse({ status: 200, description: 'Available restaurants retrieved successfully' })
  async getAvailableRestaurants() {
    return this.superAdminService.getAvailableRestaurants();
  }

  @Post('users')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new admin/manager user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: any) {
    return this.superAdminService.createUser(createUserDto);
  }

  @Put('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admin user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.superAdminService.updateUser(parseInt(id), updateUserDto);
  }

  @Delete('users/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete admin user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.superAdminService.deleteUser(parseInt(id));
  }

  @Get('restaurants')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({ status: 200, description: 'Restaurants retrieved successfully' })
  async getRestaurants(@Query() query: any) {
    return this.superAdminService.getRestaurants(query);
  }

  @Post('restaurants')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  async createRestaurant(@Body() createRestaurantDto: any) {
    return this.superAdminService.createRestaurant(createRestaurantDto);
  }

  @Put('restaurants/:id/approve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant approved successfully' })
  async approveRestaurant(@Param('id') id: string) {
    return this.superAdminService.approveRestaurant(parseInt(id));
  }

  @Put('restaurants/:id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Suspend restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant suspended successfully' })
  async suspendRestaurant(@Param('id') id: string) {
    return this.superAdminService.suspendRestaurant(parseInt(id));
  }

  @Get('reports/revenue')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get revenue reports' })
  @ApiResponse({ status: 200, description: 'Revenue report retrieved successfully' })
  async getRevenueReport(@Query() query: any) {
    return this.superAdminService.getRevenueReport(query);
  }

  @Get('reports/restaurants')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get restaurant performance reports' })
  @ApiResponse({ status: 200, description: 'Restaurant report retrieved successfully' })
  async getRestaurantReport(@Query() query: any) {
    return this.superAdminService.getRestaurantReport(query);
  }

  @Get('settings')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings() {
    return this.superAdminService.getSettings();
  }

  @Put('settings')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update platform settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@Body() settingsDto: any) {
    return this.superAdminService.updateSettings(settingsDto);
  }
} 
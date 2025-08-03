import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Restaurants')
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get restaurant statistics' })
  @ApiResponse({ status: 200, description: 'Restaurant statistics retrieved successfully' })
  async getRestaurantStats(@Query() query: any) {
    return this.restaurantsService.getStats(query);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiResponse({ status: 200, description: 'Restaurants retrieved successfully' })
  async getAllRestaurants(@Query() query: any) {
    return this.restaurantsService.findAll(query);
  }

  @Get('dashboard')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get super admin dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getSuperAdminDashboard() {
    return this.restaurantsService.getSuperAdminDashboard();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiResponse({ status: 200, description: 'Restaurant retrieved successfully' })
  async getRestaurantById(@Param('id') id: number) {
    return this.restaurantsService.findById(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create new restaurant' })
  @ApiResponse({ status: 201, description: 'Restaurant created successfully' })
  async createRestaurant(@Body() createRestaurantDto: any) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  async updateRestaurant(@Param('id') id: number, @Body() updateRestaurantDto: any) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Put(':id/approve')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant approved successfully' })
  async approveRestaurant(@Param('id') id: number) {
    return this.restaurantsService.approve(id);
  }

  @Put(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Suspend restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant suspended successfully' })
  async suspendRestaurant(@Param('id') id: number) {
    return this.restaurantsService.suspend(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete restaurant' })
  @ApiResponse({ status: 200, description: 'Restaurant deleted successfully' })
  async deleteRestaurant(@Param('id') id: number) {
    return this.restaurantsService.delete(id);
  }
} 
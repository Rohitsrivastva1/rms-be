import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';
import { RestaurantUsersService } from './restaurant-users.service';

@ApiTags('Restaurant Users')
@Controller('restaurant-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RestaurantUsersController {
  constructor(private readonly restaurantUsersService: RestaurantUsersService) {}

  @Get('staff')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get restaurant staff (waiters and chefs)' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  async getStaff(@Request() req: any, @Query() query: any) {
    return this.restaurantUsersService.getStaff(req.user.restaurantId, query);
  }

  @Post('staff')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new staff member (waiter or chef)' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  async createStaff(@Request() req: any, @Body() createStaffDto: any) {
    return this.restaurantUsersService.createStaff(req.user.restaurantId, createStaffDto);
  }

  @Put('staff/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({ status: 200, description: 'Staff member updated successfully' })
  async updateStaff(@Request() req: any, @Param('id') id: string, @Body() updateStaffDto: any) {
    return this.restaurantUsersService.updateStaff(req.user.restaurantId, parseInt(id), updateStaffDto);
  }

  @Delete('staff/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiResponse({ status: 200, description: 'Staff member deleted successfully' })
  async deleteStaff(@Request() req: any, @Param('id') id: string) {
    return this.restaurantUsersService.deleteStaff(req.user.restaurantId, parseInt(id));
  }
} 
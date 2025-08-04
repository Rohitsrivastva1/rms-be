import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get all staff' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  async getAllStaff(@Query() query: any, @Request() req: any) {
    return this.staffService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get staff statistics' })
  @ApiResponse({ status: 200, description: 'Staff statistics retrieved successfully' })
  async getStaffStats(@Query() query: any) {
    return this.staffService.getStats(query);
  }

  @Get('roles/options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get available roles for current user' })
  @ApiResponse({ status: 200, description: 'Role options retrieved successfully' })
  async getRoleOptions(@Request() req: any) {
    return this.staffService.getRoleOptions(req.user.role);
  }

  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get staff by restaurant' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  async getStaffByRestaurant(@Param('restaurantId') restaurantId: number) {
    return this.staffService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get staff by ID' })
  @ApiResponse({ status: 200, description: 'Staff retrieved successfully' })
  async getStaffById(@Param('id') id: number) {
    return this.staffService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create staff member' })
  @ApiResponse({ status: 201, description: 'Staff created successfully' })
  async createStaff(@Body() createStaffDto: any, @Request() req: any) {
    return this.staffService.create(createStaffDto, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update staff member' })
  @ApiResponse({ status: 200, description: 'Staff updated successfully' })
  async updateStaff(@Param('id') id: number, @Body() updateStaffDto: any, @Request() req: any) {
    return this.staffService.update(id, updateStaffDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete staff member' })
  @ApiResponse({ status: 200, description: 'Staff deleted successfully' })
  async deleteStaff(@Param('id') id: number, @Request() req: any) {
    return this.staffService.delete(id, req.user);
  }
} 
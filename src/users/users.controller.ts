import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: any, @Request() req: any) {
    // Role-based user creation logic
    const currentUserRole = req.user.role;
    const targetRole = createUserDto.role;
    
    // Define who can create what roles
    const roleCreationRules = {
      [UserRole.SUPER_ADMIN]: [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER],
      [UserRole.ADMIN]: [UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER],
      [UserRole.MANAGER]: [UserRole.CHEF, UserRole.WAITER]
    };
    
    const allowedRoles = roleCreationRules[currentUserRole] || [];
    if (!allowedRoles.includes(targetRole)) {
      throw new BadRequestException(`You cannot create users with role: ${targetRole}`);
    }
    
    // Ensure restaurant admins and managers can only create users for their restaurant
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      createUserDto.restaurantId = req.user.restaurantId;
    }
    
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: number, @Body() updateUserDto: any) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: number) {
    return this.usersService.delete(id);
  }

  @Put(':id/reset-password')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Param('id') id: number) {
    return this.usersService.resetPassword(id);
  }
} 
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../common/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RestaurantUsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStaff(restaurantId: number, query: any) {
    const { search, role, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    let whereClause: any = { restaurantId };
    
    // Only allow waiter and chef roles
    if (role && role !== 'all') {
      if (role !== UserRole.WAITER && role !== UserRole.CHEF) {
        throw new BadRequestException('Can only view waiter and chef accounts');
      }
      whereClause.role = role;
    } else {
      whereClause.role = [UserRole.WAITER, UserRole.CHEF];
    }

    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const [users, total] = await this.userRepository.findAndCount({
      where: whereClause,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Filter by search if provided
    const filteredUsers = search
      ? users.filter(user =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase())
        )
      : users;

    return {
      staff: filteredUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.isActive ? 'active' : 'inactive',
        lastLogin: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
      total: filteredUsers.length,
      page: parseInt(page),
      limit: parseInt(limit),
    };
  }

  async createStaff(restaurantId: number, createStaffDto: any) {
    const { name, email, password, phone, role } = createStaffDto;

    // Only allow waiter and chef roles
    if (role !== UserRole.WAITER && role !== UserRole.CHEF) {
      throw new BadRequestException('Can only create waiter and chef accounts');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      restaurantId,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'Staff member created successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.isActive ? 'active' : 'inactive',
      },
    };
  }

  async updateStaff(restaurantId: number, id: number, updateStaffDto: any) {
    const user = await this.userRepository.findOne({
      where: { id, restaurantId },
    });

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    // Only allow waiter and chef roles
    if (updateStaffDto.role && 
        updateStaffDto.role !== UserRole.WAITER && 
        updateStaffDto.role !== UserRole.CHEF) {
      throw new BadRequestException('Can only update to waiter and chef roles');
    }

    // Update user fields
    Object.assign(user, updateStaffDto);

    // Hash password if provided
    if (updateStaffDto.password) {
      user.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    const savedUser = await this.userRepository.save(user);

    return {
      success: true,
      message: 'Staff member updated successfully',
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.isActive ? 'active' : 'inactive',
      },
    };
  }

  async deleteStaff(restaurantId: number, id: number) {
    const user = await this.userRepository.findOne({
      where: { id, restaurantId },
    });

    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'Staff member deleted successfully',
    };
  }
} 
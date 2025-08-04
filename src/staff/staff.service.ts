import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User, UserRole, UserStatus } from '../common/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(query: any) {
    const { restaurantId, role, status } = query;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Filter by restaurantId
    if (restaurantId) {
      queryBuilder.andWhere('user.restaurantId = :restaurantId', { restaurantId: parseInt(restaurantId) });
    }

    // Filter by role (exclude super_admin and admin roles for staff management)
    queryBuilder.andWhere('user.role IN (:...roles)', { 
      roles: [UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER] 
    });

    if (role && role !== 'all') {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Filter by status (active/inactive)
    if (status && status !== 'all') {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    const staff = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return { staff };
  }

  async findById(id: number) {
    const staff = await this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'name', 'email', 'phone', 'role', 'status', 'restaurantId', 'createdAt', 'updatedAt']
    });
    
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }
    return staff;
  }

  async create(createStaffDto: any, currentUser: any) {
    // Validate role permissions
    const allowedRoles = this.getAllowedRoles(currentUser.role);
    if (!allowedRoles.includes(createStaffDto.role)) {
      throw new BadRequestException(`You can only create staff with roles: ${allowedRoles.join(', ')}`);
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({ 
      where: { email: createStaffDto.email } 
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);

    // Create new staff member
    const newStaff = this.userRepository.create({
      ...createStaffDto,
      password: hashedPassword,
      restaurantId: currentUser.restaurantId || createStaffDto.restaurantId,
      status: UserStatus.ACTIVE
    });

    const savedStaff = await this.userRepository.save(newStaff);
    
    // Return without password - handle both single object and array cases
    const staffToReturn = Array.isArray(savedStaff) ? savedStaff[0] : savedStaff;
    const { password, ...staffWithoutPassword } = staffToReturn as any;
    return staffWithoutPassword;
  }

  async update(id: number, updateStaffDto: any, currentUser: any) {
    const existingStaff = await this.findById(id);
    
    // Check permissions
    if (currentUser.role === UserRole.ADMIN && existingStaff.restaurantId !== currentUser.restaurantId) {
      throw new BadRequestException('You can only update staff from your restaurant');
    }

    // If updating role, validate permissions
    if (updateStaffDto.role && updateStaffDto.role !== existingStaff.role) {
      const allowedRoles = this.getAllowedRoles(currentUser.role);
      if (!allowedRoles.includes(updateStaffDto.role)) {
        throw new BadRequestException(`You can only assign roles: ${allowedRoles.join(', ')}`);
      }
    }

    // Hash password if provided
    if (updateStaffDto.password) {
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    const updatedStaff = this.userRepository.merge(existingStaff, updateStaffDto);
    const savedStaff = await this.userRepository.save(updatedStaff);
    
    // Return without password - handle both single object and array cases
    const staffToReturn = Array.isArray(savedStaff) ? savedStaff[0] : savedStaff;
    const { password, ...staffWithoutPassword } = staffToReturn as any;
    return staffWithoutPassword;
  }

  async delete(id: number, currentUser: any) {
    const staff = await this.findById(id);
    
    // Check permissions
    if (currentUser.role === UserRole.ADMIN && staff.restaurantId !== currentUser.restaurantId) {
      throw new BadRequestException('You can only delete staff from your restaurant');
    }

    // Don't allow deleting yourself
    if (staff.id === currentUser.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.userRepository.remove(staff);
    return { message: 'Staff member deleted successfully' };
  }

  async findByRestaurant(restaurantId: number) {
    const staff = await this.userRepository.find({
      where: { 
        restaurantId,
        role: In([UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER])
      },
      order: { createdAt: 'DESC' }
    });

    return { staff };
  }

  async getStats(query: any) {
    const { restaurantId } = query;
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    
    if (restaurantId) {
      queryBuilder.andWhere('user.restaurantId = :restaurantId', { restaurantId: parseInt(restaurantId) });
    }

    // Only count staff roles (exclude super_admin and admin)
    queryBuilder.andWhere('user.role IN (:...roles)', { 
      roles: [UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER] 
    });

    const staff = await queryBuilder.getMany();

    const stats = {
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.status === UserStatus.ACTIVE).length,
      chefs: staff.filter(s => s.role === UserRole.CHEF).length,
      waiters: staff.filter(s => s.role === UserRole.WAITER).length,
      managers: staff.filter(s => s.role === UserRole.MANAGER).length,
      onLeave: staff.filter(s => s.status === UserStatus.ON_LEAVE).length,
      inactive: staff.filter(s => s.status === UserStatus.INACTIVE).length
    };

    return stats;
  }

  private getAllowedRoles(currentUserRole: string): string[] {
    switch (currentUserRole) {
      case UserRole.SUPER_ADMIN:
        return [UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER];
      case UserRole.ADMIN:
        return [UserRole.MANAGER, UserRole.CHEF, UserRole.WAITER];
      case UserRole.MANAGER:
        return [UserRole.CHEF, UserRole.WAITER];
      default:
        return [];
    }
  }

  async getRoleOptions(currentUserRole: string): Promise<{ value: string; label: string }[]> {
    const allowedRoles = this.getAllowedRoles(currentUserRole);
    
    const roleLabels = {
      [UserRole.ADMIN]: 'Restaurant Owner',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.CHEF]: 'Chef',
      [UserRole.WAITER]: 'Waiter'
    };

    return allowedRoles.map(role => ({
      value: role,
      label: roleLabels[role] || role
    }));
  }
} 
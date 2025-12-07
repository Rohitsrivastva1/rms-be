import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../common/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      this.logger.warn('No user found in request');
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role;
    const userRoleString = String(userRole).toLowerCase();
    
    // Log for debugging
    this.logger.debug(`Checking access - User role: ${userRole} (${typeof userRole}), Required roles: ${requiredRoles.join(', ')}`);
    
    // Compare roles (case-insensitive string comparison)
    const hasAccess = requiredRoles.some((role) => {
      const roleString = String(role).toLowerCase();
      const matches = userRoleString === roleString;
      this.logger.debug(`Comparing: "${userRoleString}" === "${roleString}" = ${matches}`);
      return matches;
    });
    
    if (!hasAccess) {
      this.logger.warn(`Access denied. User role: "${userRole}" (type: ${typeof userRole}), Required roles: ${requiredRoles.map(r => String(r)).join(', ')}`);
      throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
    }

    this.logger.debug(`Access granted for role: ${userRole}`);
    return true;
  }
} 
import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get menu categories' })
  @ApiResponse({ status: 200, description: 'Menu categories retrieved successfully' })
  async getCategories() {
    return this.menuService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Get menu items (public)' })
  @ApiResponse({ status: 200, description: 'Menu items retrieved successfully' })
  async getMenuItems(@Query() query: any) {
    return this.menuService.findAll(query);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get menu items (admin)' })
  @ApiResponse({ status: 200, description: 'Menu items retrieved successfully' })
  async getAdminMenuItems(@Query() query: any) {
    return this.menuService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({ status: 200, description: 'Menu item retrieved successfully' })
  async getMenuItemById(@Param('id') id: number) {
    return this.menuService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create menu item' })
  @ApiResponse({ status: 201, description: 'Menu item created successfully' })
  async createMenuItem(@Body() createMenuItemDto: any) {
    return this.menuService.create(createMenuItemDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({ status: 200, description: 'Menu item updated successfully' })
  async updateMenuItem(@Param('id') id: number, @Body() updateMenuItemDto: any) {
    return this.menuService.update(id, updateMenuItemDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiResponse({ status: 200, description: 'Menu item deleted successfully' })
  async deleteMenuItem(@Param('id') id: number) {
    return this.menuService.delete(id);
  }

  @Put(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle menu item availability' })
  @ApiResponse({ status: 200, description: 'Availability toggled successfully' })
  async toggleAvailability(@Param('id') id: number) {
    return this.menuService.toggleAvailability(id);
  }
} 
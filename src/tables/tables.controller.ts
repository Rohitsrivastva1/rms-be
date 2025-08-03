import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Tables')
@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get tables by restaurant' })
  @ApiResponse({ status: 200, description: 'Tables retrieved successfully' })
  async getTables(@Query() query: any) {
    return this.tablesService.findByRestaurant(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiResponse({ status: 200, description: 'Table retrieved successfully' })
  async getTableById(@Param('id') id: number) {
    return this.tablesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new table' })
  @ApiResponse({ status: 201, description: 'Table created successfully' })
  async createTable(@Body() createTableDto: any) {
    return this.tablesService.create(createTableDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update table' })
  @ApiResponse({ status: 200, description: 'Table updated successfully' })
  async updateTable(@Param('id') id: number, @Body() updateTableDto: any) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete table' })
  @ApiResponse({ status: 200, description: 'Table deleted successfully' })
  async deleteTable(@Param('id') id: number) {
    return this.tablesService.delete(id);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update table status' })
  @ApiResponse({ status: 200, description: 'Table status updated successfully' })
  async updateTableStatus(@Param('id') id: number, @Body() updateStatusDto: any) {
    return this.tablesService.updateStatus(id, updateStatusDto);
  }

  @Get(':id/qr-code')
  @ApiOperation({ summary: 'Generate QR code for table' })
  @ApiResponse({ status: 200, description: 'QR code generated successfully' })
  async generateQRCode(@Param('id') id: number) {
    return this.tablesService.generateQRCode(id);
  }

  @Get('qr/:tableNumber')
  @ApiOperation({ summary: 'Get QR code by table number' })
  @ApiResponse({ status: 200, description: 'QR code retrieved successfully' })
  async getQRCode(@Param('tableNumber') tableNumber: string) {
    return this.tablesService.getQRCode(tableNumber);
  }
} 
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem, MenuCategory } from '../common/entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuRepository: Repository<MenuItem>,
  ) {}

  async getCategories() {
    return {
      categories: Object.values(MenuCategory).map(category => ({
        value: category,
        label: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    };
  }

  async findAll(query: any) {
    const { category, search, available, restaurantId } = query;
    
    const queryBuilder = this.menuRepository.createQueryBuilder('menu');

    if (restaurantId) {
      queryBuilder.andWhere('menu.restaurantId = :restaurantId', { restaurantId });
    }

    if (category && category !== 'all') {
      queryBuilder.andWhere('menu.category = :category', { category });
    }

    if (search) {
      queryBuilder.andWhere(
        'menu.name ILIKE :search OR menu.description ILIKE :search',
        { search: `%${search}%` }
      );
    }

    if (available !== undefined) {
      queryBuilder.andWhere('menu.available = :available', { available: available === 'true' });
    }

    const items = await queryBuilder.getMany();
    return { items };
  }

  async findById(id: number) {
    const item = await this.menuRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return item;
  }

  async create(createMenuItemDto: any) {
    const menuItem = this.menuRepository.create(createMenuItemDto);
    return this.menuRepository.save(menuItem);
  }

  async update(id: number, updateMenuItemDto: any) {
    const menuItem = await this.findById(id);
    Object.assign(menuItem, updateMenuItemDto);
    return this.menuRepository.save(menuItem);
  }

  async delete(id: number) {
    const menuItem = await this.findById(id);
    await this.menuRepository.remove(menuItem);
    return { message: 'Menu item deleted successfully' };
  }

  async toggleAvailability(id: number) {
    const menuItem = await this.findById(id);
    menuItem.available = !menuItem.available;
    return this.menuRepository.save(menuItem);
  }

  async getMenuByRestaurant(restaurantId: number) {
    const items = await this.menuRepository.find({
      where: { restaurantId, available: true },
      order: { category: 'ASC', name: 'ASC' }
    });

    // Group by category
    const menuByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    return {
      restaurant: {
        name: 'Demo Restaurant', // This should come from restaurant service
        logo: 'https://via.placeholder.com/150',
        description: 'Authentic Indian Cuisine'
      },
      menu: menuByCategory
    };
  }
} 
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
    
    try {
      // Build where conditions
      const where: any = {};
      
      if (restaurantId) {
        where.restaurantId = parseInt(restaurantId);
      }

      if (available !== undefined) {
        where.available = available === 'true' || available === true;
      }

      // Find items - don't order by category since it might not exist in DB
      let items = await this.menuRepository.find({
        where,
        order: { name: 'ASC' }
      });

      // Filter by category in memory if provided
      if (category && category !== 'all') {
        items = items.filter(item => {
          // Check if item has category property (enum) or category relation
          if (item.category) {
            // If it's an enum value, compare directly
            if (typeof item.category === 'string') {
              return item.category === category;
            }
            // If it's a relation object, check the name
            if (item.category && typeof item.category === 'object' && 'name' in item.category) {
              return item.category.name === category;
            }
          }
          return false;
        });
      }

      // Apply search filter in memory
      if (search) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
        );
      }

      return { items };
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // If error is about category column not existing, use raw query
      if (error.message && (error.message.includes('category') || error.message.includes('42703'))) {
        console.log('Category column not found, using fallback query');
        const where: any = {};
        if (restaurantId) {
          where.restaurantId = parseInt(restaurantId);
        }
        if (available !== undefined) {
          where.available = available === 'true' || available === true;
        }
        
        // Use query builder to select only columns that exist
        const queryBuilder = this.menuRepository.createQueryBuilder('menu');
        
        if (restaurantId) {
          queryBuilder.where('menu.restaurant_id = :restaurantId', { restaurantId: parseInt(restaurantId) });
        }
        
        if (available !== undefined) {
          queryBuilder.andWhere('menu.available = :available', { 
            available: available === 'true' || available === true 
          });
        }
        
        // Select only columns that definitely exist (exclude category)
        queryBuilder.select([
          'menu.id',
          'menu.name',
          'menu.description',
          'menu.price',
          'menu.available',
          'menu.veg',
          'menu.spicy_level',
          'menu.ingredients',
          'menu.image',
          'menu.rating',
          'menu.order_count',
          'menu.popular',
          'menu.restaurant_id',
          'menu.created_at',
          'menu.updated_at'
        ]);
        
        queryBuilder.orderBy('menu.name', 'ASC');
        
        let items = await queryBuilder.getMany();
        
        // Apply filters in memory
        if (category && category !== 'all') {
          // Skip category filtering if column doesn't exist
          console.log('Category filtering skipped - column does not exist in database');
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          items = items.filter(item => 
            item.name.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
          );
        }

        return { items };
      }
      throw error;
    }
  }

  async findById(id: number) {
    const item = await this.menuRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Menu item not found');
    }
    return item;
  }

  async create(createMenuItemDto: any) {
    console.log('Received createMenuItemDto:', createMenuItemDto);
    
    // Validate category
    const validCategories = Object.values(MenuCategory);
    if (!validCategories.includes(createMenuItemDto.category)) {
      throw new Error(`Invalid category: ${createMenuItemDto.category}. Valid categories are: ${validCategories.join(', ')}`);
    }
    
    const newItem = this.menuRepository.create({
      ...createMenuItemDto,
      image: createMenuItemDto.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop&crop=center',
    });
    
    console.log('Creating menu item with data:', newItem);
    const savedItem = await this.menuRepository.save(newItem);
    console.log('Created menu item:', savedItem);
    return savedItem;
  }

  async update(id: number, updateMenuItemDto: any) {
    const existingItem = await this.findById(id);
    const updatedItem = this.menuRepository.merge(existingItem, updateMenuItemDto);
    const savedItem = await this.menuRepository.save(updatedItem);
    
    console.log('Updating menu item:', savedItem);
    return savedItem;
  }

  async delete(id: number) {
    const menuItem = await this.findById(id);
    await this.menuRepository.remove(menuItem);
    console.log('Deleting menu item:', menuItem);
    return { message: 'Menu item deleted successfully' };
  }

  async toggleAvailability(id: number) {
    const menuItem = await this.findById(id);
    menuItem.available = !menuItem.available;
    
    const savedItem = await this.menuRepository.save(menuItem);
    console.log('Toggling availability for menu item:', savedItem);
    return savedItem;
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
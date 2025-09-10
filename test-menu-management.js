const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMenuManagement() {
  try {
    console.log('🧪 Testing Menu Management API...\n');

    // 1. Login as cart owner
    console.log('1. Logging in as cart owner...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User ID:', user.id);

    // 2. Get cart ID (assuming cart ID 7 from previous test)
    const cartId = 7;
    console.log(`\n2. Testing menu management for cart ID: ${cartId}`);

    // 3. Test Categories API
    console.log('\n3. Testing Categories API...');
    
    // Get categories
    console.log('   Getting categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Categories fetched:', categoriesResponse.data);

    // Create a category
    console.log('   Creating a category...');
    const createCategoryResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      name: 'Main Dishes',
      description: 'Delicious main course items',
      sortOrder: 1,
      isActive: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Category created:', createCategoryResponse.data);
    const categoryId = createCategoryResponse.data.id;

    // 4. Test Menu Items API
    console.log('\n4. Testing Menu Items API...');
    
    // Get menu items
    console.log('   Getting menu items...');
    const itemsResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Menu items fetched:', itemsResponse.data);

    // Create a menu item
    console.log('   Creating a menu item...');
    const createItemResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
      name: 'Chicken Burger',
      description: 'Juicy chicken burger with fresh vegetables',
      price: 12.99,
      categoryId: categoryId,
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      preparationTime: 15,
      sortOrder: 1
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Menu item created:', createItemResponse.data);
    const itemId = createItemResponse.data.id;

    // 5. Test Update Operations
    console.log('\n5. Testing Update Operations...');
    
    // Update category
    console.log('   Updating category...');
    const updateCategoryResponse = await axios.put(`${BASE_URL}/cart/owner/carts/${cartId}/categories/${categoryId}`, {
      name: 'Main Courses',
      description: 'Updated description for main courses'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Category updated:', updateCategoryResponse.data);

    // Update menu item
    console.log('   Updating menu item...');
    const updateItemResponse = await axios.put(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items/${itemId}`, {
      name: 'Premium Chicken Burger',
      price: 14.99,
      isSpicy: true
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Menu item updated:', updateItemResponse.data);

    // 6. Test Delete Operations
    console.log('\n6. Testing Delete Operations...');
    
    // Delete menu item
    console.log('   Deleting menu item...');
    const deleteItemResponse = await axios.delete(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items/${itemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Menu item deleted:', deleteItemResponse.data);

    // Delete category
    console.log('   Deleting category...');
    const deleteCategoryResponse = await axios.delete(`${BASE_URL}/cart/owner/carts/${cartId}/categories/${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('   ✅ Category deleted:', deleteCategoryResponse.data);

    console.log('\n🎉 All menu management tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMenuManagement();

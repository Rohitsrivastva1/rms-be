const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing Complete Cart Owner Workflow...\n');

    // 1. Login as cart owner
    console.log('1. Logging in as cart owner...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token, user } = loginResponse.data;
    console.log('✅ Login successful');
    console.log('User:', user.name, '(' + user.role + ')');

    // 2. Get cart owner's carts
    console.log('\n2. Getting cart owner\'s carts...');
    const cartsResponse = await axios.get(`${BASE_URL}/cart/owner/carts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Carts found:', cartsResponse.data.carts.length);
    
    if (cartsResponse.data.carts.length === 0) {
      console.log('No carts found, creating one...');
      const createCartResponse = await axios.post(`${BASE_URL}/cart/owner/carts`, {
        name: 'Test Cart',
        description: 'Test cart for workflow',
        location: 'Test Location',
        theme: 'modern'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Cart created:', createCartResponse.data.name);
      var cartId = createCartResponse.data.id;
    } else {
      var cartId = cartsResponse.data.carts[0].id;
      console.log('Using existing cart ID:', cartId);
    }

    // 3. Test Categories Management
    console.log('\n3. Testing Categories Management...');
    
    // Create a category
    const categoryResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
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
    console.log('✅ Category created:', categoryResponse.data.name);
    const categoryId = categoryResponse.data.id;

    // Get categories
    const categoriesResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Categories retrieved:', categoriesResponse.data.categories.length);

    // 4. Test Menu Items Management
    console.log('\n4. Testing Menu Items Management...');
    
    // Create a menu item
    const itemResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
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
    console.log('✅ Menu item created:', itemResponse.data.name);

    // Get menu items
    const itemsResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Menu items retrieved:', itemsResponse.data.menuItems.length);

    // 5. Test Bulk Import
    console.log('\n5. Testing Bulk Import...');
    const bulkImportData = [
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing',
        price: 8.99,
        categoryName: 'Salads',
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 10,
        sortOrder: 1
      },
      {
        name: 'Beef Steak',
        description: 'Grilled beef steak with herbs',
        price: 24.99,
        categoryName: 'Main Dishes',
        isAvailable: true,
        isVegetarian: false,
        isSpicy: false,
        preparationTime: 25,
        sortOrder: 2
      }
    ];

    const bulkResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items/bulk-import`, {
      items: bulkImportData
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Bulk import completed:', bulkResponse.data.imported, 'items imported');

    // 6. Final verification
    console.log('\n6. Final verification...');
    const finalItemsResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Total menu items:', finalItemsResponse.data.menuItems.length);

    const finalCategoriesResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Total categories:', finalCategoriesResponse.data.categories.length);

    console.log('\n🎉 Complete Cart Owner Workflow Test Passed!');
    console.log('\nSummary:');
    console.log('- ✅ Cart Owner Authentication');
    console.log('- ✅ Cart Management (Create/List)');
    console.log('- ✅ Category Management (Create/List)');
    console.log('- ✅ Menu Item Management (Create/List)');
    console.log('- ✅ Bulk Import Functionality');
    console.log('- ✅ Data Integrity Verification');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCompleteWorkflow();

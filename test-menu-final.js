const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testMenuFinal() {
  try {
    console.log('🧪 Testing Menu Item Creation (Final)...\n');

    // 1. Login as cart owner
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful');

    const cartId = 7;

    // 2. Get existing categories
    console.log('\n2. Getting existing categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Categories:', categoriesResponse.data.categories.length, 'found');
    
    if (categoriesResponse.data.categories.length > 0) {
      const categoryId = categoriesResponse.data.categories[0].id;
      console.log('Using category ID:', categoryId);

      // 3. Create a menu item
      console.log('\n3. Creating menu item...');
      const itemResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
        name: "Test Item",
        description: "Test description",
        price: 10.99,
        categoryId: categoryId,
        isAvailable: true,
        isVegetarian: false,
        isSpicy: false,
        preparationTime: 10,
        sortOrder: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Menu item created successfully:', itemResponse.data.name);
      console.log('Item ID:', itemResponse.data.id);
    } else {
      console.log('No categories found, creating one first...');
      const categoryResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/categories`, {
        name: 'Test Category',
        description: 'Test description',
        sortOrder: 1,
        isActive: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Category created:', categoryResponse.data.name);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMenuFinal();

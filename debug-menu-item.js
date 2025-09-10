const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function debugMenuItem() {
  try {
    console.log('🧪 Debugging Menu Item Creation...\n');

    // 1. Login as cart owner
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john.cart@example.com',
      password: 'cartowner123'
    });

    const { token } = loginResponse.data;
    console.log('✅ Login successful');

    const cartId = 7;

    // 2. Get existing categories first
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

      // 3. Try to create a menu item with the exact data from your request
      console.log('\n3. Creating menu item with your exact data...');
      const itemResponse = await axios.post(`${BASE_URL}/cart/owner/carts/${cartId}/menu-items`, {
        name: "Rohit Srivastava",
        description: " dff f",
        price: 242,
        categoryId: categoryId.toString(),
        imageUrl: "https://cdn.britannica.com/36/123536-050-95CB0C6E/Variety-fruits-vegetables.jpg",
        isAvailable: true,
        isVegetarian: true,
        isSpicy: false,
        preparationTime: 3,
        sortOrder: 0
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Menu item created:', itemResponse.data.name);
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
    console.error('❌ Full error response:', JSON.stringify(error.response?.data, null, 2));
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error message:', error.message);
  }
}

debugMenuItem();

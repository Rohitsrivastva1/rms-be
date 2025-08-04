const axios = require('axios');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('Testing API endpoints...');
    
    // Test menu categories endpoint
    console.log('\n1. Testing menu categories...');
    const categoriesResponse = await axios.get(`${baseURL}/menu/categories`);
    console.log('Categories response:', categoriesResponse.data);
    
    // Test menu items endpoint
    console.log('\n2. Testing menu items...');
    const menuResponse = await axios.get(`${baseURL}/menu?restaurantId=1`);
    console.log('Menu response:', menuResponse.data);
    
    // Test creating a menu item
    console.log('\n3. Testing create menu item...');
    const newItem = {
      name: 'Test Item',
      description: 'Test description',
      category: 'main_course',
      price: 100,
      veg: false,
      spicyLevel: 1,
      restaurantId: 1
    };
    
    const createResponse = await axios.post(`${baseURL}/menu`, newItem);
    console.log('Create response:', createResponse.data);
    
    // Test getting the created item
    console.log('\n4. Testing get created item...');
    const getResponse = await axios.get(`${baseURL}/menu/${createResponse.data.id}`);
    console.log('Get response:', getResponse.data);
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI(); 
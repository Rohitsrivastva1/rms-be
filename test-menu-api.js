const axios = require('axios');

async function testMenuAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Menu API...\n');

    // Test menu endpoint with restaurantId
    console.log('1️⃣ Testing menu endpoint...');
    const menuResponse = await axios.get(`${baseURL}/menu?restaurantId=1`);
    console.log('✅ Menu response:', menuResponse.data);

    // Test menu endpoint without restaurantId
    console.log('\n2️⃣ Testing menu endpoint without restaurantId...');
    try {
      const menuResponse2 = await axios.get(`${baseURL}/menu`);
      console.log('✅ Menu response (no restaurantId):', menuResponse2.data);
    } catch (error) {
      console.log('❌ Menu without restaurantId failed:', error.response?.data || error.message);
    }

    // Test menu items endpoint
    console.log('\n3️⃣ Testing menu items endpoint...');
    try {
      const menuItemsResponse = await axios.get(`${baseURL}/menu/items?restaurantId=1`);
      console.log('✅ Menu items response:', menuItemsResponse.data);
    } catch (error) {
      console.log('❌ Menu items failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Menu API test completed!');
    
  } catch (error) {
    console.error('❌ Menu API test failed:', error.response?.data || error.message);
  }
}

testMenuAPI(); 
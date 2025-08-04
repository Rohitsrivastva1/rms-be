const axios = require('axios');

async function testMenuAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Menu API...\n');

    // Test menu endpoint without authentication
    console.log('1️⃣ Testing GET /menu?restaurantId=1...');
    const response = await axios.get(`${baseURL}/menu?restaurantId=1`);
    console.log('✅ Menu API response:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));

    // Test menu endpoint without restaurantId
    console.log('\n2️⃣ Testing GET /menu (without restaurantId)...');
    const response2 = await axios.get(`${baseURL}/menu`);
    console.log('✅ Menu API response (no restaurantId):', response2.status);
    console.log('📊 Response data:', JSON.stringify(response2.data, null, 2));

    console.log('\n🎉 Menu API test completed!');
    
  } catch (error) {
    console.error('❌ Menu API test failed:', error.response?.data || error.message);
    console.error('🔍 Full error:', error);
  }
}

testMenuAPI(); 
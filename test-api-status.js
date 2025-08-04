const axios = require('axios');

async function testAPIStatus() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing API Status...\n');

    // Test basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    try {
      const response = await axios.get(`${baseURL}/health`);
      console.log('✅ Health check:', response.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }

    // Test menu endpoint (public)
    console.log('\n2️⃣ Testing menu endpoint...');
    try {
      const response = await axios.get(`${baseURL}/menu?restaurantId=1`);
      console.log('✅ Menu API:', response.status);
      console.log('📊 Response data:', response.data);
    } catch (error) {
      console.log('❌ Menu API failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test auth endpoint
    console.log('\n3️⃣ Testing auth endpoint...');
    try {
      const response = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@restaurant.com',
        password: 'password123'
      });
      console.log('✅ Auth API:', response.status);
      console.log('🔑 Token received:', !!response.data.token);
    } catch (error) {
      console.log('❌ Auth API failed:', error.response?.status, error.response?.data || error.message);
    }

    // Test staff endpoint with auth
    console.log('\n4️⃣ Testing staff endpoint with auth...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: 'admin@restaurant.com',
        password: 'password123'
      });
      
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      const staffResponse = await axios.get(`${baseURL}/staff?restaurantId=1`, { headers });
      console.log('✅ Staff API:', staffResponse.status);
      console.log('📊 Staff data:', staffResponse.data);
    } catch (error) {
      console.log('❌ Staff API failed:', error.response?.status, error.response?.data || error.message);
    }

    console.log('\n🎉 API status test completed!');
    
  } catch (error) {
    console.error('❌ API status test failed:', error.message);
  }
}

testAPIStatus(); 
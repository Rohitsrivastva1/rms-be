const axios = require('axios');

async function testStaffStats() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Staff Stats Endpoint...\n');

    // 1. Login as restaurant owner
    console.log('1️⃣ Logging in as restaurant owner...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful');

    // 2. Test staff stats endpoint
    console.log('\n2️⃣ Testing staff stats endpoint...');
    try {
      const statsResponse = await axios.get(`${baseURL}/staff/stats?restaurantId=1`, { headers });
      console.log('✅ Staff stats response:', statsResponse.status);
      console.log('📊 Stats data:', statsResponse.data);
    } catch (error) {
      console.log('❌ Staff stats failed:', error.response?.status || error.message);
      console.log('🔍 Error details:', error.response?.data || error.message);
    }

    // 3. Test staff list endpoint
    console.log('\n3️⃣ Testing staff list endpoint...');
    try {
      const staffResponse = await axios.get(`${baseURL}/staff?restaurantId=1`, { headers });
      console.log('✅ Staff list response:', staffResponse.status);
      console.log('📊 Staff data:', staffResponse.data);
    } catch (error) {
      console.log('❌ Staff list failed:', error.response?.status || error.message);
    }

    console.log('\n🎉 Staff endpoints test completed!');
    
  } catch (error) {
    console.error('❌ Staff test failed:', error.response?.data || error.message);
  }
}

testStaffStats(); 
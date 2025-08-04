const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testWaiterLogin() {
  try {
    console.log('🧪 Testing Waiter Login...\n');

    // Test waiter login
    const waiterCredentials = {
      email: 'rohitsrivast1va.app@gmail.com',
      password: '1234567890',
      role: 'waiter'
    };

    console.log('📝 Attempting waiter login with:', waiterCredentials.email);
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, waiterCredentials);
    
    console.log('✅ Waiter login successful!');
    console.log('📊 Response:', {
      status: loginResponse.status,
      user: {
        id: loginResponse.data.user.id,
        name: loginResponse.data.user.name,
        email: loginResponse.data.user.email,
        role: loginResponse.data.user.role,
        restaurantId: loginResponse.data.user.restaurantId
      },
      token: loginResponse.data.token ? 'Present' : 'Missing'
    });

    // Test accessing profile with waiter token
    const token = loginResponse.data.token;
    console.log('\n🔐 Testing profile access with waiter token...');
    
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile access successful!');
    console.log('📊 Profile data:', {
      id: profileResponse.data.id,
      name: profileResponse.data.name,
      email: profileResponse.data.email,
      role: profileResponse.data.role,
      restaurantId: profileResponse.data.restaurantId
    });

    // Test waiter-specific endpoints
    console.log('\n🍽️ Testing waiter-specific endpoints...');
    
    // Test orders endpoint (waiters should be able to view orders)
    const ordersResponse = await axios.get(`${BASE_URL}/orders?restaurantId=1`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Orders access successful!');
    console.log('📊 Orders count:', ordersResponse.data.orders?.length || 0);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('📊 Status:', error.response?.status);
  }
}

testWaiterLogin(); 
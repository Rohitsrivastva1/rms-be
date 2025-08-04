const axios = require('axios');

async function testChefOrders() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Chef Orders Access...\n');

    // 1. Login as chef
    console.log('1️⃣ Logging in as chef...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'rohitsrivastv1a.app@gmail.com',
      password: '1234567890',  // Updated password from the logs
      role: 'chef'
    });

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Chef login successful');
    console.log('👤 Chef role:', loginResponse.data.user.role);

    // 2. Test general orders endpoint
    console.log('\n2️⃣ Testing general orders endpoint...');
    try {
      const ordersResponse = await axios.get(`${baseURL}/orders?restaurantId=1&status[]=received&status[]=in_progress&status[]=ready`, { headers });
      console.log('✅ General orders response:', ordersResponse.status);
      console.log('📊 Orders data:', ordersResponse.data);
    } catch (error) {
      console.log('❌ General orders failed:', error.response?.status || error.message);
      console.log('🔍 Error details:', error.response?.data || error.message);
    }

    // 3. Test chef-specific orders endpoint
    console.log('\n3️⃣ Testing chef-specific orders endpoint...');
    try {
      const chefOrdersResponse = await axios.get(`${baseURL}/orders/chef?restaurantId=1`, { headers });
      console.log('✅ Chef orders response:', chefOrdersResponse.status);
      console.log('📊 Chef orders data:', chefOrdersResponse.data);
    } catch (error) {
      console.log('❌ Chef orders failed:', error.response?.status || error.message);
      console.log('🔍 Error details:', error.response?.data || error.message);
    }

    // 4. Test order status update (chef should be able to update status)
    console.log('\n4️⃣ Testing order status update...');
    try {
      const updateResponse = await axios.put(`${baseURL}/orders/1/status`, {
        status: 'in_progress'
      }, { headers });
      console.log('✅ Status update response:', updateResponse.status);
      console.log('📊 Update data:', updateResponse.data);
    } catch (error) {
      console.log('❌ Status update failed:', error.response?.status || error.message);
      console.log('🔍 Error details:', error.response?.data || error.message);
    }

    console.log('\n🎉 Chef orders test completed!');
    
  } catch (error) {
    console.error('❌ Chef orders test failed:', error.response?.data || error.message);
  }
}

testChefOrders(); 
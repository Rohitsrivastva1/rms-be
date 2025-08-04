const axios = require('axios');

async function testOrderStatusDirect() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Order Status Directly...\n');

    // Test with a known order ID
    console.log('1️⃣ Testing with order ID 10...');
    try {
      const response = await axios.get(`${baseURL}/orders/customer/10/status`);
      console.log('✅ Order status response:', response.data);
    } catch (error) {
      console.log('❌ Order 10 not found:', error.response?.data || error.message);
    }

    // Test with order ID 9
    console.log('\n2️⃣ Testing with order ID 9...');
    try {
      const response = await axios.get(`${baseURL}/orders/customer/9/status`);
      console.log('✅ Order status response:', response.data);
    } catch (error) {
      console.log('❌ Order 9 not found:', error.response?.data || error.message);
    }

    // Test with order ID 8
    console.log('\n3️⃣ Testing with order ID 8...');
    try {
      const response = await axios.get(`${baseURL}/orders/customer/8/status`);
      console.log('✅ Order status response:', response.data);
    } catch (error) {
      console.log('❌ Order 8 not found:', error.response?.data || error.message);
    }

    // Test the endpoint structure
    console.log('\n4️⃣ Testing endpoint structure...');
    try {
      const response = await axios.get(`${baseURL}/orders`);
      console.log('✅ Orders endpoint accessible');
    } catch (error) {
      console.log('❌ Orders endpoint failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Direct order status test completed!');
    
  } catch (error) {
    console.error('❌ Direct order status test failed:', error.response?.data || error.message);
  }
}

testOrderStatusDirect(); 
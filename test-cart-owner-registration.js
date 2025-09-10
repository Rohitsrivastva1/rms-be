const axios = require('axios');

async function testCartOwnerRegistration() {
  try {
    console.log('🧪 Testing Cart Owner Registration API...\n');

    // Test data
    const cartOwnerData = {
      name: 'John Cart Owner',
      email: 'john.cart@example.com',
      password: 'cartowner123',
      phone: '+91 98765 43210',
      businessName: 'John\'s Food Cart',
      businessType: 'Street Food',
      address: '123 Main Street, Mumbai'
    };

    console.log('1. Testing Cart Owner Registration...');
    console.log('Data:', JSON.stringify(cartOwnerData, null, 2));

    const response = await axios.post('http://localhost:3000/auth/register-cart-owner', cartOwnerData);

    console.log('✅ SUCCESS! Cart Owner registered successfully!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Test login with the new cart owner
    console.log('\n2. Testing Cart Owner Login...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: cartOwnerData.email,
      password: cartOwnerData.password
    });

    console.log('✅ SUCCESS! Cart Owner login successful!');
    console.log('Login Response:', JSON.stringify(loginResponse.data, null, 2));

    // Test protected endpoint with cart owner token
    console.log('\n3. Testing Cart Owner Dashboard Access...');
    const token = loginResponse.data.token;
    
    try {
      const dashboardResponse = await axios.get('http://localhost:3000/cart/owner/carts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ SUCCESS! Cart Owner can access dashboard!');
      console.log('Dashboard Response:', JSON.stringify(dashboardResponse.data, null, 2));
    } catch (dashboardError) {
      console.log('⚠️ Dashboard access test failed (this might be expected if no carts exist)');
      console.log('Dashboard Error:', dashboardError.response?.data || dashboardError.message);
    }

  } catch (error) {
    console.error('❌ ERROR:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('Full Error:', error.message);
  }
}

// Run the test
testCartOwnerRegistration();

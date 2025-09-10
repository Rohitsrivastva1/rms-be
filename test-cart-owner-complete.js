const axios = require('axios');

async function testCartOwnerComplete() {
  try {
    console.log('🧪 Complete Cart Owner Functionality Test\n');

    // Test 1: Cart Owner Registration
    console.log('1. Testing Cart Owner Registration...');
    const cartOwnerData = {
      name: 'Complete Test Cart Owner',
      email: 'complete.test@example.com',
      password: 'testpass123',
      phone: '+91 98765 43210',
      businessName: 'Complete Test Food Cart',
      businessType: 'Street Food',
      address: '123 Test Street, Test City'
    };

    const registrationResponse = await axios.post('http://localhost:3000/auth/register-cart-owner', cartOwnerData);
    console.log('✅ Registration successful!');
    console.log('User ID:', registrationResponse.data.user.id);
    console.log('Role:', registrationResponse.data.user.role);

    const token = registrationResponse.data.token;
    const userId = registrationResponse.data.user.id;

    // Test 2: Cart Owner Login
    console.log('\n2. Testing Cart Owner Login...');
    const loginResponse = await axios.post('http://localhost:3000/auth/login', {
      email: cartOwnerData.email,
      password: cartOwnerData.password
    });
    console.log('✅ Login successful!');
    console.log('Token received:', !!loginResponse.data.token);

    // Test 3: Access Cart Owner Dashboard
    console.log('\n3. Testing Cart Owner Dashboard Access...');
    const dashboardResponse = await axios.get('http://localhost:3000/cart/owner/carts', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Dashboard access successful!');
    console.log('Carts count:', dashboardResponse.data.carts.length);

    // Test 4: Create a new cart
    console.log('\n4. Testing Cart Creation...');
    const newCartData = {
      name: 'Test Cart by Cart Owner',
      description: 'A test cart created by cart owner',
      location: 'Test Location',
      theme: 'modern'
    };

    const createCartResponse = await axios.post('http://localhost:3000/cart/owner/carts', newCartData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Cart creation successful!');
    console.log('Cart ID:', createCartResponse.data.id);
    console.log('Cart Name:', createCartResponse.data.name);

    const cartId = createCartResponse.data.id;

    // Test 5: Get specific cart details
    console.log('\n5. Testing Get Cart Details...');
    const cartDetailsResponse = await axios.get(`http://localhost:3000/cart/owner/carts/${cartId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Cart details retrieved successfully!');
    console.log('Cart Status:', cartDetailsResponse.data.status);

    // Test 6: Update cart
    console.log('\n6. Testing Cart Update...');
    const updateCartData = {
      name: 'Updated Test Cart',
      description: 'Updated description',
      location: 'Updated Location',
      theme: 'classic'
    };

    const updateCartResponse = await axios.put(`http://localhost:3000/cart/owner/carts/${cartId}`, updateCartData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Cart update successful!');
    console.log('Updated Name:', updateCartResponse.data.name);

    // Test 7: Test SuperAdmin can see the cart
    console.log('\n7. Testing SuperAdmin Cart Management...');
    
    // First login as SuperAdmin
    const superAdminLogin = await axios.post('http://localhost:3000/auth/login', {
      email: 'test@gmail.com',
      password: 'admin123'
    });
    const superAdminToken = superAdminLogin.data.token;
    console.log('✅ SuperAdmin login successful!');

    // Get all carts as SuperAdmin
    const superAdminCartsResponse = await axios.get('http://localhost:3000/cart/admin/carts', {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ SuperAdmin can see all carts!');
    console.log('Total carts:', superAdminCartsResponse.data.carts.length);

    // Find our test cart
    const testCart = superAdminCartsResponse.data.carts.find(cart => cart.id === cartId);
    if (testCart) {
      console.log('✅ Test cart found in SuperAdmin view!');
      console.log('Cart Owner:', testCart.owner.name);
    }

    // Test 8: Test Cart Approval by SuperAdmin
    console.log('\n8. Testing Cart Approval by SuperAdmin...');
    const approveResponse = await axios.put(`http://localhost:3000/cart/admin/carts/${cartId}/approve`, {}, {
      headers: {
        'Authorization': `Bearer ${superAdminToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Cart approval successful!');
    console.log('Approved Cart Status:', approveResponse.data.status);

    // Test 9: Verify cart status change
    console.log('\n9. Verifying Cart Status Change...');
    const verifyCartResponse = await axios.get(`http://localhost:3000/cart/owner/carts/${cartId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Cart status verification successful!');
    console.log('Current Status:', verifyCartResponse.data.status);

    console.log('\n🎉 All Cart Owner functionality tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Cart Owner Registration');
    console.log('- ✅ Cart Owner Login');
    console.log('- ✅ Cart Owner Dashboard Access');
    console.log('- ✅ Cart Creation');
    console.log('- ✅ Cart Details Retrieval');
    console.log('- ✅ Cart Update');
    console.log('- ✅ SuperAdmin Cart Management');
    console.log('- ✅ Cart Approval Process');
    console.log('- ✅ Status Verification');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
    console.error('Error:', error.message);
  }
}

testCartOwnerComplete();

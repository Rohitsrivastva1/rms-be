const axios = require('axios');

async function testStaffIntegration() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Staff Management Integration...\n');

    // 1. Login as restaurant owner
    console.log('1️⃣ Logging in as restaurant owner...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'admin@restaurant.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Login successful');

    // 2. Test staff statistics
    console.log('\n2️⃣ Testing staff statistics...');
    const statsResponse = await axios.get(`${baseURL}/staff/stats?restaurantId=1`, { headers });
    console.log('📊 Staff stats:', statsResponse.data);

    // 3. Test role options
    console.log('\n3️⃣ Testing role options...');
    const roleResponse = await axios.get(`${baseURL}/staff/roles/options`, { headers });
    console.log('👥 Role options:', roleResponse.data);

    // 4. Test get all staff
    console.log('\n4️⃣ Testing get all staff...');
    const staffResponse = await axios.get(`${baseURL}/staff?restaurantId=1`, { headers });
    console.log('👨‍💼 Staff list:', staffResponse.data);

    // 5. Test create staff member
    console.log('\n5️⃣ Testing create staff member...');
    const newStaff = {
      name: 'Test Chef',
      email: 'test.chef@restaurant.com',
      phone: '+91 9876543210',
      password: 'password123',
      role: 'chef',
      status: 'active'
    };
    
    const createResponse = await axios.post(`${baseURL}/staff`, newStaff, { headers });
    console.log('✅ Staff created:', createResponse.data);

    // 6. Test update staff member
    console.log('\n6️⃣ Testing update staff member...');
    const staffId = createResponse.data.id;
    const updateData = {
      name: 'Updated Test Chef',
      status: 'active'
    };
    
    const updateResponse = await axios.put(`${baseURL}/staff/${staffId}`, updateData, { headers });
    console.log('✅ Staff updated:', updateResponse.data);

    // 7. Test delete staff member
    console.log('\n7️⃣ Testing delete staff member...');
    const deleteResponse = await axios.delete(`${baseURL}/staff/${staffId}`, { headers });
    console.log('✅ Staff deleted:', deleteResponse.data);

    console.log('\n🎉 Staff management integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Staff management test failed:', error.response?.data || error.message);
  }
}

testStaffIntegration(); 
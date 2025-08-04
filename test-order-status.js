const axios = require('axios');

async function testOrderStatus() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Order Status Updates...\n');

    // First, check existing orders
    console.log('1️⃣ Checking existing orders...');
    try {
      const ordersResponse = await axios.get(`${baseURL}/orders`);
      console.log('✅ Existing orders:', ordersResponse.data);
    } catch (error) {
      console.log('❌ Could not fetch orders:', error.response?.data || error.message);
    }

    // Create a test order
    console.log('\n2️⃣ Creating a test order...');
    const orderData = {
      tableNumber: 'T1',
      restaurantId: 1,
      items: [
        {
          menuItemId: 1,
          quantity: 2,
          unitPrice: 250,
          totalPrice: 500
        }
      ],
      totalAmount: 500,
      paymentMethod: 'cash'
    };

    const response = await axios.post(`${baseURL}/payments/cash-payment`, orderData);
    const orderId = response.data.order.id;
    console.log('✅ Order created:', orderId);

    // Wait a moment for the order to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test order status endpoint
    console.log('\n3️⃣ Testing order status endpoint...');
    const statusResponse = await axios.get(`${baseURL}/orders/customer/${orderId}/status`);
    console.log('✅ Order status:', statusResponse.data);

    console.log('\n🎉 Order status test completed!');
    console.log('📱 You can now test the order status UI in the frontend');
    
  } catch (error) {
    console.error('❌ Order status test failed:', error.response?.data || error.message);
  }
}

testOrderStatus(); 
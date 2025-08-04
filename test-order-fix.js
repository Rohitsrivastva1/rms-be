const axios = require('axios');

async function testOrderFix() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Order Placement with String Table Numbers...\n');

    // Test order data with string table number
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

    console.log('📝 Order Data:', orderData);

    // Test cash payment
    const response = await axios.post(`${baseURL}/payments/cash-payment`, orderData);
    console.log('✅ Order placed successfully:', response.data);

    console.log('\n🎉 Order placement test passed!');
    
  } catch (error) {
    console.error('❌ Order placement test failed:', error.response?.data || error.message);
  }
}

testOrderFix(); 
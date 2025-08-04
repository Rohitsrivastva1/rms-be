const axios = require('axios');

async function testPaymentAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('🧪 Testing Payment API...\n');

    // Test 1: Create cash payment order
    console.log('1️⃣ Testing Cash Payment Order...');
    const cashOrderData = {
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

    const cashResponse = await axios.post(`${baseURL}/payments/cash-payment`, cashOrderData);
    console.log('✅ Cash payment order created:', cashResponse.data);

    // Test 2: Create Razorpay order
    console.log('\n2️⃣ Testing Razorpay Order Creation...');
    const razorpayOrderData = {
      tableNumber: 'T2',
      restaurantId: 1,
      items: [
        {
          menuItemId: 2,
          quantity: 1,
          unitPrice: 350,
          totalPrice: 350
        }
      ],
      totalAmount: 350,
      paymentMethod: 'razorpay'
    };

    const razorpayResponse = await axios.post(`${baseURL}/payments/create-order`, razorpayOrderData);
    console.log('✅ Razorpay order created:', razorpayResponse.data);

    console.log('\n🎉 All payment API tests passed!');
    
  } catch (error) {
    console.error('❌ Payment API test failed:', error.response?.data || error.message);
  }
}

testPaymentAPI(); 
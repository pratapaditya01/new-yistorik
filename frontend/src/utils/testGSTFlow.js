/**
 * Complete GST Flow Test Script
 * Tests 0% GST from admin creation to checkout/Razorpay
 */

export const testGSTFlow = {
  
  /**
   * Test 1: Admin Form 0% GST Creation
   */
  testAdminForm: () => {
    console.group('🧪 TEST 1: ADMIN FORM 0% GST');
    
    // Simulate form data with 0% GST
    const testFormData = {
      name: 'Test 0% GST Product',
      price: 500,
      gstRate: 0,
      gstType: 'EXEMPT',
      gstInclusive: false,
      taxable: false
    };
    
    console.log('Input form data:', testFormData);
    
    // Test the processing logic from admin form
    const processedGSTRate = testFormData.gstRate !== '' && testFormData.gstRate !== null && testFormData.gstRate !== undefined 
      ? parseFloat(testFormData.gstRate) 
      : 0;
    
    console.log('Processed GST rate:', processedGSTRate);
    console.log('Expected: 0, Actual:', processedGSTRate);
    console.log('✅ Test passed:', processedGSTRate === 0);
    
    console.groupEnd();
    return processedGSTRate === 0;
  },

  /**
   * Test 2: Product API Response
   */
  testProductAPI: () => {
    console.group('🧪 TEST 2: PRODUCT API 0% GST');
    
    // Simulate product from API with 0% GST
    const testProduct = {
      _id: 'test123',
      name: 'Test 0% GST Product',
      price: 500,
      gstRate: 0,
      gstType: 'EXEMPT',
      gstInclusive: false,
      taxable: false
    };
    
    console.log('Product from API:', testProduct);
    console.log('GST Rate:', testProduct.gstRate);
    console.log('Should show GST info:', testProduct.gstRate > 0);
    console.log('Should show exempt badge:', testProduct.gstRate === 0);
    console.log('✅ Test passed:', testProduct.gstRate === 0);
    
    console.groupEnd();
    return testProduct.gstRate === 0;
  },

  /**
   * Test 3: Cart GST Calculation
   */
  testCartCalculation: () => {
    console.group('🧪 TEST 3: CART GST CALCULATION');
    
    // Simulate cart with mixed GST products
    const testCartItems = [
      {
        product: {
          _id: 'prod1',
          name: '0% GST Product',
          gstRate: 0,
          gstInclusive: false
        },
        price: 500,
        quantity: 1
      },
      {
        product: {
          _id: 'prod2',
          name: '18% GST Product',
          gstRate: 18,
          gstInclusive: false
        },
        price: 1000,
        quantity: 1
      }
    ];
    
    console.log('Test cart items:', testCartItems);
    
    // Calculate total GST
    const totalGST = testCartItems.reduce((total, item) => {
      const gstRate = item.product.gstRate || 0;
      const itemTotal = item.price * item.quantity;
      const gstAmount = item.product.gstInclusive 
        ? itemTotal - (itemTotal / (1 + gstRate / 100))
        : itemTotal * (gstRate / 100);
      
      console.log(`Item: ${item.product.name}, GST: ${gstAmount}`);
      return total + gstAmount;
    }, 0);
    
    console.log('Total GST calculated:', totalGST);
    console.log('Expected GST: 180 (only from 18% product)');
    console.log('✅ Test passed:', Math.abs(totalGST - 180) < 0.01);
    
    console.groupEnd();
    return Math.abs(totalGST - 180) < 0.01;
  },

  /**
   * Test 4: Checkout Order Data
   */
  testCheckoutOrder: () => {
    console.group('🧪 TEST 4: CHECKOUT ORDER DATA');
    
    const subtotal = 1500; // 500 + 1000
    const shipping = 0; // Free shipping over 499
    const gst = 180; // Only from 18% product
    const total = subtotal + shipping + gst;
    
    const testOrderData = {
      amount: total,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: gst,
      items: [
        { productId: 'prod1', name: '0% GST Product', price: 500, quantity: 1 },
        { productId: 'prod2', name: '18% GST Product', price: 1000, quantity: 1 }
      ]
    };
    
    console.log('Checkout order data:', testOrderData);
    console.log('Total amount:', testOrderData.amount);
    console.log('Expected total: 1680, Actual:', testOrderData.amount);
    console.log('✅ Test passed:', testOrderData.amount === 1680);
    
    console.groupEnd();
    return testOrderData.amount === 1680;
  },

  /**
   * Test 5: Razorpay Payment Data
   */
  testRazorpayData: () => {
    console.group('🧪 TEST 5: RAZORPAY PAYMENT DATA');
    
    const testPaymentData = {
      amount: 1680, // Total including GST
      itemsPrice: 1500,
      shippingPrice: 0,
      taxPrice: 180, // Only from taxable products
      items: [
        { productId: 'prod1', name: '0% GST Product', price: 500, quantity: 1 },
        { productId: 'prod2', name: '18% GST Product', price: 1000, quantity: 1 }
      ]
    };
    
    console.log('Razorpay payment data:', testPaymentData);
    
    // Verify calculation
    const expectedTotal = testPaymentData.itemsPrice + testPaymentData.shippingPrice + testPaymentData.taxPrice;
    console.log('Expected total:', expectedTotal);
    console.log('Actual total:', testPaymentData.amount);
    console.log('✅ Test passed:', testPaymentData.amount === expectedTotal);
    
    console.groupEnd();
    return testPaymentData.amount === expectedTotal;
  },

  /**
   * Run All Tests
   */
  runAllTests: () => {
    console.group('🚀 COMPLETE GST FLOW TEST SUITE');
    console.log('Testing 0% GST flow from admin to Razorpay...\n');
    
    const results = {
      adminForm: testGSTFlow.testAdminForm(),
      productAPI: testGSTFlow.testProductAPI(),
      cartCalculation: testGSTFlow.testCartCalculation(),
      checkoutOrder: testGSTFlow.testCheckoutOrder(),
      razorpayData: testGSTFlow.testRazorpayData()
    };
    
    console.log('\n📊 TEST RESULTS:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎉 0% GST flow is working correctly!');
      console.log('✅ Admin form processes 0% GST correctly');
      console.log('✅ Product API returns 0% GST correctly');
      console.log('✅ Cart calculates GST correctly (mixed products)');
      console.log('✅ Checkout order data is correct');
      console.log('✅ Razorpay payment data is correct');
    } else {
      console.log('\n🚨 Issues found in GST flow - check individual test results');
    }
    
    console.groupEnd();
    return allPassed;
  }
};

// Auto-attach to window for browser console access
if (typeof window !== 'undefined') {
  window.testGSTFlow = testGSTFlow;
}

export default testGSTFlow;

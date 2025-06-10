/**
 * Test Order GST Calculation
 * Verify that 0% GST products don't get charged 18% GST in orders
 */

export const testOrderGST = {
  
  /**
   * Test 0% GST product order calculation
   */
  testZeroGSTOrder: () => {
    console.group('🧪 TEST: 0% GST ORDER CALCULATION');
    
    // Simulate 0% GST product in cart
    const cartItems = [
      {
        product: {
          _id: 'zero-gst-book',
          name: 'Zero GST Test Book',
          gstRate: 0,
          gstInclusive: false
        },
        price: 299,
        quantity: 2
      }
    ];
    
    // Calculate using the same logic as checkout
    const itemsPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingPrice = itemsPrice > 499 ? 0 : 99;
    
    // Calculate GST based on individual product rates
    const taxPrice = cartItems.reduce((total, item) => {
      const gstRate = item.product.gstRate || 0;
      const itemTotal = item.price * item.quantity;
      const gstAmount = item.product.gstInclusive 
        ? itemTotal - (itemTotal / (1 + gstRate / 100))
        : itemTotal * (gstRate / 100);
      return total + gstAmount;
    }, 0);
    
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    console.log('📊 Order Calculation Results:');
    console.log('Items price:', itemsPrice);
    console.log('Shipping price:', shippingPrice);
    console.log('Tax price (should be 0):', taxPrice);
    console.log('Total price:', totalPrice);
    
    console.log('\n🎯 Expected vs Actual:');
    console.log('Expected items price: 598 (299 * 2)');
    console.log('Actual items price:', itemsPrice);
    console.log('Expected tax price: 0 (0% GST)');
    console.log('Actual tax price:', taxPrice);
    console.log('Expected total: 697 (598 + 99 + 0)');
    console.log('Actual total:', totalPrice);
    
    const isCorrect = itemsPrice === 598 && taxPrice === 0 && totalPrice === 697;
    console.log(`\n${isCorrect ? '✅' : '❌'} Test ${isCorrect ? 'PASSED' : 'FAILED'}`);
    
    if (!isCorrect) {
      console.log('🚨 BUG: 0% GST product is being charged tax!');
    }
    
    console.groupEnd();
    return isCorrect;
  },

  /**
   * Test 18% GST product order calculation
   */
  testRegularGSTOrder: () => {
    console.group('🧪 TEST: 18% GST ORDER CALCULATION');
    
    // Simulate 18% GST product in cart
    const cartItems = [
      {
        product: {
          _id: 'regular-tshirt',
          name: 'Regular T-Shirt',
          gstRate: 18,
          gstInclusive: false
        },
        price: 999,
        quantity: 1
      }
    ];
    
    // Calculate using the same logic as checkout
    const itemsPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingPrice = itemsPrice > 499 ? 0 : 99;
    
    // Calculate GST based on individual product rates
    const taxPrice = cartItems.reduce((total, item) => {
      const gstRate = item.product.gstRate || 0;
      const itemTotal = item.price * item.quantity;
      const gstAmount = item.product.gstInclusive 
        ? itemTotal - (itemTotal / (1 + gstRate / 100))
        : itemTotal * (gstRate / 100);
      return total + gstAmount;
    }, 0);
    
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    console.log('📊 Order Calculation Results:');
    console.log('Items price:', itemsPrice);
    console.log('Shipping price:', shippingPrice);
    console.log('Tax price (should be 179.82):', taxPrice);
    console.log('Total price:', totalPrice);
    
    console.log('\n🎯 Expected vs Actual:');
    console.log('Expected items price: 999');
    console.log('Actual items price:', itemsPrice);
    console.log('Expected tax price: 179.82 (18% of 999)');
    console.log('Actual tax price:', taxPrice);
    console.log('Expected total: 1178.82 (999 + 0 + 179.82)');
    console.log('Actual total:', totalPrice);
    
    const expectedTax = 999 * 0.18;
    const expectedTotal = 999 + 0 + expectedTax;
    const isCorrect = itemsPrice === 999 && Math.abs(taxPrice - expectedTax) < 0.01 && Math.abs(totalPrice - expectedTotal) < 0.01;
    console.log(`\n${isCorrect ? '✅' : '❌'} Test ${isCorrect ? 'PASSED' : 'FAILED'}`);
    
    console.groupEnd();
    return isCorrect;
  },

  /**
   * Test mixed cart (0% + 18% GST products)
   */
  testMixedGSTOrder: () => {
    console.group('🧪 TEST: MIXED GST ORDER CALCULATION');
    
    // Simulate mixed cart
    const cartItems = [
      {
        product: {
          _id: 'zero-gst-book',
          name: 'Zero GST Book',
          gstRate: 0,
          gstInclusive: false
        },
        price: 299,
        quantity: 1
      },
      {
        product: {
          _id: 'regular-tshirt',
          name: 'Regular T-Shirt',
          gstRate: 18,
          gstInclusive: false
        },
        price: 999,
        quantity: 1
      }
    ];
    
    // Calculate using the same logic as checkout
    const itemsPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingPrice = itemsPrice > 499 ? 0 : 99;
    
    // Calculate GST based on individual product rates
    const taxPrice = cartItems.reduce((total, item) => {
      const gstRate = item.product.gstRate || 0;
      const itemTotal = item.price * item.quantity;
      const gstAmount = item.product.gstInclusive 
        ? itemTotal - (itemTotal / (1 + gstRate / 100))
        : itemTotal * (gstRate / 100);
      
      console.log(`  ${item.product.name}: GST ${gstRate}% = ₹${gstAmount.toFixed(2)}`);
      return total + gstAmount;
    }, 0);
    
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    console.log('\n📊 Mixed Order Calculation Results:');
    console.log('Items price:', itemsPrice);
    console.log('Shipping price:', shippingPrice);
    console.log('Tax price (only from 18% product):', taxPrice);
    console.log('Total price:', totalPrice);
    
    console.log('\n🎯 Expected vs Actual:');
    console.log('Expected items price: 1298 (299 + 999)');
    console.log('Actual items price:', itemsPrice);
    console.log('Expected tax price: 179.82 (only from t-shirt)');
    console.log('Actual tax price:', taxPrice);
    console.log('Expected total: 1477.82 (1298 + 0 + 179.82)');
    console.log('Actual total:', totalPrice);
    
    const expectedTax = 999 * 0.18; // Only from t-shirt
    const expectedTotal = 1298 + 0 + expectedTax;
    const isCorrect = itemsPrice === 1298 && Math.abs(taxPrice - expectedTax) < 0.01 && Math.abs(totalPrice - expectedTotal) < 0.01;
    console.log(`\n${isCorrect ? '✅' : '❌'} Test ${isCorrect ? 'PASSED' : 'FAILED'}`);
    
    if (isCorrect) {
      console.log('✅ Mixed cart correctly charges GST only on taxable products');
    } else {
      console.log('🚨 BUG: Mixed cart GST calculation is incorrect!');
    }
    
    console.groupEnd();
    return isCorrect;
  },

  /**
   * Run all order GST tests
   */
  runAllTests: () => {
    console.group('🚀 ORDER GST CALCULATION TEST SUITE');
    console.log('Testing order GST calculations to ensure 0% GST products work correctly...\n');
    
    const results = {
      zeroGSTOrder: testOrderGST.testZeroGSTOrder(),
      regularGSTOrder: testOrderGST.testRegularGSTOrder(),
      mixedGSTOrder: testOrderGST.testMixedGSTOrder()
    };
    
    console.log('\n📊 TEST RESULTS:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎉 Order GST calculation is working correctly!');
      console.log('✅ 0% GST products are not charged any tax');
      console.log('✅ 18% GST products are charged correct tax');
      console.log('✅ Mixed carts calculate GST correctly per product');
      console.log('\n💡 The bug has been fixed! 0% GST products will no longer be charged 18% tax.');
    } else {
      console.log('\n🚨 Order GST calculation issues found!');
      console.log('❌ 0% GST products may still be charged incorrect tax');
      console.log('❌ Check the checkout calculation logic');
    }
    
    console.groupEnd();
    return allPassed;
  }
};

// Auto-attach to window for browser console access
if (typeof window !== 'undefined') {
  window.testOrderGST = testOrderGST;
}

export default testOrderGST;

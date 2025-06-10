/**
 * GST Flow Debug Utility
 * Traces 0% GST from admin creation to checkout/Razorpay
 */

export const debugGSTFlow = {
  
  /**
   * Debug admin form GST data before submission
   */
  debugAdminForm: (formData) => {
    console.group('🔧 ADMIN FORM GST DEBUG');
    console.log('Raw form GST rate:', formData.gstRate);
    console.log('GST rate type:', typeof formData.gstRate);
    console.log('GST type:', formData.gstType);
    console.log('GST inclusive:', formData.gstInclusive);
    console.log('Taxable:', formData.taxable);
    
    // Test the processing logic
    const processedGSTRate = formData.gstRate !== '' && formData.gstRate !== null && formData.gstRate !== undefined 
      ? parseFloat(formData.gstRate) 
      : 0;
    
    console.log('Processed GST rate:', processedGSTRate);
    console.log('Will be sent to backend:', processedGSTRate);
    console.groupEnd();
    
    return processedGSTRate;
  },

  /**
   * Debug product data received from API
   */
  debugProductAPI: (product) => {
    console.group('📦 PRODUCT API GST DEBUG');
    console.log('Product name:', product.name);
    console.log('Product GST rate:', product.gstRate);
    console.log('GST rate type:', typeof product.gstRate);
    console.log('GST type:', product.gstType);
    console.log('GST inclusive:', product.gstInclusive);
    console.log('Taxable:', product.taxable);
    console.log('Product price:', product.price);
    console.groupEnd();
    
    return product;
  },

  /**
   * Debug cart item GST calculation
   */
  debugCartGST: (cartItems) => {
    console.group('🛒 CART GST CALCULATION DEBUG');
    
    cartItems.forEach((item, index) => {
      console.log(`\n--- Cart Item ${index + 1}: ${item.product.name} ---`);
      console.log('Product GST rate:', item.product.gstRate);
      console.log('Product price:', item.price);
      console.log('Quantity:', item.quantity);
      console.log('Item total:', item.price * item.quantity);
      
      const gstRate = item.product.gstRate || 0;
      const itemTotal = item.price * item.quantity;
      const gstAmount = item.product.gstInclusive 
        ? itemTotal - (itemTotal / (1 + gstRate / 100))
        : itemTotal * (gstRate / 100);
      
      console.log('Calculated GST amount:', gstAmount);
      console.log('GST calculation method:', item.product.gstInclusive ? 'Inclusive' : 'Exclusive');
    });
    
    const totalGST = cartItems.reduce((total, item) => {
      const gstRate = item.product.gstRate || 0;
      const itemTotal = item.price * item.quantity;
      const gstAmount = item.product.gstInclusive 
        ? itemTotal - (itemTotal / (1 + gstRate / 100))
        : itemTotal * (gstRate / 100);
      return total + gstAmount;
    }, 0);
    
    console.log('\n🧮 TOTAL CART GST:', totalGST);
    console.log('Should show GST line?', totalGST > 0);
    console.groupEnd();
    
    return totalGST;
  },

  /**
   * Debug checkout order data
   */
  debugCheckoutOrder: (orderData) => {
    console.group('💳 CHECKOUT ORDER GST DEBUG');
    console.log('Order amount:', orderData.amount);
    console.log('Items price:', orderData.itemsPrice);
    console.log('Tax price:', orderData.taxPrice);
    console.log('Shipping price:', orderData.shippingPrice);
    
    console.log('\n📋 Order Items:');
    orderData.items?.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        productId: item.productId,
        price: item.price,
        quantity: item.quantity
      });
    });
    
    console.groupEnd();
    return orderData;
  },

  /**
   * Debug Razorpay payment data
   */
  debugRazorpayData: (paymentData) => {
    console.group('💰 RAZORPAY PAYMENT GST DEBUG');
    console.log('Payment amount:', paymentData.amount);
    console.log('Items price:', paymentData.itemsPrice);
    console.log('Tax price:', paymentData.taxPrice);
    console.log('Shipping price:', paymentData.shippingPrice);
    console.log('Total amount:', paymentData.amount);
    
    // Verify GST calculation
    const expectedTotal = (paymentData.itemsPrice || 0) + (paymentData.shippingPrice || 0) + (paymentData.taxPrice || 0);
    console.log('Expected total:', expectedTotal);
    console.log('Actual total:', paymentData.amount);
    console.log('Total matches?', Math.abs(expectedTotal - paymentData.amount) < 0.01);
    
    console.groupEnd();
    return paymentData;
  },

  /**
   * Debug complete flow from product to payment
   */
  debugCompleteFlow: (product, cartItems, checkoutData, razorpayData) => {
    console.group('🔄 COMPLETE GST FLOW DEBUG');
    
    console.log('=== STEP 1: PRODUCT DATA ===');
    debugGSTFlow.debugProductAPI(product);
    
    console.log('\n=== STEP 2: CART CALCULATION ===');
    debugGSTFlow.debugCartGST(cartItems);
    
    console.log('\n=== STEP 3: CHECKOUT DATA ===');
    debugGSTFlow.debugCheckoutOrder(checkoutData);
    
    console.log('\n=== STEP 4: RAZORPAY DATA ===');
    debugGSTFlow.debugRazorpayData(razorpayData);
    
    // Final verification
    console.log('\n🎯 FLOW VERIFICATION:');
    const hasZeroGSTProducts = cartItems.some(item => (item.product.gstRate || 0) === 0);
    const hasNonZeroGSTProducts = cartItems.some(item => (item.product.gstRate || 0) > 0);
    
    console.log('Has 0% GST products:', hasZeroGSTProducts);
    console.log('Has >0% GST products:', hasNonZeroGSTProducts);
    console.log('Should show GST in UI:', hasNonZeroGSTProducts);
    console.log('Expected behavior: GST line should', hasNonZeroGSTProducts ? 'SHOW' : 'HIDE');
    
    console.groupEnd();
  }
};

// Auto-attach to window for browser console access
if (typeof window !== 'undefined') {
  window.debugGSTFlow = debugGSTFlow;
}

export default debugGSTFlow;

/**
 * Size Flow Debug Utility
 * Traces size functionality from admin creation to customer checkout
 */

export const debugSizeFlow = {
  
  /**
   * Debug admin form size data before submission
   */
  debugAdminSizes: (formData) => {
    console.group('🔧 ADMIN FORM SIZE DEBUG');
    console.log('Raw sizes data:', formData.sizes);
    console.log('Number of sizes:', formData.sizes?.length || 0);
    console.log('Size chart enabled:', formData.sizeChart?.enabled);
    console.log('Size chart data:', formData.sizeChart);
    
    if (formData.sizes && formData.sizes.length > 0) {
      console.log('\n📏 Individual Sizes:');
      formData.sizes.forEach((size, index) => {
        console.log(`Size ${index + 1}:`, {
          name: size.name,
          label: size.label,
          stock: size.stock,
          isAvailable: size.isAvailable,
          measurements: size.measurements,
          sortOrder: size.sortOrder
        });
      });
    } else {
      console.log('⚠️ No sizes defined for this product');
    }
    
    console.groupEnd();
    return formData.sizes;
  },

  /**
   * Debug product API response for sizes
   */
  debugProductSizes: (product) => {
    console.group('📦 PRODUCT API SIZE DEBUG');
    console.log('Product name:', product.name);
    console.log('Has sizes:', !!product.sizes);
    console.log('Number of sizes:', product.sizes?.length || 0);
    console.log('Size chart enabled:', product.sizeChart?.enabled);
    
    if (product.sizes && product.sizes.length > 0) {
      console.log('\n📏 Available Sizes:');
      product.sizes.forEach((size, index) => {
        console.log(`${size.name} (${size.label}):`, {
          stock: size.stock,
          available: size.isAvailable,
          measurements: size.measurements
        });
      });
      
      // Check for size availability
      const availableSizes = product.sizes.filter(size => size.isAvailable && size.stock > 0);
      console.log(`\n✅ ${availableSizes.length} sizes in stock and available`);
      
      if (availableSizes.length === 0) {
        console.warn('⚠️ No sizes are currently available for purchase!');
      }
    } else {
      console.log('ℹ️ This product does not have size variants');
    }
    
    if (product.sizeChart?.enabled) {
      console.log('\n📊 Size Chart Available:', {
        image: product.sizeChart.image,
        description: product.sizeChart.description,
        measurements: product.sizeChart.measurements?.length || 0
      });
    }
    
    console.groupEnd();
    return product.sizes;
  },

  /**
   * Debug size selection on product page
   */
  debugSizeSelection: (selectedSize, availableSizes, product) => {
    console.group('👤 CUSTOMER SIZE SELECTION DEBUG');
    console.log('Product:', product.name);
    console.log('Available sizes:', availableSizes?.map(s => `${s.name} (${s.label})`));
    console.log('Selected size:', selectedSize);
    
    if (selectedSize) {
      const sizeDetails = availableSizes?.find(s => s.name === selectedSize || s._id === selectedSize);
      if (sizeDetails) {
        console.log('Selected size details:', {
          name: sizeDetails.name,
          label: sizeDetails.label,
          stock: sizeDetails.stock,
          available: sizeDetails.isAvailable,
          measurements: sizeDetails.measurements
        });
        
        // Validate selection
        if (!sizeDetails.isAvailable) {
          console.error('❌ Selected size is not available!');
        } else if (sizeDetails.stock <= 0) {
          console.error('❌ Selected size is out of stock!');
        } else {
          console.log('✅ Size selection is valid');
        }
      } else {
        console.error('❌ Selected size not found in available sizes!');
      }
    } else {
      console.warn('⚠️ No size selected yet');
    }
    
    console.groupEnd();
    return selectedSize;
  },

  /**
   * Debug add to cart with size
   */
  debugAddToCartWithSize: (product, selectedSize, quantity, selectedVariants) => {
    console.group('🛒 ADD TO CART SIZE DEBUG');
    console.log('Product:', product.name);
    console.log('Selected size:', selectedSize);
    console.log('Quantity:', quantity);
    console.log('Selected variants:', selectedVariants);
    
    // Validate size selection
    if (product.sizes && product.sizes.length > 0) {
      if (!selectedSize) {
        console.error('❌ Size is required but not selected!');
        return false;
      }
      
      const sizeDetails = product.sizes.find(s => s.name === selectedSize || s._id === selectedSize);
      if (!sizeDetails) {
        console.error('❌ Selected size not found in product sizes!');
        return false;
      }
      
      if (!sizeDetails.isAvailable) {
        console.error('❌ Selected size is not available!');
        return false;
      }
      
      if (sizeDetails.stock < quantity) {
        console.error(`❌ Insufficient stock! Requested: ${quantity}, Available: ${sizeDetails.stock}`);
        return false;
      }
      
      console.log('✅ Size validation passed');
      console.log('Size details being added to cart:', {
        name: sizeDetails.name,
        label: sizeDetails.label,
        stock: sizeDetails.stock,
        measurements: sizeDetails.measurements
      });
    } else {
      console.log('ℹ️ Product does not require size selection');
    }
    
    console.groupEnd();
    return true;
  },

  /**
   * Debug cart items with sizes
   */
  debugCartSizes: (cartItems) => {
    console.group('🛒 CART SIZE DEBUG');
    console.log('Number of cart items:', cartItems.length);
    
    cartItems.forEach((item, index) => {
      console.log(`\n--- Cart Item ${index + 1}: ${item.product.name} ---`);
      console.log('Quantity:', item.quantity);
      console.log('Price:', item.price);
      console.log('Selected variants:', item.selectedVariants);
      
      // Check if item has size information
      const hasSize = item.selectedVariants?.some(variant => variant.name?.toLowerCase() === 'size');
      if (hasSize) {
        const sizeVariant = item.selectedVariants.find(variant => variant.name?.toLowerCase() === 'size');
        console.log('Selected size:', sizeVariant.value);
        
        // Validate size against product sizes
        if (item.product.sizes) {
          const sizeDetails = item.product.sizes.find(s => s.name === sizeVariant.value);
          if (sizeDetails) {
            console.log('Size details:', {
              name: sizeDetails.name,
              label: sizeDetails.label,
              stock: sizeDetails.stock,
              available: sizeDetails.isAvailable
            });
            
            // Check stock availability
            if (sizeDetails.stock < item.quantity) {
              console.warn(`⚠️ Stock issue: Requested ${item.quantity}, Available ${sizeDetails.stock}`);
            } else {
              console.log('✅ Size stock is sufficient');
            }
          } else {
            console.error('❌ Size details not found in product!');
          }
        }
      } else {
        console.log('ℹ️ No size selected for this item');
      }
    });
    
    console.groupEnd();
    return cartItems;
  },

  /**
   * Debug checkout order with sizes
   */
  debugCheckoutSizes: (orderData) => {
    console.group('💳 CHECKOUT SIZE DEBUG');
    console.log('Order amount:', orderData.amount);
    console.log('Number of items:', orderData.items?.length || 0);
    
    if (orderData.items) {
      console.log('\n📋 Order Items with Sizes:');
      orderData.items.forEach((item, index) => {
        console.log(`Item ${index + 1}: ${item.name}`);
        console.log('  Product ID:', item.productId);
        console.log('  Price:', item.price);
        console.log('  Quantity:', item.quantity);
        console.log('  Selected variants:', item.selectedVariants);
        
        // Check for size in variants
        const sizeVariant = item.selectedVariants?.find(v => v.name?.toLowerCase() === 'size');
        if (sizeVariant) {
          console.log('  ✅ Size selected:', sizeVariant.value);
        } else {
          console.log('  ℹ️ No size variant');
        }
      });
    }
    
    console.groupEnd();
    return orderData;
  },

  /**
   * Debug complete size flow
   */
  debugCompleteFlow: (adminData, productData, selectedSize, cartItems, orderData) => {
    console.group('🔄 COMPLETE SIZE FLOW DEBUG');
    
    console.log('=== STEP 1: ADMIN SIZE CREATION ===');
    debugSizeFlow.debugAdminSizes(adminData);
    
    console.log('\n=== STEP 2: PRODUCT SIZE DATA ===');
    debugSizeFlow.debugProductSizes(productData);
    
    console.log('\n=== STEP 3: SIZE SELECTION ===');
    debugSizeFlow.debugSizeSelection(selectedSize, productData.sizes, productData);
    
    console.log('\n=== STEP 4: CART WITH SIZES ===');
    debugSizeFlow.debugCartSizes(cartItems);
    
    console.log('\n=== STEP 5: CHECKOUT ORDER ===');
    debugSizeFlow.debugCheckoutSizes(orderData);
    
    // Final verification
    console.log('\n🎯 FLOW VERIFICATION:');
    const hasProductSizes = productData.sizes && productData.sizes.length > 0;
    const hasSizeSelection = !!selectedSize;
    const hasCartSizes = cartItems.some(item => 
      item.selectedVariants?.some(v => v.name?.toLowerCase() === 'size')
    );
    const hasOrderSizes = orderData.items?.some(item => 
      item.selectedVariants?.some(v => v.name?.toLowerCase() === 'size')
    );
    
    console.log('Product has sizes:', hasProductSizes);
    console.log('Size was selected:', hasSizeSelection);
    console.log('Cart has size info:', hasCartSizes);
    console.log('Order has size info:', hasOrderSizes);
    
    const flowComplete = hasProductSizes && hasSizeSelection && hasCartSizes && hasOrderSizes;
    console.log(`\n${flowComplete ? '✅' : '❌'} Size flow is ${flowComplete ? 'COMPLETE' : 'INCOMPLETE'}`);
    
    console.groupEnd();
    return flowComplete;
  }
};

// Auto-attach to window for browser console access
if (typeof window !== 'undefined') {
  window.debugSizeFlow = debugSizeFlow;
}

export default debugSizeFlow;

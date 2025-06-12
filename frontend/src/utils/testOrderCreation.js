/**
 * Test Order Creation
 * Simple test to verify order creation is working
 */

import { orderService } from '../services/orderService';

export const testOrderCreation = async () => {
  console.group('🧪 TESTING ORDER CREATION');
  
  try {
    // Sample order data that matches backend expectations
    const testOrderData = {
      orderItems: [{
        product: '684aec40711bc33cd0a238c3', // Use a real product ID from your database
        name: 'Test Product',
        image: '/placeholder.jpg',
        price: 999,
        quantity: 1,
        selectedVariants: []
      }],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '123456',
        country: 'India',
        phone: '+91 9876543210'
      },
      paymentMethod: 'cash_on_delivery',
      itemsPrice: 999,
      taxPrice: 0,
      shippingPrice: 99,
      totalPrice: 1098,
      isGuestOrder: true,
      guestInfo: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+91 9876543210'
      }
    };

    console.log('📋 Test order data:', testOrderData);
    
    // Test the order creation
    const response = await orderService.createOrder(testOrderData);
    
    console.log('✅ Order creation test PASSED');
    console.log('📦 Created order:', response);
    
    return {
      success: true,
      order: response,
      message: 'Order creation test passed'
    };
    
  } catch (error) {
    console.error('❌ Order creation test FAILED');
    console.error('Error:', error);
    console.error('Response:', error.response?.data);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data,
      message: 'Order creation test failed'
    };
  } finally {
    console.groupEnd();
  }
};

// Quick test function for console
export const quickOrderTest = () => {
  console.log('🚀 Running quick order creation test...');
  testOrderCreation().then(result => {
    if (result.success) {
      console.log('🎉 Test completed successfully!');
    } else {
      console.log('💥 Test failed:', result.message);
    }
  });
};

// Global access for console debugging
window.testOrderCreation = testOrderCreation;
window.quickOrderTest = quickOrderTest;

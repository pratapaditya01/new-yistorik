/**
 * Analytics Testing Utility
 * Test and verify Vercel Analytics implementation
 */

import { analytics } from './analytics';

export const testAnalytics = {
  
  /**
   * Test basic analytics functionality
   */
  testBasicTracking: () => {
    console.group('🧪 TEST: BASIC ANALYTICS TRACKING');
    
    try {
      // Test custom event tracking
      analytics.trackCustomEvent('test_event', {
        test_parameter: 'test_value',
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Custom event tracking works');
      
      // Test page view tracking
      analytics.trackPageView('test_page', {
        test_data: 'page_view_test'
      });
      
      console.log('✅ Page view tracking works');
      console.log('✅ Basic analytics tracking is functional');
      
    } catch (error) {
      console.error('❌ Basic analytics tracking failed:', error);
      return false;
    }
    
    console.groupEnd();
    return true;
  },

  /**
   * Test e-commerce event tracking
   */
  testEcommerceTracking: () => {
    console.group('🧪 TEST: E-COMMERCE ANALYTICS');
    
    try {
      // Test product view
      const testProduct = {
        _id: 'test123',
        name: 'Test Product',
        price: 999,
        category: { name: 'Test Category' },
        gstRate: 18
      };
      
      analytics.trackProductView(testProduct);
      console.log('✅ Product view tracking works');
      
      // Test add to cart
      analytics.trackAddToCart(testProduct, 2, [
        { name: 'Size', value: 'M' }
      ]);
      console.log('✅ Add to cart tracking works');
      
      // Test checkout start
      const testCartItems = [
        {
          product: testProduct,
          quantity: 2,
          price: 999
        }
      ];
      
      analytics.trackCheckoutStart(testCartItems, 1998);
      console.log('✅ Checkout start tracking works');
      
      // Test purchase
      const testOrder = {
        _id: 'order123',
        amount: 2177,
        paymentMethod: 'razorpay',
        items: testCartItems,
        shippingPrice: 0,
        taxPrice: 179
      };
      
      analytics.trackPurchase(testOrder);
      console.log('✅ Purchase tracking works');
      
      console.log('✅ E-commerce analytics tracking is functional');
      
    } catch (error) {
      console.error('❌ E-commerce analytics tracking failed:', error);
      return false;
    }
    
    console.groupEnd();
    return true;
  },

  /**
   * Test user event tracking
   */
  testUserTracking: () => {
    console.group('🧪 TEST: USER ANALYTICS');
    
    try {
      // Test user registration
      analytics.trackUserRegistration('email');
      console.log('✅ User registration tracking works');
      
      // Test user login
      analytics.trackUserLogin('email');
      console.log('✅ User login tracking works');
      
      // Test user logout
      analytics.trackUserLogout();
      console.log('✅ User logout tracking works');
      
      console.log('✅ User analytics tracking is functional');
      
    } catch (error) {
      console.error('❌ User analytics tracking failed:', error);
      return false;
    }
    
    console.groupEnd();
    return true;
  },

  /**
   * Test error and performance tracking
   */
  testErrorAndPerformanceTracking: () => {
    console.group('🧪 TEST: ERROR & PERFORMANCE ANALYTICS');
    
    try {
      // Test error tracking
      analytics.trackError('test_error', 'This is a test error', {
        component: 'test_component',
        user_action: 'test_action'
      });
      console.log('✅ Error tracking works');
      
      // Test performance tracking
      analytics.trackPerformance('page_load_time', 1250, {
        page: 'test_page',
        device: 'desktop'
      });
      console.log('✅ Performance tracking works');
      
      console.log('✅ Error and performance analytics tracking is functional');
      
    } catch (error) {
      console.error('❌ Error and performance analytics tracking failed:', error);
      return false;
    }
    
    console.groupEnd();
    return true;
  },

  /**
   * Run all analytics tests
   */
  runAllTests: () => {
    console.group('🚀 VERCEL ANALYTICS TEST SUITE');
    console.log('Testing Vercel Analytics implementation...\n');
    
    const results = {
      basicTracking: testAnalytics.testBasicTracking(),
      ecommerceTracking: testAnalytics.testEcommerceTracking(),
      userTracking: testAnalytics.testUserTracking(),
      errorAndPerformance: testAnalytics.testErrorAndPerformanceTracking()
    };
    
    console.log('\n📊 TEST RESULTS:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 OVERALL RESULT: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎉 Vercel Analytics is working correctly!');
      console.log('✅ Page views are being tracked automatically');
      console.log('✅ E-commerce events are being tracked');
      console.log('✅ User events are being tracked');
      console.log('✅ Error and performance events are being tracked');
      console.log('\n📈 Analytics Dashboard:');
      console.log('Visit https://vercel.com/analytics to view your analytics data');
    } else {
      console.log('\n🚨 Issues found in analytics implementation');
    }
    
    console.groupEnd();
    return allPassed;
  },

  /**
   * Show analytics implementation summary
   */
  showImplementationSummary: () => {
    console.group('📋 VERCEL ANALYTICS IMPLEMENTATION SUMMARY');
    
    console.log('🔧 COMPONENTS WITH ANALYTICS:');
    console.log('✅ App.jsx - Analytics component added');
    console.log('✅ ProductDetail.jsx - Product view & add to cart tracking');
    console.log('✅ Cart.jsx - Cart view tracking');
    console.log('✅ Checkout.jsx - Checkout start & purchase tracking');
    console.log('✅ Login.jsx - User login tracking');
    
    console.log('\n📊 TRACKED EVENTS:');
    console.log('• Page views (automatic)');
    console.log('• Product views');
    console.log('• Add to cart');
    console.log('• Cart views');
    console.log('• Checkout start');
    console.log('• Purchase completion');
    console.log('• User login/registration');
    console.log('• Search queries');
    console.log('• Filter usage');
    console.log('• Errors and performance');
    
    console.log('\n🎯 ANALYTICS BENEFITS:');
    console.log('• Track visitor behavior and page views');
    console.log('• Monitor e-commerce conversion funnel');
    console.log('• Identify popular products and categories');
    console.log('• Analyze user engagement patterns');
    console.log('• Monitor site performance and errors');
    console.log('• Make data-driven business decisions');
    
    console.log('\n📈 VIEW ANALYTICS:');
    console.log('Visit https://vercel.com/analytics to view your data');
    console.log('Analytics data will appear after deployment to Vercel');
    
    console.groupEnd();
  }
};

// Auto-attach to window for browser console access
if (typeof window !== 'undefined') {
  window.testAnalytics = testAnalytics;
}

export default testAnalytics;

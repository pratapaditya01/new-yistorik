/**
 * Order Creation Debugger
 * Debugs frontend order creation issues
 */

class OrderDebugger {
  constructor() {
    this.version = '1.0.0';
    this.debugHistory = [];
  }

  /**
   * Debug order creation process
   */
  async debugOrderCreation(orderData) {
    console.group('🛒 ORDER CREATION DEBUG');
    console.log(`🚀 Order Debugger v${this.version}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    
    const debugResult = {
      timestamp: new Date().toISOString(),
      orderData: orderData,
      validationResults: {},
      apiTest: {},
      recommendations: []
    };

    try {
      // 1. Validate order data structure
      console.log('\n1. 🔍 Validating order data structure...');
      debugResult.validationResults = this.validateOrderData(orderData);
      
      // 2. Test API connectivity
      console.log('\n2. 🌐 Testing API connectivity...');
      debugResult.apiTest = await this.testAPIConnectivity();
      
      // 3. Test order creation
      console.log('\n3. 🛒 Testing order creation...');
      debugResult.orderTest = await this.testOrderCreation(orderData);
      
      // 4. Generate recommendations
      console.log('\n4. 💡 Generating recommendations...');
      debugResult.recommendations = this.generateRecommendations(debugResult);
      
      this.logSummary(debugResult);
      
    } catch (error) {
      console.error('❌ Order debugging failed:', error);
      debugResult.error = error.message;
    }
    
    console.groupEnd();
    
    this.debugHistory.push(debugResult);
    return debugResult;
  }

  /**
   * Validate order data structure
   */
  validateOrderData(orderData) {
    const results = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required fields
    const requiredFields = [
      'orderItems',
      'shippingAddress',
      'paymentMethod',
      'itemsPrice',
      'taxPrice',
      'shippingPrice',
      'totalPrice'
    ];

    requiredFields.forEach(field => {
      if (!orderData || !orderData.hasOwnProperty(field)) {
        results.errors.push(`Missing required field: ${field}`);
        results.isValid = false;
      }
    });

    // Validate order items
    if (orderData?.orderItems) {
      if (!Array.isArray(orderData.orderItems)) {
        results.errors.push('orderItems must be an array');
        results.isValid = false;
      } else if (orderData.orderItems.length === 0) {
        results.errors.push('orderItems cannot be empty');
        results.isValid = false;
      } else {
        orderData.orderItems.forEach((item, index) => {
          const itemErrors = this.validateOrderItem(item, index);
          results.errors.push(...itemErrors);
          if (itemErrors.length > 0) {
            results.isValid = false;
          }
        });
      }
    }

    // Validate shipping address
    if (orderData?.shippingAddress) {
      const addressErrors = this.validateShippingAddress(orderData.shippingAddress);
      results.errors.push(...addressErrors);
      if (addressErrors.length > 0) {
        results.isValid = false;
      }
    }

    // Validate payment method
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay', 'cash_on_delivery'];
    if (orderData?.paymentMethod && !validPaymentMethods.includes(orderData.paymentMethod)) {
      results.errors.push(`Invalid payment method: ${orderData.paymentMethod}`);
      results.isValid = false;
    }

    // Validate prices
    const priceFields = ['itemsPrice', 'taxPrice', 'shippingPrice', 'totalPrice'];
    priceFields.forEach(field => {
      if (orderData?.[field] !== undefined) {
        if (typeof orderData[field] !== 'number' || orderData[field] < 0) {
          results.errors.push(`${field} must be a non-negative number`);
          results.isValid = false;
        }
      }
    });

    // Check guest order requirements
    if (orderData?.isGuestOrder && !orderData?.guestInfo) {
      results.errors.push('Guest orders require guestInfo');
      results.isValid = false;
    }

    console.log(`✅ Validation complete: ${results.isValid ? 'VALID' : 'INVALID'}`);
    if (results.errors.length > 0) {
      console.log('❌ Validation errors:', results.errors);
    }
    if (results.warnings.length > 0) {
      console.log('⚠️ Validation warnings:', results.warnings);
    }

    return results;
  }

  /**
   * Validate individual order item
   */
  validateOrderItem(item, index) {
    const errors = [];
    const requiredItemFields = ['product', 'name', 'image', 'price', 'quantity'];

    requiredItemFields.forEach(field => {
      if (!item.hasOwnProperty(field)) {
        errors.push(`Order item ${index}: Missing required field: ${field}`);
      }
    });

    if (item.quantity && (typeof item.quantity !== 'number' || item.quantity <= 0)) {
      errors.push(`Order item ${index}: Quantity must be a positive number`);
    }

    if (item.price && (typeof item.price !== 'number' || item.price < 0)) {
      errors.push(`Order item ${index}: Price must be a non-negative number`);
    }

    return errors;
  }

  /**
   * Validate shipping address
   */
  validateShippingAddress(address) {
    const errors = [];
    const requiredAddressFields = ['fullName', 'address', 'city', 'state', 'zipCode', 'country', 'phone'];

    requiredAddressFields.forEach(field => {
      if (!address.hasOwnProperty(field) || !address[field]) {
        errors.push(`Shipping address: Missing required field: ${field}`);
      }
    });

    return errors;
  }

  /**
   * Test API connectivity
   */
  async testAPIConnectivity() {
    const result = {
      baseUrl: '',
      reachable: false,
      responseTime: 0,
      error: null
    };

    try {
      // Get API base URL
      const apiModule = await import('../services/api.js');
      result.baseUrl = apiModule.default.defaults.baseURL;

      const startTime = Date.now();
      
      // Test basic connectivity
      const response = await fetch(`${result.baseUrl.replace('/api', '')}/api/health`);
      result.responseTime = Date.now() - startTime;
      result.reachable = response.ok;

      console.log(`✅ API connectivity: ${result.reachable ? 'WORKING' : 'FAILED'}`);
      console.log(`   Base URL: ${result.baseUrl}`);
      console.log(`   Response time: ${result.responseTime}ms`);

    } catch (error) {
      result.error = error.message;
      console.log(`❌ API connectivity failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Test order creation
   */
  async testOrderCreation(orderData) {
    const result = {
      success: false,
      response: null,
      error: null,
      statusCode: null
    };

    try {
      const orderService = await import('../services/orderService.js');
      
      console.log('📋 Sending order data:', JSON.stringify(orderData, null, 2));
      
      const response = await orderService.orderService.createOrder(orderData);
      
      result.success = true;
      result.response = response;
      
      console.log('✅ Order creation test: SUCCESS');
      console.log(`   Order ID: ${response._id}`);
      console.log(`   Order Number: ${response.orderNumber}`);

    } catch (error) {
      result.error = error.message;
      result.statusCode = error.response?.status;
      
      console.log('❌ Order creation test: FAILED');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Error: ${error.message}`);
      
      if (error.response?.data) {
        console.log('📋 Error details:', error.response.data);
      }
    }

    return result;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(debugResult) {
    const recommendations = [];

    // Validation recommendations
    if (!debugResult.validationResults.isValid) {
      recommendations.push({
        type: 'validation',
        priority: 'high',
        message: 'Fix order data validation errors',
        actions: debugResult.validationResults.errors
      });
    }

    // API connectivity recommendations
    if (!debugResult.apiTest.reachable) {
      recommendations.push({
        type: 'connectivity',
        priority: 'high',
        message: 'Fix API connectivity issues',
        actions: ['Check internet connection', 'Verify API URL', 'Check CORS settings']
      });
    }

    // Order creation recommendations
    if (debugResult.orderTest && !debugResult.orderTest.success) {
      const statusCode = debugResult.orderTest.statusCode;
      
      if (statusCode === 400) {
        recommendations.push({
          type: 'validation',
          priority: 'high',
          message: 'Fix order data validation on server',
          actions: ['Check required fields', 'Verify data types', 'Check field names']
        });
      } else if (statusCode === 500) {
        recommendations.push({
          type: 'server',
          priority: 'high',
          message: 'Server error occurred',
          actions: ['Check server logs', 'Verify database connection', 'Check for server issues']
        });
      } else if (statusCode >= 400) {
        recommendations.push({
          type: 'client',
          priority: 'medium',
          message: 'Client error occurred',
          actions: ['Check request format', 'Verify authentication', 'Check permissions']
        });
      }
    }

    return recommendations;
  }

  /**
   * Log summary
   */
  logSummary(debugResult) {
    console.group('📊 ORDER DEBUG SUMMARY');
    
    console.log(`🕐 Debug completed at: ${debugResult.timestamp}`);
    console.log(`✅ Data validation: ${debugResult.validationResults.isValid ? 'PASSED' : 'FAILED'}`);
    console.log(`🌐 API connectivity: ${debugResult.apiTest.reachable ? 'WORKING' : 'FAILED'}`);
    console.log(`🛒 Order creation: ${debugResult.orderTest?.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`💡 Recommendations: ${debugResult.recommendations.length}`);
    
    if (debugResult.recommendations.length > 0) {
      console.log('\n🔧 Recommended actions:');
      debugResult.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        if (rec.actions) {
          rec.actions.forEach(action => {
            console.log(`      - ${action}`);
          });
        }
      });
    }
    
    console.groupEnd();
  }

  /**
   * Quick fix for common issues
   */
  quickFix() {
    console.log('⚡ Applying quick fixes for order creation...');
    
    // Clear any cached order data
    sessionStorage.removeItem('orderData');
    sessionStorage.removeItem('checkoutData');
    
    // Clear any error states
    localStorage.removeItem('orderError');
    
    console.log('✅ Quick fixes applied');
    
    return { success: true, message: 'Quick fixes applied' };
  }
}

// Create global instance
const orderDebugger = new OrderDebugger();

// Export for use
export default orderDebugger;

// Global access for console debugging
window.orderDebugger = orderDebugger;

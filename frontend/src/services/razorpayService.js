import api from './api';

/**
 * Razorpay Service for handling payments
 */
class RazorpayService {
  constructor() {
    this.razorpayConfig = null;
    this.isScriptLoaded = false;
  }

  /**
   * Load Razorpay script dynamically
   * @returns {Promise<boolean>} Script load status
   */
  async loadRazorpayScript() {
    if (this.isScriptLoaded) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Get Razorpay configuration
   * @returns {Promise<Object>} Configuration object
   */
  async getConfig() {
    if (this.razorpayConfig) {
      return this.razorpayConfig;
    }

    try {
      const response = await api.get('/payment/config');
      this.razorpayConfig = response;
      return response;
    } catch (error) {
      console.error('Error fetching Razorpay config:', error);
      throw new Error('Failed to load payment configuration');
    }
  }

  /**
   * Create payment order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Order creation result
   */
  async createOrder(orderData) {
    try {
      const response = await api.post('/payment/create-order', orderData);
      return response;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(paymentData) {
    try {
      const response = await api.post('/payment/verify', paymentData);
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Initialize Razorpay payment
   * @param {Object} options - Payment options
   * @returns {Promise<Object>} Payment result
   */
  async initiatePayment(options) {
    try {
      // Load Razorpay script if not already loaded
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway');
      }

      // Get configuration
      const config = await this.getConfig();

      return new Promise((resolve, reject) => {
        const razorpayOptions = {
          key: config.key_id,
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name || 'Yistorik',
          description: options.description || 'Purchase from Yistorik',
          image: options.image || '/logo.png',
          order_id: options.order_id,
          handler: (response) => {
            resolve({
              success: true,
              payment: response
            });
          },
          prefill: {
            name: options.prefill?.name || '',
            email: options.prefill?.email || '',
            contact: options.prefill?.contact || ''
          },
          notes: options.notes || {},
          theme: {
            color: options.theme?.color || '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'));
            }
          },
          retry: {
            enabled: true,
            max_count: 3
          },
          timeout: 300, // 5 minutes
          remember_customer: false
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  /**
   * Process complete payment flow
   * @param {Object} orderData - Order data
   * @param {Object} userInfo - User information
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(orderData, userInfo = {}) {
    try {
      // Step 1: Create order
      console.log('Creating payment order...');
      const orderResponse = await this.createOrder(orderData);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      // Step 2: Initiate payment
      console.log('Initiating payment...');
      const paymentOptions = {
        amount: orderResponse.order.amount,
        currency: orderResponse.order.currency,
        order_id: orderResponse.order.id,
        name: 'Yistorik',
        description: `Order #${orderResponse.order.receipt}`,
        prefill: {
          name: userInfo.name || orderResponse.user?.name || '',
          email: userInfo.email || orderResponse.user?.email || '',
          contact: userInfo.contact || orderResponse.user?.contact || ''
        },
        notes: {
          orderId: orderResponse.orderId
        }
      };

      const paymentResult = await this.initiatePayment(paymentOptions);

      // Step 3: Verify payment
      console.log('Verifying payment...');
      const verificationData = {
        razorpay_order_id: paymentResult.payment.razorpay_order_id,
        razorpay_payment_id: paymentResult.payment.razorpay_payment_id,
        razorpay_signature: paymentResult.payment.razorpay_signature,
        orderId: orderResponse.orderId
      };

      const verificationResult = await this.verifyPayment(verificationData);

      return {
        success: true,
        order: verificationResult.order,
        payment: paymentResult.payment,
        message: 'Payment completed successfully'
      };

    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
        details: error
      };
    }
  }

  /**
   * Format amount for display
   * @param {number} amount - Amount in rupees
   * @returns {string} Formatted amount
   */
  formatAmount(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Convert amount to paise (smallest currency unit)
   * @param {number} amount - Amount in rupees
   * @returns {number} Amount in paise
   */
  convertToPaise(amount) {
    return Math.round(amount * 100);
  }

  /**
   * Convert amount from paise to rupees
   * @param {number} amount - Amount in paise
   * @returns {number} Amount in rupees
   */
  convertToRupees(amount) {
    return amount / 100;
  }

  /**
   * Get payment method display name
   * @param {string} method - Payment method code
   * @returns {string} Display name
   */
  getPaymentMethodName(method) {
    const methods = {
      'card': 'Credit/Debit Card',
      'netbanking': 'Net Banking',
      'wallet': 'Digital Wallet',
      'upi': 'UPI',
      'emi': 'EMI',
      'cardless_emi': 'Cardless EMI',
      'paylater': 'Pay Later'
    };
    return methods[method] || method;
  }

  /**
   * Check if Razorpay is available
   * @returns {boolean} Availability status
   */
  isAvailable() {
    return typeof window !== 'undefined' && this.isScriptLoaded && window.Razorpay;
  }
}

// Create and export singleton instance
const razorpayService = new RazorpayService();
export default razorpayService;

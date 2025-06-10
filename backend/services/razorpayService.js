const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @returns {Object} Razorpay order
 */
const createOrder = async (orderData) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = orderData;

    // Amount should be in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt,
      notes: notes,
      payment_capture: 1, // Auto capture payment
    };

    console.log('Creating Razorpay order with options:', options);

    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created:', order);

    return {
      success: true,
      order: order,
      key_id: process.env.RAZORPAY_KEY_ID, // Frontend needs this
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Razorpay payment signature
 * @param {Object} paymentData - Payment verification data
 * @returns {Boolean} Verification result
 */
const verifyPayment = (paymentData) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // Create signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', razorpay_signature);

    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

/**
 * Verify webhook signature
 * @param {String} body - Webhook body
 * @param {String} signature - Webhook signature
 * @returns {Boolean} Verification result
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Object} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      payment: payment,
    };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fetch order details
 * @param {String} orderId - Razorpay order ID
 * @returns {Object} Order details
 */
const fetchOrder = async (orderId) => {
  try {
    const order = await razorpay.orders.fetch(orderId);
    return {
      success: true,
      order: order,
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Refund amount in rupees
 * @param {Object} notes - Additional notes
 * @returns {Object} Refund details
 */
const createRefund = async (paymentId, amount, notes = {}) => {
  try {
    const amountInPaise = Math.round(amount * 100);
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amountInPaise,
      notes: notes,
    });

    return {
      success: true,
      refund: refund,
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all refunds for a payment
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Object} Refunds list
 */
const fetchRefunds = async (paymentId) => {
  try {
    const refunds = await razorpay.payments.fetchMultipleRefund(paymentId);
    return {
      success: true,
      refunds: refunds,
    };
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Convert amount from rupees to paise
 * @param {Number} amount - Amount in rupees
 * @returns {Number} Amount in paise
 */
const convertToPaise = (amount) => {
  return Math.round(amount * 100);
};

/**
 * Convert amount from paise to rupees
 * @param {Number} amount - Amount in paise
 * @returns {Number} Amount in rupees
 */
const convertToRupees = (amount) => {
  return amount / 100;
};

/**
 * Validate Razorpay configuration
 * @returns {Boolean} Configuration validity
 */
const validateConfig = () => {
  const requiredEnvVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing Razorpay environment variables:', missingVars);
    return false;
  }

  return true;
};

module.exports = {
  createOrder,
  verifyPayment,
  verifyWebhookSignature,
  fetchPayment,
  fetchOrder,
  createRefund,
  fetchRefunds,
  convertToPaise,
  convertToRupees,
  validateConfig,
  razorpay, // Export instance for advanced usage
};

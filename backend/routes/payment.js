const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const {
  createOrder,
  verifyPayment,
  verifyWebhookSignature,
  fetchPayment,
  fetchOrder,
  createRefund,
  validateConfig,
  convertToRupees
} = require('../services/razorpayService');

// Validate Razorpay configuration on startup
if (!validateConfig()) {
  console.error('Razorpay configuration is invalid. Payment routes may not work properly.');
}

/**
 * @route   POST /api/payment/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR', items, shippingAddress, notes = {} } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    // Generate unique receipt ID
    const receipt = `order_${Date.now()}_${req.user._id}`;

    // Add user info to notes
    const orderNotes = {
      ...notes,
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      userName: req.user.name,
    };

    // Create Razorpay order
    const razorpayResult = await createOrder({
      amount,
      currency,
      receipt,
      notes: orderNotes
    });

    if (!razorpayResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: razorpayResult.error
      });
    }

    // Create order in database with pending status
    const order = new Order({
      user: req.user._id,
      items: items.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress,
      paymentMethod: 'razorpay',
      itemsPrice: amount,
      taxPrice: 0, // Will be calculated based on items
      shippingPrice: 0, // Will be calculated based on amount
      totalPrice: amount,
      razorpayOrderId: razorpayResult.order.id,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    await order.save();

    res.json({
      success: true,
      order: {
        id: razorpayResult.order.id,
        amount: razorpayResult.order.amount,
        currency: razorpayResult.order.currency,
        receipt: razorpayResult.order.receipt,
      },
      key_id: razorpayResult.key_id,
      orderId: order._id,
      user: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone || ''
      }
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment
 * @access  Private
 */
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification data'
      });
    }

    // Verify payment signature
    const isValidSignature = verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find order in database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    // Fetch payment details from Razorpay
    const paymentResult = await fetchPayment(razorpay_payment_id);
    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details'
      });
    }

    // Update order with payment details
    order.razorpayPaymentId = razorpay_payment_id;
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paidAt = new Date();
    order.paymentDetails = {
      method: paymentResult.payment.method,
      bank: paymentResult.payment.bank,
      wallet: paymentResult.payment.wallet,
      vpa: paymentResult.payment.vpa,
      cardId: paymentResult.payment.card_id,
      amount: convertToRupees(paymentResult.payment.amount),
      currency: paymentResult.payment.currency,
      status: paymentResult.payment.status,
      createdAt: new Date(paymentResult.payment.created_at * 1000)
    };

    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order._id,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalPrice,
        paidAt: order.paidAt
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle Razorpay webhooks
 * @access  Public (but verified)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event, event.payload);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// Helper function to handle payment captured event
const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order && order.paymentStatus !== 'completed') {
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.paidAt = new Date();
      await order.save();
      console.log('Order payment captured:', order._id);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

// Helper function to handle payment failed event
const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: payment.order_id });
    if (order) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      console.log('Order payment failed:', order._id);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Helper function to handle order paid event
const handleOrderPaid = async (orderData) => {
  try {
    const order = await Order.findOne({ razorpayOrderId: orderData.id });
    if (order) {
      order.paymentStatus = 'completed';
      order.orderStatus = 'confirmed';
      order.paidAt = new Date();
      await order.save();
      console.log('Order paid:', order._id);
    }
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
};

/**
 * @route   GET /api/payment/config
 * @desc    Get Razorpay configuration for frontend
 * @access  Public
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID,
    currency: 'INR'
  });
});

module.exports = router;

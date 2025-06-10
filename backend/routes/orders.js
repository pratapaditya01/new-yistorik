const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test route to verify orders endpoint is working
router.get('/test', (req, res) => {
  res.json({ message: 'Orders route is working!' });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (supports guest checkout)
router.post('/', async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discountAmount,
      couponCode,
      guestInfo,
      isGuestOrder
    } = req.body;

    // Check if user is authenticated
    const isAuthenticated = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    let userId = null;

    if (isAuthenticated) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const User = require('../models/User');
        const user = await User.findById(decoded.id);
        if (user) {
          userId = user._id;
        }
      } catch (error) {
        // Token invalid, treat as guest
        console.log('Invalid token, treating as guest order');
      }
    }

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify products exist and prices are correct
    console.log('Order items received:', orderItems);
    for (let item of orderItems) {
      // Handle both productId and product field names
      const productId = item.productId || item.product;
      console.log(`Looking for product with ID: ${productId}`);
      console.log(`Item structure:`, JSON.stringify(item, null, 2));

      if (!productId) {
        console.log(`No product ID found for item: ${item.name}`);
        return res.status(400).json({ message: `Product ID missing for ${item.name}` });
      }

      // Validate ObjectId format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        console.log(`Invalid product ID format: ${productId}`);
        return res.status(400).json({ message: `Invalid product ID format for ${item.name}` });
      }

      const product = await Product.findById(productId);
      console.log(`Product lookup result:`, product ? `Found: ${product.name}` : 'Not found');

      if (!product) {
        console.log(`Product not found: ${productId} for item: ${item.name}`);
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      console.log(`Product found: ${product.name} with price: ${product.price}`);

      if (product.price !== item.price) {
        return res.status(400).json({ message: `Price mismatch for ${item.name}` });
      }
      // Check stock if tracking quantity
      if (product.trackQuantity && product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.name}. Available: ${product.quantity}`
        });
      }
    }

    // Normalize order items to ensure consistent product field
    const normalizedOrderItems = orderItems.map(item => ({
      ...item,
      product: item.productId || item.product // Ensure product field is set
    }));

    // Create order data
    const orderData = {
      orderItems: normalizedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      discountAmount: discountAmount || 0,
      couponCode: couponCode || '',
      isGuestOrder: !userId
    };

    // Add user or guest info
    if (userId) {
      orderData.user = userId;
    } else {
      orderData.guestInfo = guestInfo;
    }

    const order = new Order(orderData);

    const createdOrder = await order.save();

    // Update product quantities
    for (let item of normalizedOrderItems) {
      const productId = item.productId || item.product;
      const product = await Product.findById(productId);
      if (product && product.trackQuantity) {
        product.quantity -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
});

// @desc    Get user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('orderItems.product', 'name slug images');

    const total = await Order.countDocuments({ user: req.user._id });

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('User orders fetch error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name slug images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Order payment update error:', error);
    res.status(500).json({ message: 'Server error updating order payment' });
  }
});

module.exports = router;

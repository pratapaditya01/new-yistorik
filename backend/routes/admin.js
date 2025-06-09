const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { upload, deleteImage, extractPublicId } = require('../config/cloudinary');

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect, admin);

// Dashboard stats - Optimized with parallel queries
router.get('/dashboard', async (req, res) => {
  try {
    // Execute all queries in parallel for better performance
    const [
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      orderStats
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(), // Use lean() for better performance
      Product.find({
        trackQuantity: true,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
      })
        .select('name quantity lowStockThreshold')
        .limit(10)
        .lean(),
      // Get order statistics for the last 30 days
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

// Product Management
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { sku: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const productData = { ...req.body };

    // Validate required fields
    if (!productData.name || productData.name.trim().length === 0) {
      return res.status(400).json({
        message: 'Product name is required and cannot be empty'
      });
    }

    if (!productData.description || productData.description.trim().length === 0) {
      return res.status(400).json({
        message: 'Product description is required and cannot be empty'
      });
    }

    if (!productData.category) {
      return res.status(400).json({
        message: 'Product category is required'
      });
    }

    // Generate slug if not provided (will also be handled by pre-save hook)
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (!productData.slug) {
        productData.slug = `product-${Date.now()}`;
      }
    }

    // Ensure price is a number
    if (productData.price) {
      productData.price = parseFloat(productData.price);
    }

    // Ensure quantity is a number
    if (productData.quantity) {
      productData.quantity = parseInt(productData.quantity);
    }

    console.log('Creating product with data:', productData);

    const product = new Product(productData);
    const savedProduct = await product.save();

    // Populate category for response
    await savedProduct.populate('category', 'name slug');

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Product creation error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field} already exists. Please use a different value.`
      });
    }

    res.status(500).json({
      message: 'Server error creating product',
      error: error.message
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = { ...req.body };

    // Images are now handled separately through the upload API
    // They come as an array of image objects with url and publicId

    Object.assign(product, updateData);
    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      message: 'Server error updating product',
      error: error.message
    });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          try {
            await deleteImage(image.publicId);
          } catch (imageError) {
            console.error('Error deleting image from Cloudinary:', imageError);
            // Continue with product deletion even if image deletion fails
          }
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Category Management
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name')
      .populate('subcategories', 'name')
      .sort({ sortOrder: 1, name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Admin categories fetch error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

router.post('/categories', upload.single('image'), async (req, res) => {
  try {
    const categoryData = { ...req.body };

    if (req.file) {
      categoryData.image = req.file.path; // Cloudinary URL
      categoryData.imagePublicId = req.file.filename; // Cloudinary public ID
    }

    const category = new Category(categoryData);
    const savedCategory = await category.save();

    // Update parent category if specified
    if (categoryData.parentCategory) {
      await Category.findByIdAndUpdate(
        categoryData.parentCategory,
        { $push: { subcategories: savedCategory._id } }
      );
    }

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ message: 'Server error creating category' });
  }
});

router.put('/categories/:id', upload.single('image'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updateData = { ...req.body };

    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (category.imagePublicId) {
        try {
          await deleteImage(category.imagePublicId);
        } catch (imageError) {
          console.error('Error deleting old category image:', imageError);
        }
      }

      updateData.image = req.file.path; // Cloudinary URL
      updateData.imagePublicId = req.file.filename; // Cloudinary public ID
    }

    Object.assign(category, updateData);
    const updatedCategory = await category.save();

    res.json(updatedCategory);
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ message: 'Server error updating category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category with existing products'
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ message: 'Server error deleting category' });
  }
});

// Order Management
router.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.search) {
      query.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

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
    console.error('Admin orders fetch error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (note) {
      order.notes = note;
    }

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

// Update order tracking information
router.put('/orders/:id/tracking', async (req, res) => {
  try {
    const { trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update tracking information
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (notes) {
      order.notes = notes;
    }

    // If tracking number is provided and status is still processing, update to shipped
    if (trackingNumber && order.status === 'processing') {
      order.status = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        date: new Date(),
        note: `Tracking number added: ${trackingNumber}`
      });
    }

    const updatedOrder = await order.save();
    res.json({ message: 'Tracking information updated successfully', order: updatedOrder });
  } catch (error) {
    console.error('Error updating tracking information:', error);
    res.status(500).json({ message: 'Server error updating tracking information' });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error('User status update error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

module.exports = router;

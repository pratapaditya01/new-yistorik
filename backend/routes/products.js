const express = require('express');
const Product = require('../models/Product');
const { protect, admin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products with filtering, sorting, and pagination (Optimized)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12)); // Limit max results
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Subcategory filter
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = { $regex: req.query.brand, $options: 'i' };
    }

    // Search filter
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      query.$or = [
        { trackQuantity: false },
        { $and: [{ trackQuantity: true }, { quantity: { $gt: 0 } }] }
      ];
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'name_asc':
        sort.name = 1;
        break;
      case 'name_desc':
        sort.name = -1;
        break;
      case 'rating':
        sort.averageRating = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      default:
        sort.sortOrder = 1;
        sort.createdAt = -1;
    }

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-reviews -description') // Exclude heavy fields for list view
        .lean(), // Use lean() for better performance
      Product.countDocuments(query)
    ]);

    // Set cache headers for better performance
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache

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
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has this product in wishlist
    let isInWishlist = false;
    if (req.user) {
      isInWishlist = req.user.wishlist.includes(product._id);
    }

    res.json({
      ...product.toJSON(),
      isInWishlist
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured/list
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate('category', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit)
      .select('-reviews');

    res.json(products);
  } catch (error) {
    console.error('Featured products fetch error:', error);
    res.status(500).json({ message: 'Server error fetching featured products' });
  }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide rating and comment' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.calculateAverageRating();

    await product.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Review add error:', error);
    res.status(500).json({ message: 'Server error adding review' });
  }
});

module.exports = router;

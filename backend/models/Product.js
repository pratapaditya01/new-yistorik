const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true
  },
  barcode: {
    type: String,
    default: ''
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },
  quantity: {
    type: Number,
    required: function() { return this.trackQuantity; },
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isMain: { type: Boolean, default: false }
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  variants: [{
    name: { type: String, required: true }, // e.g., "Size", "Color"
    options: [{ type: String, required: true }] // e.g., ["S", "M", "L"] or ["Red", "Blue"]
  }],

  // Available sizes with detailed information
  sizes: [{
    name: {
      type: String,
      required: true // e.g., "S", "M", "L", "XL", "XXL"
    },
    label: {
      type: String,
      required: true // e.g., "Small", "Medium", "Large"
    },
    measurements: {
      chest: String, // e.g., "36-38 inches"
      waist: String,
      length: String,
      sleeve: String,
      shoulder: String
    },
    stock: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],

  // Size chart information
  sizeChart: {
    enabled: {
      type: Boolean,
      default: false
    },
    image: String, // URL to size chart image
    description: String,
    measurements: [{
      size: String, // Size name
      chest: String,
      waist: String,
      length: String,
      sleeve: String,
      shoulder: String
    }]
  },
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
  },
  seoDescription: {
    type: String,
    maxlength: [160, 'SEO description cannot exceed 160 characters']
  },
  sortOrder: {
    type: Number,
    default: 0
  },

  // GST and Tax Information (India)
  gstRate: {
    type: Number,
    default: 18, // Default 18% GST
    min: [0, 'GST rate cannot be negative'],
    max: [28, 'GST rate cannot exceed 28%'],
    validate: {
      validator: function(value) {
        // Allow up to 2 decimal places
        return Number.isFinite(value) && /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'GST rate can have maximum 2 decimal places'
    }
  },
  gstType: {
    type: String,
    enum: ['CGST_SGST', 'IGST', 'EXEMPT', 'ZERO_RATED'],
    default: 'CGST_SGST'
  },
  hsnCode: {
    type: String,
    trim: true,
    maxlength: [10, 'HSN code cannot exceed 10 characters'],
    default: ''
  },
  gstInclusive: {
    type: Boolean,
    default: false // Whether price includes GST or not
  },
  taxable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  // Always ensure we have a slug
  if (!this.slug || this.isModified('name')) {
    if (this.name && this.name.trim().length > 0) {
      let slug = this.name
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters but keep spaces
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      // Ensure slug is not empty
      if (!slug || slug.length === 0) {
        slug = `product-${Date.now()}`;
      }

      this.slug = slug;
    } else {
      // Generate a default slug if no name or empty name
      this.slug = `product-${Date.now()}`;
    }
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Check if product is in stock
productSchema.virtual('inStock').get(function() {
  return !this.trackQuantity || this.quantity > 0;
});

// Check if product is low stock
productSchema.virtual('isLowStock').get(function() {
  return this.trackQuantity && this.quantity <= this.lowStockThreshold;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

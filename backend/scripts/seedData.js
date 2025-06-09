const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    // Create demo user
    const userPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: userPassword,
      role: 'user',
      isActive: true,
    });

    console.log('Created users');

    // Create categories
    const categories = await Category.create([
      {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Comfortable and stylish t-shirts for everyday wear',
        isActive: true,
      },
      {
        name: 'Jackets',
        slug: 'jackets',
        description: 'Stylish jackets for all seasons',
        isActive: true,
      },
      {
        name: 'Dresses',
        slug: 'dresses',
        description: 'Beautiful dresses for every occasion',
        isActive: true,
      },
      {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Comfortable and fashionable footwear',
        isActive: true,
      },
    ]);

    console.log('Created categories');

    // Create products
    const products = await Product.create([
      {
        name: 'Classic White T-Shirt',
        slug: 'classic-white-t-shirt',
        description: 'A comfortable cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a relaxed fit.',
        shortDescription: 'Comfortable cotton t-shirt perfect for everyday wear',
        price: 29.99,
        comparePrice: 39.99,
        sku: 'TSH-WHT-001',
        category: categories[0]._id, // T-Shirts
        quantity: 50,
        trackQuantity: true,
        lowStockThreshold: 10,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            alt: 'Classic White T-Shirt',
            isMain: true
          }
        ],
        isActive: true,
        isFeatured: true,
        tags: ['cotton', 'casual', 'basic'],
        specifications: [
          { name: 'Material', value: '100% Organic Cotton' },
          { name: 'Fit', value: 'Relaxed' },
          { name: 'Care', value: 'Machine wash cold' }
        ]
      },
      {
        name: 'Denim Jacket',
        slug: 'denim-jacket',
        description: 'Vintage-style denim jacket with modern fit. Features classic button closure and multiple pockets.',
        shortDescription: 'Vintage-style denim jacket with modern fit',
        price: 89.99,
        comparePrice: 120.00,
        sku: 'JKT-DNM-001',
        category: categories[1]._id, // Jackets
        quantity: 25,
        trackQuantity: true,
        lowStockThreshold: 5,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            alt: 'Denim Jacket',
            isMain: true
          }
        ],
        isActive: true,
        isFeatured: false,
        tags: ['denim', 'vintage', 'casual'],
        specifications: [
          { name: 'Material', value: '100% Cotton Denim' },
          { name: 'Fit', value: 'Regular' },
          { name: 'Closure', value: 'Button' }
        ]
      },
      {
        name: 'Summer Dress',
        slug: 'summer-dress',
        description: 'Light and breezy summer dress perfect for warm days. Features a flattering A-line silhouette.',
        shortDescription: 'Light and breezy summer dress for warm days',
        price: 79.99,
        sku: 'DRS-SUM-001',
        category: categories[2]._id, // Dresses
        quantity: 30,
        trackQuantity: true,
        lowStockThreshold: 8,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            alt: 'Summer Dress',
            isMain: true
          }
        ],
        isActive: true,
        isFeatured: true,
        tags: ['summer', 'dress', 'casual'],
        specifications: [
          { name: 'Material', value: 'Cotton Blend' },
          { name: 'Length', value: 'Knee Length' },
          { name: 'Fit', value: 'A-Line' }
        ]
      },
      {
        name: 'Leather Boots',
        slug: 'leather-boots',
        description: 'Durable leather boots perfect for all occasions. Handcrafted with premium materials.',
        shortDescription: 'Durable leather boots for all occasions',
        price: 159.99,
        sku: 'SHO-LTH-001',
        category: categories[3]._id, // Shoes
        quantity: 20,
        trackQuantity: true,
        lowStockThreshold: 5,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            alt: 'Leather Boots',
            isMain: true
          }
        ],
        isActive: true,
        isFeatured: false,
        tags: ['leather', 'boots', 'formal'],
        specifications: [
          { name: 'Material', value: 'Genuine Leather' },
          { name: 'Sole', value: 'Rubber' },
          { name: 'Style', value: 'Ankle Boot' }
        ]
      },
      {
        name: 'Wool Sweater',
        slug: 'wool-sweater',
        description: 'Cozy wool sweater perfect for cold weather. Features a classic crew neck design.',
        shortDescription: 'Cozy wool sweater for cold weather',
        price: 119.99,
        sku: 'SWT-WOL-001',
        category: categories[0]._id, // T-Shirts (using as general clothing)
        quantity: 0,
        trackQuantity: true,
        lowStockThreshold: 10,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            alt: 'Wool Sweater',
            isMain: true
          }
        ],
        isActive: false, // Out of stock
        isFeatured: false,
        tags: ['wool', 'sweater', 'winter'],
        specifications: [
          { name: 'Material', value: '100% Merino Wool' },
          { name: 'Fit', value: 'Regular' },
          { name: 'Neckline', value: 'Crew Neck' }
        ]
      }
    ]);

    console.log('Created products');

    // Create sample order
    const sampleOrder = await Order.create({
      orderNumber: 'ORD-' + Date.now(),
      user: demoUser._id,
      orderItems: [
        {
          product: products[0]._id,
          name: products[0].name,
          image: products[0].images[0].url,
          price: products[0].price,
          quantity: 2
        },
        {
          product: products[2]._id,
          name: products[2].name,
          image: products[2].images[0].url,
          price: products[2].price,
          quantity: 1
        }
      ],
      shippingAddress: {
        fullName: 'Demo User',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        phone: '+1234567890'
      },
      paymentMethod: 'credit_card',
      itemsPrice: 139.97,
      taxPrice: 11.20,
      shippingPrice: 9.99,
      totalPrice: 161.16,
      isPaid: true,
      paidAt: new Date(),
      status: 'processing'
    });

    console.log('Created sample order');

    console.log('✅ Database seeded successfully!');
    console.log('Admin credentials: admin@example.com / admin123');
    console.log('User credentials: demo@example.com / demo123');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  process.exit(0);
};

runSeed();

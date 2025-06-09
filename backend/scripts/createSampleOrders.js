const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

console.log('🔄 Creating sample orders...');

async function createSampleOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });
    console.log('✅ Connected to MongoDB');

    // Get users and products
    const users = await User.find().limit(3);
    const products = await Product.find().limit(5);

    if (users.length === 0 || products.length === 0) {
      console.log('❌ No users or products found. Please run seedData.js first.');
      return;
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing orders');

    console.log('📋 Found users:', users.length);
    console.log('📋 Found products:', products.length);

    // Use available users (repeat if needed)
    const getUser = (index) => users[index % users.length];

    // Sample orders data
    const sampleOrders = [
      {
        orderNumber: `ORD-${Date.now()}-0001`,
        user: getUser(0)._id,
        orderItems: [
          {
            product: products[0]._id,
            name: products[0].name,
            image: products[0].images?.[0]?.url || '/placeholder.jpg',
            price: products[0].price,
            quantity: 2,
            selectedVariants: [
              { name: 'Size', value: 'Large' },
              { name: 'Color', value: 'Blue' }
            ]
          },
          {
            product: products[1]._id,
            name: products[1].name,
            image: products[1].images?.[0]?.url || '/placeholder.jpg',
            price: products[1].price,
            quantity: 1,
            selectedVariants: []
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1-555-0123'
        },
        paymentMethod: 'credit_card',
        itemsPrice: (products[0].price * 2) + products[1].price,
        taxPrice: ((products[0].price * 2) + products[1].price) * 0.08,
        shippingPrice: 10.00,
        totalPrice: ((products[0].price * 2) + products[1].price) * 1.08 + 10,
        isPaid: true,
        paidAt: new Date(),
        status: 'processing',
        notes: 'Customer requested expedited shipping'
      },
      {
        orderNumber: `ORD-${Date.now()}-0002`,
        user: getUser(1)._id,
        orderItems: [
          {
            product: products[2]._id,
            name: products[2].name,
            image: products[2].images?.[0]?.url || '/placeholder.jpg',
            price: products[2].price,
            quantity: 1,
            selectedVariants: [
              { name: 'Size', value: 'Medium' }
            ]
          }
        ],
        shippingAddress: {
          fullName: 'Jane Smith',
          address: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'United States',
          phone: '+1-555-0456'
        },
        paymentMethod: 'paypal',
        itemsPrice: products[2].price,
        taxPrice: products[2].price * 0.08,
        shippingPrice: 0, // Free shipping
        totalPrice: products[2].price * 1.08,
        isPaid: true,
        paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'shipped',
        trackingNumber: 'TRK123456789',
        notes: 'Gift wrapping requested'
      },
      {
        orderNumber: `ORD-${Date.now()}-0003`,
        user: getUser(0)._id,
        orderItems: [
          {
            product: products[3]._id,
            name: products[3].name,
            image: products[3].images?.[0]?.url || '/placeholder.jpg',
            price: products[3].price,
            quantity: 1,
            selectedVariants: []
          },
          {
            product: products[0]._id,
            name: products[0].name,
            image: products[0].images?.[0]?.url || '/placeholder.jpg',
            price: products[0].price,
            quantity: 2,
            selectedVariants: [
              { name: 'Color', value: 'Black' }
            ]
          }
        ],
        shippingAddress: {
          fullName: 'Mike Johnson',
          address: '789 Pine Road',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'United States',
          phone: '+1-555-0789'
        },
        paymentMethod: 'cash_on_delivery',
        itemsPrice: products[3].price + (products[0].price * 2),
        taxPrice: (products[3].price + (products[0].price * 2)) * 0.08,
        shippingPrice: 15.00,
        totalPrice: (products[3].price + (products[0].price * 2)) * 1.08 + 15,
        isPaid: false,
        status: 'pending'
      },
      {
        orderNumber: `ORD-${Date.now()}-0004`,
        user: getUser(0)._id,
        orderItems: [
          {
            product: products[0]._id,
            name: products[0].name,
            image: products[0].images?.[0]?.url || '/placeholder.jpg',
            price: products[0].price,
            quantity: 1,
            selectedVariants: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'Red' }
            ]
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          address: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '+1-555-0123'
        },
        paymentMethod: 'credit_card',
        itemsPrice: products[0].price,
        taxPrice: products[0].price * 0.08,
        shippingPrice: 10.00,
        totalPrice: products[0].price * 1.08 + 10,
        isPaid: true,
        paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: 'delivered',
        isDelivered: true,
        deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        orderNumber: `ORD-${Date.now()}-0005`,
        user: getUser(1)._id,
        orderItems: [
          {
            product: products[1]._id,
            name: products[1].name,
            image: products[1].images?.[0]?.url || '/placeholder.jpg',
            price: products[1].price,
            quantity: 1,
            selectedVariants: []
          }
        ],
        shippingAddress: {
          fullName: 'Jane Smith',
          address: '456 Oak Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'United States',
          phone: '+1-555-0456'
        },
        paymentMethod: 'credit_card',
        itemsPrice: products[1].price,
        taxPrice: products[1].price * 0.08,
        shippingPrice: 10.00,
        totalPrice: products[1].price * 1.08 + 10,
        isPaid: true,
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'cancelled',
        notes: 'Customer requested cancellation due to size issues'
      }
    ];

    // Create orders
    for (const orderData of sampleOrders) {
      const order = new Order(orderData);
      await order.save();
      console.log(`✅ Created order: ${order.orderNumber}`);
    }

    console.log('🎉 Sample orders created successfully!');

  } catch (error) {
    console.error('❌ Error creating sample orders:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔚 Disconnected from MongoDB');
    process.exit(0);
  }
}

createSampleOrders();

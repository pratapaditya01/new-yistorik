const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categoryHierarchy = {
  // Men's Collection
  men: {
    name: 'Men\'s Collection',
    slug: 'men',
    description: 'Complete collection of men\'s fashion and accessories',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 1,
    subcategories: {
      'mens-clothing': {
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Men\'s clothing essentials',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
        subcategories: {
          'mens-shirts': {
            name: 'Shirts',
            slug: 'mens-shirts',
            description: 'Formal and casual shirts for men',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 1
          },
          'mens-t-shirts': {
            name: 'T-Shirts',
            slug: 'mens-t-shirts',
            description: 'Comfortable t-shirts and polos',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 2
          },
          'mens-jeans': {
            name: 'Men\'s Jeans',
            slug: 'mens-jeans',
            description: 'Denim jeans in various fits',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 3
          },
          'mens-trousers': {
            name: 'Trousers',
            slug: 'mens-trousers',
            description: 'Formal and casual trousers',
            image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 4
          },
          'mens-jackets': {
            name: 'Jackets & Blazers',
            slug: 'mens-jackets',
            description: 'Jackets, blazers, and outerwear',
            image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 5
          }
        }
      },
      'mens-footwear': {
        name: 'Men\'s Footwear',
        slug: 'mens-footwear',
        description: 'Men\'s shoes and footwear',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
        subcategories: {
          'mens-formal-shoes': {
            name: 'Formal Shoes',
            slug: 'mens-formal-shoes',
            description: 'Dress shoes and formal footwear',
            sortOrder: 1
          },
          'mens-casual-shoes': {
            name: 'Casual Shoes',
            slug: 'mens-casual-shoes',
            description: 'Sneakers and casual footwear',
            sortOrder: 2
          },
          'mens-boots': {
            name: 'Men\'s Boots',
            slug: 'mens-boots',
            description: 'Boots for all occasions',
            sortOrder: 3
          }
        }
      },
      'mens-accessories': {
        name: 'Men\'s Accessories',
        slug: 'mens-accessories',
        description: 'Men\'s accessories and essentials',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 3,
        subcategories: {
          'mens-watches': {
            name: 'Watches',
            slug: 'mens-watches',
            description: 'Stylish watches for men',
            sortOrder: 1
          },
          'mens-bags': {
            name: 'Men\'s Bags',
            slug: 'mens-bags',
            description: 'Backpacks, briefcases, and bags',
            sortOrder: 2
          },
          'mens-belts': {
            name: 'Belts',
            slug: 'mens-belts',
            description: 'Leather and fabric belts',
            sortOrder: 3
          }
        }
      }
    }
  },

  // Women's Collection
  women: {
    name: 'Women\'s Collection',
    slug: 'women',
    description: 'Complete collection of women\'s fashion and accessories',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 2,
    subcategories: {
      'womens-clothing': {
        name: 'Women\'s Clothing',
        slug: 'womens-clothing',
        description: 'Women\'s clothing essentials',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
        subcategories: {
          'womens-dresses': {
            name: 'Dresses',
            slug: 'womens-dresses',
            description: 'Beautiful dresses for every occasion',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 1
          },
          'womens-tops': {
            name: 'Tops & Blouses',
            slug: 'womens-tops',
            description: 'Stylish tops and blouses',
            image: 'https://images.unsplash.com/photo-1564257577-0a4b8e8b8c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 2
          },
          'womens-jeans': {
            name: 'Women\'s Jeans',
            slug: 'womens-jeans',
            description: 'Trendy jeans and denim',
            image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            sortOrder: 3
          },
          'womens-skirts': {
            name: 'Skirts',
            slug: 'womens-skirts',
            description: 'Elegant skirts and bottoms',
            sortOrder: 4
          },
          'womens-jackets': {
            name: 'Jackets & Coats',
            slug: 'womens-jackets',
            description: 'Stylish outerwear for women',
            sortOrder: 5
          }
        }
      },
      'womens-footwear': {
        name: 'Women\'s Footwear',
        slug: 'womens-footwear',
        description: 'Women\'s shoes and footwear',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
        subcategories: {
          'womens-heels': {
            name: 'Heels',
            slug: 'womens-heels',
            description: 'High heels and dress shoes',
            sortOrder: 1
          },
          'womens-flats': {
            name: 'Flats',
            slug: 'womens-flats',
            description: 'Comfortable flats and loafers',
            sortOrder: 2
          },
          'womens-sneakers': {
            name: 'Sneakers',
            slug: 'womens-sneakers',
            description: 'Casual and athletic sneakers',
            sortOrder: 3
          },
          'womens-boots': {
            name: 'Women\'s Boots',
            slug: 'womens-boots',
            description: 'Stylish boots for all seasons',
            sortOrder: 4
          }
        }
      },
      'womens-accessories': {
        name: 'Women\'s Accessories',
        slug: 'womens-accessories',
        description: 'Women\'s accessories and jewelry',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sortOrder: 3,
        subcategories: {
          'womens-jewelry': {
            name: 'Jewelry',
            slug: 'womens-jewelry',
            description: 'Beautiful jewelry and accessories',
            sortOrder: 1
          },
          'womens-bags': {
            name: 'Handbags',
            slug: 'womens-bags',
            description: 'Stylish handbags and purses',
            sortOrder: 2
          },
          'womens-scarves': {
            name: 'Scarves',
            slug: 'womens-scarves',
            description: 'Elegant scarves and wraps',
            sortOrder: 3
          }
        }
      }
    }
  },

  // Kids Collection
  kids: {
    name: 'Kids Collection',
    slug: 'kids',
    description: 'Adorable clothing and accessories for children',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 3,
    subcategories: {
      'boys-clothing': {
        name: 'Boys',
        slug: 'boys-clothing',
        description: 'Clothing for boys',
        sortOrder: 1
      },
      'girls-clothing': {
        name: 'Girls',
        slug: 'girls-clothing',
        description: 'Clothing for girls',
        sortOrder: 2
      },
      'kids-footwear': {
        name: 'Kids Footwear',
        slug: 'kids-footwear',
        description: 'Shoes for children',
        sortOrder: 3
      }
    }
  },

  // Home & Living
  home: {
    name: 'Home & Living',
    slug: 'home',
    description: 'Home decor and lifestyle products',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sortOrder: 4,
    subcategories: {
      'home-decor': {
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Decorative items for your home',
        sortOrder: 1
      },
      'bedding': {
        name: 'Bedding',
        slug: 'bedding',
        description: 'Bed sheets, pillows, and bedding',
        sortOrder: 2
      }
    }
  }
};

async function setupCategoryHierarchy() {
  try {
    console.log('🔄 Setting up category hierarchy...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Create categories recursively
    const createdCategories = new Map();

    async function createCategory(categoryData, parentId = null, level = 0) {
      const indent = '  '.repeat(level);
      
      const category = new Category({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        image: categoryData.image || '',
        sortOrder: categoryData.sortOrder || 0,
        parentCategory: parentId,
        isActive: true
      });

      const savedCategory = await category.save();
      createdCategories.set(categoryData.slug, savedCategory._id);
      
      console.log(`${indent}✅ Created: ${categoryData.name} (${categoryData.slug})`);

      // Update parent category with subcategory reference
      if (parentId) {
        await Category.findByIdAndUpdate(
          parentId,
          { $push: { subcategories: savedCategory._id } }
        );
      }

      // Create subcategories if they exist
      if (categoryData.subcategories) {
        for (const [key, subcategoryData] of Object.entries(categoryData.subcategories)) {
          await createCategory(subcategoryData, savedCategory._id, level + 1);
        }
      }

      return savedCategory;
    }

    // Create all categories
    for (const [key, categoryData] of Object.entries(categoryHierarchy)) {
      await createCategory(categoryData);
      console.log(''); // Add spacing between main categories
    }

    console.log('🎉 Category hierarchy setup complete!');
    console.log(`📊 Total categories created: ${createdCategories.size}`);

    // Display hierarchy
    console.log('\n📋 Category Hierarchy:');
    const allCategories = await Category.find()
      .populate('parentCategory', 'name')
      .populate('subcategories', 'name')
      .sort({ sortOrder: 1, name: 1 });

    const rootCategories = allCategories.filter(cat => !cat.parentCategory);
    
    function displayHierarchy(categories, level = 0) {
      const indent = '  '.repeat(level);
      for (const category of categories) {
        console.log(`${indent}- ${category.name} (${category.subcategories.length} subcategories)`);
        
        const children = allCategories.filter(cat => 
          cat.parentCategory && cat.parentCategory._id.toString() === category._id.toString()
        );
        
        if (children.length > 0) {
          displayHierarchy(children, level + 1);
        }
      }
    }

    displayHierarchy(rootCategories);

  } catch (error) {
    console.error('❌ Error setting up category hierarchy:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔚 Database disconnected');
  }
}

// Run the setup
setupCategoryHierarchy();

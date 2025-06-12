import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getMainImageUrl } from '../../utils/imageUtils';

const MegaMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      
      // Get only root categories (Men's, Women's, etc.)
      const rootCategories = response.filter(cat => !cat.parentCategory);
      
      // For each root category, get its subcategories
      const categoriesWithChildren = await Promise.all(
        rootCategories.map(async (rootCat) => {
          const subcategories = response.filter(cat => 
            cat.parentCategory === rootCat._id
          );
          
          // For each subcategory, get its children
          const subcategoriesWithChildren = subcategories.map(subcat => ({
            ...subcat,
            children: response.filter(cat => cat.parentCategory === subcat._id)
          }));
          
          return {
            ...rootCat,
            subcategories: subcategoriesWithChildren
          };
        })
      );

      setCategories(categoriesWithChildren.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (categorySlug) => {
    setActiveMenu(categorySlug);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const renderMegaMenuContent = (category) => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-200 z-50"
        onMouseEnter={() => setActiveMenu(category.slug)}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Featured Category Image */}
            <div className="md:col-span-1">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={getMainImageUrl([{ url: category.image }])}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/300x200/f3f4f6/9ca3af?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="p-4">
                    <h3 className="text-white text-lg font-semibold">{category.name}</h3>
                    <Link
                      to={`/products?category=${category.slug}`}
                      className="text-white text-sm hover:underline"
                    >
                      Shop All →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Columns */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory._id} className="space-y-3">
                    <Link
                      to={`/products?category=${subcategory.slug}`}
                      className="block text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                    >
                      {subcategory.name}
                    </Link>
                    
                    {subcategory.children && subcategory.children.length > 0 && (
                      <ul className="space-y-2">
                        {subcategory.children.map((child) => (
                          <li key={child._id}>
                            <Link
                              to={`/products?category=${child.slug}`}
                              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Products or Promotions */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
                <h4 className="text-lg font-semibold mb-2">New Arrivals</h4>
                <p className="text-sm mb-4">Discover the latest trends in {category.name.toLowerCase()}</p>
                <Link
                  to={`/products?category=${category.slug}&sort=newest`}
                  className="inline-block bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  Shop Now
                </Link>
              </div>
              
              <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-lg p-6 text-white">
                <h4 className="text-lg font-semibold mb-2">Sale Items</h4>
                <p className="text-sm mb-4">Up to 50% off on selected items</p>
                <Link
                  to={`/products?category=${category.slug}&sale=true`}
                  className="inline-block bg-white text-pink-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  View Sale
                </Link>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-6 text-white">
                <h4 className="text-lg font-semibold mb-2">Best Sellers</h4>
                <p className="text-sm mb-4">Most popular items in {category.name.toLowerCase()}</p>
                <Link
                  to={`/products?category=${category.slug}&sort=popular`}
                  className="inline-block bg-white text-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return null;
  }

  return (
    <div className="relative">
      {/* Main Navigation */}
      <div className="flex items-center space-x-8">
        {categories.map((category) => (
          <div
            key={category._id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.slug)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={`/products?category=${category.slug}`}
              className={`text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeMenu === category.slug ? 'text-indigo-600' : ''
              }`}
            >
              {category.name}
            </Link>

            {/* Mega Menu Content */}
            <AnimatePresence>
              {activeMenu === category.slug && renderMegaMenuContent(category)}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;

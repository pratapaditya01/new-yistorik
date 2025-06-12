import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const CategoryNavigation = ({ isMobile = false, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCategories, setOpenCategories] = useState(new Set());
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      
      // Organize categories into hierarchy
      const categoryMap = new Map();
      const rootCategories = [];

      // First pass: create map of all categories
      response.forEach(category => {
        categoryMap.set(category._id, { ...category, children: [] });
      });

      // Second pass: organize hierarchy
      response.forEach(category => {
        if (category.parentCategory) {
          const parent = categoryMap.get(category.parentCategory);
          if (parent) {
            parent.children.push(categoryMap.get(category._id));
          }
        } else {
          rootCategories.push(categoryMap.get(category._id));
        }
      });

      // Sort categories by sortOrder
      const sortCategories = (cats) => {
        cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        cats.forEach(cat => {
          if (cat.children.length > 0) {
            sortCategories(cat.children);
          }
        });
      };

      sortCategories(rootCategories);
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(categoryId)) {
      newOpenCategories.delete(categoryId);
    } else {
      newOpenCategories.add(categoryId);
    }
    setOpenCategories(newOpenCategories);
  };

  const handleCategoryClick = (category) => {
    if (onClose) onClose();
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isOpen = openCategories.has(category._id);
    const paddingLeft = level * 16;

    return (
      <div key={category._id} className="relative">
        <div
          className={`flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors duration-200 ${
            level > 0 ? 'border-l border-gray-200' : ''
          }`}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
          onMouseEnter={() => !isMobile && setHoveredCategory(category._id)}
          onMouseLeave={() => !isMobile && setHoveredCategory(null)}
        >
          <Link
            to={`/products?category=${category.slug}`}
            onClick={() => handleCategoryClick(category)}
            className="flex-1 text-gray-700 hover:text-indigo-600 font-medium transition-colors duration-200"
          >
            {category.name}
          </Link>
          
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category._id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {isOpen ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Desktop Mega Menu */}
        {!isMobile && hasChildren && hoveredCategory === category._id && (
          <div className="absolute left-full top-0 w-64 bg-white shadow-lg border border-gray-200 rounded-md z-50">
            <div className="py-2">
              {category.children.map(child => (
                <Link
                  key={child._id}
                  to={`/products?category=${child.slug}`}
                  onClick={() => handleCategoryClick(child)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                >
                  {child.name}
                  {child.children && child.children.length > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({child.children.length})
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Accordion */}
        {isMobile && hasChildren && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden bg-gray-50"
              >
                {category.children.map(child => renderCategory(child, level + 1))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-white`}>
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <div className="py-2">
        {categories.map(category => renderCategory(category))}
      </div>
    </div>
  );
};

export default CategoryNavigation;

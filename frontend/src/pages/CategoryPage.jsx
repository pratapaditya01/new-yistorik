import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getMainImageUrl } from '../utils/imageUtils';
import {
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    sizes: [],
    inStock: false,
  });

  useEffect(() => {
    if (slug) {
      fetchCategoryData();
    }
  }, [slug, searchParams]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch category details
      const categoryResponse = await api.get(`/categories/${slug}`);
      setCategory(categoryResponse);

      // Fetch products for this category
      const params = new URLSearchParams(searchParams);
      params.set('category', slug);
      params.set('sort', sortBy);
      
      const productsResponse = await api.get(`/products?${params.toString()}`);
      setProducts(productsResponse.products || []);

      // Fetch subcategories
      const allCategoriesResponse = await api.get('/categories');
      const subcats = allCategoriesResponse.filter(cat => 
        cat.parentCategory === categoryResponse._id
      );
      setSubcategories(subcats);

    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategory(null);
      setProducts([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };

  const getBreadcrumbs = () => {
    if (!category) return [];
    
    const breadcrumbs = [
      { name: 'Home', href: '/' },
      { name: 'Products', href: '/products' },
    ];

    // Add parent categories if they exist
    if (category.parentCategory) {
      breadcrumbs.push({
        name: category.parentCategory.name,
        href: `/category/${category.parentCategory.slug}`
      });
    }

    breadcrumbs.push({
      name: category.name,
      href: `/category/${category.slug}`,
      current: true
    });

    return breadcrumbs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero Section */}
      <div className="relative h-64 bg-gray-900">
        {category.image && (
          <img
            src={getMainImageUrl([{ url: category.image }])}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/1200x400/f3f4f6/9ca3af?text=Category';
            }}
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.name}>
                <div className="flex items-center">
                  {index > 0 && (
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-4" />
                  )}
                  {breadcrumb.current ? (
                    <span className="text-gray-500 font-medium">
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link
                      to={breadcrumb.href}
                      className="text-gray-700 hover:text-indigo-600 font-medium"
                    >
                      {breadcrumb.name}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat._id}
                  to={`/category/${subcat.slug}`}
                  className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="aspect-square bg-gray-100">
                    {subcat.image ? (
                      <img
                        src={getMainImageUrl([{ url: subcat.image }])}
                        alt={subcat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=Category';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Squares2X2Icon className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 text-center">
                      {subcat.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>
            <p className="text-gray-600">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Name A-Z</option>
              <option value="-name">Name Z-A</option>
              <option value="price">Price Low to High</option>
              <option value="-price">Price High to Low</option>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Squares2X2Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              There are no products in this category yet.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

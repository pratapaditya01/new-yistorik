import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatPrice } from '../utils/currency';
import { getMainImageUrl } from '../utils/imageUtils';
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/wishlist');
      setWishlistItems(response || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to fetch wishlist');
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setRemovingItems(prev => new Set(prev).add(productId));
      await api.post(`/auth/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleAddToCart = (product) => {
    // Check if product has sizes and none is selected
    if (product.sizes && product.sizes.length > 0) {
      // Redirect to product page for size selection
      toast.error('Please select a size on the product page');
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
      slug: product.slug,
      quantity: 1
    });
    toast.success('Added to cart');
  };

  const clearWishlist = async () => {
    if (wishlistItems.length === 0) return;

    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
      // Remove all items from wishlist
      const promises = wishlistItems.map(item =>
        api.post(`/auth/wishlist/${item._id}`)
      );
      await Promise.all(promises);
      setWishlistItems([]);
      toast.success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="mt-2 text-gray-600">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Save items you love to your wishlist and shop them later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow duration-200"
              >
                {/* Product Image */}
                <div className="relative aspect-square">
                  <Link to={`/products/${product.slug}`}>
                    <img
                      src={getMainImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/300x300/f3f4f6/9ca3af?text=No+Image';
                      }}
                    />
                  </Link>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    disabled={removingItems.has(product._id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                  >
                    {removingItems.has(product._id) ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    )}
                  </button>

                  {/* Sale Badge */}
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <Link
                      to={`/products/${product.slug}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    {product.category && (
                      <p className="text-xs text-gray-500 mt-1">
                        {product.category.name}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {product.averageRating > 0 && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.numReviews})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-3">
                    {product.quantity > 0 ? (
                      <span className="text-xs text-green-600 font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity === 0}
                      className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ShoppingCartIcon className="h-4 w-4 inline mr-1" />
                      {product.sizes && product.sizes.length > 0 ? 'Select Size' : 'Add to Cart'}
                    </button>
                    <Link
                      to={`/products/${product.slug}`}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

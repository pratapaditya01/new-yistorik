/**
 * Analytics Utility for Vercel Analytics
 * Custom event tracking for e-commerce actions
 */

import { track } from '@vercel/analytics';

export const analytics = {
  
  /**
   * Track page views (automatically handled by Analytics component)
   * This is for manual page view tracking if needed
   */
  trackPageView: (pageName, additionalData = {}) => {
    track('page_view', {
      page: pageName,
      ...additionalData
    });
  },

  /**
   * E-commerce Events
   */
  
  // Product events
  trackProductView: (product) => {
    track('product_view', {
      product_id: product._id,
      product_name: product.name,
      product_category: product.category?.name,
      product_price: product.price,
      product_gst_rate: product.gstRate
    });
  },

  trackProductSearch: (searchTerm, resultsCount) => {
    track('product_search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  },

  // Cart events
  trackAddToCart: (product, quantity, selectedVariants = []) => {
    track('add_to_cart', {
      product_id: product._id,
      product_name: product.name,
      product_price: product.price,
      quantity: quantity,
      selected_variants: selectedVariants,
      cart_value: product.price * quantity
    });
  },

  trackRemoveFromCart: (product, quantity) => {
    track('remove_from_cart', {
      product_id: product._id,
      product_name: product.name,
      quantity: quantity,
      removed_value: product.price * quantity
    });
  },

  trackCartView: (cartItems, totalValue) => {
    track('cart_view', {
      cart_items_count: cartItems.length,
      cart_total_value: totalValue,
      cart_items: cartItems.map(item => ({
        product_id: item.product._id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.price
      }))
    });
  },

  // Checkout events
  trackCheckoutStart: (cartItems, totalValue) => {
    track('checkout_start', {
      cart_items_count: cartItems.length,
      cart_total_value: totalValue,
      checkout_step: 'start'
    });
  },

  trackCheckoutProgress: (step, additionalData = {}) => {
    track('checkout_progress', {
      checkout_step: step,
      ...additionalData
    });
  },

  trackPurchase: (orderData) => {
    track('purchase', {
      order_id: orderData._id,
      order_value: orderData.amount,
      payment_method: orderData.paymentMethod,
      items_count: orderData.items?.length || 0,
      shipping_cost: orderData.shippingPrice,
      tax_amount: orderData.taxPrice,
      currency: 'INR'
    });
  },

  // User events
  trackUserRegistration: (method = 'email') => {
    track('user_registration', {
      registration_method: method
    });
  },

  trackUserLogin: (method = 'email') => {
    track('user_login', {
      login_method: method
    });
  },

  trackUserLogout: () => {
    track('user_logout');
  },

  // Wishlist events
  trackAddToWishlist: (product) => {
    track('add_to_wishlist', {
      product_id: product._id,
      product_name: product.name,
      product_price: product.price
    });
  },

  trackRemoveFromWishlist: (product) => {
    track('remove_from_wishlist', {
      product_id: product._id,
      product_name: product.name
    });
  },

  // Navigation events
  trackCategoryView: (category, productsCount) => {
    track('category_view', {
      category_name: category.name,
      category_slug: category.slug,
      products_count: productsCount
    });
  },

  trackFilterUsage: (filterType, filterValue) => {
    track('filter_usage', {
      filter_type: filterType,
      filter_value: filterValue
    });
  },

  // Admin events (for admin users)
  trackAdminAction: (action, details = {}) => {
    track('admin_action', {
      action: action,
      ...details
    });
  },

  // Error tracking
  trackError: (errorType, errorMessage, additionalData = {}) => {
    track('error', {
      error_type: errorType,
      error_message: errorMessage,
      ...additionalData
    });
  },

  // Performance tracking
  trackPerformance: (metric, value, additionalData = {}) => {
    track('performance', {
      metric: metric,
      value: value,
      ...additionalData
    });
  },

  // Custom events
  trackCustomEvent: (eventName, eventData = {}) => {
    track(eventName, eventData);
  }
};

export default analytics;

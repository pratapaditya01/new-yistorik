import api from './api';

export const productService = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/products?${queryString}`);
    return response;
  },

  // Get single product by slug
  getProduct: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await api.get(`/products/featured/list?limit=${limit}`);
      // If no featured products found, get regular products
      if (!response || response.length === 0) {
        const fallbackResponse = await api.get(`/products?limit=${limit}`);
        return Array.isArray(fallbackResponse) ? fallbackResponse : fallbackResponse.products || [];
      }
      return response;
    } catch (error) {
      console.warn('Featured products failed, falling back to regular products');
      const fallbackResponse = await api.get(`/products?limit=${limit}`);
      return Array.isArray(fallbackResponse) ? fallbackResponse : fallbackResponse.products || [];
    }
  },

  // Add product review
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/categories');
    return response;
  },

  // Get category by slug
  getCategory: async (slug) => {
    const response = await api.get(`/categories/${slug}`);
    return response;
  },
};

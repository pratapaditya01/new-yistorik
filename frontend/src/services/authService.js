import api from './api';

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response;
  },

  // Add/Remove from wishlist
  toggleWishlist: async (productId) => {
    const response = await api.post(`/auth/wishlist/${productId}`);
    return response;
  },
};

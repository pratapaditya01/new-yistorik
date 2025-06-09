import api from './api';

export const orderService = {
  // Create new order (supports both authenticated and guest users)
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response;
  },

  // Create guest order (no authentication required)
  createGuestOrder: async (orderData) => {
    // Remove authorization header for guest orders
    const response = await api.post('/orders', orderData, {
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      }
    });
    return response;
  },

  // Get user orders
  getUserOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/orders/myorders?${queryString}`);
    return response;
  },

  // Get order by ID
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  },

  // Update order payment
  updateOrderPayment: async (orderId, paymentData) => {
    const response = await api.put(`/orders/${orderId}/pay`, paymentData);
    return response;
  },
};

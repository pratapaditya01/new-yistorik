import axios from 'axios';

// Dynamic API URL configuration
const getApiBaseUrl = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }

  // Check current domain
  const currentDomain = window.location.hostname;

  if (currentDomain === 'yistorik.in' || currentDomain === 'www.yistorik.in') {
    // Production domain - use your backend URL
    return 'https://new-yistorik.onrender.com/api';
  }

  // Fallback for Vercel deployments
  return 'https://new-yistorik.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);
console.log('Current domain:', window.location.hostname);

// Request cache for deduplication
const requestCache = new Map();
const pendingRequests = new Map();

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with deduplication and auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    console.log('Full URL:', config.baseURL + config.url);

    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Request deduplication for GET requests
    if (config.method === 'get') {
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;

      // If there's a pending request for the same endpoint, return it
      if (pendingRequests.has(requestKey)) {
        config.cancelToken = new axios.CancelToken((cancel) => {
          pendingRequests.get(requestKey).then(cancel, cancel);
        });
      } else {
        // Store the request promise
        const requestPromise = new Promise((resolve) => {
          config.metadata = { resolve, requestKey };
        });
        pendingRequests.set(requestKey, requestPromise);
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with caching and error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response success:', response.status, response.config.url);

    // Clean up pending requests
    if (response.config.metadata?.requestKey) {
      const { resolve, requestKey } = response.config.metadata;
      pendingRequests.delete(requestKey);
      resolve(response);
    }

    // Cache GET responses for 5 minutes
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}:${JSON.stringify(response.config.params)}`;
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
        ttl: 5 * 60 * 1000 // 5 minutes
      });

      // Limit cache size
      if (requestCache.size > 100) {
        const firstKey = requestCache.keys().next().value;
        requestCache.delete(firstKey);
      }
    }

    return response.data;
  },
  (error) => {
    console.error('API response error:', error.response?.status, error.response?.data, error.config?.url);

    // Clean up pending requests on error
    if (error.config?.metadata?.requestKey) {
      pendingRequests.delete(error.config.metadata.requestKey);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;

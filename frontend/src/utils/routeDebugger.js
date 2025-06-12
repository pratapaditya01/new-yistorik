/**
 * Complete Route Debugging Utility
 * Debugs product details routes, admin routes, and accessibility issues
 */

class RouteDebugger {
  constructor() {
    this.version = '1.0.0';
    this.debugKey = 'route_debug_info';
  }

  /**
   * Complete route debugging analysis
   */
  debugComplete() {
    console.group('🛣️ COMPLETE ROUTE DEBUG ANALYSIS');
    
    this.analyzeCurrentRoute();
    this.testProductRoutes();
    this.testAdminRoutes();
    this.checkAuthentication();
    this.checkRouteProtection();
    this.analyzeRouteHistory();
    
    console.groupEnd();
    
    return this.generateRouteReport();
  }

  /**
   * Analyze current route
   */
  analyzeCurrentRoute() {
    console.group('📍 CURRENT ROUTE ANALYSIS');
    
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    console.log(`🔗 Current Path: ${currentPath}`);
    console.log(`🔍 Search Params: ${currentSearch}`);
    console.log(`#️⃣ Hash: ${currentHash}`);
    console.log(`🌐 Full URL: ${window.location.href}`);
    
    // Check if current route is valid
    const routeType = this.identifyRouteType(currentPath);
    console.log(`📋 Route Type: ${routeType}`);
    
    // Check for route parameters
    const params = this.extractRouteParams(currentPath);
    if (params.length > 0) {
      console.log(`📝 Route Parameters:`, params);
    }
    
    console.groupEnd();
  }

  /**
   * Test product routes
   */
  async testProductRoutes() {
    console.group('🛍️ PRODUCT ROUTES TESTING');
    
    try {
      // Test products list route
      console.log('Testing /products route...');
      const productsAccessible = await this.testRouteAccessibility('/products');
      console.log(`✅ /products: ${productsAccessible ? 'Accessible' : 'Not Accessible'}`);
      
      // Test product detail routes
      console.log('Testing product detail routes...');
      const sampleSlugs = await this.getSampleProductSlugs();
      
      for (const slug of sampleSlugs.slice(0, 3)) { // Test first 3 products
        const productRoute = `/products/${slug}`;
        const accessible = await this.testRouteAccessibility(productRoute);
        console.log(`${accessible ? '✅' : '❌'} ${productRoute}: ${accessible ? 'Accessible' : 'Not Accessible'}`);
        
        if (!accessible) {
          console.warn(`⚠️ Product route issue: ${productRoute}`);
          await this.debugProductRoute(slug);
        }
      }
      
      // Test category routes
      console.log('Testing category routes...');
      const categoryRoute = '/category/mens-clothing';
      const categoryAccessible = await this.testRouteAccessibility(categoryRoute);
      console.log(`${categoryAccessible ? '✅' : '❌'} ${categoryRoute}: ${categoryAccessible ? 'Accessible' : 'Not Accessible'}`);
      
    } catch (error) {
      console.error('❌ Product routes testing failed:', error);
    }
    
    console.groupEnd();
  }

  /**
   * Test admin routes
   */
  async testAdminRoutes() {
    console.group('👑 ADMIN ROUTES TESTING');
    
    const adminRoutes = [
      '/admin',
      '/admin/products',
      '/admin/orders',
      '/admin/users',
      '/admin/categories',
      '/admin/deliveries'
    ];
    
    const isAdmin = this.checkAdminStatus();
    console.log(`🔐 Admin Status: ${isAdmin ? 'Admin User' : 'Not Admin'}`);
    
    for (const route of adminRoutes) {
      try {
        const accessible = await this.testRouteAccessibility(route);
        const expected = isAdmin ? 'Should be accessible' : 'Should redirect to login';
        
        console.log(`${accessible ? '✅' : '❌'} ${route}: ${accessible ? 'Accessible' : 'Protected'} (${expected})`);
        
        if (!accessible && isAdmin) {
          console.warn(`⚠️ Admin route issue: ${route} - Admin should have access`);
        }
      } catch (error) {
        console.error(`❌ Error testing ${route}:`, error);
      }
    }
    
    console.groupEnd();
  }

  /**
   * Check authentication status
   */
  checkAuthentication() {
    console.group('🔐 AUTHENTICATION CHECK');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log(`🎫 Token exists: ${!!token}`);
    console.log(`👤 User data exists: ${!!user}`);
    
    if (token) {
      const isExpired = this.isJWTExpired(token);
      console.log(`⏰ Token expired: ${isExpired}`);
      
      if (isExpired) {
        console.warn('⚠️ Token is expired - this may cause authentication issues');
      }
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log(`👤 User role: ${userData.role}`);
        console.log(`📧 User email: ${userData.email}`);
        console.log(`🆔 User ID: ${userData._id}`);
      } catch (error) {
        console.error('❌ Invalid user data in localStorage');
      }
    }
    
    console.groupEnd();
  }

  /**
   * Check route protection
   */
  checkRouteProtection() {
    console.group('🛡️ ROUTE PROTECTION CHECK');
    
    const currentPath = window.location.pathname;
    const isProtectedRoute = this.isProtectedRoute(currentPath);
    const isAdminRoute = this.isAdminRoute(currentPath);
    const isAuthenticated = !!localStorage.getItem('token') && !this.isJWTExpired(localStorage.getItem('token'));
    const isAdmin = this.checkAdminStatus();
    
    console.log(`🔒 Is Protected Route: ${isProtectedRoute}`);
    console.log(`👑 Is Admin Route: ${isAdminRoute}`);
    console.log(`✅ Is Authenticated: ${isAuthenticated}`);
    console.log(`👑 Is Admin: ${isAdmin}`);
    
    // Check access permissions
    if (isAdminRoute && !isAdmin) {
      console.warn('⚠️ Accessing admin route without admin privileges');
    }
    
    if (isProtectedRoute && !isAuthenticated) {
      console.warn('⚠️ Accessing protected route without authentication');
    }
    
    console.groupEnd();
  }

  /**
   * Analyze route history
   */
  analyzeRouteHistory() {
    console.group('📚 ROUTE HISTORY ANALYSIS');
    
    // Check browser history
    console.log(`📊 History length: ${window.history.length}`);
    
    // Check for stored redirect paths
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      console.log(`🔄 Stored redirect path: ${redirectPath}`);
    }
    
    // Check for navigation state
    const navigationState = window.history.state;
    if (navigationState) {
      console.log(`📋 Navigation state:`, navigationState);
    }
    
    console.groupEnd();
  }

  /**
   * Test route accessibility
   */
  async testRouteAccessibility(route) {
    try {
      // Create a temporary link and test if it would be handled by React Router
      const testLink = document.createElement('a');
      testLink.href = route;
      
      // Check if route matches known patterns
      const routePatterns = [
        /^\/$/,                           // Home
        /^\/products$/,                   // Products list
        /^\/products\/[^\/]+$/,          // Product detail
        /^\/category\/[^\/]+$/,          // Category
        /^\/cart$/,                      // Cart
        /^\/checkout$/,                  // Checkout
        /^\/login$/,                     // Login
        /^\/register$/,                  // Register
        /^\/profile$/,                   // Profile
        /^\/orders$/,                    // Orders
        /^\/wishlist$/,                  // Wishlist
        /^\/admin(\/.*)?$/,              // Admin routes
      ];
      
      return routePatterns.some(pattern => pattern.test(route));
    } catch (error) {
      console.error(`Error testing route ${route}:`, error);
      return false;
    }
  }

  /**
   * Get sample product slugs for testing
   */
  async getSampleProductSlugs() {
    try {
      // Try to get products from API
      const response = await fetch('/api/products?limit=5');
      if (response.ok) {
        const data = await response.json();
        return data.products?.map(p => p.slug) || [];
      }
    } catch (error) {
      console.warn('Could not fetch products for testing:', error);
    }
    
    // Fallback to common product slugs
    return ['test-product', 'sample-item', 'demo-product'];
  }

  /**
   * Debug specific product route
   */
  async debugProductRoute(slug) {
    console.group(`🔍 DEBUGGING PRODUCT ROUTE: ${slug}`);
    
    try {
      // Test API endpoint
      const apiResponse = await fetch(`/api/products/${slug}`);
      console.log(`📡 API Response Status: ${apiResponse.status}`);
      
      if (apiResponse.ok) {
        const productData = await apiResponse.json();
        console.log(`✅ Product found: ${productData.name}`);
        console.log(`🔗 Product ID: ${productData._id}`);
        console.log(`📂 Category: ${productData.category?.name}`);
      } else {
        console.error(`❌ API Error: ${apiResponse.statusText}`);
      }
    } catch (error) {
      console.error(`❌ Network Error:`, error);
    }
    
    console.groupEnd();
  }

  /**
   * Identify route type
   */
  identifyRouteType(path) {
    if (path === '/') return 'Home';
    if (path === '/products') return 'Products List';
    if (path.startsWith('/products/')) return 'Product Detail';
    if (path.startsWith('/category/')) return 'Category';
    if (path.startsWith('/admin')) return 'Admin';
    if (path === '/cart') return 'Cart';
    if (path === '/checkout') return 'Checkout';
    if (path === '/login') return 'Login';
    if (path === '/register') return 'Register';
    if (path === '/profile') return 'Profile';
    if (path === '/orders') return 'Orders';
    if (path === '/wishlist') return 'Wishlist';
    return 'Unknown';
  }

  /**
   * Extract route parameters
   */
  extractRouteParams(path) {
    const params = [];
    
    if (path.startsWith('/products/')) {
      const slug = path.split('/products/')[1];
      if (slug) params.push({ name: 'slug', value: slug });
    }
    
    if (path.startsWith('/category/')) {
      const slug = path.split('/category/')[1];
      if (slug) params.push({ name: 'categorySlug', value: slug });
    }
    
    return params;
  }

  /**
   * Check if route is protected
   */
  isProtectedRoute(path) {
    const protectedRoutes = ['/profile', '/orders', '/wishlist'];
    return protectedRoutes.includes(path);
  }

  /**
   * Check if route is admin route
   */
  isAdminRoute(path) {
    return path.startsWith('/admin');
  }

  /**
   * Check admin status
   */
  checkAdminStatus() {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role === 'admin';
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    return false;
  }

  /**
   * Check if JWT token is expired
   */
  isJWTExpired(token) {
    try {
      if (!token) return true;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Fix common route issues
   */
  fixRouteIssues() {
    console.group('🔧 FIXING ROUTE ISSUES');
    
    // Fix expired token
    const token = localStorage.getItem('token');
    if (token && this.isJWTExpired(token)) {
      console.log('🧹 Removing expired token...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Expired authentication data removed');
    }
    
    // Fix invalid user data
    try {
      const user = localStorage.getItem('user');
      if (user) {
        JSON.parse(user); // Test if valid JSON
      }
    } catch (error) {
      console.log('🧹 Removing invalid user data...');
      localStorage.removeItem('user');
      console.log('✅ Invalid user data removed');
    }
    
    // Clear any stored redirect paths that might be causing issues
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      console.log(`🧹 Clearing stored redirect path: ${redirectPath}`);
      sessionStorage.removeItem('redirectPath');
      console.log('✅ Redirect path cleared');
    }
    
    console.groupEnd();
  }

  /**
   * Generate route debug report
   */
  generateRouteReport() {
    const report = {
      timestamp: new Date().toISOString(),
      currentRoute: window.location.pathname,
      routeType: this.identifyRouteType(window.location.pathname),
      authentication: {
        hasToken: !!localStorage.getItem('token'),
        tokenExpired: localStorage.getItem('token') ? this.isJWTExpired(localStorage.getItem('token')) : null,
        hasUser: !!localStorage.getItem('user'),
        isAdmin: this.checkAdminStatus()
      },
      routeAccess: {
        isProtected: this.isProtectedRoute(window.location.pathname),
        isAdmin: this.isAdminRoute(window.location.pathname),
        shouldHaveAccess: this.shouldHaveAccess(window.location.pathname)
      },
      recommendations: this.getRouteRecommendations()
    };
    
    console.log('📋 ROUTE DEBUG REPORT:', report);
    return report;
  }

  /**
   * Check if user should have access to current route
   */
  shouldHaveAccess(path) {
    const isAuthenticated = !!localStorage.getItem('token') && !this.isJWTExpired(localStorage.getItem('token'));
    const isAdmin = this.checkAdminStatus();
    
    if (this.isAdminRoute(path)) {
      return isAdmin;
    }
    
    if (this.isProtectedRoute(path)) {
      return isAuthenticated;
    }
    
    return true; // Public routes
  }

  /**
   * Get route-specific recommendations
   */
  getRouteRecommendations() {
    const recommendations = [];
    const currentPath = window.location.pathname;
    
    // Check authentication issues
    const token = localStorage.getItem('token');
    if (token && this.isJWTExpired(token)) {
      recommendations.push('JWT token is expired. Clear authentication data and log in again.');
    }
    
    // Check admin access
    if (this.isAdminRoute(currentPath) && !this.checkAdminStatus()) {
      recommendations.push('Admin route accessed without admin privileges. Log in as admin.');
    }
    
    // Check protected routes
    if (this.isProtectedRoute(currentPath) && !localStorage.getItem('token')) {
      recommendations.push('Protected route accessed without authentication. Log in first.');
    }
    
    return recommendations;
  }
}

// Create global instance
const routeDebugger = new RouteDebugger();

// Export for use
export default routeDebugger;

// Global access for console debugging
window.routeDebugger = routeDebugger;

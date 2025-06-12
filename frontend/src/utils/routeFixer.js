/**
 * Route Fixer Utility
 * Automatically fixes common route accessibility issues
 */

class RouteFixer {
  constructor() {
    this.version = '1.0.0';
    this.fixHistory = [];
  }

  /**
   * Run all route fixes
   */
  async fixAllRoutes() {
    console.group('🔧 FIXING ALL ROUTE ISSUES');
    
    const fixes = [
      this.fixExpiredAuthentication,
      this.fixInvalidStorageData,
      this.fixBrokenRedirects,
      this.fixCacheIssues,
      this.fixRouteHistory,
      this.fixAdminAccess,
      this.fixProductRoutes
    ];

    const results = [];
    
    for (const fix of fixes) {
      try {
        const result = await fix.call(this);
        results.push(result);
        this.fixHistory.push({
          fix: fix.name,
          result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error(`❌ Fix failed: ${fix.name}`, error);
        results.push({ success: false, message: error.message });
      }
    }
    
    console.groupEnd();
    
    const summary = this.generateFixSummary(results);
    console.log('📋 FIX SUMMARY:', summary);
    
    return summary;
  }

  /**
   * Fix expired authentication
   */
  async fixExpiredAuthentication() {
    console.log('🔐 Fixing expired authentication...');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token && !user) {
      return { success: true, message: 'No authentication data to fix' };
    }

    let fixed = false;
    
    // Check if token is expired
    if (token && this.isJWTExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      fixed = true;
      console.log('✅ Removed expired authentication data');
    }

    // Check if user data is valid
    if (user) {
      try {
        JSON.parse(user);
      } catch (error) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        fixed = true;
        console.log('✅ Removed invalid user data');
      }
    }

    return {
      success: true,
      message: fixed ? 'Fixed expired/invalid authentication' : 'Authentication data is valid'
    };
  }

  /**
   * Fix invalid storage data
   */
  async fixInvalidStorageData() {
    console.log('🗄️ Fixing invalid storage data...');
    
    let fixed = false;
    const keysToCheck = ['cart', 'wishlist', 'preferences', 'theme'];
    
    for (const key of keysToCheck) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          JSON.parse(value);
        } catch (error) {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          fixed = true;
          console.log(`✅ Removed invalid ${key} data`);
        }
      }
    }

    return {
      success: true,
      message: fixed ? 'Fixed invalid storage data' : 'Storage data is valid'
    };
  }

  /**
   * Fix broken redirects
   */
  async fixBrokenRedirects() {
    console.log('🔄 Fixing broken redirects...');
    
    const redirectPath = sessionStorage.getItem('redirectPath');
    const returnUrl = sessionStorage.getItem('returnUrl');
    
    let fixed = false;
    
    if (redirectPath) {
      // Check if redirect path is valid
      if (!this.isValidRoute(redirectPath)) {
        sessionStorage.removeItem('redirectPath');
        fixed = true;
        console.log('✅ Removed invalid redirect path');
      }
    }

    if (returnUrl) {
      sessionStorage.removeItem('returnUrl');
      fixed = true;
      console.log('✅ Cleared return URL');
    }

    return {
      success: true,
      message: fixed ? 'Fixed broken redirects' : 'No broken redirects found'
    };
  }

  /**
   * Fix cache issues
   */
  async fixCacheIssues() {
    console.log('💾 Fixing cache issues...');
    
    let fixed = false;
    
    try {
      // Clear service worker caches if available
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if (cacheName.includes('old') || cacheName.includes('v1')) {
            await caches.delete(cacheName);
            fixed = true;
            console.log(`✅ Cleared old cache: ${cacheName}`);
          }
        }
      }

      // Force reload cached resources
      if (fixed) {
        // Clear browser cache for this domain
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.update();
          }
        }
      }

    } catch (error) {
      console.warn('⚠️ Could not clear all caches:', error);
    }

    return {
      success: true,
      message: fixed ? 'Cleared old caches' : 'No cache issues found'
    };
  }

  /**
   * Fix route history
   */
  async fixRouteHistory() {
    console.log('📚 Fixing route history...');
    
    let fixed = false;
    
    // Check current route validity
    const currentPath = window.location.pathname;
    if (!this.isValidRoute(currentPath)) {
      window.history.replaceState(null, '', '/');
      fixed = true;
      console.log('✅ Fixed invalid current route');
    }

    // Clear problematic history state
    if (window.history.state && typeof window.history.state === 'object') {
      const state = window.history.state;
      if (state.error || state.invalid) {
        window.history.replaceState(null, '', window.location.pathname);
        fixed = true;
        console.log('✅ Cleared problematic history state');
      }
    }

    return {
      success: true,
      message: fixed ? 'Fixed route history issues' : 'Route history is clean'
    };
  }

  /**
   * Fix admin access issues
   */
  async fixAdminAccess() {
    console.log('👑 Fixing admin access issues...');
    
    const currentPath = window.location.pathname;
    const isAdminRoute = currentPath.startsWith('/admin');
    
    if (!isAdminRoute) {
      return { success: true, message: 'Not on admin route' };
    }

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    let fixed = false;
    
    // Check if user has admin access
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role !== 'admin') {
          // Redirect non-admin users away from admin routes
          window.location.href = '/';
          fixed = true;
          console.log('✅ Redirected non-admin user from admin route');
        }
      } catch (error) {
        // Invalid user data, redirect to login
        window.location.href = '/login';
        fixed = true;
        console.log('✅ Redirected user with invalid data to login');
      }
    } else if (!token) {
      // No authentication, redirect to login
      window.location.href = '/login';
      fixed = true;
      console.log('✅ Redirected unauthenticated user to login');
    }

    return {
      success: true,
      message: fixed ? 'Fixed admin access issue' : 'Admin access is valid'
    };
  }

  /**
   * Fix product route issues
   */
  async fixProductRoutes() {
    console.log('🛍️ Fixing product route issues...');
    
    const currentPath = window.location.pathname;
    const isProductRoute = currentPath.startsWith('/products/');
    
    if (!isProductRoute) {
      return { success: true, message: 'Not on product route' };
    }

    const slug = currentPath.split('/products/')[1];
    if (!slug) {
      window.location.href = '/products';
      return { success: true, message: 'Fixed empty product slug' };
    }

    // Test if product exists
    try {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Product not found, redirect to products page
          window.location.href = '/products';
          return { success: true, message: 'Redirected from non-existent product' };
        }
      }
    } catch (error) {
      console.warn('Could not verify product existence:', error);
    }

    return { success: true, message: 'Product route is valid' };
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
   * Check if route is valid
   */
  isValidRoute(route) {
    const validRoutes = [
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
      /^\/test\/.*$/,                  // Test routes
      /^\/debug\/.*$/,                 // Debug routes
    ];
    
    return validRoutes.some(pattern => pattern.test(route));
  }

  /**
   * Generate fix summary
   */
  generateFixSummary(results) {
    const summary = {
      timestamp: new Date().toISOString(),
      totalFixes: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      fixes: results,
      recommendations: []
    };

    // Add recommendations based on results
    if (summary.failed > 0) {
      summary.recommendations.push('Some fixes failed. Check console for details.');
    }

    if (results.some(r => r.message.includes('expired'))) {
      summary.recommendations.push('Authentication was expired. Please log in again.');
    }

    if (results.some(r => r.message.includes('cache'))) {
      summary.recommendations.push('Caches were cleared. Page may load slower on next visit.');
    }

    return summary;
  }

  /**
   * Quick fix for immediate issues
   */
  async quickFix() {
    console.log('⚡ Running quick route fixes...');
    
    // Fix most common issues quickly
    const token = localStorage.getItem('token');
    if (token && this.isJWTExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Quick fix: Removed expired token');
    }

    // Clear problematic redirects
    sessionStorage.removeItem('redirectPath');
    sessionStorage.removeItem('returnUrl');
    console.log('✅ Quick fix: Cleared redirects');

    // Fix current route if invalid
    const currentPath = window.location.pathname;
    if (!this.isValidRoute(currentPath)) {
      window.location.href = '/';
      console.log('✅ Quick fix: Redirected to home');
    }

    return { success: true, message: 'Quick fixes applied' };
  }
}

// Create global instance
const routeFixer = new RouteFixer();

// Export for use
export default routeFixer;

// Global access for console debugging
window.routeFixer = routeFixer;

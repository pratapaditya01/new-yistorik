/**
 * Null Safety Debugger
 * Identifies and fixes null reference errors in React components
 */

class NullSafetyDebugger {
  constructor() {
    this.version = '1.0.0';
    this.errors = [];
  }

  /**
   * Debug null reference errors
   */
  debugNullReferences() {
    console.group('🔍 NULL REFERENCE DEBUGGING');
    
    this.checkCommonNullPatterns();
    this.analyzeDataStructures();
    this.generateNullSafetyReport();
    
    console.groupEnd();
    
    return this.generateReport();
  }

  /**
   * Check common null patterns
   */
  checkCommonNullPatterns() {
    console.log('🔍 Checking common null patterns...');
    
    // Check localStorage data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (!user.name || !user.email) {
          this.errors.push({
            type: 'null_user_data',
            message: 'User data missing required fields',
            location: 'localStorage',
            fix: 'Clear and re-authenticate user'
          });
        }
      } catch (error) {
        this.errors.push({
          type: 'invalid_user_data',
          message: 'Invalid user data in localStorage',
          location: 'localStorage',
          fix: 'Clear localStorage user data'
        });
      }
    }

    // Check for common API response patterns
    this.checkAPIResponsePatterns();
  }

  /**
   * Check API response patterns
   */
  checkAPIResponsePatterns() {
    console.log('📡 Checking API response patterns...');
    
    // Mock check for product data structure
    const commonIssues = [
      {
        pattern: 'product.category.name',
        issue: 'Category not populated in product response',
        fix: 'Ensure backend populates category field'
      },
      {
        pattern: 'product.images[0].url',
        issue: 'Images array might be empty',
        fix: 'Add null checks for images array'
      },
      {
        pattern: 'user.profile.name',
        issue: 'Profile not populated in user response',
        fix: 'Ensure backend populates profile field'
      }
    ];

    commonIssues.forEach(issue => {
      this.errors.push({
        type: 'potential_null_reference',
        message: issue.issue,
        pattern: issue.pattern,
        fix: issue.fix
      });
    });
  }

  /**
   * Analyze data structures
   */
  analyzeDataStructures() {
    console.log('📊 Analyzing data structures...');
    
    // Check if we're on admin products page
    if (window.location.pathname.includes('/admin/products')) {
      this.errors.push({
        type: 'admin_products_null_check',
        message: 'Admin products page may have null category references',
        location: '/admin/products',
        fix: 'Add null safety checks for product.category'
      });
    }
  }

  /**
   * Generate null safety report
   */
  generateNullSafetyReport() {
    console.log('📋 Generating null safety report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      currentPage: window.location.pathname,
      errorsFound: this.errors.length,
      errors: this.errors,
      recommendations: this.getRecommendations()
    };

    console.log('📋 NULL SAFETY REPORT:', report);
    return report;
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    if (this.errors.some(e => e.type.includes('user'))) {
      recommendations.push('Clear user authentication data and re-login');
    }
    
    if (this.errors.some(e => e.pattern?.includes('category'))) {
      recommendations.push('Check backend API to ensure category population');
    }
    
    if (this.errors.some(e => e.pattern?.includes('images'))) {
      recommendations.push('Add null checks for image arrays');
    }
    
    return recommendations;
  }

  /**
   * Generate report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      errorsFound: this.errors.length,
      errors: this.errors,
      fixes: this.getQuickFixes()
    };
  }

  /**
   * Get quick fixes
   */
  getQuickFixes() {
    return [
      {
        name: 'Clear Authentication Data',
        action: () => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.clear();
          window.location.reload();
        }
      },
      {
        name: 'Refresh Page',
        action: () => {
          window.location.reload();
        }
      },
      {
        name: 'Go to Home',
        action: () => {
          window.location.href = '/';
        }
      }
    ];
  }

  /**
   * Apply null safety fixes
   */
  applyNullSafetyFixes() {
    console.group('🔧 APPLYING NULL SAFETY FIXES');
    
    // Fix 1: Clear invalid user data
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (!user.name || !user.email || !user._id) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          console.log('✅ Cleared invalid user data');
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.log('✅ Cleared corrupted user data');
      }
    }

    // Fix 2: Clear invalid cart data
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        if (!Array.isArray(cart)) {
          localStorage.removeItem('cart');
          console.log('✅ Cleared invalid cart data');
        }
      } catch (error) {
        localStorage.removeItem('cart');
        console.log('✅ Cleared corrupted cart data');
      }
    }

    console.groupEnd();
    
    return { success: true, message: 'Null safety fixes applied' };
  }
}

// Null-safe helper functions
export const nullSafeHelpers = {
  /**
   * Safely get nested property
   */
  safeGet: (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : defaultValue;
      }, obj);
    } catch (error) {
      return defaultValue;
    }
  },

  /**
   * Safely get category name
   */
  getCategoryName: (product) => {
    if (!product) return 'Unknown Product';
    if (!product.category) return 'No Category';
    if (typeof product.category === 'string') return product.category;
    return product.category.name || 'Unknown Category';
  },

  /**
   * Safely get product name
   */
  getProductName: (product) => {
    return product?.name || 'Unknown Product';
  },

  /**
   * Safely get user name
   */
  getUserName: (user) => {
    return user?.name || user?.firstName || 'Unknown User';
  },

  /**
   * Safely get image URL
   */
  getImageUrl: (images, fallback = '/placeholder.jpg') => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return fallback;
    }
    
    const mainImage = images.find(img => img?.isMain) || images[0];
    return mainImage?.url || fallback;
  },

  /**
   * Safely map array
   */
  safeMap: (array, mapFn, fallback = []) => {
    if (!Array.isArray(array)) return fallback;
    
    try {
      return array.filter(item => item != null).map(mapFn);
    } catch (error) {
      console.error('Safe map error:', error);
      return fallback;
    }
  },

  /**
   * Check if object has required properties
   */
  hasRequiredProps: (obj, requiredProps) => {
    if (!obj || typeof obj !== 'object') return false;
    
    return requiredProps.every(prop => {
      const value = nullSafeHelpers.safeGet(obj, prop);
      return value !== null && value !== undefined;
    });
  }
};

// Create global instance
const nullSafetyDebugger = new NullSafetyDebugger();

// Export for use
export default nullSafetyDebugger;

// Global access for console debugging
window.nullSafetyDebugger = nullSafetyDebugger;
window.nullSafeHelpers = nullSafeHelpers;

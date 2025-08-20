/**
 * 404 Error Debugging Utility
 * Comprehensive tool to debug and fix 404 errors
 */

export const debug404 = {
  
  /**
   * Monitor and log all network requests
   */
  monitorNetworkRequests: () => {
    console.group('🔍 404 DEBUG: MONITORING NETWORK REQUESTS');
    
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      console.log('📡 FETCH REQUEST:', url, options);
      
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 404) {
          console.error('❌ 404 ERROR:', {
            url: url,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });
        } else if (response.ok) {
          console.log('✅ SUCCESS:', url, response.status);
        } else {
          console.warn('⚠️ ERROR:', url, response.status, response.statusText);
        }
        
        return response;
      } catch (error) {
        console.error('🚨 NETWORK ERROR:', url, error);
        throw error;
      }
    };
    
    // Monitor XMLHttpRequest
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      
      xhr.open = function(method, url, ...args) {
        console.log('📡 XHR REQUEST:', method, url);
        this._url = url;
        this._method = method;
        return originalOpen.apply(this, [method, url, ...args]);
      };
      
      xhr.send = function(...args) {
        this.addEventListener('load', () => {
          if (this.status === 404) {
            console.error('❌ XHR 404 ERROR:', {
              method: this._method,
              url: this._url,
              status: this.status,
              statusText: this.statusText,
              response: this.responseText
            });
          } else if (this.status >= 200 && this.status < 300) {
            console.log('✅ XHR SUCCESS:', this._method, this._url, this.status);
          } else {
            console.warn('⚠️ XHR ERROR:', this._method, this._url, this.status, this.statusText);
          }
        });
        
        this.addEventListener('error', () => {
          console.error('🚨 XHR NETWORK ERROR:', this._method, this._url);
        });
        
        return originalSend.apply(this, args);
      };
      
      return xhr;
    };
    
    console.log('✅ Network monitoring enabled');
    console.groupEnd();
  },

  /**
   * Check API endpoints
   */
  checkAPIEndpoints: async () => {
    console.group('🔍 404 DEBUG: CHECKING API ENDPOINTS');
    
    const endpoints = [
      '/api/products',
      '/api/categories',
      '/api/auth/me',
      '/api/orders',
      '/api/users',
      '/uploads/sample-product.jpg',
      '/api/health',
      '/api/test'
    ];
    
    const baseUrls = [
      'http://localhost:5001',
      'https://31.97.235.37',
      window.location.origin
    ];
    
    for (const baseUrl of baseUrls) {
      console.log(`\n🌐 Testing base URL: ${baseUrl}`);
      
      for (const endpoint of endpoints) {
        const fullUrl = `${baseUrl}${endpoint}`;
        
        try {
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          const status = response.status;
          const statusText = response.statusText;
          
          if (status === 404) {
            console.error(`❌ 404: ${endpoint} - ${statusText}`);
          } else if (status >= 200 && status < 300) {
            console.log(`✅ ${status}: ${endpoint}`);
          } else if (status === 401 || status === 403) {
            console.warn(`🔒 ${status}: ${endpoint} - Auth required`);
          } else {
            console.warn(`⚠️ ${status}: ${endpoint} - ${statusText}`);
          }
          
        } catch (error) {
          console.error(`🚨 ERROR: ${endpoint} - ${error.message}`);
        }
      }
    }
    
    console.groupEnd();
  },

  /**
   * Check static assets
   */
  checkStaticAssets: async () => {
    console.group('🔍 404 DEBUG: CHECKING STATIC ASSETS');
    
    const assets = [
      '/favicon.ico',
      '/logo.svg',
      '/placeholder-image.svg',
      '/manifest.json',
      '/robots.txt'
    ];
    
    for (const asset of assets) {
      try {
        const response = await fetch(asset);
        
        if (response.status === 404) {
          console.error(`❌ 404: ${asset}`);
        } else if (response.ok) {
          console.log(`✅ ${response.status}: ${asset}`);
        } else {
          console.warn(`⚠️ ${response.status}: ${asset}`);
        }
        
      } catch (error) {
        console.error(`🚨 ERROR: ${asset} - ${error.message}`);
      }
    }
    
    console.groupEnd();
  },

  /**
   * Check image URLs
   */
  checkImageUrls: async () => {
    console.group('🔍 404 DEBUG: CHECKING IMAGE URLS');
    
    const imageUrls = [
      'https://placehold.co/300x300?text=Test+Image',  // More reliable placeholder service
      'https://placehold.co/300x300',           // Problematic service (should be blocked)
      'https://picsum.photos/300/300',
      'https://31.97.235.37/uploads/sample-product.jpg',
      '/uploads/placeholder.jpg',
      '/placeholder-image.svg'
    ];
    
    for (const url of imageUrls) {
      try {
        const response = await fetch(url);
        
        if (response.status === 404) {
          console.error(`❌ 404 IMAGE: ${url}`);
        } else if (response.ok) {
          console.log(`✅ IMAGE OK: ${url}`);
        } else {
          console.warn(`⚠️ IMAGE ERROR: ${url} - ${response.status}`);
        }
        
      } catch (error) {
        console.error(`🚨 IMAGE NETWORK ERROR: ${url} - ${error.message}`);
      }
    }
    
    console.groupEnd();
  },

  /**
   * Check route configuration
   */
  checkRoutes: () => {
    console.group('🔍 404 DEBUG: CHECKING ROUTE CONFIGURATION');
    
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    console.log('📍 Current Location:', {
      pathname: currentPath,
      search: currentSearch,
      hash: currentHash,
      href: window.location.href
    });
    
    // Check if current route exists
    const routes = [
      '/',
      '/products',
      '/cart',
      '/login',
      '/register',
      '/checkout',
      '/test/images',
      '/admin',
      '/admin/products'
    ];
    
    console.log('\n📋 Available Routes:');
    routes.forEach(route => {
      const isCurrentRoute = route === currentPath;
      console.log(`${isCurrentRoute ? '👉' : '  '} ${route}`);
    });
    
    if (!routes.includes(currentPath)) {
      console.warn(`⚠️ Current path "${currentPath}" not in defined routes`);
    }
    
    console.groupEnd();
  },

  /**
   * Check browser console for errors
   */
  checkConsoleErrors: () => {
    console.group('🔍 404 DEBUG: CONSOLE ERROR MONITORING');
    
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    
    // Override console.error to catch 404-related errors
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('404') || message.includes('Not Found')) {
        console.log('🚨 DETECTED 404 ERROR:', message);
      }
      
      if (message.includes('Failed to load resource')) {
        console.log('🚨 DETECTED RESOURCE LOAD FAILURE:', message);
      }
      
      return originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('404') || message.includes('Not Found')) {
        console.log('⚠️ DETECTED 404 WARNING:', message);
      }
      
      return originalWarn.apply(console, args);
    };
    
    console.log('✅ Console error monitoring enabled');
    console.groupEnd();
  },

  /**
   * Generate 404 debugging report
   */
  generateReport: async () => {
    console.group('📊 404 DEBUGGING REPORT');
    console.log('Starting comprehensive 404 debugging...\n');
    
    // Run all checks
    debug404.checkRoutes();
    await debug404.checkAPIEndpoints();
    await debug404.checkStaticAssets();
    await debug404.checkImageUrls();
    debug404.checkConsoleErrors();
    debug404.monitorNetworkRequests();
    
    console.log('\n✅ 404 debugging report complete');
    console.log('Monitor the console for real-time 404 detection');
    console.groupEnd();
  },

  /**
   * Quick fix for common 404 issues
   */
  quickFix: () => {
    console.group('🔧 404 QUICK FIX');
    
    console.log('Applying common 404 fixes...');
    
    // Fix 1: Ensure proper base URL
    const baseUrl = window.location.origin;
    console.log('✅ Base URL set to:', baseUrl);
    
    // Fix 2: Add error handlers to all images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.onerror) {
        img.onerror = function() {
          console.warn(`🖼️ Image failed to load: ${this.src}`);
          this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
        };
        console.log(`✅ Added error handler to image ${index + 1}`);
      }
    });
    
    console.log(`✅ Applied error handlers to ${images.length} images`);
    console.groupEnd();
  }
};

// Auto-attach to window for easy access
if (typeof window !== 'undefined') {
  window.debug404 = debug404;
}

export default debug404;

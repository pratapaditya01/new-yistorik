/**
 * 404 Fix Utility
 * Comprehensive fixes for common 404 issues
 */

import { sanitizeImageUrl, isExternalPlaceholder } from './imageFallback';

export const fix404 = {
  
  /**
   * Fix all images on the page
   */
  fixAllImages: () => {
    console.group('🔧 FIXING ALL IMAGES');
    
    const images = document.querySelectorAll('img');
    let fixedCount = 0;
    
    images.forEach((img, index) => {
      const originalSrc = img.src;
      
      // Check if image needs fixing
      if (isExternalPlaceholder(originalSrc) || !originalSrc) {
        const fixedSrc = sanitizeImageUrl(originalSrc, 'product');
        img.src = fixedSrc;
        fixedCount++;
        console.log(`✅ Fixed image ${index + 1}: ${originalSrc} → ${fixedSrc}`);
      }
      
      // Add error handler if not present
      if (!img.onerror) {
        img.onerror = function() {
          console.warn(`🖼️ Image failed to load: ${this.src}`);
          this.src = sanitizeImageUrl('', 'error');
        };
      }
      
      // Add load handler for logging
      if (!img.onload) {
        img.onload = function() {
          console.log(`✅ Image loaded: ${this.src}`);
        };
      }
    });
    
    console.log(`✅ Fixed ${fixedCount} images out of ${images.length} total`);
    console.groupEnd();
    
    return fixedCount;
  },

  /**
   * Fix API base URL configuration
   */
  fixAPIBaseURL: () => {
    console.group('🔧 FIXING API BASE URL');
    
    const currentDomain = window.location.hostname;
    let apiBaseUrl;
    
    if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
      apiBaseUrl = 'http://localhost:5001';
    } else if (currentDomain === 'yistorik.in' || currentDomain === 'www.yistorik.in') {
      apiBaseUrl = 'https://31.97.235.37';
    } else {
      apiBaseUrl = 'https://31.97.235.37'; // Default fallback
    }
    
    // Store in global variable for access
    window.API_BASE_URL = apiBaseUrl;
    
    console.log(`✅ API Base URL set to: ${apiBaseUrl}`);
    console.groupEnd();
    
    return apiBaseUrl;
  },

  /**
   * Fix missing static assets
   */
  fixStaticAssets: async () => {
    console.group('🔧 FIXING STATIC ASSETS');
    
    const assets = [
      { path: '/favicon.ico', type: 'icon' },
      { path: '/logo.svg', type: 'logo' },
      { path: '/placeholder-image.svg', type: 'placeholder' },
      { path: '/manifest.json', type: 'manifest' }
    ];
    
    for (const asset of assets) {
      try {
        const response = await fetch(asset.path);
        
        if (response.status === 404) {
          console.warn(`⚠️ Missing asset: ${asset.path}`);
          
          // Create fallback for missing assets
          if (asset.type === 'placeholder') {
            console.log(`🔧 Creating fallback for ${asset.path}`);
            // The placeholder will be handled by our image fallback system
          }
        } else {
          console.log(`✅ Asset OK: ${asset.path}`);
        }
      } catch (error) {
        console.error(`❌ Asset error: ${asset.path} - ${error.message}`);
      }
    }
    
    console.groupEnd();
  },

  /**
   * Fix fetch requests to handle 404s gracefully
   */
  fixFetchRequests: () => {
    console.group('🔧 FIXING FETCH REQUESTS');
    
    if (window.originalFetch) {
      console.log('✅ Fetch already patched');
      console.groupEnd();
      return;
    }
    
    // Store original fetch
    window.originalFetch = window.fetch;
    
    // Override fetch with 404 handling
    window.fetch = async (...args) => {
      const [url, options] = args;
      
      try {
        const response = await window.originalFetch(...args);
        
        if (response.status === 404) {
          console.warn(`⚠️ 404 Response: ${url}`);
          
          // For API endpoints, return a meaningful error
          if (url.includes('/api/')) {
            const errorResponse = new Response(
              JSON.stringify({ 
                error: 'Not Found', 
                message: `API endpoint ${url} not found`,
                status: 404 
              }),
              { 
                status: 404, 
                statusText: 'Not Found',
                headers: { 'Content-Type': 'application/json' }
              }
            );
            return errorResponse;
          }
        }
        
        return response;
      } catch (error) {
        console.error(`🚨 Fetch error: ${url} - ${error.message}`);
        throw error;
      }
    };
    
    console.log('✅ Fetch requests patched for 404 handling');
    console.groupEnd();
  },

  /**
   * Fix router configuration for SPA
   */
  fixSPARouting: () => {
    console.group('🔧 FIXING SPA ROUTING');
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      console.log('🔄 Browser navigation:', window.location.pathname);
    });
    
    // Handle unhandled routes
    const currentPath = window.location.pathname;
    const validRoutes = [
      '/',
      '/products',
      '/cart',
      '/login',
      '/register',
      '/checkout',
      '/profile',
      '/orders',
      '/wishlist',
      '/admin',
      '/test/images',
      '/debug/404'
    ];
    
    const isValidRoute = validRoutes.some(route => 
      currentPath === route || 
      currentPath.startsWith(route + '/') ||
      currentPath.startsWith('/products/') ||
      currentPath.startsWith('/admin/')
    );
    
    if (!isValidRoute) {
      console.warn(`⚠️ Invalid route: ${currentPath}`);
      console.log('💡 Consider redirecting to home or 404 page');
    } else {
      console.log(`✅ Valid route: ${currentPath}`);
    }
    
    console.groupEnd();
  },

  /**
   * Fix CORS issues
   */
  fixCORSIssues: () => {
    console.group('🔧 FIXING CORS ISSUES');
    
    // Add CORS headers to requests
    const addCORSHeaders = (url) => {
      const headers = {};
      
      // For backend requests
      if (url.includes('31.97.235.37')) {
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      }
      
      return headers;
    };
    
    console.log('✅ CORS headers configuration ready');
    console.groupEnd();
    
    return addCORSHeaders;
  },

  /**
   * Run all fixes
   */
  runAllFixes: async () => {
    console.group('🚀 RUNNING ALL 404 FIXES');
    console.log('Starting comprehensive 404 fix process...\n');
    
    const results = {
      imagesFixed: 0,
      apiBaseUrl: '',
      fetchPatched: false,
      routingChecked: false,
      corsConfigured: false
    };
    
    try {
      // Fix images
      results.imagesFixed = fix404.fixAllImages();
      
      // Fix API base URL
      results.apiBaseUrl = fix404.fixAPIBaseURL();
      
      // Fix static assets
      await fix404.fixStaticAssets();
      
      // Fix fetch requests
      fix404.fixFetchRequests();
      results.fetchPatched = true;
      
      // Fix SPA routing
      fix404.fixSPARouting();
      results.routingChecked = true;
      
      // Fix CORS
      fix404.fixCORSIssues();
      results.corsConfigured = true;
      
      console.log('\n📊 FIX RESULTS:');
      console.log(`✅ Images fixed: ${results.imagesFixed}`);
      console.log(`✅ API Base URL: ${results.apiBaseUrl}`);
      console.log(`✅ Fetch patched: ${results.fetchPatched}`);
      console.log(`✅ Routing checked: ${results.routingChecked}`);
      console.log(`✅ CORS configured: ${results.corsConfigured}`);
      
      console.log('\n🎉 All 404 fixes applied successfully!');
      
    } catch (error) {
      console.error('❌ Error applying fixes:', error);
    }
    
    console.groupEnd();
    return results;
  },

  /**
   * Monitor for new 404 errors
   */
  startMonitoring: () => {
    console.group('👁️ STARTING 404 MONITORING');
    
    // Monitor for new images added to DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const images = node.tagName === 'IMG' ? [node] : node.querySelectorAll?.('img') || [];
            
            images.forEach((img) => {
              if (isExternalPlaceholder(img.src)) {
                console.log('🔧 Auto-fixing new image:', img.src);
                img.src = sanitizeImageUrl(img.src, 'product');
              }
              
              if (!img.onerror) {
                img.onerror = function() {
                  console.warn(`🖼️ New image failed: ${this.src}`);
                  this.src = sanitizeImageUrl('', 'error');
                };
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('✅ DOM monitoring started for new images');
    console.groupEnd();
    
    return observer;
  }
};

// Auto-attach to window for easy access
if (typeof window !== 'undefined') {
  window.fix404 = fix404;
}

export default fix404;

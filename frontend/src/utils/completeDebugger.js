/**
 * Complete Debugger - All-in-one debugging solution
 * Combines all debugging utilities for comprehensive error resolution
 */

import nullSafetyDebugger, { nullSafeHelpers } from './nullSafetyDebugger';
import routeDebugger from './routeDebugger';
import routeFixer from './routeFixer';
import storageDebugger from './debugStorage';

class CompleteDebugger {
  constructor() {
    this.version = '1.0.0';
    this.debugHistory = [];
  }

  /**
   * Run complete debugging analysis
   */
  async debugComplete() {
    console.group('🔍 COMPLETE DEBUGGING ANALYSIS');
    console.log(`🚀 Complete Debugger v${this.version}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: this.getEnvironmentInfo(),
      nullSafety: null,
      routes: null,
      storage: null,
      performance: null,
      recommendations: [],
      quickFixes: []
    };

    try {
      // 1. Null Safety Analysis
      console.log('\n1. 🛡️ Running null safety analysis...');
      results.nullSafety = await nullSafetyDebugger.debugNullReferences();
      
      // 2. Route Analysis
      console.log('\n2. 🛣️ Running route analysis...');
      results.routes = await routeDebugger.debugComplete();
      
      // 3. Storage Analysis
      console.log('\n3. 🗄️ Running storage analysis...');
      results.storage = await storageDebugger.debugComplete();
      
      // 4. Performance Analysis
      console.log('\n4. ⚡ Running performance analysis...');
      results.performance = this.analyzePerformance();
      
      // 5. Generate recommendations
      console.log('\n5. 💡 Generating recommendations...');
      results.recommendations = this.generateRecommendations(results);
      results.quickFixes = this.getQuickFixes(results);
      
      // 6. Log summary
      this.logSummary(results);
      
    } catch (error) {
      console.error('❌ Complete debugging failed:', error);
      results.error = error.message;
    }
    
    console.groupEnd();
    
    // Store results
    this.debugHistory.push(results);
    this.storeResults(results);
    
    return results;
  }

  /**
   * Get environment information
   */
  getEnvironmentInfo() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
      } : null,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      } : null,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    };
  }

  /**
   * Analyze performance
   */
  analyzePerformance() {
    const performance = window.performance;
    const timing = performance.timing;
    
    const metrics = {
      loadTime: timing.loadEventEnd - timing.navigationStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      firstPaint: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null
    };

    // Get paint metrics if available
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = Math.round(entry.startTime);
        } else if (entry.name === 'first-contentful-paint') {
          metrics.firstContentfulPaint = Math.round(entry.startTime);
        }
      });

      // Get LCP if available
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        metrics.largestContentfulPaint = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
      }
    }

    return metrics;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(results) {
    const recommendations = [];

    // Null safety recommendations
    if (results.nullSafety?.errorsFound > 0) {
      recommendations.push({
        type: 'null_safety',
        priority: 'high',
        message: 'Null reference errors detected',
        action: 'Run null safety fixes'
      });
    }

    // Route recommendations
    if (results.routes?.recommendations?.length > 0) {
      recommendations.push({
        type: 'routes',
        priority: 'medium',
        message: 'Route issues detected',
        action: 'Run route fixes'
      });
    }

    // Storage recommendations
    if (results.storage?.recommendations?.length > 0) {
      recommendations.push({
        type: 'storage',
        priority: 'medium',
        message: 'Storage issues detected',
        action: 'Clean up storage'
      });
    }

    // Performance recommendations
    if (results.performance?.loadTime > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Slow page load detected',
        action: 'Optimize performance'
      });
    }

    return recommendations;
  }

  /**
   * Get quick fixes
   */
  getQuickFixes(results) {
    return [
      {
        name: 'Fix Null References',
        description: 'Apply null safety fixes',
        action: () => nullSafetyDebugger.applyNullSafetyFixes()
      },
      {
        name: 'Fix Routes',
        description: 'Apply route fixes',
        action: () => routeFixer.fixAllRoutes()
      },
      {
        name: 'Clean Storage',
        description: 'Clean up browser storage',
        action: () => storageDebugger.completeCleanup()
      },
      {
        name: 'Clear Auth Data',
        description: 'Clear authentication data',
        action: () => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.clear();
          window.location.reload();
        }
      },
      {
        name: 'Force Refresh',
        description: 'Force page refresh',
        action: () => window.location.reload(true)
      }
    ];
  }

  /**
   * Apply all quick fixes
   */
  async applyAllFixes() {
    console.group('🔧 APPLYING ALL QUICK FIXES');
    
    const results = [];
    
    try {
      // 1. Null safety fixes
      console.log('1. 🛡️ Applying null safety fixes...');
      const nullFixes = await nullSafetyDebugger.applyNullSafetyFixes();
      results.push({ type: 'null_safety', result: nullFixes });
      
      // 2. Route fixes
      console.log('2. 🛣️ Applying route fixes...');
      const routeFixes = await routeFixer.fixAllRoutes();
      results.push({ type: 'routes', result: routeFixes });
      
      // 3. Storage cleanup
      console.log('3. 🗄️ Cleaning storage...');
      await storageDebugger.completeCleanup();
      results.push({ type: 'storage', result: { success: true } });
      
      console.log('✅ All fixes applied successfully!');
      
    } catch (error) {
      console.error('❌ Some fixes failed:', error);
      results.push({ type: 'error', result: { success: false, error: error.message } });
    }
    
    console.groupEnd();
    
    return results;
  }

  /**
   * Log summary
   */
  logSummary(results) {
    console.group('📊 DEBUGGING SUMMARY');
    
    console.log(`🕐 Analysis completed at: ${results.timestamp}`);
    console.log(`🌐 URL: ${results.environment.url}`);
    console.log(`💾 Memory: ${results.environment.memory?.used || 'N/A'}MB used`);
    console.log(`⚡ Load time: ${results.performance?.loadTime || 'N/A'}ms`);
    console.log(`🛡️ Null safety issues: ${results.nullSafety?.errorsFound || 0}`);
    console.log(`🛣️ Route issues: ${results.routes?.recommendations?.length || 0}`);
    console.log(`🗄️ Storage issues: ${results.storage?.recommendations?.length || 0}`);
    console.log(`💡 Recommendations: ${results.recommendations.length}`);
    
    if (results.recommendations.length > 0) {
      console.log('\n🔧 Recommended actions:');
      results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message} - ${rec.action}`);
      });
    } else {
      console.log('✅ No issues detected!');
    }
    
    console.groupEnd();
  }

  /**
   * Store results for later analysis
   */
  storeResults(results) {
    try {
      const existingResults = JSON.parse(localStorage.getItem('debug_results') || '[]');
      existingResults.push(results);
      
      // Keep only last 5 results
      if (existingResults.length > 5) {
        existingResults.splice(0, existingResults.length - 5);
      }
      
      localStorage.setItem('debug_results', JSON.stringify(existingResults));
    } catch (error) {
      console.warn('Could not store debug results:', error);
    }
  }

  /**
   * Get debug history
   */
  getDebugHistory() {
    try {
      return JSON.parse(localStorage.getItem('debug_results') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Emergency fix - for critical errors
   */
  emergencyFix() {
    console.log('🚨 EMERGENCY FIX ACTIVATED');
    
    // Clear all potentially problematic data
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any error states
    if (window.location.pathname.includes('/admin') && !this.isAdmin()) {
      window.location.href = '/login';
      return;
    }
    
    // Reload page
    window.location.reload();
  }

  /**
   * Check if user is admin
   */
  isAdmin() {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.role === 'admin';
      }
    } catch (error) {
      return false;
    }
    return false;
  }
}

// Create global instance
const completeDebugger = new CompleteDebugger();

// Export for use
export default completeDebugger;

// Global access for console debugging
window.completeDebugger = completeDebugger;
window.nullSafeHelpers = nullSafeHelpers;

// Auto-run in development if there are errors
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    console.warn('🚨 Error detected, running auto-debug...');
    setTimeout(() => {
      completeDebugger.debugComplete();
    }, 1000);
  });
}

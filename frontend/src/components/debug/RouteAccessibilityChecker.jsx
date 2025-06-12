import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import routeDebugger from '../../utils/routeDebugger';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const RouteAccessibilityChecker = ({ onClose }) => {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setTesting(true);
    setTestResults(null);
    
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        isAuthenticated,
        userRole: user?.role || 'guest'
      },
      tests: {
        publicRoutes: [],
        productRoutes: [],
        adminRoutes: [],
        protectedRoutes: []
      },
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };

    try {
      // Test public routes
      setCurrentTest('Testing public routes...');
      const publicRoutes = ['/', '/products', '/cart', '/checkout', '/login', '/register'];
      
      for (const route of publicRoutes) {
        const testResult = await testRoute(route, 'public');
        results.tests.publicRoutes.push(testResult);
        updateSummary(results.summary, testResult);
      }

      // Test product routes
      setCurrentTest('Testing product routes...');
      const productSlugs = await getProductSlugs();
      
      for (const slug of productSlugs.slice(0, 3)) {
        const route = `/products/${slug}`;
        const testResult = await testRoute(route, 'product');
        results.tests.productRoutes.push(testResult);
        updateSummary(results.summary, testResult);
      }

      // Test category routes
      const categoryRoute = '/category/mens-clothing';
      const categoryResult = await testRoute(categoryRoute, 'category');
      results.tests.productRoutes.push(categoryResult);
      updateSummary(results.summary, categoryResult);

      // Test admin routes
      setCurrentTest('Testing admin routes...');
      const adminRoutes = ['/admin', '/admin/products', '/admin/orders', '/admin/users', '/admin/categories'];
      
      for (const route of adminRoutes) {
        const testResult = await testRoute(route, 'admin');
        results.tests.adminRoutes.push(testResult);
        updateSummary(results.summary, testResult);
      }

      // Test protected routes
      setCurrentTest('Testing protected routes...');
      const protectedRoutes = ['/profile', '/orders', '/wishlist'];
      
      for (const route of protectedRoutes) {
        const testResult = await testRoute(route, 'protected');
        results.tests.protectedRoutes.push(testResult);
        updateSummary(results.summary, testResult);
      }

      setTestResults(results);
      
    } catch (error) {
      console.error('Route testing failed:', error);
    } finally {
      setTesting(false);
      setCurrentTest('');
    }
  };

  const testRoute = async (route, type) => {
    const startTime = Date.now();
    
    try {
      // Test if route is accessible
      const accessible = await routeDebugger.testRouteAccessibility(route);
      const endTime = Date.now();
      
      // Check authentication requirements
      const requiresAuth = type === 'protected' || type === 'admin';
      const requiresAdmin = type === 'admin';
      const hasAccess = routeDebugger.shouldHaveAccess(route);
      
      let status = 'passed';
      let message = 'Route is accessible';
      let warnings = [];
      
      if (!accessible) {
        status = 'failed';
        message = 'Route is not accessible';
      } else if (requiresAdmin && user?.role !== 'admin') {
        status = 'warning';
        message = 'Admin route accessible without admin privileges';
        warnings.push('This route should require admin authentication');
      } else if (requiresAuth && !isAuthenticated) {
        status = 'warning';
        message = 'Protected route accessible without authentication';
        warnings.push('This route should require user authentication');
      }

      return {
        route,
        type,
        status,
        message,
        warnings,
        accessible,
        hasAccess,
        responseTime: endTime - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        route,
        type,
        status: 'failed',
        message: `Test failed: ${error.message}`,
        warnings: [],
        accessible: false,
        hasAccess: false,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  };

  const getProductSlugs = async () => {
    try {
      const response = await fetch('/api/products?limit=5');
      if (response.ok) {
        const data = await response.json();
        return data.products?.map(p => p.slug) || [];
      }
    } catch (error) {
      console.warn('Could not fetch products:', error);
    }
    return ['test-product', 'sample-item'];
  };

  const updateSummary = (summary, testResult) => {
    summary.total++;
    if (testResult.status === 'passed') {
      summary.passed++;
    } else if (testResult.status === 'failed') {
      summary.failed++;
    } else if (testResult.status === 'warning') {
      summary.warnings++;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const testRoute = (route) => {
    navigate(route);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🛣️ Route Accessibility Checker</h2>
            <p className="text-sm text-gray-600">Test all routes for accessibility and authentication</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Testing Status */}
        {testing && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-blue-800 font-medium">{currentTest}</span>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {testResults && (
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{testResults.summary.total}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testResults.summary.warnings}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {testResults ? (
            <div className="space-y-6">
              {/* Public Routes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Public Routes</h3>
                <div className="space-y-2">
                  {testResults.tests.publicRoutes.map((test, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.route}</span>
                          <button
                            onClick={() => testRoute(test.route)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Test this route"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm">{test.responseTime}ms</span>
                      </div>
                      <div className="mt-1 text-sm">{test.message}</div>
                      {test.warnings.length > 0 && (
                        <div className="mt-2">
                          {test.warnings.map((warning, wIndex) => (
                            <div key={wIndex} className="text-xs text-yellow-700">⚠️ {warning}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Routes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Routes</h3>
                <div className="space-y-2">
                  {testResults.tests.productRoutes.map((test, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.route}</span>
                          <button
                            onClick={() => testRoute(test.route)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Test this route"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm">{test.responseTime}ms</span>
                      </div>
                      <div className="mt-1 text-sm">{test.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Routes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Routes</h3>
                <div className="space-y-2">
                  {testResults.tests.adminRoutes.map((test, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.route}</span>
                          <button
                            onClick={() => testRoute(test.route)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Test this route"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm">{test.responseTime}ms</span>
                      </div>
                      <div className="mt-1 text-sm">{test.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protected Routes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Protected Routes</h3>
                <div className="space-y-2">
                  {testResults.tests.protectedRoutes.map((test, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(test.status)}
                          <span className="font-medium">{test.route}</span>
                          <button
                            onClick={() => testRoute(test.route)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Test this route"
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-sm">{test.responseTime}ms</span>
                      </div>
                      <div className="mt-1 text-sm">{test.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">No test results yet. Click "Run Tests" to start.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Current user: {isAuthenticated ? `${user?.email} (${user?.role})` : 'Not authenticated'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={runTests}
                disabled={testing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {testing ? 'Testing...' : 'Run Tests'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RouteAccessibilityChecker;

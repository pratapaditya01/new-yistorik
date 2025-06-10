import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

/**
 * Component to test backend connection and display status
 */
const ConnectionTest = ({ showDetails = false }) => {
  const [status, setStatus] = useState({
    health: 'testing',
    cors: 'testing',
    products: 'testing',
    categories: 'testing'
  });
  const [details, setDetails] = useState({});
  const [lastTest, setLastTest] = useState(null);

  const testConnection = async () => {
    setStatus({
      health: 'testing',
      cors: 'testing',
      products: 'testing',
      categories: 'testing'
    });
    setDetails({});

    const results = {};

    // Test 1: Health check
    try {
      const healthResponse = await fetch('https://new-yistorik.onrender.com/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setStatus(prev => ({ ...prev, health: 'success' }));
        results.health = { status: 'success', data: healthData };
      } else {
        setStatus(prev => ({ ...prev, health: 'error' }));
        results.health = { status: 'error', error: `HTTP ${healthResponse.status}` };
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, health: 'error' }));
      results.health = { status: 'error', error: error.message };
    }

    // Test 2: CORS test
    try {
      const corsResponse = await fetch('https://new-yistorik.onrender.com/api/cors-test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      if (corsResponse.ok) {
        const corsData = await corsResponse.json();
        setStatus(prev => ({ ...prev, cors: 'success' }));
        results.cors = { status: 'success', data: corsData };
      } else {
        setStatus(prev => ({ ...prev, cors: 'error' }));
        results.cors = { status: 'error', error: `HTTP ${corsResponse.status}` };
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, cors: 'error' }));
      results.cors = { status: 'error', error: error.message };
    }

    // Test 3: Products API
    try {
      const productsData = await api.get('/products?limit=1');
      setStatus(prev => ({ ...prev, products: 'success' }));
      results.products = { status: 'success', data: { count: productsData?.length || 0 } };
    } catch (error) {
      setStatus(prev => ({ ...prev, products: 'error' }));
      results.products = { status: 'error', error: error.message };
    }

    // Test 4: Categories API
    try {
      const categoriesData = await api.get('/categories');
      setStatus(prev => ({ ...prev, categories: 'success' }));
      results.categories = { status: 'success', data: { count: categoriesData?.length || 0 } };
    } catch (error) {
      setStatus(prev => ({ ...prev, categories: 'error' }));
      results.categories = { status: 'error', error: error.message };
    }

    setDetails(results);
    setLastTest(new Date());
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = (testStatus) => {
    switch (testStatus) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'testing':
        return <ClockIcon className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (testStatus) => {
    switch (testStatus) {
      case 'success':
        return 'Connected';
      case 'error':
        return 'Failed';
      case 'testing':
        return 'Testing...';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (testStatus) => {
    switch (testStatus) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'testing':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const allTestsPassed = Object.values(status).every(s => s === 'success');
  const anyTestFailed = Object.values(status).some(s => s === 'error');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Backend Connection Status</h3>
        <button
          onClick={testConnection}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Test Again
        </button>
      </div>

      {/* Overall Status */}
      <div className={`p-3 rounded-md mb-4 ${
        allTestsPassed ? 'bg-green-50 border border-green-200' :
        anyTestFailed ? 'bg-red-50 border border-red-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center">
          {allTestsPassed ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
          ) : anyTestFailed ? (
            <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
          ) : (
            <ClockIcon className="w-5 h-5 text-yellow-500 mr-2 animate-pulse" />
          )}
          <span className={`font-medium ${
            allTestsPassed ? 'text-green-800' :
            anyTestFailed ? 'text-red-800' :
            'text-yellow-800'
          }`}>
            {allTestsPassed ? 'All systems operational' :
             anyTestFailed ? 'Some services are experiencing issues' :
             'Testing connection...'}
          </span>
        </div>
      </div>

      {/* Individual Test Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status.health)}
            <span className="ml-2 text-sm font-medium text-gray-700">Server Health</span>
          </div>
          <span className={`text-sm ${getStatusColor(status.health)}`}>
            {getStatusText(status.health)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status.cors)}
            <span className="ml-2 text-sm font-medium text-gray-700">CORS Configuration</span>
          </div>
          <span className={`text-sm ${getStatusColor(status.cors)}`}>
            {getStatusText(status.cors)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status.products)}
            <span className="ml-2 text-sm font-medium text-gray-700">Products API</span>
          </div>
          <span className={`text-sm ${getStatusColor(status.products)}`}>
            {getStatusText(status.products)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status.categories)}
            <span className="ml-2 text-sm font-medium text-gray-700">Categories API</span>
          </div>
          <span className={`text-sm ${getStatusColor(status.categories)}`}>
            {getStatusText(status.categories)}
          </span>
        </div>
      </div>

      {/* Last Test Time */}
      {lastTest && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last tested: {lastTest.toLocaleString()}
          </p>
        </div>
      )}

      {/* Detailed Results */}
      {showDetails && Object.keys(details).length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              View Technical Details
            </summary>
            <div className="bg-gray-50 rounded-md p-3">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;

/**
 * Debug Panel Component
 * Quick access panel for debugging 404 and other issues
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StorageDebugger from '../debug/StorageDebugger';
import RouteAccessibilityChecker from '../debug/RouteAccessibilityChecker';

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showStorageDebugger, setShowStorageDebugger] = useState(false);
  const [showRouteChecker, setShowRouteChecker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const shouldShow = 
      window.location.hostname === 'localhost' || 
      window.location.search.includes('debug=true') ||
      localStorage.getItem('showDebugPanel') === 'true';
    
    if (!shouldShow) return;

    // Listen for errors
    const handleError = (event) => {
      const error = {
        id: Date.now(),
        type: 'error',
        message: event.error?.message || event.message || 'Unknown error',
        timestamp: new Date().toLocaleTimeString(),
        stack: event.error?.stack
      };
      
      setErrors(prev => [error, ...prev.slice(0, 9)]); // Keep last 10 errors
    };

    // Listen for 404 errors in console
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('404') || message.includes('Failed to load')) {
        const error = {
          id: Date.now(),
          type: '404',
          message: message,
          timestamp: new Date().toLocaleTimeString()
        };
        
        setErrors(prev => [error, ...prev.slice(0, 9)]);
      }
      
      return originalError.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
      console.error = originalError;
    };
  }, []);

  // Don't render in production unless explicitly enabled
  const shouldRender = 
    window.location.hostname === 'localhost' || 
    window.location.search.includes('debug=true') ||
    localStorage.getItem('showDebugPanel') === 'true';

  if (!shouldRender) return null;

  const runQuickFix = () => {
    if (window.fix404) {
      window.fix404.runAllFixes();
    } else {
      console.error('fix404 utility not available');
    }
  };

  const runDebugReport = () => {
    if (window.debug404) {
      window.debug404.generateReport();
    } else {
      console.error('debug404 utility not available');
    }
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
          errors.length > 0 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white flex items-center justify-center`}
        title={`Debug Panel (${errors.length} errors)`}
      >
        {errors.length > 0 ? (
          <span className="text-xs font-bold">{errors.length}</span>
        ) : (
          <span className="text-lg">🔧</span>
        )}
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 text-white p-3 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Debug Panel</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Controls */}
          <div className="p-3 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={runQuickFix}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Quick Fix
              </button>

              <button
                onClick={runDebugReport}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Debug Report
              </button>

              <button
                onClick={() => setShowRouteChecker(true)}
                className="bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
              >
                Route Check
              </button>

              <button
                onClick={() => setShowStorageDebugger(true)}
                className="bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600"
              >
                Storage Debug
              </button>

              <button
                onClick={() => navigate('/debug/404')}
                className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
              >
                Debug Page
              </button>

              <button
                onClick={clearErrors}
                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                Clear Errors
              </button>
            </div>
          </div>

          {/* Error List */}
          <div className="max-h-48 overflow-y-auto">
            {errors.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                No errors detected
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {errors.map((error) => (
                  <div key={error.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${
                          error.type === '404' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {error.type === '404' ? '404 Error' : 'Error'}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 break-words">
                          {error.message}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {error.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-2 text-xs text-gray-500 text-center">
            Environment: {window.location.hostname === 'localhost' ? 'Development' : 'Production'}
          </div>
        </div>
      )}

      {/* Storage Debugger Modal */}
      {showStorageDebugger && (
        <StorageDebugger onClose={() => setShowStorageDebugger(false)} />
      )}

      {/* Route Accessibility Checker Modal */}
      {showRouteChecker && (
        <RouteAccessibilityChecker onClose={() => setShowRouteChecker(false)} />
      )}
    </>
  );
};

export default DebugPanel;

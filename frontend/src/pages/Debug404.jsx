/**
 * 404 Debugging Page
 * Comprehensive debugging interface for 404 errors
 */

import React, { useState, useEffect } from 'react';
import { debug404 } from '../utils/debug404';

const Debug404 = () => {
  const [debugResults, setDebugResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Start monitoring immediately
    debug404.monitorNetworkRequests();
    debug404.checkConsoleErrors();
    
    // Add log capture
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    const captureLog = (type, ...args) => {
      const message = args.join(' ');
      const timestamp = new Date().toLocaleTimeString();
      
      setLogs(prev => [...prev, {
        type,
        message,
        timestamp,
        id: Date.now() + Math.random()
      }]);
    };
    
    console.log = (...args) => {
      captureLog('log', ...args);
      return originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      captureLog('error', ...args);
      return originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      captureLog('warn', ...args);
      return originalWarn.apply(console, args);
    };
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  const runFullDebug = async () => {
    setIsRunning(true);
    setLogs([]);
    
    try {
      await debug404.generateReport();
      setDebugResults({
        completed: true,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Debug failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickFix = () => {
    debug404.quickFix();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testProblematicUrls = async () => {
    const urls = [
      'https://via.placeholder.com/300x300',
      'https://broken-url.com/image.jpg',
      '/api/nonexistent',
      '/uploads/missing-image.jpg'
    ];
    
    for (const url of urls) {
      try {
        await fetch(url);
      } catch (error) {
        console.error('Test URL failed:', url, error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            404 Error Debugger
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive tool to debug and fix 404 errors in the application.
            Monitor network requests, check endpoints, and identify issues.
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Debug Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={runFullDebug}
              disabled={isRunning}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Full Debug'}
            </button>
            
            <button
              onClick={runQuickFix}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Apply Quick Fixes
            </button>
            
            <button
              onClick={testProblematicUrls}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              Test Problem URLs
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current URL</h3>
            <p className="text-sm text-gray-600 break-all">{window.location.href}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Base API URL</h3>
            <p className="text-sm text-gray-600">
              {window.location.hostname === 'localhost' 
                ? 'http://localhost:5001' 
                : 'https://new-yistorik.onrender.com'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Environment</h3>
            <p className="text-sm text-gray-600">
              {window.location.hostname === 'localhost' ? 'Development' : 'Production'}
            </p>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Live Debug Logs</h2>
            <span className="text-sm text-gray-500">
              {logs.length} entries
            </span>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run debug or interact with the app to see logs...</div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warn' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Test Images */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Problematic Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">via.placeholder.com</h3>
              <img 
                src="https://via.placeholder.com/150x150" 
                alt="Via Placeholder"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => console.error('Image failed:', e.target.src)}
                onLoad={() => console.log('Image loaded:', 'via.placeholder.com')}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Broken URL</h3>
              <img 
                src="https://broken-url-404.com/image.jpg" 
                alt="Broken URL"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => console.error('Image failed:', e.target.src)}
                onLoad={() => console.log('Image loaded:', 'broken-url')}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Backend Image</h3>
              <img 
                src="https://new-yistorik.onrender.com/uploads/sample-product.jpg" 
                alt="Backend Image"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => console.error('Image failed:', e.target.src)}
                onLoad={() => console.log('Image loaded:', 'backend-image')}
              />
            </div>
            
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Local SVG</h3>
              <img 
                src="/placeholder-image.svg" 
                alt="Local SVG"
                className="w-full h-32 object-cover rounded border"
                onError={(e) => console.error('Image failed:', e.target.src)}
                onLoad={() => console.log('Image loaded:', 'local-svg')}
              />
            </div>
          </div>
        </div>

        {/* Common 404 Issues */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common 404 Issues & Solutions</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold text-red-700">External Placeholder Services</h3>
              <p className="text-gray-600">via.placeholder.com, picsum.photos blocked by network</p>
              <p className="text-sm text-gray-500">Solution: Use local SVG placeholders</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-orange-700">Backend API Endpoints</h3>
              <p className="text-gray-600">API server not running or wrong URL</p>
              <p className="text-sm text-gray-500">Solution: Check backend server status</p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold text-yellow-700">Static Assets</h3>
              <p className="text-gray-600">Missing favicon, images, or other static files</p>
              <p className="text-sm text-gray-500">Solution: Ensure files exist in public directory</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-700">Route Configuration</h3>
              <p className="text-gray-600">React Router not handling SPA routes correctly</p>
              <p className="text-sm text-gray-500">Solution: Configure server for SPA routing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Debug404;

import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.group('🚨 ERROR BOUNDARY CAUGHT ERROR');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Update state with error details
    this.setState({
      error,
      errorInfo
    });

    // Log to external service if needed
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Log error details for debugging
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId(),
      errorId: this.state.errorId
    };

    // Store in localStorage for debugging
    const existingErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
    existingErrors.push(errorReport);
    
    // Keep only last 10 errors
    if (existingErrors.length > 10) {
      existingErrors.splice(0, existingErrors.length - 10);
    }
    
    localStorage.setItem('error_reports', JSON.stringify(existingErrors));

    // Log to console for immediate debugging
    console.log('📋 Error Report Saved:', errorReport);
  };

  getUserId = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData._id || userData.id || 'unknown';
      }
    } catch (error) {
      return 'unknown';
    }
    return 'guest';
  };

  handleRetry = () => {
    // Clear error state and retry
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleClearData = () => {
    // Clear potentially corrupted data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    sessionStorage.clear();
    window.location.reload();
  };

  getErrorType = (error) => {
    if (error.message.includes('Cannot read properties of null')) {
      return 'null_reference';
    }
    if (error.message.includes('Cannot read properties of undefined')) {
      return 'undefined_reference';
    }
    if (error.message.includes('Network Error')) {
      return 'network_error';
    }
    if (error.message.includes('ChunkLoadError')) {
      return 'chunk_load_error';
    }
    return 'unknown_error';
  };

  getErrorSolution = (errorType) => {
    switch (errorType) {
      case 'null_reference':
        return {
          title: 'Data Reference Error',
          description: 'Some data is missing or corrupted.',
          solutions: [
            'Clear browser data and refresh',
            'Log out and log back in',
            'Contact support if issue persists'
          ]
        };
      case 'undefined_reference':
        return {
          title: 'Missing Data Error',
          description: 'Required data is not available.',
          solutions: [
            'Refresh the page',
            'Check your internet connection',
            'Clear browser cache'
          ]
        };
      case 'network_error':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to the server.',
          solutions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if issue persists'
          ]
        };
      case 'chunk_load_error':
        return {
          title: 'Loading Error',
          description: 'Failed to load application resources.',
          solutions: [
            'Refresh the page',
            'Clear browser cache',
            'Try a different browser'
          ]
        };
      default:
        return {
          title: 'Unexpected Error',
          description: 'Something went wrong.',
          solutions: [
            'Refresh the page',
            'Try again later',
            'Contact support if issue persists'
          ]
        };
    }
  };

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType(this.state.error);
      const solution = this.getErrorSolution(errorType);

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>

            {/* Error Title */}
            <h1 className="text-xl font-bold text-gray-900 text-center mb-2">
              {solution.title}
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              {solution.description}
            </p>

            {/* Error ID */}
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500 text-center">
                Error ID: {this.state.errorId}
              </p>
            </div>

            {/* Solutions */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Try these solutions:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {solution.solutions.map((sol, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {sol}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Go to Home
              </button>

              <button
                onClick={this.handleClearData}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear Data & Reload
              </button>
            </div>

            {/* Debug Info (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 bg-gray-100 rounded-lg p-3">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Debug Information
                </summary>
                <div className="mt-2 text-xs text-gray-600 font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-xs mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Info */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                If this problem continues, please contact support with Error ID: {this.state.errorId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

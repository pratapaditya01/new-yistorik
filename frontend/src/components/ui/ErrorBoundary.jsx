import React, { Component } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Error Boundary component to catch and handle React errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-lg font-medium text-gray-900">
                  Something went wrong
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      Error Details (Development)
                    </summary>
                    <div className="mt-2 p-3 bg-red-50 rounded-md">
                      <pre className="text-xs text-red-800 whitespace-pre-wrap">
                        {this.state.error.toString()}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </details>
                )}
                
                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Refresh Page
                  </button>
                  
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex justify-center px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    Go to Homepage
                  </button>
                </div>
                
                {this.state.retryCount > 0 && (
                  <p className="mt-4 text-xs text-gray-500">
                    Retry attempts: {this.state.retryCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

/**
 * Network Error Component for API failures
 */
export const NetworkError = ({ 
  error, 
  onRetry, 
  title = "Connection Error",
  message = "Unable to connect to the server. Please check your internet connection and try again."
}) => {
  const getErrorMessage = (error) => {
    if (error?.response?.status === 502) {
      return "The server is temporarily unavailable. Please try again in a few moments.";
    }
    if (error?.response?.status === 503) {
      return "The service is temporarily unavailable for maintenance.";
    }
    if (error?.response?.status === 404) {
      return "The requested resource was not found.";
    }
    if (error?.code === 'ERR_NETWORK') {
      return "Network error. Please check your internet connection.";
    }
    if (error?.message?.includes('CORS')) {
      return "Cross-origin request blocked. The server may be experiencing issues.";
    }
    return message;
  };

  return (
    <div className="text-center py-12">
      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-500" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
        {getErrorMessage(error)}
      </p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 text-left max-w-md mx-auto">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-yellow-50 rounded-md">
            <pre className="text-xs text-yellow-800 whitespace-pre-wrap">
              {JSON.stringify({
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                url: error.config?.url
              }, null, 2)}
            </pre>
          </div>
        </details>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Loading state with error fallback
 */
export const LoadingWithError = ({ 
  loading, 
  error, 
  onRetry, 
  children,
  loadingText = "Loading..."
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">{loadingText}</span>
      </div>
    );
  }

  if (error) {
    return <NetworkError error={error} onRetry={onRetry} />;
  }

  return children;
};

export default ErrorBoundary;

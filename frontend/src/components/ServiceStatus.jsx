import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * Service Status Banner - Shows when backend is experiencing issues
 */
const ServiceStatus = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'online', 'degraded', 'offline'
  const [lastCheck, setLastCheck] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkServiceStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://31.97.235.37/api/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('online');
        setRetryCount(0);
      } else if (response.status >= 500) {
        setStatus('degraded');
      } else {
        setStatus('degraded');
      }
    } catch (error) {
      console.warn('Service status check failed:', error.message);
      if (error.name === 'AbortError') {
        setStatus('degraded');
      } else {
        setStatus('offline');
      }
      setRetryCount(prev => prev + 1);
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkServiceStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkServiceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't show banner if service is online
  if (status === 'online') {
    return null;
  }

  // Don't show banner while checking for the first time
  if (status === 'checking' && !lastCheck) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'degraded':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-500',
          title: 'Service Degraded',
          message: 'Our servers are experiencing some issues. You may notice slower loading times or temporary errors.',
          action: 'We\'re working to resolve this quickly.'
        };
      case 'offline':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-500',
          title: 'Service Unavailable',
          message: 'Our servers are currently unavailable. Please try again in a few minutes.',
          action: 'If the problem persists, please contact support.'
        };
      case 'checking':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: ClockIcon,
          iconColor: 'text-blue-500',
          title: 'Checking Service Status',
          message: 'Verifying server connectivity...',
          action: ''
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border-l-4 p-4`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <div className={`mt-1 text-sm ${config.textColor}`}>
            <p>{config.message}</p>
            {config.action && (
              <p className="mt-1 font-medium">{config.action}</p>
            )}
            {lastCheck && (
              <p className="mt-2 text-xs opacity-75">
                Last checked: {lastCheck.toLocaleTimeString()}
                {retryCount > 0 && ` (${retryCount} failed attempts)`}
              </p>
            )}
          </div>
        </div>
        <div className="ml-3 flex-shrink-0">
          <button
            onClick={checkServiceStatus}
            className={`inline-flex text-sm font-medium ${config.textColor} hover:opacity-75 focus:outline-none focus:underline`}
          >
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Inline Service Status Indicator - Small indicator for headers/footers
 */
export const ServiceStatusIndicator = () => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('https://31.97.235.37/api/health', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        setStatus(response.ok ? 'online' : 'degraded');
      } catch (error) {
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const getIndicatorConfig = () => {
    switch (status) {
      case 'online':
        return { color: 'bg-green-400', text: 'All systems operational' };
      case 'degraded':
        return { color: 'bg-yellow-400', text: 'Some issues detected' };
      case 'offline':
        return { color: 'bg-red-400', text: 'Service unavailable' };
      default:
        return { color: 'bg-gray-400', text: 'Checking status...' };
    }
  };

  const config = getIndicatorConfig();

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
      <span className="text-xs text-gray-600">{config.text}</span>
    </div>
  );
};

export default ServiceStatus;

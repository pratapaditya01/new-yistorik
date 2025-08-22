// Domain configuration for Yistorik
export const DOMAINS = {
  PRODUCTION: {
    PRIMARY: 'yistorik.in',
    WWW: 'www.yistorik.in',
    BACKEND: 'https://yistorik.in'
  },
  DEVELOPMENT: {
    FRONTEND: 'localhost:5173',
    BACKEND: 'http://localhost:5001'
  },
  STAGING: {
    VERCEL: 'new-yistorik-delta.vercel.app',
    BACKEND: 'https://yistorik.in'
  }
};

// Get current environment
export const getCurrentEnvironment = () => {
  if (typeof window === 'undefined') return 'production';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname === DOMAINS.PRODUCTION.PRIMARY || hostname === DOMAINS.PRODUCTION.WWW) {
    return 'production';
  }
  
  if (hostname.includes('vercel.app')) {
    return 'staging';
  }
  
  return 'production'; // fallback
};

// Get API base URL based on current environment
export const getApiBaseUrl = () => {
  const env = getCurrentEnvironment();
  
  switch (env) {
    case 'development':
      return DOMAINS.DEVELOPMENT.BACKEND;
    case 'staging':
      return DOMAINS.STAGING.BACKEND;
    case 'production':
    default:
      return DOMAINS.PRODUCTION.BACKEND;
  }
};

// Get full domain URL
export const getDomainUrl = (subdomain = '') => {
  const env = getCurrentEnvironment();
  
  if (env === 'development') {
    return `http://${DOMAINS.DEVELOPMENT.FRONTEND}`;
  }
  
  const domain = subdomain ? `${subdomain}.${DOMAINS.PRODUCTION.PRIMARY}` : DOMAINS.PRODUCTION.WWW;
  return `https://${domain}`;
};

// SEO and meta configuration
export const SEO_CONFIG = {
  SITE_NAME: 'Yistorik',
  SITE_DESCRIPTION: 'Premium Fashion Store - Discover the latest trends in clothing and accessories',
  SITE_URL: getDomainUrl(),
  LOGO_URL: `${getDomainUrl()}/logo.png`,
  SOCIAL: {
    TWITTER: '@yistorik',
    FACEBOOK: 'yistorik',
    INSTAGRAM: 'yistorik'
  }
};

export default {
  DOMAINS,
  getCurrentEnvironment,
  getApiBaseUrl,
  getDomainUrl,
  SEO_CONFIG
};

// Currency utility functions for Indian Rupee (₹)

/**
 * Format a number as Indian Rupee currency
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    locale = 'en-IN'
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const number = parseFloat(amount);
  
  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(number);
  } else {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(number);
  }
};

/**
 * Format price with rupee symbol (₹)
 * @param {number} price - The price to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, showDecimals = true) => {
  if (price === null || price === undefined || isNaN(price)) {
    return '₹0';
  }

  const number = parseFloat(price);
  
  if (showDecimals) {
    return `₹${number.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } else {
    return `₹${Math.round(number).toLocaleString('en-IN')}`;
  }
};

/**
 * Format price range (for compare prices)
 * @param {number} price - Current price
 * @param {number} comparePrice - Original/compare price
 * @returns {object} - Object with formatted prices and savings
 */
export const formatPriceRange = (price, comparePrice) => {
  const currentPrice = formatPrice(price);
  const originalPrice = comparePrice ? formatPrice(comparePrice) : null;
  const savings = comparePrice && comparePrice > price ? 
    formatPrice(comparePrice - price) : null;
  const savingsPercent = comparePrice && comparePrice > price ? 
    Math.round(((comparePrice - price) / comparePrice) * 100) : null;

  return {
    currentPrice,
    originalPrice,
    savings,
    savingsPercent,
    hasDiscount: comparePrice && comparePrice > price
  };
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string like "₹1,234.56"
 * @returns {number} - Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }
  
  // Remove currency symbol and commas, then parse
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  const number = parseFloat(cleanString);
  
  return isNaN(number) ? 0 : number;
};

/**
 * Format currency for admin/backend (without symbol for calculations)
 * @param {number} amount - The amount to format
 * @returns {number} - Clean number for backend
 */
export const formatForBackend = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 0;
  }
  return parseFloat(amount);
};

/**
 * Currency constants
 */
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  NAME: 'Indian Rupee',
  LOCALE: 'en-IN'
};

// Default export
export default {
  formatCurrency,
  formatPrice,
  formatPriceRange,
  parseCurrency,
  formatForBackend,
  CURRENCY
};

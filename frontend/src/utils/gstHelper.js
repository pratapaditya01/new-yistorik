/**
 * GST Helper Utilities for Indian Tax Calculations
 */

// Standard GST rates in India
export const GST_RATES = {
  EXEMPT: 0,
  ESSENTIAL: 5,
  STANDARD_LOW: 12,
  STANDARD: 18,
  LUXURY: 28,
  SPECIAL_JEWELRY: 3, // Special rate for jewelry
  SPECIAL_PRECIOUS_METALS: 3 // Special rate for precious metals
};

// GST rate suggestions based on product categories
export const GST_CATEGORY_SUGGESTIONS = {
  'clothing': { rate: 12, note: 'Textiles and clothing typically have 12% GST', hsn: '6203' },
  'textiles': { rate: 12, note: 'Textile products typically have 12% GST', hsn: '5208' },
  'electronics': { rate: 18, note: 'Electronics typically have 18% GST', hsn: '8517' },
  'mobile': { rate: 18, note: 'Mobile phones typically have 18% GST', hsn: '8517' },
  'computer': { rate: 18, note: 'Computers typically have 18% GST', hsn: '8471' },
  'food': { rate: 5, note: 'Food items typically have 5% GST', hsn: '1905' },
  'books': { rate: 0, note: 'Books are typically GST exempt (0%)', hsn: '4901' },
  'cosmetics': { rate: 18, note: 'Cosmetics typically have 18% GST', hsn: '3304' },
  'jewelry': { rate: 3, note: 'Jewelry typically has 3% GST', hsn: '7113' },
  'gold': { rate: 3, note: 'Gold jewelry typically has 3% GST', hsn: '7108' },
  'silver': { rate: 3, note: 'Silver jewelry typically has 3% GST', hsn: '7106' },
  'automobiles': { rate: 28, note: 'Automobiles typically have 28% GST', hsn: '8703' },
  'cars': { rate: 28, note: 'Cars typically have 28% GST', hsn: '8703' },
  'furniture': { rate: 12, note: 'Furniture typically has 12% GST', hsn: '9403' },
  'medicines': { rate: 5, note: 'Medicines typically have 5% GST', hsn: '3004' },
  'luxury': { rate: 28, note: 'Luxury items typically have 28% GST', hsn: '9999' },
  'shoes': { rate: 18, note: 'Footwear typically has 18% GST', hsn: '6403' },
  'bags': { rate: 18, note: 'Bags and luggage typically have 18% GST', hsn: '4202' },
  'watches': { rate: 18, note: 'Watches typically have 18% GST', hsn: '9102' },
  'toys': { rate: 12, note: 'Toys typically have 12% GST', hsn: '9503' },
  'sports': { rate: 18, note: 'Sports equipment typically has 18% GST', hsn: '9506' },
  'home': { rate: 18, note: 'Home appliances typically have 18% GST', hsn: '8516' },
  'kitchen': { rate: 18, note: 'Kitchen appliances typically have 18% GST', hsn: '8516' }
};

/**
 * Get GST rate suggestion based on category name
 * @param {string} categoryName - The category name
 * @returns {object|null} - GST suggestion object or null
 */
export const getGSTSuggestion = (categoryName) => {
  if (!categoryName) return null;
  
  const categoryLower = categoryName.toLowerCase();
  
  // Direct match first
  if (GST_CATEGORY_SUGGESTIONS[categoryLower]) {
    return GST_CATEGORY_SUGGESTIONS[categoryLower];
  }
  
  // Partial match
  for (const [key, value] of Object.entries(GST_CATEGORY_SUGGESTIONS)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }
  
  return null;
};

/**
 * Validate GST rate
 * @param {number} rate - GST rate to validate
 * @returns {object} - Validation result
 */
export const validateGSTRate = (rate) => {
  const numRate = parseFloat(rate);
  
  if (isNaN(numRate)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (numRate < 0) {
    return { valid: false, error: 'GST rate cannot be negative' };
  }
  
  if (numRate > 28) {
    return { valid: false, error: 'GST rate cannot exceed 28%' };
  }
  
  // Check decimal places
  const decimalPlaces = (numRate.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: 'GST rate can have maximum 2 decimal places' };
  }
  
  // Warning for non-standard rates
  const standardRates = [0, 3, 5, 12, 18, 28];
  if (!standardRates.includes(numRate) && numRate % 1 === 0) {
    return { 
      valid: true, 
      warning: `${numRate}% is not a standard GST rate. Common rates are 0%, 3%, 5%, 12%, 18%, 28%` 
    };
  }
  
  return { valid: true };
};

/**
 * Calculate GST amount and total price
 * @param {number} basePrice - Base price of the product
 * @param {number} gstRate - GST rate percentage
 * @param {boolean} gstInclusive - Whether price includes GST
 * @returns {object} - Calculation results
 */
export const calculateGST = (basePrice, gstRate, gstInclusive = false) => {
  const price = parseFloat(basePrice) || 0;
  const rate = parseFloat(gstRate) || 0;
  
  if (gstInclusive) {
    // Price includes GST - calculate base price and GST amount
    const gstAmount = (price * rate) / (100 + rate);
    const basePriceExGST = price - gstAmount;
    
    return {
      basePrice: basePriceExGST,
      gstAmount: gstAmount,
      totalPrice: price,
      gstRate: rate,
      gstInclusive: true
    };
  } else {
    // Price excludes GST - calculate GST amount and total price
    const gstAmount = (price * rate) / 100;
    const totalPrice = price + gstAmount;
    
    return {
      basePrice: price,
      gstAmount: gstAmount,
      totalPrice: totalPrice,
      gstRate: rate,
      gstInclusive: false
    };
  }
};

/**
 * Format GST calculation for display
 * @param {object} calculation - Result from calculateGST
 * @returns {object} - Formatted strings for display
 */
export const formatGSTCalculation = (calculation) => {
  const { basePrice, gstAmount, totalPrice, gstRate, gstInclusive } = calculation;
  
  return {
    basePrice: `₹${basePrice.toFixed(2)}`,
    gstAmount: `₹${gstAmount.toFixed(2)}`,
    totalPrice: `₹${totalPrice.toFixed(2)}`,
    gstRate: `${gstRate}%`,
    breakdown: gstInclusive 
      ? `Total: ₹${totalPrice.toFixed(2)} (incl. ₹${gstAmount.toFixed(2)} GST)`
      : `Base: ₹${basePrice.toFixed(2)} + GST: ₹${gstAmount.toFixed(2)} = Total: ₹${totalPrice.toFixed(2)}`
  };
};

/**
 * Get common GST rates for quick selection
 * @returns {array} - Array of common GST rate objects
 */
export const getCommonGSTRates = () => [
  { rate: 0, label: '0%', description: 'Exempt items' },
  { rate: 3, label: '3%', description: 'Jewelry, precious metals' },
  { rate: 5, label: '5%', description: 'Essential items, food' },
  { rate: 12, label: '12%', description: 'Standard items, textiles' },
  { rate: 18, label: '18%', description: 'Most goods & services' },
  { rate: 28, label: '28%', description: 'Luxury items, automobiles' }
];

/**
 * Check if GST rate is standard
 * @param {number} rate - GST rate to check
 * @returns {boolean} - Whether rate is standard
 */
export const isStandardGSTRate = (rate) => {
  const standardRates = [0, 3, 5, 12, 18, 28];
  return standardRates.includes(parseFloat(rate));
};

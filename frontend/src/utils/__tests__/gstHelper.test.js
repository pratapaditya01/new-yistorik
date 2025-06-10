/**
 * Test file for GST Helper utilities
 * Run with: npm test gstHelper.test.js
 */

import {
  getGSTSuggestion,
  validateGSTRate,
  calculateGST,
  formatGSTCalculation,
  getCommonGSTRates,
  isStandardGSTRate
} from '../gstHelper';

describe('GST Helper Functions', () => {
  
  describe('getGSTSuggestion', () => {
    test('should return correct suggestion for clothing', () => {
      const suggestion = getGSTSuggestion('clothing');
      expect(suggestion).toEqual({
        rate: 12,
        note: 'Textiles and clothing typically have 12% GST',
        hsn: '6203'
      });
    });

    test('should return correct suggestion for electronics', () => {
      const suggestion = getGSTSuggestion('electronics');
      expect(suggestion).toEqual({
        rate: 18,
        note: 'Electronics typically have 18% GST',
        hsn: '8517'
      });
    });

    test('should return null for unknown category', () => {
      const suggestion = getGSTSuggestion('unknown-category');
      expect(suggestion).toBeNull();
    });

    test('should handle partial matches', () => {
      const suggestion = getGSTSuggestion('mobile phones');
      expect(suggestion.rate).toBe(18);
    });
  });

  describe('validateGSTRate', () => {
    test('should validate correct GST rates', () => {
      expect(validateGSTRate(18)).toEqual({ valid: true });
      expect(validateGSTRate(0)).toEqual({ valid: true });
      expect(validateGSTRate(28)).toEqual({ valid: true });
    });

    test('should reject negative rates', () => {
      const result = validateGSTRate(-5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('GST rate cannot be negative');
    });

    test('should reject rates above 28%', () => {
      const result = validateGSTRate(30);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('GST rate cannot exceed 28%');
    });

    test('should reject invalid numbers', () => {
      const result = validateGSTRate('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid number');
    });

    test('should warn about non-standard rates', () => {
      const result = validateGSTRate(15);
      expect(result.valid).toBe(true);
      expect(result.warning).toContain('not a standard GST rate');
    });

    test('should reject more than 2 decimal places', () => {
      const result = validateGSTRate(18.123);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('GST rate can have maximum 2 decimal places');
    });
  });

  describe('calculateGST', () => {
    test('should calculate GST exclusive correctly', () => {
      const result = calculateGST(1000, 18, false);
      expect(result.basePrice).toBe(1000);
      expect(result.gstAmount).toBe(180);
      expect(result.totalPrice).toBe(1180);
      expect(result.gstInclusive).toBe(false);
    });

    test('should calculate GST inclusive correctly', () => {
      const result = calculateGST(1180, 18, true);
      expect(result.basePrice).toBeCloseTo(1000, 2);
      expect(result.gstAmount).toBeCloseTo(180, 2);
      expect(result.totalPrice).toBe(1180);
      expect(result.gstInclusive).toBe(true);
    });

    test('should handle zero GST rate', () => {
      const result = calculateGST(1000, 0, false);
      expect(result.basePrice).toBe(1000);
      expect(result.gstAmount).toBe(0);
      expect(result.totalPrice).toBe(1000);
    });

    test('should handle decimal GST rates', () => {
      const result = calculateGST(1000, 18.5, false);
      expect(result.basePrice).toBe(1000);
      expect(result.gstAmount).toBe(185);
      expect(result.totalPrice).toBe(1185);
    });
  });

  describe('formatGSTCalculation', () => {
    test('should format GST exclusive calculation', () => {
      const calculation = calculateGST(1000, 18, false);
      const formatted = formatGSTCalculation(calculation);
      
      expect(formatted.basePrice).toBe('₹1000.00');
      expect(formatted.gstAmount).toBe('₹180.00');
      expect(formatted.totalPrice).toBe('₹1180.00');
      expect(formatted.gstRate).toBe('18%');
      expect(formatted.breakdown).toContain('Base: ₹1000.00 + GST: ₹180.00 = Total: ₹1180.00');
    });

    test('should format GST inclusive calculation', () => {
      const calculation = calculateGST(1180, 18, true);
      const formatted = formatGSTCalculation(calculation);
      
      expect(formatted.totalPrice).toBe('₹1180.00');
      expect(formatted.breakdown).toContain('Total: ₹1180.00 (incl.');
    });
  });

  describe('getCommonGSTRates', () => {
    test('should return array of common GST rates', () => {
      const rates = getCommonGSTRates();
      expect(Array.isArray(rates)).toBe(true);
      expect(rates.length).toBeGreaterThan(0);
      
      const rate18 = rates.find(r => r.rate === 18);
      expect(rate18).toBeDefined();
      expect(rate18.label).toBe('18%');
      expect(rate18.description).toContain('Most goods');
    });
  });

  describe('isStandardGSTRate', () => {
    test('should identify standard rates', () => {
      expect(isStandardGSTRate(0)).toBe(true);
      expect(isStandardGSTRate(3)).toBe(true);
      expect(isStandardGSTRate(5)).toBe(true);
      expect(isStandardGSTRate(12)).toBe(true);
      expect(isStandardGSTRate(18)).toBe(true);
      expect(isStandardGSTRate(28)).toBe(true);
    });

    test('should identify non-standard rates', () => {
      expect(isStandardGSTRate(15)).toBe(false);
      expect(isStandardGSTRate(20)).toBe(false);
      expect(isStandardGSTRate(25)).toBe(false);
    });
  });
});

// Manual test examples for console testing
console.log('🧪 GST Helper Manual Tests');
console.log('==========================');

// Test 1: Category suggestions
console.log('\n1. Category Suggestions:');
console.log('Clothing:', getGSTSuggestion('clothing'));
console.log('Electronics:', getGSTSuggestion('electronics'));
console.log('Jewelry:', getGSTSuggestion('jewelry'));

// Test 2: GST calculations
console.log('\n2. GST Calculations:');
const calc1 = calculateGST(1000, 18, false);
console.log('₹1000 + 18% GST:', formatGSTCalculation(calc1));

const calc2 = calculateGST(1180, 18, true);
console.log('₹1180 (incl. 18% GST):', formatGSTCalculation(calc2));

// Test 3: Custom GST rates
console.log('\n3. Custom GST Rate Validation:');
console.log('Valid rate (18.5%):', validateGSTRate(18.5));
console.log('Invalid rate (30%):', validateGSTRate(30));
console.log('Non-standard rate (15%):', validateGSTRate(15));

// Test 4: Common rates
console.log('\n4. Common GST Rates:');
getCommonGSTRates().forEach(rate => {
  console.log(`${rate.label}: ${rate.description}`);
});

/**
 * Currency Conversion Utility
 * Handles real-time currency conversion using Exchange Rate API
 */

// Free tier API - 1500 requests/month
const EXCHANGE_RATE_API_BASE = 'https://api.exchangerate-api.com/v4/latest';

// Common currencies with their symbols and names
export const CURRENCIES = {
  'USD': { symbol: '$', name: 'US Dollar' },
  'EUR': { symbol: '€', name: 'Euro' },
  'GBP': { symbol: '£', name: 'British Pound' },
  'JPY': { symbol: '¥', name: 'Japanese Yen' },
  'AUD': { symbol: 'A$', name: 'Australian Dollar' },
  'CAD': { symbol: 'C$', name: 'Canadian Dollar' },
  'CHF': { symbol: 'Fr', name: 'Swiss Franc' },
  'CNY': { symbol: '¥', name: 'Chinese Yuan' },
  'SEK': { symbol: 'kr', name: 'Swedish Krona' },
  'NZD': { symbol: 'NZ$', name: 'New Zealand Dollar' },
  'MXN': { symbol: '$', name: 'Mexican Peso' },
  'SGD': { symbol: 'S$', name: 'Singapore Dollar' },
  'HKD': { symbol: 'HK$', name: 'Hong Kong Dollar' },
  'NOK': { symbol: 'kr', name: 'Norwegian Krone' },
  'INR': { symbol: '₹', name: 'Indian Rupee' },
  'KRW': { symbol: '₩', name: 'South Korean Won' },
  'BRL': { symbol: 'R$', name: 'Brazilian Real' },
  'ZAR': { symbol: 'R', name: 'South African Rand' },
  'THB': { symbol: '฿', name: 'Thai Baht' },
  'TRY': { symbol: '₺', name: 'Turkish Lira' }
};

// Popular travel destinations and their currencies
export const DESTINATION_CURRENCIES = {
  'Thailand': 'THB',
  'Japan': 'JPY',
  'United Kingdom': 'GBP',
  'France': 'EUR',
  'Germany': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Australia': 'AUD',
  'Canada': 'CAD',
  'Mexico': 'MXN',
  'Singapore': 'SGD',
  'Hong Kong': 'HKD',
  'South Korea': 'KRW',
  'India': 'INR',
  'Brazil': 'BRL',
  'Turkey': 'TRY',
  'Norway': 'NOK',
  'Sweden': 'SEK',
  'Switzerland': 'CHF',
  'New Zealand': 'NZD'
};

/**
 * Get exchange rates for a base currency
 * @param {string} baseCurrency - Base currency code (e.g., 'USD')
 * @returns {Promise<Object>} - Exchange rates object
 */
export async function getExchangeRates(baseCurrency = 'USD') {
  try {
    const response = await fetch(`${EXCHANGE_RATE_API_BASE}/${baseCurrency}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      base: data.base,
      date: data.date,
      rates: data.rates
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Fallback to cached rates or default rates
    return {
      success: false,
      error: error.message,
      base: baseCurrency,
      rates: getFallbackRates(baseCurrency)
    };
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object (optional)
 * @returns {Promise<Object>} - Conversion result
 */
export async function convertCurrency(amount, fromCurrency, toCurrency, rates = null) {
  try {
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        success: true,
        amount: parseFloat(amount),
        convertedAmount: parseFloat(amount),
        fromCurrency,
        toCurrency,
        rate: 1.0,
        date: new Date().toISOString().split('T')[0]
      };
    }

    // Get exchange rates if not provided
    if (!rates) {
      const ratesData = await getExchangeRates(fromCurrency);
      if (!ratesData.success) {
        throw new Error(ratesData.error);
      }
      rates = ratesData.rates;
    }

    // Convert the amount
    const rate = rates[toCurrency];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    const convertedAmount = parseFloat(amount) * rate;

    return {
      success: true,
      amount: parseFloat(amount),
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      fromCurrency,
      toCurrency,
      rate,
      date: new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    return {
      success: false,
      error: error.message,
      amount: parseFloat(amount),
      convertedAmount: parseFloat(amount), // Fallback to original amount
      fromCurrency,
      toCurrency,
      rate: 1.0
    };
  }
}

/**
 * Get currency symbol for a currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @returns {string} - Currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  return CURRENCIES[currencyCode]?.symbol || currencyCode;
}

/**
 * Get currency name for a currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @returns {string} - Currency name
 */
export function getCurrencyName(currencyCode) {
  return CURRENCIES[currencyCode]?.name || currencyCode;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @returns {string} - Formatted amount with symbol
 */
export function formatCurrency(amount, currencyCode) {
  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = parseFloat(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // For some currencies, symbol goes after the amount
  const symbolAfter = ['SEK', 'NOK', 'DKK'];
  if (symbolAfter.includes(currencyCode)) {
    return `${formattedAmount} ${symbol}`;
  }
  
  return `${symbol}${formattedAmount}`;
}

/**
 * Detect currency from destination
 * @param {string} destination - Travel destination
 * @returns {string} - Currency code
 */
export function detectCurrencyFromDestination(destination) {
  const destinationLower = destination.toLowerCase();
  
  for (const [country, currency] of Object.entries(DESTINATION_CURRENCIES)) {
    if (destinationLower.includes(country.toLowerCase())) {
      return currency;
    }
  }
  
  // Default to USD if no match found
  return 'USD';
}

/**
 * Get popular currencies list
 * @returns {Array} - Array of popular currency objects
 */
export function getPopularCurrencies() {
  const popular = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'THB'];
  return popular.map(code => ({
    code,
    symbol: getCurrencySymbol(code),
    name: getCurrencyName(code)
  }));
}

/**
 * Fallback exchange rates (approximate rates for offline use)
 * @param {string} baseCurrency - Base currency
 * @returns {Object} - Fallback rates
 */
function getFallbackRates(baseCurrency) {
  const fallbackRates = {
    'USD': {
      'EUR': 0.85, 'GBP': 0.73, 'JPY': 110, 'AUD': 1.35, 'CAD': 1.25,
      'CHF': 0.92, 'CNY': 6.45, 'SEK': 8.5, 'NZD': 1.45, 'MXN': 20,
      'SGD': 1.35, 'HKD': 7.8, 'NOK': 8.5, 'INR': 74, 'KRW': 1180,
      'BRL': 5.2, 'ZAR': 14.5, 'THB': 33, 'TRY': 8.5
    }
  };
  
  return fallbackRates[baseCurrency] || {};
}

/**
 * Calculate budget breakdown by category
 * @param {number} totalBudget - Total budget amount
 * @param {Array} categories - Travel categories with typical percentages
 * @returns {Array} - Budget breakdown by category
 */
export function calculateBudgetBreakdown(totalBudget, categories) {
  return categories.map(category => ({
    ...category,
    suggestedAmount: Math.round((totalBudget * category.typical_percentage / 100) * 100) / 100,
    percentage: category.typical_percentage
  }));
}

/**
 * Estimate daily budget
 * @param {number} totalBudget - Total budget
 * @param {string} startDate - Trip start date
 * @param {string} endDate - Trip end date
 * @returns {Object} - Daily budget information
 */
export function estimateDailyBudget(totalBudget, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end days
  
  return {
    totalDays: daysDiff,
    dailyBudget: Math.round((totalBudget / daysDiff) * 100) / 100,
    weeklyBudget: Math.round((totalBudget / daysDiff * 7) * 100) / 100
  };
}
/**
 * Subscription Detection Algorithm
 * Analyzes expense patterns to identify potential subscriptions
 */

// Common subscription keywords and patterns
const SUBSCRIPTION_KEYWORDS = [
  'netflix', 'spotify', 'apple', 'google', 'amazon prime', 'hulu', 'disney',
  'subscription', 'monthly', 'premium', 'plus', 'pro', 'unlimited',
  'gym', 'fitness', 'insurance', 'internet', 'phone', 'cable',
  'adobe', 'microsoft', 'dropbox', 'zoom', 'slack'
];

const SUBSCRIPTION_CATEGORIES_MAP = {
  'netflix': 'streaming',
  'hulu': 'streaming',
  'disney': 'streaming',
  'spotify': 'streaming',
  'apple music': 'streaming',
  'youtube': 'streaming',
  'adobe': 'software',
  'microsoft': 'software',
  'dropbox': 'software',
  'zoom': 'software',
  'slack': 'productivity',
  'gym': 'fitness',
  'fitness': 'fitness',
  'insurance': 'financial',
  'internet': 'utilities',
  'phone': 'utilities',
  'cable': 'utilities'
};

/**
 * Detect potential subscriptions from expense data
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} - Array of detected subscription patterns
 */
export function detectSubscriptions(expenses) {
  const potentialSubscriptions = [];
  
  // Group expenses by description and amount to find patterns
  const expensePatterns = {};
  
  expenses.forEach(expense => {
    const key = `${expense.description.toLowerCase()}_${expense.amount}`;
    
    if (!expensePatterns[key]) {
      expensePatterns[key] = [];
    }
    expensePatterns[key].push(expense);
  });
  
  // Analyze patterns for subscription characteristics
  Object.entries(expensePatterns).forEach(([key, expenseGroup]) => {
    if (expenseGroup.length >= 2) { // At least 2 occurrences
      const subscription = analyzeExpensePattern(expenseGroup);
      if (subscription) {
        potentialSubscriptions.push(subscription);
      }
    }
  });
  
  return potentialSubscriptions;
}

/**
 * Analyze a group of similar expenses to determine if it's a subscription
 * @param {Array} expenseGroup - Group of similar expenses
 * @returns {Object|null} - Subscription object or null
 */
function analyzeExpensePattern(expenseGroup) {
  if (expenseGroup.length < 2) return null;
  
  const firstExpense = expenseGroup[0];
  const sortedExpenses = expenseGroup.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate intervals between payments
  const intervals = [];
  for (let i = 1; i < sortedExpenses.length; i++) {
    const prevDate = new Date(sortedExpenses[i - 1].date);
    const currDate = new Date(sortedExpenses[i].date);
    const daysDiff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }
  
  // Determine if intervals are consistent (subscription pattern)
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const intervalVariance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  // If variance is low, it's likely a subscription
  if (intervalVariance < 25) { // Allow for some variation
    const frequency = determineFrequency(avgInterval);
    const category = determineCategory(firstExpense.description);
    
    if (frequency) {
      const lastExpense = sortedExpenses[sortedExpenses.length - 1];
      const nextBillingDate = calculateNextBillingDate(lastExpense.date, frequency);
      
      return {
        name: firstExpense.description,
        category,
        amount: firstExpense.amount,
        billing_frequency: frequency,
        next_billing_date: nextBillingDate,
        provider: extractProvider(firstExpense.description),
        detected_from_expenses: true,
        expense_pattern_id: firstExpense.id,
        confidence: calculateConfidence(expenseGroup, avgInterval, intervalVariance)
      };
    }
  }
  
  return null;
}

/**
 * Determine billing frequency based on average interval
 * @param {number} avgInterval - Average days between payments
 * @returns {string|null} - Frequency or null
 */
function determineFrequency(avgInterval) {
  if (avgInterval >= 6 && avgInterval <= 8) return 'weekly';
  if (avgInterval >= 13 && avgInterval <= 15) return 'bi-weekly';
  if (avgInterval >= 28 && avgInterval <= 32) return 'monthly';
  if (avgInterval >= 88 && avgInterval <= 95) return 'quarterly';
  if (avgInterval >= 360 && avgInterval <= 370) return 'yearly';
  return null;
}

/**
 * Determine subscription category based on description
 * @param {string} description - Expense description
 * @returns {string} - Category
 */
function determineCategory(description) {
  const lowerDesc = description.toLowerCase();
  
  for (const [keyword, category] of Object.entries(SUBSCRIPTION_CATEGORIES_MAP)) {
    if (lowerDesc.includes(keyword)) {
      return category;
    }
  }
  
  // Check for general subscription keywords
  if (SUBSCRIPTION_KEYWORDS.some(keyword => lowerDesc.includes(keyword))) {
    return 'other';
  }
  
  return 'other';
}

/**
 * Extract provider name from description
 * @param {string} description - Expense description
 * @returns {string} - Provider name
 */
function extractProvider(description) {
  // Simple extraction - take first word or known provider
  const words = description.split(' ');
  const firstWord = words[0];
  
  // Check for known providers
  const knownProviders = ['Netflix', 'Spotify', 'Apple', 'Google', 'Amazon', 'Adobe', 'Microsoft'];
  const foundProvider = knownProviders.find(provider => 
    description.toLowerCase().includes(provider.toLowerCase())
  );
  
  return foundProvider || firstWord;
}

/**
 * Calculate next billing date based on frequency
 * @param {string} lastDate - Last payment date
 * @param {string} frequency - Billing frequency
 * @returns {string} - Next billing date (YYYY-MM-DD)
 */
function calculateNextBillingDate(lastDate, frequency) {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1); // Default to monthly
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Calculate confidence score for detected subscription
 * @param {Array} expenseGroup - Group of expenses
 * @param {number} avgInterval - Average interval
 * @param {number} intervalVariance - Variance in intervals
 * @returns {number} - Confidence score (0-1)
 */
function calculateConfidence(expenseGroup, avgInterval, intervalVariance) {
  let confidence = 0.5; // Base confidence
  
  // More occurrences = higher confidence
  confidence += Math.min(expenseGroup.length * 0.1, 0.3);
  
  // Lower variance = higher confidence
  confidence += Math.max(0, (25 - intervalVariance) / 25 * 0.2);
  
  // Exact amounts = higher confidence
  const amounts = expenseGroup.map(e => e.amount);
  const uniqueAmounts = [...new Set(amounts)];
  if (uniqueAmounts.length === 1) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
}
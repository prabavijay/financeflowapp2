/**
 * Fee Detection Algorithm
 * Analyzes transaction descriptions to identify and categorize fees
 */

// Fee detection patterns with keywords and confidence scores
const FEE_PATTERNS = {
  // Banking Fees
  'Overdraft Fee': {
    keywords: ['overdraft', 'od fee', 'nsf', 'insufficient funds', 'returned item'],
    category_type: 'banking',
    confidence_boost: 0.9,
    amount_range: [25, 50] // Typical range
  },
  'ATM Fee': {
    keywords: ['atm fee', 'atm withdrawal', 'foreign atm', 'out of network', 'atm surcharge'],
    category_type: 'banking',
    confidence_boost: 0.8,
    amount_range: [2, 6]
  },
  'Monthly Maintenance': {
    keywords: ['monthly fee', 'maintenance fee', 'service charge', 'account fee', 'monthly service'],
    category_type: 'banking',
    confidence_boost: 0.7,
    amount_range: [5, 25]
  },
  'Wire Transfer Fee': {
    keywords: ['wire fee', 'wire transfer', 'outgoing wire', 'incoming wire', 'international wire'],
    category_type: 'banking',
    confidence_boost: 0.9,
    amount_range: [15, 50]
  },
  'NSF Fee': {
    keywords: ['nsf', 'non-sufficient funds', 'insufficient funds', 'returned check'],
    category_type: 'banking',
    confidence_boost: 0.9,
    amount_range: [25, 40]
  },
  'Foreign Transaction': {
    keywords: ['foreign transaction', 'international fee', 'currency conversion', 'fx fee'],
    category_type: 'banking',
    confidence_boost: 0.8,
    amount_range: [1, 10]
  },

  // Investment Fees
  'Management Fee': {
    keywords: ['management fee', 'advisory fee', 'portfolio fee', 'account management'],
    category_type: 'investment',
    confidence_boost: 0.8,
    amount_range: [10, 500]
  },
  'Trading Commission': {
    keywords: ['commission', 'trade fee', 'transaction fee', 'brokerage fee', 'trading fee'],
    category_type: 'investment',
    confidence_boost: 0.8,
    amount_range: [0, 20]
  },
  'Expense Ratio': {
    keywords: ['expense ratio', 'fund fee', 'etf fee', 'mutual fund fee'],
    category_type: 'investment',
    confidence_boost: 0.7,
    amount_range: [5, 100]
  },
  'Advisory Fee': {
    keywords: ['advisor fee', 'consultation fee', 'financial planning', 'advisory service'],
    category_type: 'investment',
    confidence_boost: 0.8,
    amount_range: [50, 1000]
  },
  'Account Fee': {
    keywords: ['account fee', 'custody fee', 'platform fee', 'brokerage account'],
    category_type: 'investment',
    confidence_boost: 0.7,
    amount_range: [25, 100]
  },

  // Credit Card Fees
  'Annual Fee': {
    keywords: ['annual fee', 'membership fee', 'yearly fee', 'card fee'],
    category_type: 'credit_card',
    confidence_boost: 0.9,
    amount_range: [50, 500]
  },
  'Late Payment Fee': {
    keywords: ['late fee', 'late payment', 'past due fee', 'penalty fee'],
    category_type: 'credit_card',
    confidence_boost: 0.9,
    amount_range: [25, 40]
  },
  'Cash Advance Fee': {
    keywords: ['cash advance', 'atm advance', 'cash fee', 'advance fee'],
    category_type: 'credit_card',
    confidence_boost: 0.9,
    amount_range: [5, 25]
  },
  'Balance Transfer Fee': {
    keywords: ['balance transfer', 'bt fee', 'transfer fee'],
    category_type: 'credit_card',
    confidence_boost: 0.9,
    amount_range: [10, 100]
  },
  'Over Limit Fee': {
    keywords: ['over limit', 'overlimit', 'credit limit', 'exceed limit'],
    category_type: 'credit_card',
    confidence_boost: 0.9,
    amount_range: [25, 40]
  },

  // Other Fees
  'Service Fee': {
    keywords: ['service fee', 'processing fee', 'handling fee', 'convenience fee'],
    category_type: 'other',
    confidence_boost: 0.6,
    amount_range: [1, 50]
  },
  'Processing Fee': {
    keywords: ['processing fee', 'transaction fee', 'payment fee', 'handling charge'],
    category_type: 'other',
    confidence_boost: 0.6,
    amount_range: [1, 25]
  }
};

// Institution patterns to help identify fee sources
const INSTITUTION_PATTERNS = {
  banks: ['bank', 'credit union', 'cu', 'savings', 'checking', 'wells fargo', 'chase', 'bofa', 'citi', 'td bank'],
  brokerages: ['fidelity', 'schwab', 'etrade', 'robinhood', 'ameritrade', 'vanguard', 'merrill'],
  credit_cards: ['visa', 'mastercard', 'amex', 'discover', 'capital one', 'citi card']
};

/**
 * Detect fees from expense/transaction data
 * @param {Array} transactions - Array of transaction objects
 * @param {Array} existingFees - Array of already tracked fees to avoid duplicates
 * @returns {Array} - Array of detected fee objects
 */
export function detectFees(transactions, existingFees = []) {
  const detectedFees = [];
  
  // Create a set of existing fee transaction IDs for quick lookup
  const existingFeeExpenseIds = new Set(
    existingFees.map(fee => fee.expense_id).filter(Boolean)
  );
  
  transactions.forEach(transaction => {
    // Skip if this transaction already has a tracked fee
    if (existingFeeExpenseIds.has(transaction.id)) {
      return;
    }
    
    const detectedFee = analyzeFeeTransaction(transaction);
    if (detectedFee) {
      detectedFees.push(detectedFee);
    }
  });
  
  return detectedFees.sort((a, b) => b.detection_confidence - a.detection_confidence);
}

/**
 * Analyze a single transaction to determine if it's a fee
 * @param {Object} transaction - Transaction object
 * @returns {Object|null} - Detected fee object or null
 */
function analyzeFeeTransaction(transaction) {
  const description = transaction.description.toLowerCase();
  const amount = parseFloat(transaction.amount);
  
  let bestMatch = null;
  let bestConfidence = 0;
  
  // Check each fee pattern
  Object.entries(FEE_PATTERNS).forEach(([feeName, pattern]) => {
    const confidence = calculateFeeConfidence(description, amount, pattern);
    
    if (confidence > 0.5 && confidence > bestConfidence) {
      bestMatch = {
        fee_name: feeName,
        pattern: pattern,
        confidence: confidence
      };
      bestConfidence = confidence;
    }
  });
  
  if (bestMatch) {
    const institution = extractInstitution(description);
    const accountType = inferAccountType(description, bestMatch.pattern.category_type);
    
    return {
      expense_id: transaction.id,
      fee_category_name: bestMatch.fee_name,
      category_type: bestMatch.pattern.category_type,
      amount: amount,
      description: transaction.description,
      institution_name: institution,
      account_type: accountType,
      date: transaction.date,
      detected_automatically: true,
      detection_confidence: Math.round(bestMatch.confidence * 100) / 100,
      user_id: transaction.user_id,
      owner: transaction.owner || 'Personal'
    };
  }
  
  return null;
}

/**
 * Calculate confidence score for fee detection
 * @param {string} description - Transaction description (lowercase)
 * @param {number} amount - Transaction amount
 * @param {Object} pattern - Fee pattern object
 * @returns {number} - Confidence score (0-1)
 */
function calculateFeeConfidence(description, amount, pattern) {
  let confidence = 0;
  
  // Check keyword matches
  const keywordMatches = pattern.keywords.filter(keyword => 
    description.includes(keyword.toLowerCase())
  );
  
  if (keywordMatches.length === 0) {
    return 0; // No keyword match, definitely not this fee
  }
  
  // Base confidence from keyword matches
  confidence += (keywordMatches.length / pattern.keywords.length) * 0.6;
  
  // Boost for exact keyword matches
  const exactMatches = keywordMatches.filter(keyword => 
    description.includes(keyword.toLowerCase())
  );
  confidence += (exactMatches.length * 0.1);
  
  // Amount range validation
  if (pattern.amount_range) {
    const [minAmount, maxAmount] = pattern.amount_range;
    if (amount >= minAmount && amount <= maxAmount) {
      confidence += 0.2;
    } else if (amount > maxAmount && amount <= maxAmount * 2) {
      confidence += 0.1; // Slightly higher than expected, but possible
    } else if (amount < minAmount || amount > maxAmount * 3) {
      confidence -= 0.2; // Amount seems wrong for this fee type
    }
  }
  
  // Additional confidence boost from pattern
  confidence += pattern.confidence_boost * 0.1;
  
  // Check for negative indicators (things that suggest it's NOT a fee)
  const negativeIndicators = ['refund', 'credit', 'reversal', 'adjustment', 'cashback'];
  const hasNegativeIndicator = negativeIndicators.some(indicator => 
    description.includes(indicator)
  );
  
  if (hasNegativeIndicator) {
    confidence -= 0.3;
  }
  
  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Extract institution name from transaction description
 * @param {string} description - Transaction description
 * @returns {string|null} - Institution name or null
 */
function extractInstitution(description) {
  const desc = description.toLowerCase();
  
  // Check for known institution patterns
  for (const [type, institutions] of Object.entries(INSTITUTION_PATTERNS)) {
    for (const institution of institutions) {
      if (desc.includes(institution)) {
        return institution.replace(/\b\w/g, l => l.toUpperCase()); // Title case
      }
    }
  }
  
  // Try to extract first word that might be an institution
  const words = description.split(' ');
  const firstWord = words[0];
  
  // If first word looks like an institution (contains no numbers, reasonable length)
  if (firstWord && firstWord.length > 2 && firstWord.length < 20 && !/\d/.test(firstWord)) {
    return firstWord;
  }
  
  return null;
}

/**
 * Infer account type from description and fee category
 * @param {string} description - Transaction description
 * @param {string} categoryType - Fee category type
 * @returns {string} - Account type
 */
function inferAccountType(description, categoryType) {
  const desc = description.toLowerCase();
  
  // Specific account type indicators
  if (desc.includes('checking') || desc.includes('chk')) return 'checking';
  if (desc.includes('savings') || desc.includes('sav')) return 'savings';
  if (desc.includes('credit card') || desc.includes('visa') || desc.includes('mastercard')) return 'credit_card';
  if (desc.includes('investment') || desc.includes('brokerage')) return 'investment';
  if (desc.includes('mortgage') || desc.includes('loan')) return 'loan';
  
  // Default based on category type
  switch (categoryType) {
    case 'banking':
      return 'checking'; // Most common banking account
    case 'investment':
      return 'investment';
    case 'credit_card':
      return 'credit_card';
    default:
      return 'unknown';
  }
}

/**
 * Get fee statistics and insights
 * @param {Array} fees - Array of tracked fees
 * @param {string} timeRange - Time range ('month', 'quarter', 'year')
 * @returns {Object} - Fee statistics and insights
 */
export function getFeeAnalytics(fees, timeRange = 'month') {
  const now = new Date();
  const cutoffDate = new Date();
  
  switch (timeRange) {
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  const recentFees = fees.filter(fee => new Date(fee.date) >= cutoffDate);
  
  // Calculate totals by category
  const categoryTotals = recentFees.reduce((acc, fee) => {
    const categoryType = fee.category_type || 'other';
    acc[categoryType] = (acc[categoryType] || 0) + parseFloat(fee.amount);
    return acc;
  }, {});
  
  // Calculate totals by institution
  const institutionTotals = recentFees.reduce((acc, fee) => {
    const institution = fee.institution_name || 'Unknown';
    acc[institution] = (acc[institution] || 0) + parseFloat(fee.amount);
    return acc;
  }, {});
  
  // Find most expensive fees
  const topFees = recentFees
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 5);
  
  // Calculate trends
  const totalAmount = recentFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
  const averageFee = recentFees.length > 0 ? totalAmount / recentFees.length : 0;
  
  return {
    timeRange,
    totalFees: recentFees.length,
    totalAmount,
    averageFee: Math.round(averageFee * 100) / 100,
    categoryBreakdown: categoryTotals,
    institutionBreakdown: institutionTotals,
    topFees,
    avoidableFees: recentFees.filter(fee => 
      ['Overdraft Fee', 'Late Payment Fee', 'NSF Fee', 'Over Limit Fee'].includes(fee.fee_category_name)
    ),
    recurringFees: recentFees.filter(fee => 
      ['Monthly Maintenance', 'Annual Fee', 'Management Fee'].includes(fee.fee_category_name)
    )
  };
}

/**
 * Generate fee reduction recommendations
 * @param {Array} fees - Array of tracked fees
 * @param {Object} analytics - Fee analytics object
 * @returns {Array} - Array of recommendation objects
 */
export function getFeeRecommendations(fees, analytics) {
  const recommendations = [];
  
  // Check for avoidable fees
  if (analytics.avoidableFees.length > 0) {
    const avoidableAmount = analytics.avoidableFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    recommendations.push({
      type: 'avoid_fees',
      priority: 'high',
      title: 'Avoid Preventable Fees',
      description: `You paid $${avoidableAmount.toFixed(2)} in avoidable fees like overdrafts and late payments.`,
      action: 'Set up account alerts and automatic payments to prevent these fees.',
      potential_savings: avoidableAmount * 12 // Annualized
    });
  }
  
  // Check for high ATM fees
  const atmFees = fees.filter(fee => fee.fee_category_name === 'ATM Fee');
  if (atmFees.length > 3) {
    const atmAmount = atmFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    recommendations.push({
      type: 'atm_optimization',
      priority: 'medium',
      title: 'Reduce ATM Fees',
      description: `You paid $${atmAmount.toFixed(2)} in ATM fees from ${atmFees.length} transactions.`,
      action: 'Use your bank\'s ATM network or find a bank with ATM fee reimbursement.',
      potential_savings: atmAmount * 4 // Quarterly estimate
    });
  }
  
  // Check for monthly maintenance fees
  const maintenanceFees = fees.filter(fee => fee.fee_category_name === 'Monthly Maintenance');
  if (maintenanceFees.length > 0) {
    const maintenanceAmount = maintenanceFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    recommendations.push({
      type: 'account_optimization',
      priority: 'medium',
      title: 'Eliminate Monthly Maintenance Fees',
      description: `You pay $${maintenanceAmount.toFixed(2)} in monthly maintenance fees.`,
      action: 'Maintain minimum balance requirements or switch to a no-fee account.',
      potential_savings: maintenanceAmount * 12
    });
  }
  
  // Check for high investment fees
  const investmentFees = fees.filter(fee => fee.category_type === 'investment');
  if (investmentFees.length > 0) {
    const investmentAmount = investmentFees.reduce((sum, fee) => sum + parseFloat(fee.amount), 0);
    recommendations.push({
      type: 'investment_optimization',
      priority: 'low',
      title: 'Review Investment Fees',
      description: `You paid $${investmentAmount.toFixed(2)} in investment-related fees.`,
      action: 'Consider low-cost index funds and fee-free brokerages.',
      potential_savings: investmentAmount * 0.5 // Conservative estimate
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}
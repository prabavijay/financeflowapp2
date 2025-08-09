/**
 * Loan Calculation Engine
 * Handles loan payment calculations, amortization schedules, and comparisons
 */

/**
 * Calculate monthly payment using the standard loan payment formula
 * PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param {number} termMonths - Loan term in months
 * @returns {number} - Monthly payment amount
 */
export function calculateMonthlyPayment(principal, annualRate, termMonths) {
  if (annualRate === 0) {
    return principal / termMonths; // No interest case
  }
  
  const monthlyRate = annualRate / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  return numerator / denominator;
}

/**
 * Calculate total interest paid over the life of the loan
 * @param {number} monthlyPayment - Monthly payment amount
 * @param {number} termMonths - Loan term in months
 * @param {number} principal - Original loan amount
 * @returns {number} - Total interest paid
 */
export function calculateTotalInterest(monthlyPayment, termMonths, principal) {
  return (monthlyPayment * termMonths) - principal;
}

/**
 * Calculate APR including fees and costs
 * @param {number} principal - Loan amount
 * @param {number} monthlyPayment - Monthly payment
 * @param {number} termMonths - Loan term in months
 * @param {number} totalFees - Total upfront fees and costs
 * @returns {number} - APR as decimal (e.g., 0.055 for 5.5%)
 */
export function calculateAPR(principal, monthlyPayment, termMonths, totalFees = 0) {
  const effectivePrincipal = principal - totalFees;
  const totalPaid = monthlyPayment * termMonths;
  const totalInterestAndFees = totalPaid - effectivePrincipal;
  
  // Simple APR calculation - for precise APR, would need iterative method
  const annualInterestAndFees = totalInterestAndFees / (termMonths / 12);
  return annualInterestAndFees / effectivePrincipal;
}

/**
 * Generate amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @param {number} termMonths - Loan term in months
 * @param {number} monthlyPayment - Monthly payment amount
 * @returns {Array} - Array of payment objects
 */
export function generateAmortizationSchedule(principal, annualRate, termMonths, monthlyPayment) {
  const schedule = [];
  const monthlyRate = annualRate / 12;
  let remainingBalance = principal;
  
  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    
    schedule.push({
      paymentNumber: month,
      paymentAmount: monthlyPayment,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      cumulativePrincipal: principal - remainingBalance,
      cumulativeInterest: schedule.reduce((sum, p) => sum + p.interestPayment, 0) + interestPayment
    });
  }
  
  return schedule;
}

/**
 * Calculate loan affordability based on debt-to-income ratio
 * @param {number} monthlyIncome - Gross monthly income
 * @param {number} monthlyDebts - Existing monthly debt payments
 * @param {number} maxDTIRatio - Maximum debt-to-income ratio (default 0.43)
 * @returns {Object} - Affordability analysis
 */
export function calculateAffordability(monthlyIncome, monthlyDebts, maxDTIRatio = 0.43) {
  const maxTotalMonthlyDebt = monthlyIncome * maxDTIRatio;
  const availableForNewLoan = maxTotalMonthlyDebt - monthlyDebts;
  const currentDTI = monthlyDebts / monthlyIncome;
  
  return {
    maxAffordablePayment: Math.max(0, availableForNewLoan),
    currentDTI: Math.round(currentDTI * 10000) / 100, // Percentage with 2 decimals
    maxDTI: Math.round(maxDTIRatio * 100),
    remainingDTICapacity: Math.max(0, maxDTIRatio - currentDTI),
    canAffordNewLoan: availableForNewLoan > 0,
    recommendedMaxPayment: Math.max(0, availableForNewLoan * 0.9) // 90% of max for safety
  };
}

/**
 * Compare multiple loan products
 * @param {Array} loanProducts - Array of loan product objects
 * @param {Object} loanParams - Loan parameters (amount, term, etc.)
 * @returns {Array} - Array of loan comparisons with calculations
 */
export function compareLoanProducts(loanProducts, loanParams) {
  const { loanAmount, termMonths, downPayment = 0, creditScore } = loanParams;
  const financedAmount = loanAmount - downPayment;
  
  return loanProducts
    .filter(product => {
      // Filter by eligibility criteria
      const meetsAmount = loanAmount >= product.minimum_amount && loanAmount <= product.maximum_amount;
      const meetsCreditScore = !product.credit_score_min || creditScore >= product.credit_score_min;
      const isActive = product.status === 'active';
      
      return meetsAmount && meetsCreditScore && isActive;
    })
    .map(product => {
      // Calculate loan details for each product
      const rate = product.interest_rate / 100; // Convert percentage to decimal
      const monthlyPayment = calculateMonthlyPayment(financedAmount, rate, termMonths);
      const totalInterest = calculateTotalInterest(monthlyPayment, termMonths, financedAmount);
      const totalPayments = monthlyPayment * termMonths;
      
      // Calculate fees
      const originationFee = financedAmount * (product.origination_fee / 100);
      const closingCosts = product.closing_costs || 0;
      const points = product.points ? (financedAmount * (product.points / 100)) : 0;
      const totalUpfrontCosts = originationFee + closingCosts + points + downPayment;
      
      // Calculate APR
      const totalFees = originationFee + closingCosts + points;
      const apr = calculateAPR(financedAmount, monthlyPayment, termMonths, totalFees);
      
      return {
        ...product,
        calculations: {
          loanAmount: financedAmount,
          monthlyPayment: Math.round(monthlyPayment * 100) / 100,
          totalInterest: Math.round(totalInterest * 100) / 100,
          totalPayments: Math.round(totalPayments * 100) / 100,
          effectiveAPR: Math.round(apr * 10000) / 100, // Percentage with 2 decimals
          fees: {
            originationFee: Math.round(originationFee * 100) / 100,
            closingCosts: closingCosts,
            points: Math.round(points * 100) / 100,
            totalUpfrontCosts: Math.round(totalUpfrontCosts * 100) / 100
          },
          termYears: Math.round(termMonths / 12 * 10) / 10,
          interestRate: product.interest_rate,
          savings: 0 // Will be calculated relative to highest cost option
        }
      };
    })
    .sort((a, b) => a.calculations.totalPayments - b.calculations.totalPayments) // Sort by total cost
    .map((product, index, sortedArray) => {
      // Calculate savings compared to most expensive option
      const mostExpensive = sortedArray[sortedArray.length - 1];
      product.calculations.savings = mostExpensive.calculations.totalPayments - product.calculations.totalPayments;
      product.calculations.rank = index + 1;
      return product;
    });
}

/**
 * Calculate refinancing analysis
 * @param {Object} currentLoan - Current loan details
 * @param {Object} newLoan - New loan offer
 * @returns {Object} - Refinancing analysis
 */
export function calculateRefinancingAnalysis(currentLoan, newLoan) {
  const { remainingBalance, currentRate, remainingTermMonths, currentPayment } = currentLoan;
  const { newRate, newTermMonths, closingCosts = 0 } = newLoan;
  
  // Calculate new payment
  const newPayment = calculateMonthlyPayment(remainingBalance, newRate, newTermMonths);
  
  // Calculate remaining interest on current loan
  const remainingInterestCurrent = (currentPayment * remainingTermMonths) - remainingBalance;
  
  // Calculate total interest on new loan
  const totalInterestNew = calculateTotalInterest(newPayment, newTermMonths, remainingBalance);
  
  // Calculate total costs
  const totalCostCurrent = remainingInterestCurrent + remainingBalance;
  const totalCostNew = totalInterestNew + remainingBalance + closingCosts;
  
  // Calculate break-even point
  const monthlySavings = currentPayment - newPayment;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : Infinity;
  
  return {
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    totalSavings: Math.round((totalCostCurrent - totalCostNew) * 100) / 100,
    newPayment: Math.round(newPayment * 100) / 100,
    paymentDifference: Math.round((newPayment - currentPayment) * 100) / 100,
    breakEvenMonths,
    breakEvenYears: Math.round(breakEvenMonths / 12 * 10) / 10,
    worthRefinancing: totalCostNew < totalCostCurrent && breakEvenMonths <= remainingTermMonths,
    closingCosts,
    newTermYears: Math.round(newTermMonths / 12 * 10) / 10,
    interestSavings: Math.round((remainingInterestCurrent - totalInterestNew) * 100) / 100
  };
}

/**
 * Calculate payment scenarios (bi-weekly, extra payments, etc.)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @param {number} termMonths - Original loan term in months
 * @param {Object} scenarios - Payment scenario options
 * @returns {Object} - Scenario comparisons
 */
export function calculatePaymentScenarios(principal, annualRate, termMonths, scenarios = {}) {
  const standardPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const standardTotalInterest = calculateTotalInterest(standardPayment, termMonths, principal);
  
  const results = {
    standard: {
      paymentAmount: Math.round(standardPayment * 100) / 100,
      totalInterest: Math.round(standardTotalInterest * 100) / 100,
      totalPayments: Math.round((standardPayment * termMonths) * 100) / 100,
      termMonths: termMonths,
      termYears: Math.round(termMonths / 12 * 10) / 10
    }
  };
  
  // Bi-weekly payments scenario
  if (scenarios.biweekly) {
    const biweeklyPayment = standardPayment / 2;
    const biweeklySchedule = generateBiweeklySchedule(principal, annualRate, biweeklyPayment);
    const biweeklyTermMonths = biweeklySchedule.length / 2; // Approximate
    const biweeklyTotalInterest = biweeklySchedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
    
    results.biweekly = {
      paymentAmount: Math.round(biweeklyPayment * 100) / 100,
      totalInterest: Math.round(biweeklyTotalInterest * 100) / 100,
      totalPayments: Math.round((biweeklyPayment * biweeklySchedule.length) * 100) / 100,
      termMonths: biweeklyTermMonths,
      termYears: Math.round(biweeklyTermMonths / 12 * 10) / 10,
      interestSavings: Math.round((standardTotalInterest - biweeklyTotalInterest) * 100) / 100,
      timeSavings: termMonths - biweeklyTermMonths
    };
  }
  
  // Extra payment scenario
  if (scenarios.extraPayment) {
    const extraAmount = scenarios.extraPayment;
    const newPayment = standardPayment + extraAmount;
    const extraSchedule = generateAmortizationSchedule(principal, annualRate, termMonths, newPayment);
    
    // Find when loan is paid off
    const payoffMonth = extraSchedule.findIndex(payment => payment.remainingBalance <= 0) + 1;
    const actualTermMonths = payoffMonth || termMonths;
    const extraTotalInterest = extraSchedule.slice(0, actualTermMonths).reduce((sum, payment) => sum + payment.interestPayment, 0);
    
    results.extraPayment = {
      paymentAmount: Math.round(newPayment * 100) / 100,
      extraAmount: extraAmount,
      totalInterest: Math.round(extraTotalInterest * 100) / 100,
      totalPayments: Math.round((newPayment * actualTermMonths) * 100) / 100,
      termMonths: actualTermMonths,
      termYears: Math.round(actualTermMonths / 12 * 10) / 10,
      interestSavings: Math.round((standardTotalInterest - extraTotalInterest) * 100) / 100,
      timeSavings: termMonths - actualTermMonths
    };
  }
  
  return results;
}

/**
 * Generate bi-weekly payment schedule (simplified)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @param {number} biweeklyPayment - Bi-weekly payment amount
 * @returns {Array} - Bi-weekly payment schedule
 */
function generateBiweeklySchedule(principal, annualRate, biweeklyPayment) {
  const schedule = [];
  const biweeklyRate = annualRate / 26; // 26 bi-weekly periods per year
  let remainingBalance = principal;
  let paymentNumber = 1;
  
  while (remainingBalance > 0 && paymentNumber <= 1000) { // Safety limit
    const interestPayment = remainingBalance * biweeklyRate;
    const principalPayment = Math.min(biweeklyPayment - interestPayment, remainingBalance);
    remainingBalance -= principalPayment;
    
    schedule.push({
      paymentNumber,
      paymentAmount: principalPayment + interestPayment,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.round(Math.max(0, remainingBalance) * 100) / 100
    });
    
    paymentNumber++;
  }
  
  return schedule;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format percentage for display
 * @param {number} rate - Rate as decimal (e.g., 0.055)
 * @param {number} decimals - Number of decimal places (default: 3)
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(rate, decimals = 3) {
  return `${(rate * 100).toFixed(decimals)}%`;
}

/**
 * Calculate loan qualification estimate
 * @param {Object} borrowerInfo - Borrower information
 * @param {string} loanType - Type of loan
 * @returns {Object} - Qualification estimate
 */
export function calculateLoanQualification(borrowerInfo, loanType) {
  const { creditScore, annualIncome, monthlyDebts, downPayment = 0, employmentLength = 0 } = borrowerInfo;
  
  // Base qualification criteria by loan type
  const criteria = {
    mortgage: { minCredit: 580, maxDTI: 0.43, minDown: 0.03, minEmployment: 24 },
    auto: { minCredit: 500, maxDTI: 0.40, minDown: 0.00, minEmployment: 6 },
    personal: { minCredit: 600, maxDTI: 0.36, minDown: 0.00, minEmployment: 12 },
    student: { minCredit: 0, maxDTI: 0.50, minDown: 0.00, minEmployment: 0 },
    home_equity: { minCredit: 620, maxDTI: 0.43, minDown: 0.00, minEmployment: 24 },
    business: { minCredit: 650, maxDTI: 0.40, minDown: 0.10, minEmployment: 24 }
  };
  
  const loanCriteria = criteria[loanType] || criteria.personal;
  const monthlyIncome = annualIncome / 12;
  const currentDTI = monthlyDebts / monthlyIncome;
  
  // Calculate qualification score (0-100)
  let qualificationScore = 0;
  const factors = [];
  
  // Credit score factor (40% weight)
  if (creditScore >= loanCriteria.minCredit + 100) {
    qualificationScore += 40;
    factors.push({ factor: 'Credit Score', status: 'excellent', impact: 40 });
  } else if (creditScore >= loanCriteria.minCredit + 50) {
    qualificationScore += 30;
    factors.push({ factor: 'Credit Score', status: 'good', impact: 30 });
  } else if (creditScore >= loanCriteria.minCredit) {
    qualificationScore += 20;
    factors.push({ factor: 'Credit Score', status: 'fair', impact: 20 });
  } else {
    factors.push({ factor: 'Credit Score', status: 'poor', impact: -20 });
  }
  
  // DTI factor (30% weight)
  if (currentDTI <= loanCriteria.maxDTI - 0.10) {
    qualificationScore += 30;
    factors.push({ factor: 'Debt-to-Income', status: 'excellent', impact: 30 });
  } else if (currentDTI <= loanCriteria.maxDTI) {
    qualificationScore += 20;
    factors.push({ factor: 'Debt-to-Income', status: 'acceptable', impact: 20 });
  } else {
    factors.push({ factor: 'Debt-to-Income', status: 'too_high', impact: -30 });
  }
  
  // Employment factor (20% weight)
  if (employmentLength >= loanCriteria.minEmployment + 12) {
    qualificationScore += 20;
    factors.push({ factor: 'Employment History', status: 'excellent', impact: 20 });
  } else if (employmentLength >= loanCriteria.minEmployment) {
    qualificationScore += 15;
    factors.push({ factor: 'Employment History', status: 'good', impact: 15 });
  } else {
    factors.push({ factor: 'Employment History', status: 'insufficient', impact: -15 });
  }
  
  // Down payment factor (10% weight) - for applicable loan types
  if (loanType === 'mortgage' || loanType === 'auto') {
    const loanAmount = 300000; // Assumed for calculation
    const downPaymentPercent = downPayment / loanAmount;
    
    if (downPaymentPercent >= loanCriteria.minDown + 0.10) {
      qualificationScore += 10;
      factors.push({ factor: 'Down Payment', status: 'excellent', impact: 10 });
    } else if (downPaymentPercent >= loanCriteria.minDown) {
      qualificationScore += 5;
      factors.push({ factor: 'Down Payment', status: 'adequate', impact: 5 });
    } else {
      factors.push({ factor: 'Down Payment', status: 'insufficient', impact: -10 });
    }
  }
  
  // Determine qualification level
  let qualificationLevel = 'poor';
  let estimatedRate = 0.12; // Default high rate
  
  if (qualificationScore >= 80) {
    qualificationLevel = 'excellent';
    estimatedRate = 0.035; // 3.5%
  } else if (qualificationScore >= 60) {
    qualificationLevel = 'good';
    estimatedRate = 0.055; // 5.5%
  } else if (qualificationScore >= 40) {
    qualificationLevel = 'fair';
    estimatedRate = 0.075; // 7.5%
  } else if (qualificationScore >= 20) {
    qualificationLevel = 'poor';
    estimatedRate = 0.095; // 9.5%
  }
  
  return {
    qualificationScore: Math.max(0, qualificationScore),
    qualificationLevel,
    estimatedRate,
    factors,
    recommendations: generateQualificationRecommendations(factors, loanCriteria),
    meetsCriteria: {
      creditScore: creditScore >= loanCriteria.minCredit,
      debtToIncome: currentDTI <= loanCriteria.maxDTI,
      employment: employmentLength >= loanCriteria.minEmployment,
      downPayment: loanType === 'personal' || downPayment >= (300000 * loanCriteria.minDown)
    }
  };
}

/**
 * Generate qualification improvement recommendations
 * @param {Array} factors - Qualification factors
 * @param {Object} criteria - Loan criteria
 * @returns {Array} - Array of recommendations
 */
function generateQualificationRecommendations(factors, criteria) {
  const recommendations = [];
  
  factors.forEach(factor => {
    if (factor.impact < 0) {
      switch (factor.factor) {
        case 'Credit Score':
          recommendations.push({
            category: 'Credit',
            priority: 'high',
            recommendation: 'Improve credit score by paying down existing debt and ensuring all payments are on time.',
            timeframe: '3-6 months'
          });
          break;
        case 'Debt-to-Income':
          recommendations.push({
            category: 'Debt',
            priority: 'high',
            recommendation: 'Reduce monthly debt payments or increase income to improve debt-to-income ratio.',
            timeframe: '1-3 months'
          });
          break;
        case 'Employment History':
          recommendations.push({
            category: 'Employment',
            priority: 'medium',
            recommendation: `Maintain current employment for at least ${criteria.minEmployment} months before applying.`,
            timeframe: `${criteria.minEmployment} months`
          });
          break;
        case 'Down Payment':
          recommendations.push({
            category: 'Savings',
            priority: 'medium',
            recommendation: `Save for a larger down payment (minimum ${criteria.minDown * 100}% recommended).`,
            timeframe: '6-12 months'
          });
          break;
      }
    }
  });
  
  return recommendations;
}
/**
 * Email Receipt Parser Utility
 * Automatically detects and extracts receipt data from email content
 */

// Common receipt sender patterns
const RECEIPT_SENDER_PATTERNS = [
  // E-commerce
  /.*@amazon\.(com|co\.uk|ca|de|fr|it|es|in|jp|au)/i,
  /.*@ebay\.(com|co\.uk|ca|de|fr|it|es|in|jp|au)/i,
  /.*@etsy\.com/i,
  /.*@shopify\.com/i,
  /.*@walmart\.com/i,
  /.*@target\.com/i,
  /.*@bestbuy\.com/i,
  /.*@homedepot\.com/i,
  /.*@lowes\.com/i,
  /.*@costco\.com/i,
  
  // Food delivery
  /.*@doordash\.com/i,
  /.*@ubereats\.com/i,
  /.*@grubhub\.com/i,
  /.*@postmates\.com/i,
  /.*@seamless\.com/i,
  /.*@deliveroo\.(com|co\.uk)/i,
  /.*@foodpanda\.com/i,
  
  // Transportation
  /.*@uber\.com/i,
  /.*@lyft\.com/i,
  /.*@delta\.com/i,
  /.*@united\.com/i,
  /.*@southwest\.com/i,
  /.*@american\.com/i,
  /.*@expedia\.com/i,
  /.*@booking\.com/i,
  /.*@airbnb\.com/i,
  
  // Subscription services
  /.*@netflix\.com/i,
  /.*@spotify\.com/i,
  /.*@adobe\.com/i,
  /.*@microsoft\.com/i,
  /.*@apple\.com/i,
  /.*@google\.com/i,
  /.*@dropbox\.com/i,
  
  // Utilities and services
  /.*@paypal\.com/i,
  /.*@venmo\.com/i,
  /.*@square\.com/i,
  /.*@stripe\.com/i,
  
  // Generic patterns
  /.*receipts?@/i,
  /.*orders?@/i,
  /.*billing@/i,
  /.*noreply@/i,
  /.*no-reply@/i
];

// Common receipt subject patterns
const RECEIPT_SUBJECT_PATTERNS = [
  // Direct receipt mentions
  /receipt/i,
  /invoice/i,
  /bill/i,
  /statement/i,
  /payment/i,
  /purchase/i,
  /order/i,
  /transaction/i,
  
  // Confirmation patterns
  /confirmation/i,
  /confirmed/i,
  /complete/i,
  /processed/i,
  /approved/i,
  
  // Thank you patterns
  /thank\s+you\s+for\s+your/i,
  /thanks\s+for\s+your/i,
  
  // Order-specific patterns
  /your\s+order/i,
  /order\s+#/i,
  /order\s+number/i,
  /booking\s+confirmation/i,
  
  // Payment patterns
  /payment\s+received/i,
  /payment\s+confirmation/i,
  /charge\s+confirmation/i
];

// Patterns for extracting data from email content
const EMAIL_EXTRACTION_PATTERNS = {
  // Total amount patterns
  total: [
    /total[:\s]*\$?(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i,
    /amount[:\s]*\$?(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i,
    /charged[:\s]*\$?(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i,
    /paid[:\s]*\$?(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i,
    /billed[:\s]*\$?(\d{1,3}(?:,?\d{3})*\.?\d{0,2})/i,
    /\$(\d{1,3}(?:,?\d{3})*\.?\d{0,2})\s*(?:total|charged|paid|billed)/i
  ],
  
  // Order/Transaction ID patterns
  orderId: [
    /order\s*#?[:\s]*([A-Z0-9\-]+)/i,
    /transaction\s*#?[:\s]*([A-Z0-9\-]+)/i,
    /invoice\s*#?[:\s]*([A-Z0-9\-]+)/i,
    /reference\s*#?[:\s]*([A-Z0-9\-]+)/i,
    /confirmation\s*#?[:\s]*([A-Z0-9\-]+)/i,
    /booking\s*#?[:\s]*([A-Z0-9\-]+)/i
  ],
  
  // Date patterns
  date: [
    /date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /purchased\s+on[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /ordered\s+on[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\w{3,9}\s+\d{1,2},?\s+\d{4})/i, // January 15, 2024
    /(\d{1,2}\s+\w{3,9}\s+\d{4})/i    // 15 January 2024
  ],
  
  // Merchant name patterns (context-based)
  merchant: [
    /from\s+([A-Z][A-Za-z\s&\.]+?)(?:\s+<|$)/i,
    /at\s+([A-Z][A-Za-z\s&\.]+?)(?:\s+on|\s+for|$)/i,
    /purchase\s+from\s+([A-Z][A-Za-z\s&\.]+)/i
  ]
};

// Merchant category mapping based on email domains and content
const MERCHANT_CATEGORIES = {
  // E-commerce
  'amazon': 'shopping',
  'ebay': 'shopping',
  'etsy': 'shopping',
  'walmart': 'shopping',
  'target': 'shopping',
  'bestbuy': 'electronics',
  'homedepot': 'home',
  'lowes': 'home',
  'costco': 'shopping',
  
  // Food & Dining
  'doordash': 'food',
  'ubereats': 'food',
  'grubhub': 'food',
  'postmates': 'food',
  'seamless': 'food',
  'deliveroo': 'food',
  'starbucks': 'food',
  'mcdonalds': 'food',
  'subway': 'food',
  
  // Transportation
  'uber': 'transportation',
  'lyft': 'transportation',
  'delta': 'transportation',
  'united': 'transportation',
  'southwest': 'transportation',
  'american': 'transportation',
  'expedia': 'transportation',
  'booking': 'transportation',
  'airbnb': 'accommodation',
  
  // Subscriptions & Digital Services
  'netflix': 'entertainment',
  'spotify': 'entertainment',
  'adobe': 'software',
  'microsoft': 'software',
  'apple': 'technology',
  'google': 'technology',
  'dropbox': 'software',
  
  // Financial Services
  'paypal': 'financial',
  'venmo': 'financial',
  'square': 'financial',
  'stripe': 'financial',
  
  // Utilities
  'electric': 'utilities',
  'gas': 'utilities',
  'water': 'utilities',
  'internet': 'utilities',
  'phone': 'utilities'
};

/**
 * Email Receipt Parser class
 */
export class EmailReceiptParser {
  constructor() {
    this.spamKeywords = [
      'viagra', 'casino', 'lottery', 'winner', 'congratulations',
      'click here', 'act now', 'limited time', 'free money',
      'nigerian prince', 'inheritance', 'tax refund'
    ];
  }

  /**
   * Check if an email is likely a receipt
   * @param {Object} email - Email object with sender, subject, body
   * @returns {Object} - Detection result with confidence score
   */
  isReceiptEmail(email) {
    let confidence = 0;
    const reasons = [];

    // Check sender patterns
    const senderMatch = RECEIPT_SENDER_PATTERNS.some(pattern => 
      pattern.test(email.sender_email)
    );
    if (senderMatch) {
      confidence += 0.4;
      reasons.push('Known receipt sender');
    }

    // Check subject patterns
    const subjectMatches = RECEIPT_SUBJECT_PATTERNS.filter(pattern => 
      pattern.test(email.subject)
    );
    if (subjectMatches.length > 0) {
      confidence += Math.min(subjectMatches.length * 0.2, 0.4);
      reasons.push(`Subject contains receipt keywords (${subjectMatches.length})`);
    }

    // Check for dollar amounts in subject or body
    const amountPattern = /\$\d{1,3}(?:,?\d{3})*\.?\d{0,2}/;
    if (amountPattern.test(email.subject) || amountPattern.test(email.body || '')) {
      confidence += 0.2;
      reasons.push('Contains monetary amounts');
    }

    // Check for attachments (common for receipts)
    if (email.attachment_count > 0) {
      confidence += 0.1;
      reasons.push('Has attachments');
    }

    // Spam detection (reduces confidence)
    if (this.isSpamEmail(email)) {
      confidence = Math.max(0, confidence - 0.5);
      reasons.push('Potential spam detected');
    }

    return {
      isReceipt: confidence >= 0.5,
      confidence: Math.min(confidence, 1.0),
      reasons,
      requiresReview: confidence < 0.7
    };
  }

  /**
   * Extract receipt data from email content
   * @param {Object} email - Email object
   * @returns {Object} - Extracted receipt data
   */
  extractReceiptData(email) {
    const emailContent = `${email.subject}\n${email.body || ''}`;
    const extractedData = {
      merchant_name: null,
      total_amount: null,
      order_number: null,
      transaction_date: null,
      category: null,
      confidence_breakdown: {}
    };

    // Extract merchant name from sender email first
    const domain = email.sender_email.split('@')[1]?.toLowerCase() || '';
    const domainParts = domain.split('.');
    let merchantFromDomain = null;

    // Try to get merchant from domain
    for (const part of domainParts) {
      if (MERCHANT_CATEGORIES[part]) {
        merchantFromDomain = part;
        extractedData.category = MERCHANT_CATEGORIES[part];
        break;
      }
    }

    // Extract total amount
    for (const pattern of EMAIL_EXTRACTION_PATTERNS.total) {
      const match = emailContent.match(pattern);
      if (match) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (amount > 0 && amount < 10000) { // Reasonable range
          extractedData.total_amount = amount;
          extractedData.confidence_breakdown.amount = 0.8;
          break;
        }
      }
    }

    // Extract order/transaction ID
    for (const pattern of EMAIL_EXTRACTION_PATTERNS.orderId) {
      const match = emailContent.match(pattern);
      if (match && match[1].length > 3) {
        extractedData.order_number = match[1];
        extractedData.confidence_breakdown.orderId = 0.7;
        break;
      }
    }

    // Extract date
    for (const pattern of EMAIL_EXTRACTION_PATTERNS.date) {
      const match = emailContent.match(pattern);
      if (match) {
        const parsedDate = this.parseDate(match[1]);
        if (parsedDate) {
          extractedData.transaction_date = parsedDate;
          extractedData.confidence_breakdown.date = 0.6;
          break;
        }
      }
    }

    // Extract merchant name from content
    if (!extractedData.merchant_name && merchantFromDomain) {
      extractedData.merchant_name = this.capitalizeMerchantName(merchantFromDomain);
      extractedData.confidence_breakdown.merchant = 0.6;
    } else {
      for (const pattern of EMAIL_EXTRACTION_PATTERNS.merchant) {
        const match = emailContent.match(pattern);
        if (match && match[1].length > 2 && match[1].length < 50) {
          extractedData.merchant_name = match[1].trim();
          extractedData.confidence_breakdown.merchant = 0.5;
          break;
        }
      }
    }

    // Fallback: use domain as merchant name
    if (!extractedData.merchant_name && domain) {
      const mainDomain = domainParts[domainParts.length - 2] || domainParts[0];
      extractedData.merchant_name = this.capitalizeMerchantName(mainDomain);
      extractedData.confidence_breakdown.merchant = 0.3;
    }

    // Determine category if not already set
    if (!extractedData.category && extractedData.merchant_name) {
      const merchantLower = extractedData.merchant_name.toLowerCase();
      for (const [keyword, category] of Object.entries(MERCHANT_CATEGORIES)) {
        if (merchantLower.includes(keyword)) {
          extractedData.category = category;
          break;
        }
      }
    }

    // Default category
    if (!extractedData.category) {
      extractedData.category = 'other';
    }

    // Calculate overall confidence
    const confidenceValues = Object.values(extractedData.confidence_breakdown);
    extractedData.confidence = confidenceValues.length > 0 
      ? confidenceValues.reduce((sum, val) => sum + val, 0) / confidenceValues.length
      : 0.2;

    return extractedData;
  }

  /**
   * Check if email is likely spam
   * @param {Object} email - Email object
   * @returns {boolean} - True if likely spam
   */
  isSpamEmail(email) {
    const content = `${email.subject} ${email.body || ''}`.toLowerCase();
    
    // Check for spam keywords
    const spamMatches = this.spamKeywords.filter(keyword => 
      content.includes(keyword.toLowerCase())
    );

    // Check for excessive capitalization
    const capsRatio = (email.subject.match(/[A-Z]/g) || []).length / email.subject.length;
    
    // Check for excessive punctuation
    const exclamationCount = (email.subject.match(/!/g) || []).length;
    
    return spamMatches.length > 0 || capsRatio > 0.7 || exclamationCount > 3;
  }

  /**
   * Parse date string into standard format
   * @param {string} dateStr - Date string
   * @returns {string|null} - Parsed date in YYYY-MM-DD format
   */
  parseDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      // Ensure date is not too far in the future or past
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneMonthForward = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      if (date < oneYearAgo || date > oneMonthForward) {
        return null;
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      return null;
    }
  }

  /**
   * Capitalize merchant name properly
   * @param {string} name - Merchant name
   * @returns {string} - Capitalized name
   */
  capitalizeMerchantName(name) {
    return name
      .split(/[\s\-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Process multiple emails for receipt detection
   * @param {Array} emails - Array of email objects
   * @returns {Array} - Array of processing results
   */
  processEmailBatch(emails) {
    return emails.map(email => {
      const detection = this.isReceiptEmail(email);
      const extractedData = detection.isReceipt ? this.extractReceiptData(email) : null;
      
      return {
        email_id: email.id,
        is_receipt: detection.isReceipt,
        confidence_score: detection.confidence,
        detection_reasons: detection.reasons,
        requires_review: detection.requiresReview,
        extracted_data: extractedData,
        processing_status: detection.isReceipt ? 'completed' : 'not_receipt',
        processed_at: new Date().toISOString()
      };
    });
  }

  /**
   * Create email processing rules from merchant patterns
   * @param {Array} merchantDomains - Array of merchant domains to create rules for
   * @returns {Array} - Array of rule objects
   */
  generateRulesForMerchants(merchantDomains) {
    return merchantDomains.map(domain => {
      const merchantName = this.capitalizeMerchantName(domain.split('.')[0]);
      const category = MERCHANT_CATEGORIES[domain.split('.')[0]] || 'other';
      
      return {
        rule_name: `${merchantName} Receipts`,
        sender_patterns: `*@${domain}`,
        subject_patterns: '*receipt*,*order*,*confirmation*,*invoice*',
        auto_category: category,
        confidence_threshold: 0.7,
        is_active: true
      };
    });
  }
}

/**
 * Validate extracted email receipt data
 * @param {Object} data - Extracted receipt data
 * @returns {Object} - Validation results
 */
export function validateEmailReceiptData(data) {
  const issues = [];
  const warnings = [];

  // Check required fields
  if (!data.merchant_name || data.merchant_name.length < 2) {
    issues.push('Merchant name is missing or too short');
  }

  if (!data.total_amount || data.total_amount <= 0) {
    issues.push('Total amount is missing or invalid');
  }

  if (data.total_amount > 10000) {
    warnings.push('Amount seems unusually high');
  }

  if (!data.transaction_date) {
    warnings.push('Transaction date could not be determined');
  }

  // Check confidence score
  if (data.confidence < 0.4) {
    warnings.push('Low confidence in extraction - manual review recommended');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    requiresReview: issues.length > 0 || warnings.length > 0 || data.confidence < 0.6
  };
}

// Export singleton instance
export const emailReceiptParser = new EmailReceiptParser();
export default emailReceiptParser;
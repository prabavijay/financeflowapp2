/**
 * OCR Processing Utility for Receipt Scanner
 * Supports multiple OCR providers and receipt data extraction
 */

import { createWorker } from 'tesseract.js';

// Receipt pattern matching for data extraction
const RECEIPT_PATTERNS = {
  // Total amount patterns
  total: [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /sum[:\s]*\$?(\d+\.?\d*)/i,
    /grand total[:\s]*\$?(\d+\.?\d*)/i,
    /final[:\s]*\$?(\d+\.?\d*)/i
  ],
  
  // Tax patterns
  tax: [
    /tax[:\s]*\$?(\d+\.?\d*)/i,
    /gst[:\s]*\$?(\d+\.?\d*)/i,
    /vat[:\s]*\$?(\d+\.?\d*)/i,
    /sales tax[:\s]*\$?(\d+\.?\d*)/i
  ],
  
  // Tip patterns
  tip: [
    /tip[:\s]*\$?(\d+\.?\d*)/i,
    /gratuity[:\s]*\$?(\d+\.?\d*)/i,
    /service charge[:\s]*\$?(\d+\.?\d*)/i
  ],
  
  // Merchant name patterns
  merchant: [
    /^([A-Z][A-Za-z\s&]+)$/m,
    /^([A-Z\s]+)(?:\s+LLC|\s+INC|\s+CORP|$)/m
  ],
  
  // Date patterns
  date: [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
    /(\w{3}\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}\s+\w{3}\s+\d{4})/i
  ],
  
  // Receipt number patterns
  receiptNumber: [
    /receipt[#\s]*:?\s*(\w+)/i,
    /transaction[#\s]*:?\s*(\w+)/i,
    /order[#\s]*:?\s*(\w+)/i,
    /#(\d+)/
  ],
  
  // Phone number patterns
  phone: [
    /(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/,
    /(\+1[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/
  ],
  
  // Address patterns
  address: [
    /(\d+\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|blvd|boulevard))/i
  ]
};

// Common merchant categories based on name patterns
const MERCHANT_CATEGORIES = {
  'walmart': 'shopping',
  'target': 'shopping',
  'costco': 'shopping',
  'amazon': 'shopping',
  'starbucks': 'food',
  'mcdonalds': 'food',
  'subway': 'food',
  'shell': 'transportation',
  'exxon': 'transportation',
  'chevron': 'transportation',
  'cvs': 'healthcare',
  'walgreens': 'healthcare',
  'best buy': 'electronics',
  'home depot': 'home',
  'lowes': 'home',
  'uber': 'transportation',
  'lyft': 'transportation'
};

/**
 * OCR Processing class with multiple provider support
 */
export class OCRProcessor {
  constructor() {
    this.tesseractWorker = null;
    this.initializationPromise = null;
  }

  /**
   * Initialize Tesseract.js worker
   */
  async initializeTesseract() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        this.tesseractWorker = await createWorker();
        await this.tesseractWorker.loadLanguage('eng');
        await this.tesseractWorker.initialize('eng');
        await this.tesseractWorker.setParameters({
          tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,:-$#()/@&',
          preserve_interword_spaces: '1'
        });
        console.log('Tesseract OCR initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize Tesseract:', error);
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Process receipt image using Tesseract.js
   * @param {File|string} imageSource - Image file or base64 string
   * @returns {Promise<Object>} - OCR results with extracted data
   */
  async processReceipt(imageSource) {
    try {
      const startTime = Date.now();
      
      // Initialize OCR if not already done
      await this.initializeTesseract();
      
      // Perform OCR
      const { data } = await this.tesseractWorker.recognize(imageSource);
      const processingTime = Date.now() - startTime;
      
      // Extract structured data from OCR text
      const extractedData = this.extractReceiptData(data.text);
      
      return {
        success: true,
        processingTime,
        confidence: data.confidence / 100, // Convert to 0-1 scale
        rawText: data.text,
        extractedData,
        provider: 'tesseract'
      };
    } catch (error) {
      console.error('OCR processing failed:', error);
      return {
        success: false,
        error: error.message,
        provider: 'tesseract'
      };
    }
  }

  /**
   * Extract structured data from OCR text
   * @param {string} ocrText - Raw OCR text
   * @returns {Object} - Extracted receipt data
   */
  extractReceiptData(ocrText) {
    const data = {
      merchantName: null,
      totalAmount: null,
      taxAmount: null,
      tipAmount: null,
      transactionDate: null,
      receiptNumber: null,
      phoneNumber: null,
      address: null,
      category: null,
      lineItems: [],
      confidence: 0
    };

    let confidenceScore = 0;
    let detectedFields = 0;

    // Extract total amount
    for (const pattern of RECEIPT_PATTERNS.total) {
      const match = ocrText.match(pattern);
      if (match) {
        data.totalAmount = parseFloat(match[1]);
        confidenceScore += 0.3;
        detectedFields++;
        break;
      }
    }

    // Extract tax amount
    for (const pattern of RECEIPT_PATTERNS.tax) {
      const match = ocrText.match(pattern);
      if (match) {
        data.taxAmount = parseFloat(match[1]);
        confidenceScore += 0.15;
        detectedFields++;
        break;
      }
    }

    // Extract tip amount
    for (const pattern of RECEIPT_PATTERNS.tip) {
      const match = ocrText.match(pattern);
      if (match) {
        data.tipAmount = parseFloat(match[1]);
        confidenceScore += 0.1;
        detectedFields++;
        break;
      }
    }

    // Extract merchant name
    for (const pattern of RECEIPT_PATTERNS.merchant) {
      const match = ocrText.match(pattern);
      if (match && match[1].length > 2 && match[1].length < 50) {
        data.merchantName = match[1].trim();
        confidenceScore += 0.2;
        detectedFields++;
        break;
      }
    }

    // Extract date
    for (const pattern of RECEIPT_PATTERNS.date) {
      const match = ocrText.match(pattern);
      if (match) {
        data.transactionDate = this.parseDate(match[1]);
        if (data.transactionDate) {
          confidenceScore += 0.15;
          detectedFields++;
        }
        break;
      }
    }

    // Extract receipt number
    for (const pattern of RECEIPT_PATTERNS.receiptNumber) {
      const match = ocrText.match(pattern);
      if (match) {
        data.receiptNumber = match[1];
        confidenceScore += 0.05;
        detectedFields++;
        break;
      }
    }

    // Extract phone number
    for (const pattern of RECEIPT_PATTERNS.phone) {
      const match = ocrText.match(pattern);
      if (match) {
        data.phoneNumber = match[1];
        confidenceScore += 0.05;
        detectedFields++;
        break;
      }
    }

    // Determine category based on merchant name
    if (data.merchantName) {
      const merchantLower = data.merchantName.toLowerCase();
      for (const [keyword, category] of Object.entries(MERCHANT_CATEGORIES)) {
        if (merchantLower.includes(keyword)) {
          data.category = category;
          confidenceScore += 0.1;
          break;
        }
      }
    }

    // Extract line items (basic implementation)
    data.lineItems = this.extractLineItems(ocrText);
    if (data.lineItems.length > 0) {
      confidenceScore += 0.1;
    }

    // Calculate final confidence score
    data.confidence = Math.min(confidenceScore, 1.0);

    return data;
  }

  /**
   * Parse date string into standard format
   * @param {string} dateStr - Date string from OCR
   * @returns {string|null} - Parsed date in YYYY-MM-DD format
   */
  parseDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString().split('T')[0];
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract line items from receipt text (basic implementation)
   * @param {string} ocrText - Raw OCR text
   * @returns {Array} - Array of line items
   */
  extractLineItems(ocrText) {
    const items = [];
    const lines = ocrText.split('\n');
    
    // Look for lines that contain item descriptions and prices
    const itemPattern = /^(.+?)\s+(\$?\d+\.?\d*)\s*$/;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) continue;
      
      const match = trimmedLine.match(itemPattern);
      if (match && !this.isHeaderOrFooter(trimmedLine)) {
        const description = match[1].trim();
        const price = parseFloat(match[2].replace('$', ''));
        
        if (price > 0 && price < 1000 && description.length > 2) {
          items.push({
            description,
            price,
            quantity: 1
          });
        }
      }
    }
    
    return items.slice(0, 20); // Limit to 20 items
  }

  /**
   * Check if line is likely a header or footer (not an item)
   * @param {string} line - Text line
   * @returns {boolean} - True if header/footer
   */
  isHeaderOrFooter(line) {
    const headerFooterKeywords = [
      'total', 'subtotal', 'tax', 'tip', 'gratuity', 'receipt', 'thank you',
      'visa', 'mastercard', 'cash', 'change', 'tender', 'balance'
    ];
    
    const lineLower = line.toLowerCase();
    return headerFooterKeywords.some(keyword => lineLower.includes(keyword));
  }

  /**
   * Cleanup OCR worker
   */
  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
      this.initializationPromise = null;
    }
  }
}

/**
 * Process receipt using Google Vision API (placeholder)
 * @param {File} imageFile - Receipt image file
 * @returns {Promise<Object>} - OCR results
 */
export async function processReceiptWithGoogleVision(imageFile) {
  // This would integrate with Google Vision API
  // For now, return a placeholder response
  return {
    success: false,
    error: 'Google Vision API integration not implemented',
    provider: 'google-vision'
  };
}

/**
 * Process receipt using AWS Textract (placeholder)
 * @param {File} imageFile - Receipt image file
 * @returns {Promise<Object>} - OCR results
 */
export async function processReceiptWithAWSTextract(imageFile) {
  // This would integrate with AWS Textract
  // For now, return a placeholder response
  return {
    success: false,
    error: 'AWS Textract integration not implemented',
    provider: 'aws-textract'
  };
}

/**
 * Validate extracted receipt data
 * @param {Object} data - Extracted receipt data
 * @returns {Object} - Validation results
 */
export function validateReceiptData(data) {
  const issues = [];
  const warnings = [];

  // Check required fields
  if (!data.merchantName || data.merchantName.length < 2) {
    issues.push('Merchant name is missing or too short');
  }

  if (!data.totalAmount || data.totalAmount <= 0) {
    issues.push('Total amount is missing or invalid');
  }

  if (!data.transactionDate) {
    warnings.push('Transaction date could not be determined');
  }

  // Validate amounts
  if (data.totalAmount && data.taxAmount && data.taxAmount > data.totalAmount) {
    issues.push('Tax amount exceeds total amount');
  }

  if (data.totalAmount && data.tipAmount && data.tipAmount > data.totalAmount) {
    warnings.push('Tip amount seems unusually high');
  }

  // Check confidence score
  if (data.confidence < 0.3) {
    warnings.push('Low confidence in OCR results - manual review recommended');
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    requiresReview: issues.length > 0 || warnings.length > 0 || data.confidence < 0.5
  };
}

// Export singleton instance
export const ocrProcessor = new OCRProcessor();
export default ocrProcessor;
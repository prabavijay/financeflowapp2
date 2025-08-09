/**
 * Document Security and Encryption Utilities
 * Handles secure storage, encryption, and access control for documents
 */

import crypto from 'crypto';

// Security configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_DERIVATION_ITERATIONS = 100000;
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Generate a secure random key for document encryption
 * @returns {string} Base64 encoded encryption key
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('base64');
}

/**
 * Generate a salt for key derivation
 * @returns {Buffer} Random salt
 */
export function generateSalt() {
  return crypto.randomBytes(SALT_LENGTH);
}

/**
 * Derive encryption key from master key and salt
 * @param {string} masterKey - Master encryption key
 * @param {Buffer} salt - Salt for key derivation
 * @returns {Buffer} Derived key
 */
export function deriveKey(masterKey, salt) {
  return crypto.pbkdf2Sync(masterKey, salt, KEY_DERIVATION_ITERATIONS, 32, 'sha256');
}

/**
 * Encrypt file buffer
 * @param {Buffer} fileBuffer - File data to encrypt
 * @param {string} encryptionKey - Base64 encoded encryption key
 * @returns {Object} Encrypted data with metadata
 */
export function encryptFile(fileBuffer, encryptionKey) {
  try {
    const key = Buffer.from(encryptionKey, 'base64');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, key);
    cipher.setAAD(Buffer.from('FinanceFlow-Document', 'utf8'));
    
    const encrypted = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      algorithm: ENCRYPTION_ALGORITHM
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt file buffer
 * @param {Buffer} encryptedBuffer - Encrypted file data
 * @param {string} encryptionKey - Base64 encoded encryption key
 * @param {string} iv - Base64 encoded initialization vector
 * @param {string} tag - Base64 encoded authentication tag
 * @returns {Buffer} Decrypted file data
 */
export function decryptFile(encryptedBuffer, encryptionKey, iv, tag) {
  try {
    const key = Buffer.from(encryptionKey, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const tagBuffer = Buffer.from(tag, 'base64');
    
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, key);
    decipher.setAAD(Buffer.from('FinanceFlow-Document', 'utf8'));
    decipher.setAuthTag(tagBuffer);
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Calculate file checksum
 * @param {Buffer} fileBuffer - File data
 * @returns {string} SHA-256 checksum
 */
export function calculateChecksum(fileBuffer) {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

/**
 * Generate secure filename for storage
 * @param {string} originalFilename - Original filename
 * @param {string} userId - User ID
 * @returns {string} Secure storage filename
 */
export function generateSecureFilename(originalFilename, userId) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const extension = originalFilename.split('.').pop();
  const userHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 8);
  
  return `${userHash}_${timestamp}_${random}.${extension}`;
}

/**
 * Validate file type and size
 * @param {string} mimeType - File MIME type
 * @param {number} fileSize - File size in bytes
 * @returns {Object} Validation result
 */
export function validateFile(mimeType, fileSize) {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  const errors = [];
  
  if (fileSize > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  if (!ALLOWED_TYPES.includes(mimeType)) {
    errors.push(`File type ${mimeType} is not allowed`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate access token for document sharing
 * @param {string} documentId - Document ID
 * @param {string} userId - User ID
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} Access token
 */
export function generateAccessToken(documentId, userId, expiresIn = 3600) {
  const payload = {
    documentId,
    userId,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const secret = process.env.DOCUMENT_ACCESS_SECRET || 'default-secret-key';
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('base64url');
}

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {Object} Token payload if valid
 */
export function verifyAccessToken(token) {
  try {
    const secret = process.env.DOCUMENT_ACCESS_SECRET || 'default-secret-key';
    const [header, payload, signature] = token.split('.');
    
    // Verify signature (simplified - in production use proper JWT library)
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    
    return decodedPayload;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Sanitize filename for security
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters
    .replace(/\.+/g, '.') // Remove multiple dots
    .replace(/^\./, '') // Remove leading dot
    .substring(0, 255); // Limit length
}

/**
 * Check if user can access document
 * @param {Object} document - Document object
 * @param {string} userId - User ID requesting access
 * @returns {boolean} Access granted
 */
export function checkDocumentAccess(document, userId) {
  // Owner has full access
  if (document.user_id === userId) {
    return true;
  }
  
  // Check shared access
  if (document.access_level === 'shared' && document.shared_with?.includes(userId)) {
    return true;
  }
  
  // Family access (would need family member check in real implementation)
  if (document.access_level === 'family') {
    // TODO: Implement family member verification
    return true;
  }
  
  return false;
}

/**
 * Create search vector for document content
 * @param {string} title - Document title
 * @param {string} description - Document description
 * @param {string} ocrText - OCR extracted text
 * @param {Array} tags - Document tags
 * @returns {string} PostgreSQL tsvector compatible string
 */
export function createSearchVector(title, description = '', ocrText = '', tags = []) {
  const searchableText = [
    title,
    description,
    ocrText,
    tags.join(' ')
  ].filter(Boolean).join(' ');
  
  return searchableText
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default {
  generateEncryptionKey,
  generateSalt,
  deriveKey,
  encryptFile,
  decryptFile,
  calculateChecksum,
  generateSecureFilename,
  validateFile,
  generateAccessToken,
  verifyAccessToken,
  sanitizeFilename,
  checkDocumentAccess,
  createSearchVector
};
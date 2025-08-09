/**
 * Gmail OAuth2 Integration Service
 * Handles Google OAuth2 authentication and Gmail API access
 * Browser-compatible implementation using Google Identity Services
 */

import { OAUTH2_CONFIG, OAUTH2_SCOPES, TOKEN_STORAGE, OAUTH2_ERRORS } from '../config/oauth2Config';

/**
 * Gmail OAuth2 Service Class
 */
export class GmailOAuth2Service {
  constructor() {
    this.isInitialized = false;
    this.userInfo = null;
    this.accessToken = null;
    this.tokenClient = null;
  }

  /**
   * Initialize the Gmail OAuth2 client
   */
  async initialize() {
    try {
      await this.loadGoogleIdentityServices();
      
      const config = OAUTH2_CONFIG.gmail;
      
      // Initialize Google Identity Services Token Client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: config.clientId,
        scope: config.scopes.join(' '),
        callback: (response) => {
          this.handleTokenResponse(response);
        },
      });

      this.isInitialized = true;

      // Try to load existing tokens
      await this.loadStoredTokens();

      console.log('Gmail OAuth2 service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gmail OAuth2:', error);
      throw new Error(`Gmail OAuth2 initialization failed: ${error.message}`);
    }
  }

  /**
   * Load Google Identity Services library
   */
  async loadGoogleIdentityServices() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        // Wait a bit for the library to initialize
        setTimeout(() => {
          if (window.google?.accounts?.oauth2) {
            resolve();
          } else {
            reject(new Error('Google Identity Services failed to load'));
          }
        }, 100);
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  /**
   * Start OAuth2 authentication flow
   * @returns {Promise} - Authentication promise
   */
  async signIn() {
    return new Promise((resolve, reject) => {
      if (!this.tokenClient) {
        reject(new Error('Token client not initialized'));
        return;
      }

      // Set up the callback for this specific sign-in attempt
      this.tokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.handleTokenResponse(response);
          resolve({
            success: true,
            user: this.userInfo,
            accessToken: this.accessToken
          });
        }
      };

      // Request access token
      this.tokenClient.requestAccessToken({
        prompt: 'consent', // Force consent to get refresh token
      });
    });
  }

  /**
   * Handle token response from Google Identity Services
   * @param {Object} response - Token response
   */
  async handleTokenResponse(response) {
    try {
      if (response.access_token) {
        this.accessToken = response.access_token;
        
        // Store token
        const expiryDate = Date.now() + (response.expires_in * 1000);
        this.storeTokens({
          access_token: response.access_token,
          expiry_date: expiryDate
        });

        // Get user info
        await this.getUserInfo();
        
        console.log('Gmail OAuth2 authentication successful');
      }
    } catch (error) {
      console.error('Error handling token response:', error);
      throw error;
    }
  }

  /**
   * Get authorization URL (for backward compatibility)
   * @returns {string} - Placeholder URL
   */
  getAuthUrl() {
    // This method is kept for backward compatibility but isn't used with GIS
    return '#gmail-oauth2-popup';
  }

  /**
   * Handle auth callback (for backward compatibility)
   * @param {string} code - Not used with GIS
   * @param {string} state - Not used with GIS  
   * @returns {Object} - Result object
   */
  async handleAuthCallback(code, state) {
    // This method is kept for backward compatibility
    // Actual authentication is handled by signIn() method
    return {
      success: false,
      error: 'Use signIn() method for Google Identity Services authentication'
    };
  }

  /**
   * Get user profile information
   * @returns {Object} - User profile data
   */
  async getUserInfo() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      
      this.userInfo = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        verified_email: userData.verified_email,
        provider: 'gmail'
      };

      // Store user info
      localStorage.setItem(TOKEN_STORAGE.USER_INFO, JSON.stringify(this.userInfo));
      
      return this.userInfo;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Get Gmail messages with filtering
   * @param {Object} options - Query options
   * @returns {Array} - Array of messages
   */
  async getMessages(options = {}) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const {
        query = '',
        maxResults = 100,
        labelIds = [],
        includeSpamTrash = false,
        pageToken = null
      } = options;

      // Build query parameters
      const params = new URLSearchParams({
        q: query,
        maxResults: maxResults.toString(),
        includeSpamTrash: includeSpamTrash.toString()
      });

      if (labelIds.length > 0) {
        params.append('labelIds', labelIds.join(','));
      }

      if (pageToken) {
        params.append('pageToken', pageToken);
      }

      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.messages) {
        return {
          messages: [],
          nextPageToken: null,
          resultSizeEstimate: 0
        };
      }

      // Get full message details (limit to avoid too many requests)
      const messagesToFetch = data.messages.slice(0, Math.min(10, data.messages.length));
      const messages = await Promise.all(
        messagesToFetch.map(async (message) => {
          return this.getMessage(message.id);
        })
      );

      return {
        messages: messages.filter(msg => msg !== null),
        nextPageToken: data.nextPageToken,
        resultSizeEstimate: data.resultSizeEstimate
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get a specific Gmail message
   * @param {string} messageId - Message ID
   * @returns {Object} - Message details
   */
  async getMessage(messageId) {
    try {
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const message = await response.json();
      const headers = message.payload?.headers || [];
      
      // Extract common email fields
      const extractedMessage = {
        id: message.id,
        threadId: message.threadId,
        labelIds: message.labelIds,
        snippet: message.snippet,
        historyId: message.historyId,
        internalDate: new Date(parseInt(message.internalDate)),
        sizeEstimate: message.sizeEstimate,
        
        // Headers
        subject: this.getHeader(headers, 'Subject') || '',
        from: this.getHeader(headers, 'From') || '',
        to: this.getHeader(headers, 'To') || '',
        date: this.getHeader(headers, 'Date') || '',
        messageId: this.getHeader(headers, 'Message-ID') || '',
        
        // Body content
        body: this.extractMessageBody(message.payload || {}),
        hasAttachments: this.hasAttachments(message.payload || {}),
        attachments: this.extractAttachments(message.payload || {})
      };

      return extractedMessage;
    } catch (error) {
      console.error(`Error getting message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Search for receipt emails using Gmail search
   * @param {Object} searchOptions - Search parameters
   * @returns {Array} - Receipt messages
   */
  async searchReceiptEmails(searchOptions = {}) {
    try {
      const {
        fromDate = null,
        toDate = null,
        merchants = [],
        keywords = ['receipt', 'invoice', 'order', 'confirmation'],
        maxResults = 50
      } = searchOptions;

      // Build search query
      let query = keywords.map(keyword => `subject:${keyword}`).join(' OR ');
      
      if (merchants.length > 0) {
        const merchantQuery = merchants.map(merchant => `from:${merchant}`).join(' OR ');
        query = `(${query}) AND (${merchantQuery})`;
      }

      if (fromDate) {
        query += ` after:${this.formatGmailDate(fromDate)}`;
      }

      if (toDate) {
        query += ` before:${this.formatGmailDate(toDate)}`;
      }

      // Add common receipt patterns
      query += ' AND (has:attachment OR subject:receipt OR subject:invoice OR subject:order)';

      console.log('Gmail search query:', query);

      const result = await this.getMessages({
        query,
        maxResults,
        includeSpamTrash: false
      });

      return result;
    } catch (error) {
      console.error('Error searching receipt emails:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    if (!this.accessToken) return false;
    
    // Check if token is expired (basic check)
    const storedExpiry = localStorage.getItem(TOKEN_STORAGE.GMAIL_TOKEN_EXPIRES);
    if (storedExpiry && parseInt(storedExpiry) <= Date.now()) {
      return false;
    }
    
    return true;
  }

  /**
   * Refresh access token
   * @returns {boolean} - Success status
   */
  async refreshToken() {
    try {
      // With Google Identity Services, we request a new token
      // instead of using refresh tokens
      console.warn('Token refresh requested - will need to re-authenticate');
      this.clearTokens();
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Sign out and clear tokens
   */
  async signOut() {
    try {
      // Revoke tokens
      if (this.oauth2Client.credentials.access_token) {
        await this.oauth2Client.revokeCredentials();
      }
      
      this.clearTokens();
      this.userInfo = null;
      
      console.log('Gmail OAuth2 sign out successful');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Clear tokens anyway
      this.clearTokens();
    }
  }

  // Private helper methods

  /**
   * Store tokens securely
   * @param {Object} tokens - OAuth2 tokens
   */
  storeTokens(tokens) {
    try {
      if (tokens.access_token) {
        localStorage.setItem(TOKEN_STORAGE.GMAIL_ACCESS_TOKEN, tokens.access_token);
        this.accessToken = tokens.access_token;
      }
      
      if (tokens.refresh_token) {
        localStorage.setItem(TOKEN_STORAGE.GMAIL_REFRESH_TOKEN, tokens.refresh_token);
      }
      
      if (tokens.expiry_date) {
        localStorage.setItem(TOKEN_STORAGE.GMAIL_TOKEN_EXPIRES, tokens.expiry_date.toString());
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Load stored tokens
   */
  async loadStoredTokens() {
    try {
      const accessToken = localStorage.getItem(TOKEN_STORAGE.GMAIL_ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(TOKEN_STORAGE.GMAIL_REFRESH_TOKEN);
      const expiryDate = localStorage.getItem(TOKEN_STORAGE.GMAIL_TOKEN_EXPIRES);

      if (accessToken) {
        this.accessToken = accessToken;
        
        if (refreshToken && this.oauth2Client) {
          const credentials = {
            access_token: accessToken,
            refresh_token: refreshToken
          };

          if (expiryDate) {
            credentials.expiry_date = parseInt(expiryDate);
          }

          this.oauth2Client.setCredentials(credentials);
        }
        
        // Load user info
        const userInfoStr = localStorage.getItem(TOKEN_STORAGE.USER_INFO);
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr);
        }

        console.log('Loaded stored Gmail tokens');
        return true;
      }
    } catch (error) {
      console.error('Error loading stored tokens:', error);
    }
    
    return false;
  }

  /**
   * Clear stored tokens
   */
  clearTokens() {
    localStorage.removeItem(TOKEN_STORAGE.GMAIL_ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE.GMAIL_REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE.GMAIL_TOKEN_EXPIRES);
    localStorage.removeItem(TOKEN_STORAGE.USER_INFO);
    
    this.accessToken = null;
    
    if (this.oauth2Client) {
      this.oauth2Client.setCredentials({});
    }
  }

  /**
   * Handle token updates
   * @param {Object} tokens - New tokens
   */
  handleTokenUpdate(tokens) {
    console.log('Gmail tokens updated');
    this.storeTokens(tokens);
  }

  /**
   * Generate random state for OAuth2
   * @returns {string} - Random state string
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get error code from error object
   * @param {Error} error - Error object
   * @returns {string} - Error code
   */
  getErrorCode(error) {
    if (error.message.includes('invalid_client')) return OAUTH2_ERRORS.INVALID_CLIENT;
    if (error.message.includes('invalid_grant')) return OAUTH2_ERRORS.INVALID_GRANT;
    if (error.message.includes('access_denied')) return OAUTH2_ERRORS.ACCESS_DENIED;
    if (error.message.includes('network')) return OAUTH2_ERRORS.NETWORK_ERROR;
    return 'unknown_error';
  }

  /**
   * Extract header value from message headers
   * @param {Array} headers - Message headers
   * @param {string} name - Header name
   * @returns {string} - Header value
   */
  getHeader(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : null;
  }

  /**
   * Extract message body from payload
   * @param {Object} payload - Message payload
   * @returns {Object} - Body content
   */
  extractMessageBody(payload) {
    const body = {
      text: '',
      html: ''
    };

    if (payload.body && payload.body.data) {
      const mimeType = payload.mimeType;
      const bodyData = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      
      if (mimeType === 'text/plain') {
        body.text = bodyData;
      } else if (mimeType === 'text/html') {
        body.html = bodyData;
      }
    }

    // Handle multipart messages
    if (payload.parts) {
      payload.parts.forEach(part => {
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          body.text += Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
          body.html += Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      });
    }

    return body;
  }

  /**
   * Check if message has attachments
   * @param {Object} payload - Message payload
   * @returns {boolean} - Has attachments
   */
  hasAttachments(payload) {
    if (payload.parts) {
      return payload.parts.some(part => 
        part.filename && part.filename.length > 0
      );
    }
    return false;
  }

  /**
   * Extract attachment info
   * @param {Object} payload - Message payload
   * @returns {Array} - Attachment details
   */
  extractAttachments(payload) {
    const attachments = [];
    
    if (payload.parts) {
      payload.parts.forEach(part => {
        if (part.filename && part.filename.length > 0) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId
          });
        }
      });
    }
    
    return attachments;
  }

  /**
   * Format date for Gmail search
   * @param {Date} date - Date object
   * @returns {string} - Formatted date
   */
  formatGmailDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  }
}

// Export singleton instance
export const gmailOAuth2Service = new GmailOAuth2Service();
export default gmailOAuth2Service;
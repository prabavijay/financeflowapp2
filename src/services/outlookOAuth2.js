/**
 * Outlook OAuth2 Integration Service
 * Handles Microsoft OAuth2 authentication and Microsoft Graph API access
 */

import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import { MSAL_CONFIG, OAUTH2_CONFIG, OAUTH2_SCOPES, TOKEN_STORAGE, OAUTH2_ERRORS } from '../config/oauth2Config';

/**
 * Outlook OAuth2 Service Class
 */
export class OutlookOAuth2Service {
  constructor() {
    this.msalInstance = null;
    this.isInitialized = false;
    this.userInfo = null;
    this.activeAccount = null;
  }

  /**
   * Initialize the Microsoft Authentication Library
   */
  async initialize() {
    try {
      // Check if MSAL config is valid
      if (!MSAL_CONFIG?.auth?.clientId || MSAL_CONFIG.auth.clientId === 'your-microsoft-client-id') {
        console.warn('Microsoft Client ID not configured. Skipping Outlook OAuth2 initialization.');
        this.isInitialized = false;
        return false;
      }

      // Prevent double initialization
      if (this.isInitialized && this.msalInstance) {
        console.log('Outlook OAuth2 service already initialized');
        return true;
      }

      // Create and initialize MSAL instance
      this.msalInstance = new PublicClientApplication(MSAL_CONFIG);
      
      // Wait for MSAL to be fully initialized
      await this.msalInstance.initialize();
      
      // Now handle redirect promise after initialization is complete
      const redirectResponse = await this.msalInstance.handleRedirectPromise();
      
      if (redirectResponse) {
        // User returned from redirect flow
        this.activeAccount = redirectResponse.account;
        this.msalInstance.setActiveAccount(this.activeAccount);
        try {
          await this.getUserInfo();
        } catch (userInfoError) {
          console.warn('Failed to get user info during initialization:', userInfoError);
          // Continue initialization even if user info fails
        }
      } else {
        // Check for existing accounts
        const accounts = this.msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          this.activeAccount = accounts[0];
          this.msalInstance.setActiveAccount(this.activeAccount);
          try {
            await this.getUserInfo();
          } catch (userInfoError) {
            console.warn('Failed to get user info during initialization:', userInfoError);
            // Continue initialization even if user info fails
          }
        }
      }

      this.isInitialized = true;
      console.log('Outlook OAuth2 service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Outlook OAuth2:', error);
      this.isInitialized = false;
      
      // Don't throw error for missing client ID configuration
      if (error.message?.includes('Invalid client id')) {
        console.warn('Invalid Microsoft Client ID configuration. Please check your environment variables.');
        return false;
      }
      
      throw new Error(`Outlook OAuth2 initialization failed: ${error.message}`);
    }
  }

  /**
   * Sign in with redirect flow
   * @param {Array} scopes - OAuth2 scopes to request
   */
  async signInRedirect(scopes = OAUTH2_SCOPES.outlook.full) {
    try {
      if (!this.msalInstance || !this.isInitialized) {
        throw new Error('MSAL not initialized. Call initialize() first.');
      }

      const loginRequest = {
        scopes: scopes,
        prompt: 'select_account'
      };

      await this.msalInstance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Sign in redirect error:', error);
      throw error;
    }
  }

  /**
   * Sign in with popup flow
   * @param {Array} scopes - OAuth2 scopes to request
   * @returns {Object} - Authentication result
   */
  async signInPopup(scopes = OAUTH2_SCOPES.outlook.full) {
    try {
      if (!this.msalInstance || !this.isInitialized) {
        throw new Error('MSAL not initialized. Call initialize() first.');
      }

      const loginRequest = {
        scopes: scopes,
        prompt: 'select_account'
      };

      const response = await this.msalInstance.loginPopup(loginRequest);
      
      if (response.account) {
        this.activeAccount = response.account;
        this.msalInstance.setActiveAccount(this.activeAccount);
        await this.getUserInfo();
        
        return {
          success: true,
          user: this.userInfo,
          accessToken: response.accessToken,
          account: response.account
        };
      }

      throw new Error('No account returned from authentication');
    } catch (error) {
      console.error('Sign in popup error:', error);
      
      return {
        success: false,
        error: error.message,
        errorCode: this.getErrorCode(error)
      };
    }
  }

  /**
   * Get access token silently
   * @param {Array} scopes - OAuth2 scopes to request
   * @returns {string} - Access token
   */
  async getAccessToken(scopes = OAUTH2_SCOPES.outlook.read) {
    try {
      if (!this.isInitialized) {
        throw new Error('MSAL not initialized. Call initialize() first.');
      }
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const silentRequest = {
        scopes: scopes,
        account: this.activeAccount
      };

      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token expired or requires interaction
        console.log('Token expired, requesting new token');
        const response = await this.msalInstance.acquireTokenPopup({
          scopes: scopes,
          account: this.activeAccount
        });
        return response.accessToken;
      }
      
      console.error('Error getting access token:', error);
      throw error;
    }
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

      const accessToken = await this.getAccessToken(OAUTH2_SCOPES.outlook.profile);
      
      const response = await fetch(OAUTH2_CONFIG.outlook.userInfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      
      this.userInfo = {
        id: userData.id,
        email: userData.mail || userData.userPrincipalName,
        name: userData.displayName,
        firstName: userData.givenName,
        lastName: userData.surname,
        jobTitle: userData.jobTitle,
        provider: 'outlook'
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
   * Get Outlook messages with filtering
   * @param {Object} options - Query options
   * @returns {Array} - Array of messages
   */
  async getMessages(options = {}) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const {
        folderName = 'inbox',
        filter = '',
        select = 'id,subject,from,receivedDateTime,hasAttachments,bodyPreview,internetMessageId',
        orderBy = 'receivedDateTime desc',
        top = 100,
        skip = 0
      } = options;

      const accessToken = await this.getAccessToken(OAUTH2_SCOPES.outlook.read);
      
      // Build query parameters
      const params = new URLSearchParams({
        $select: select,
        $orderby: orderBy,
        $top: top.toString(),
        $skip: skip.toString()
      });

      if (filter) {
        params.append('$filter', filter);
      }

      const url = `${OAUTH2_CONFIG.outlook.graphEndpoint}/me/mailFolders/${folderName}/messages?${params}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform messages to consistent format
      const messages = data.value.map(message => this.transformMessage(message));

      return {
        messages,
        nextLink: data['@odata.nextLink'],
        totalCount: data['@odata.count']
      };
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get a specific Outlook message
   * @param {string} messageId - Message ID
   * @returns {Object} - Message details
   */
  async getMessage(messageId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const accessToken = await this.getAccessToken(OAUTH2_SCOPES.outlook.read);
      
      const url = `${OAUTH2_CONFIG.outlook.graphEndpoint}/me/messages/${messageId}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const message = await response.json();
      return this.transformMessage(message, true);
    } catch (error) {
      console.error(`Error getting message ${messageId}:`, error);
      return null;
    }
  }

  /**
   * Search for receipt emails using Microsoft Graph
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

      // Build OData filter
      let filters = [];

      // Date filters
      if (fromDate) {
        filters.push(`receivedDateTime ge ${fromDate.toISOString()}`);
      }
      if (toDate) {
        filters.push(`receivedDateTime le ${toDate.toISOString()}`);
      }

      // Subject keyword filters
      const subjectFilters = keywords.map(keyword => 
        `contains(subject,'${keyword}')`
      ).join(' or ');
      
      if (subjectFilters) {
        filters.push(`(${subjectFilters})`);
      }

      // Merchant filters (from email address)
      if (merchants.length > 0) {
        const merchantFilters = merchants.map(merchant => 
          `contains(from/emailAddress/address,'${merchant}')`
        ).join(' or ');
        filters.push(`(${merchantFilters})`);
      }

      const filter = filters.join(' and ');

      console.log('Outlook search filter:', filter);

      const result = await this.getMessages({
        filter,
        top: maxResults,
        orderBy: 'receivedDateTime desc'
      });

      return result;
    } catch (error) {
      console.error('Error searching receipt emails:', error);
      throw error;
    }
  }

  /**
   * Get message attachments
   * @param {string} messageId - Message ID
   * @returns {Array} - Attachment details
   */
  async getMessageAttachments(messageId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const accessToken = await this.getAccessToken(OAUTH2_SCOPES.outlook.read);
      
      const url = `${OAUTH2_CONFIG.outlook.graphEndpoint}/me/messages/${messageId}/attachments`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.value.map(attachment => ({
        id: attachment.id,
        name: attachment.name,
        contentType: attachment.contentType,
        size: attachment.size,
        isInline: attachment.isInline,
        lastModifiedDateTime: attachment.lastModifiedDateTime
      }));
    } catch (error) {
      console.error(`Error getting attachments for message ${messageId}:`, error);
      return [];
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated() {
    if (!this.msalInstance || !this.isInitialized) {
      return false;
    }
    
    try {
      const accounts = this.msalInstance.getAllAccounts();
      return accounts.length > 0;
    } catch (error) {
      console.warn('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Sign out and clear tokens
   */
  async signOut() {
    try {
      if (this.msalInstance && this.activeAccount) {
        await this.msalInstance.logoutRedirect({
          account: this.activeAccount
        });
      }
      
      this.clearTokens();
      this.userInfo = null;
      this.activeAccount = null;
      
      console.log('Outlook OAuth2 sign out successful');
    } catch (error) {
      console.error('Error during sign out:', error);
      // Clear tokens anyway
      this.clearTokens();
    }
  }

  // Private helper methods

  /**
   * Transform Microsoft Graph message to consistent format
   * @param {Object} message - Microsoft Graph message
   * @param {boolean} includeBody - Include message body
   * @returns {Object} - Transformed message
   */
  transformMessage(message, includeBody = false) {
    const transformed = {
      id: message.id,
      subject: message.subject || '',
      from: message.from?.emailAddress?.address || '',
      fromName: message.from?.emailAddress?.name || '',
      to: message.toRecipients?.[0]?.emailAddress?.address || '',
      receivedDateTime: new Date(message.receivedDateTime),
      hasAttachments: message.hasAttachments || false,
      bodyPreview: message.bodyPreview || '',
      internetMessageId: message.internetMessageId || '',
      isRead: message.isRead || false,
      importance: message.importance || 'normal',
      sizeEstimate: message.body?.content?.length || 0
    };

    if (includeBody && message.body) {
      transformed.body = {
        contentType: message.body.contentType,
        content: message.body.content
      };
    }

    return transformed;
  }

  /**
   * Clear stored tokens and user info
   */
  clearTokens() {
    localStorage.removeItem(TOKEN_STORAGE.OUTLOOK_ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE.OUTLOOK_REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE.OUTLOOK_TOKEN_EXPIRES);
    localStorage.removeItem(TOKEN_STORAGE.USER_INFO);
  }

  /**
   * Get error code from error object
   * @param {Error} error - Error object
   * @returns {string} - Error code
   */
  getErrorCode(error) {
    if (error.message.includes('user_cancelled')) return OAUTH2_ERRORS.ACCESS_DENIED;
    if (error.message.includes('consent_required')) return OAUTH2_ERRORS.CONSENT_REQUIRED;
    if (error.message.includes('interaction_required')) return OAUTH2_ERRORS.INTERACTION_REQUIRED;
    if (error.message.includes('login_required')) return OAUTH2_ERRORS.LOGIN_REQUIRED;
    if (error.message.includes('invalid_client')) return OAUTH2_ERRORS.INVALID_CLIENT;
    if (error.message.includes('invalid_scope')) return OAUTH2_ERRORS.INVALID_SCOPE;
    if (error.message.includes('network')) return OAUTH2_ERRORS.NETWORK_ERROR;
    return 'unknown_error';
  }

  /**
   * Get mail folders
   * @returns {Array} - Mail folders
   */
  async getMailFolders() {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Not authenticated');
      }

      const accessToken = await this.getAccessToken(OAUTH2_SCOPES.outlook.read);
      
      const url = `${OAUTH2_CONFIG.outlook.graphEndpoint}/me/mailFolders`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.value.map(folder => ({
        id: folder.id,
        displayName: folder.displayName,
        parentFolderId: folder.parentFolderId,
        childFolderCount: folder.childFolderCount,
        unreadItemCount: folder.unreadItemCount,
        totalItemCount: folder.totalItemCount
      }));
    } catch (error) {
      console.error('Error getting mail folders:', error);
      throw error;
    }
  }

  /**
   * Create OData date filter
   * @param {Date} date - Date object
   * @returns {string} - OData date string
   */
  formatODataDate(date) {
    return date.toISOString();
  }

  /**
   * Handle MSAL errors
   * @param {Error} error - MSAL error
   */
  handleMsalError(error) {
    console.error('MSAL Error:', error);
    
    if (error instanceof InteractionRequiredAuthError) {
      // Token expired or requires user interaction
      console.log('User interaction required for token refresh');
      return OAUTH2_ERRORS.INTERACTION_REQUIRED;
    }
    
    return this.getErrorCode(error);
  }
}

// Export singleton instance
export const outlookOAuth2Service = new OutlookOAuth2Service();
export default outlookOAuth2Service;
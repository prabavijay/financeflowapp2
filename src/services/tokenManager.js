/**
 * OAuth2 Token Management Service
 * Handles secure token storage, refresh, and validation
 */

import { TOKEN_STORAGE, OAUTH2_ERRORS } from '../config/oauth2Config';
import gmailOAuth2Service from './gmailOAuth2';
import outlookOAuth2Service from './outlookOAuth2';

/**
 * Token Manager Class
 */
export class TokenManager {
  constructor() {
    this.refreshTimers = new Map();
    this.tokenValidators = new Map();
  }

  /**
   * Initialize token manager
   */
  async initialize() {
    try {
      // Set up automatic token refresh for stored tokens
      await this.setupAutoRefresh('gmail');
      await this.setupAutoRefresh('outlook');
      
      console.log('Token manager initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize token manager:', error);
      return false;
    }
  }

  /**
   * Get valid access token for provider
   * @param {string} provider - OAuth2 provider
   * @param {Array} scopes - Required scopes
   * @returns {string} - Valid access token
   */
  async getAccessToken(provider, scopes = []) {
    try {
      const service = this.getService(provider);
      if (!service) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Check if service is authenticated
      if (!service.isAuthenticated()) {
        throw new Error(`Not authenticated with ${provider}`);
      }

      // Get token based on provider
      let token;
      if (provider === 'gmail') {
        // Gmail tokens are managed by Google APIs client
        const credentials = service.oauth2Client.credentials;
        if (this.isTokenExpired(credentials.expiry_date)) {
          await service.refreshToken();
        }
        token = service.oauth2Client.credentials.access_token;
      } else if (provider === 'outlook') {
        // Outlook tokens are managed by MSAL
        token = await service.getAccessToken(scopes);
      }

      if (!token) {
        throw new Error(`Failed to get access token for ${provider}`);
      }

      return token;
    } catch (error) {
      console.error(`Error getting access token for ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Validate token for provider
   * @param {string} provider - OAuth2 provider
   * @returns {Object} - Validation result
   */
  async validateToken(provider) {
    try {
      const service = this.getService(provider);
      if (!service) {
        return { valid: false, error: 'Unsupported provider' };
      }

      if (!service.isAuthenticated()) {
        return { valid: false, error: 'Not authenticated' };
      }

      // Try to get user info to validate token
      const userInfo = await service.getUserInfo();
      
      return {
        valid: true,
        userInfo,
        provider,
        validatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Token validation failed for ${provider}:`, error);
      
      return {
        valid: false,
        error: error.message,
        errorCode: this.getErrorCode(error)
      };
    }
  }

  /**
   * Refresh token for provider
   * @param {string} provider - OAuth2 provider
   * @returns {boolean} - Success status
   */
  async refreshToken(provider) {
    try {
      const service = this.getService(provider);
      if (!service) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      let success = false;
      if (provider === 'gmail') {
        success = await service.refreshToken();
      } else if (provider === 'outlook') {
        // MSAL handles refresh automatically, just validate
        const validation = await this.validateToken(provider);
        success = validation.valid;
      }

      if (success) {
        console.log(`Token refreshed successfully for ${provider}`);
        this.scheduleNextRefresh(provider);
      }

      return success;
    } catch (error) {
      console.error(`Token refresh failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Revoke tokens for provider
   * @param {string} provider - OAuth2 provider
   * @returns {boolean} - Success status
   */
  async revokeToken(provider) {
    try {
      const service = this.getService(provider);
      if (!service) {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      await service.signOut();
      this.clearRefreshTimer(provider);
      
      console.log(`Token revoked for ${provider}`);
      return true;
    } catch (error) {
      console.error(`Token revocation failed for ${provider}:`, error);
      return false;
    }
  }

  /**
   * Get token info for provider
   * @param {string} provider - OAuth2 provider
   * @returns {Object} - Token information
   */
  getTokenInfo(provider) {
    try {
      const service = this.getService(provider);
      if (!service) {
        return { exists: false, error: 'Unsupported provider' };
      }

      const isAuthenticated = service.isAuthenticated();
      if (!isAuthenticated) {
        return { exists: false, authenticated: false };
      }

      let tokenInfo = {
        exists: true,
        authenticated: true,
        provider,
        userInfo: service.userInfo
      };

      if (provider === 'gmail' && service.oauth2Client.credentials) {
        const credentials = service.oauth2Client.credentials;
        tokenInfo = {
          ...tokenInfo,
          hasRefreshToken: !!credentials.refresh_token,
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          isExpired: this.isTokenExpired(credentials.expiry_date),
          scopes: credentials.scope?.split(' ') || []
        };
      } else if (provider === 'outlook' && service.activeAccount) {
        tokenInfo = {
          ...tokenInfo,
          account: service.activeAccount,
          hasRefreshToken: true, // MSAL handles refresh tokens internally
          isExpired: false // MSAL handles expiration automatically
        };
      }

      return tokenInfo;
    } catch (error) {
      console.error(`Error getting token info for ${provider}:`, error);
      return { exists: false, error: error.message };
    }
  }

  /**
   * Get all token information
   * @returns {Object} - All token information
   */
  getAllTokenInfo() {
    return {
      gmail: this.getTokenInfo('gmail'),
      outlook: this.getTokenInfo('outlook'),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Setup automatic token refresh for provider
   * @param {string} provider - OAuth2 provider
   */
  async setupAutoRefresh(provider) {
    try {
      const tokenInfo = this.getTokenInfo(provider);
      
      if (tokenInfo.exists && tokenInfo.authenticated) {
        this.scheduleNextRefresh(provider);
        console.log(`Auto refresh setup for ${provider}`);
      }
    } catch (error) {
      console.error(`Failed to setup auto refresh for ${provider}:`, error);
    }
  }

  /**
   * Schedule next token refresh
   * @param {string} provider - OAuth2 provider
   */
  scheduleNextRefresh(provider) {
    // Clear existing timer
    this.clearRefreshTimer(provider);

    const tokenInfo = this.getTokenInfo(provider);
    if (!tokenInfo.exists || !tokenInfo.authenticated) {
      return;
    }

    let refreshInterval;
    if (provider === 'gmail' && tokenInfo.expiresAt) {
      // Refresh 5 minutes before expiration
      const timeUntilExpiry = tokenInfo.expiresAt.getTime() - Date.now();
      refreshInterval = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // Min 1 minute
    } else {
      // Default refresh every 30 minutes for providers without explicit expiry
      refreshInterval = 30 * 60 * 1000;
    }

    const timer = setTimeout(async () => {
      console.log(`Auto refreshing token for ${provider}`);
      const success = await this.refreshToken(provider);
      
      if (success) {
        // Schedule next refresh
        this.scheduleNextRefresh(provider);
      } else {
        console.warn(`Auto refresh failed for ${provider}, clearing timer`);
      }
    }, refreshInterval);

    this.refreshTimers.set(provider, timer);
    
    console.log(`Next refresh scheduled for ${provider} in ${Math.round(refreshInterval / 1000 / 60)} minutes`);
  }

  /**
   * Clear refresh timer for provider
   * @param {string} provider - OAuth2 provider
   */
  clearRefreshTimer(provider) {
    const timer = this.refreshTimers.get(provider);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(provider);
    }
  }

  /**
   * Clear all refresh timers
   */
  clearAllTimers() {
    for (const [provider] of this.refreshTimers) {
      this.clearRefreshTimer(provider);
    }
  }

  /**
   * Monitor token health for all providers
   * @returns {Object} - Health status
   */
  async monitorTokenHealth() {
    const health = {
      overall: 'healthy',
      providers: {},
      lastCheck: new Date().toISOString(),
      issues: []
    };

    for (const provider of ['gmail', 'outlook']) {
      try {
        const tokenInfo = this.getTokenInfo(provider);
        const validation = await this.validateToken(provider);
        
        health.providers[provider] = {
          status: validation.valid ? 'healthy' : 'unhealthy',
          authenticated: tokenInfo.authenticated,
          lastValidated: validation.validatedAt,
          error: validation.error
        };

        if (!validation.valid && tokenInfo.authenticated) {
          health.issues.push(`${provider}: ${validation.error}`);
          health.overall = 'degraded';
        }
      } catch (error) {
        health.providers[provider] = {
          status: 'error',
          error: error.message
        };
        health.issues.push(`${provider}: ${error.message}`);
        health.overall = 'unhealthy';
      }
    }

    return health;
  }

  // Private helper methods

  /**
   * Get OAuth2 service for provider
   * @param {string} provider - OAuth2 provider
   * @returns {Object} - OAuth2 service
   */
  getService(provider) {
    switch (provider) {
      case 'gmail':
        return gmailOAuth2Service;
      case 'outlook':
        return outlookOAuth2Service;
      default:
        return null;
    }
  }

  /**
   * Check if token is expired
   * @param {number} expiryDate - Token expiry timestamp
   * @returns {boolean} - Is expired
   */
  isTokenExpired(expiryDate) {
    if (!expiryDate) return false;
    return Date.now() >= expiryDate;
  }

  /**
   * Get error code from error
   * @param {Error} error - Error object
   * @returns {string} - Error code
   */
  getErrorCode(error) {
    if (error.message.includes('invalid_grant')) return OAUTH2_ERRORS.INVALID_GRANT;
    if (error.message.includes('invalid_client')) return OAUTH2_ERRORS.INVALID_CLIENT;
    if (error.message.includes('token_expired')) return OAUTH2_ERRORS.TOKEN_EXPIRED;
    if (error.message.includes('network')) return OAUTH2_ERRORS.NETWORK_ERROR;
    return 'unknown_error';
  }

  /**
   * Encrypt token for storage (placeholder - implement with crypto library)
   * @param {string} token - Token to encrypt
   * @returns {string} - Encrypted token
   */
  encryptToken(token) {
    // TODO: Implement actual encryption
    return btoa(token);
  }

  /**
   * Decrypt token from storage (placeholder - implement with crypto library)
   * @param {string} encryptedToken - Encrypted token
   * @returns {string} - Decrypted token
   */
  decryptToken(encryptedToken) {
    // TODO: Implement actual decryption
    try {
      return atob(encryptedToken);
    } catch {
      return encryptedToken; // Fallback for unencrypted tokens
    }
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.clearAllTimers();
    console.log('Token manager destroyed');
  }
}

// Export singleton instance
export const tokenManager = new TokenManager();
export default tokenManager;
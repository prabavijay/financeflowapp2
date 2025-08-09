/**
 * OAuth2 Security Utilities
 * Provides security validation and protection for OAuth2 operations
 */

import { OAUTH2_CONFIG, OAUTH2_ERRORS } from '../config/oauth2Config';

/**
 * Security validation results
 */
export const SECURITY_LEVELS = {
  SECURE: 'secure',
  WARNING: 'warning',
  VULNERABLE: 'vulnerable'
};

/**
 * OAuth2 Security Validator
 */
export class OAuth2SecurityValidator {
  /**
   * Validate OAuth2 configuration security
   * @param {string} provider - OAuth2 provider
   * @returns {Object} - Security validation result
   */
  static validateConfiguration(provider) {
    const config = OAUTH2_CONFIG[provider];
    if (!config) {
      return {
        level: SECURITY_LEVELS.VULNERABLE,
        issues: ['Invalid or missing provider configuration'],
        recommendations: ['Verify provider configuration exists']
      };
    }

    const issues = [];
    const recommendations = [];

    // Check client ID format and security
    if (!config.clientId || config.clientId.includes('your-')) {
      issues.push('Client ID not properly configured');
      recommendations.push('Set proper OAuth2 client ID from provider console');
    }

    // Check redirect URI security
    if (config.redirectUri) {
      if (!config.redirectUri.startsWith('https://') && 
          !config.redirectUri.startsWith('http://localhost')) {
        issues.push('Redirect URI should use HTTPS in production');
        recommendations.push('Configure HTTPS redirect URI for production use');
      }
    }

    // Check scope configuration
    if (!config.scopes || config.scopes.length === 0) {
      issues.push('No OAuth2 scopes configured');
      recommendations.push('Configure minimum required scopes');
    }

    // Provider-specific validations
    if (provider === 'gmail') {
      if (!config.clientSecret && process.env.NODE_ENV === 'development') {
        issues.push('Client secret missing (required for server-side flows)');
        recommendations.push('Consider using PKCE flow for enhanced security');
      }
    }

    if (provider === 'outlook') {
      if (!config.tenantId) {
        issues.push('Tenant ID not configured for Microsoft OAuth2');
        recommendations.push('Configure tenant ID for proper access control');
      }
    }

    // Determine security level
    let level = SECURITY_LEVELS.SECURE;
    if (issues.length > 0) {
      level = issues.some(issue => 
        issue.includes('HTTPS') || 
        issue.includes('secret') || 
        issue.includes('configured')
      ) ? SECURITY_LEVELS.VULNERABLE : SECURITY_LEVELS.WARNING;
    }

    return {
      level,
      issues,
      recommendations,
      validatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate token security
   * @param {Object} tokenData - Token information
   * @returns {Object} - Token security validation
   */
  static validateTokenSecurity(tokenData) {
    const issues = [];
    const recommendations = [];

    if (!tokenData) {
      return {
        level: SECURITY_LEVELS.VULNERABLE,
        issues: ['No token data provided'],
        recommendations: ['Ensure proper token management']
      };
    }

    // Check token expiration
    if (tokenData.expiresAt) {
      const expiresAt = new Date(tokenData.expiresAt);
      const now = new Date();
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

      if (timeUntilExpiry <= 0) {
        issues.push('Access token has expired');
        recommendations.push('Refresh access token immediately');
      } else if (hoursUntilExpiry < 1) {
        issues.push('Access token expires soon');
        recommendations.push('Schedule token refresh');
      }
    }

    // Check refresh token presence
    if (!tokenData.hasRefreshToken && tokenData.provider === 'gmail') {
      issues.push('No refresh token available');
      recommendations.push('Re-authenticate with consent prompt to get refresh token');
    }

    // Check token scope validation
    if (tokenData.scopes && Array.isArray(tokenData.scopes)) {
      const requiredScopes = OAUTH2_CONFIG[tokenData.provider]?.scopes || [];
      const missingScopes = requiredScopes.filter(scope => 
        !tokenData.scopes.includes(scope)
      );

      if (missingScopes.length > 0) {
        issues.push(`Missing required scopes: ${missingScopes.join(', ')}`);
        recommendations.push('Re-authenticate with all required scopes');
      }
    }

    // Determine security level
    let level = SECURITY_LEVELS.SECURE;
    if (issues.length > 0) {
      level = issues.some(issue => 
        issue.includes('expired') || 
        issue.includes('Missing required')
      ) ? SECURITY_LEVELS.VULNERABLE : SECURITY_LEVELS.WARNING;
    }

    return {
      level,
      issues,
      recommendations,
      validatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate request security
   * @param {Object} requestContext - Request context information
   * @returns {Object} - Request security validation
   */
  static validateRequestSecurity(requestContext) {
    const issues = [];
    const recommendations = [];

    // Check HTTPS usage
    if (requestContext.protocol && requestContext.protocol !== 'https:' && 
        !requestContext.hostname?.includes('localhost')) {
      issues.push('OAuth2 requests should use HTTPS in production');
      recommendations.push('Configure HTTPS for production deployments');
    }

    // Check origin validation
    if (requestContext.origin) {
      const allowedOrigins = import.meta.env.VITE_ALLOWED_ORIGINS?.split(',') || [];
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(requestContext.origin)) {
        issues.push('Request origin not in allowed list');
        recommendations.push('Verify allowed origins configuration');
      }
    }

    // Check state parameter
    if (requestContext.hasStateParameter === false) {
      issues.push('Missing state parameter for CSRF protection');
      recommendations.push('Always include state parameter in OAuth2 flows');
    }

    // Check code verifier for PKCE
    if (requestContext.usesPKCE === false && requestContext.isPublicClient) {
      issues.push('Public client should use PKCE for enhanced security');
      recommendations.push('Implement PKCE (Proof Key for Code Exchange)');
    }

    let level = SECURITY_LEVELS.SECURE;
    if (issues.length > 0) {
      level = issues.some(issue => 
        issue.includes('HTTPS') || 
        issue.includes('CSRF') || 
        issue.includes('origin')
      ) ? SECURITY_LEVELS.VULNERABLE : SECURITY_LEVELS.WARNING;
    }

    return {
      level,
      issues,
      recommendations,
      validatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate comprehensive security report
   * @param {string} provider - OAuth2 provider
   * @param {Object} tokenData - Token information
   * @param {Object} requestContext - Request context
   * @returns {Object} - Complete security report
   */
  static generateSecurityReport(provider, tokenData = null, requestContext = null) {
    const configValidation = this.validateConfiguration(provider);
    const tokenValidation = tokenData ? this.validateTokenSecurity(tokenData) : null;
    const requestValidation = requestContext ? this.validateRequestSecurity(requestContext) : null;

    // Aggregate issues and recommendations
    const allIssues = [
      ...configValidation.issues,
      ...(tokenValidation?.issues || []),
      ...(requestValidation?.issues || [])
    ];

    const allRecommendations = [
      ...configValidation.recommendations,
      ...(tokenValidation?.recommendations || []),
      ...(requestValidation?.recommendations || [])
    ];

    // Determine overall security level
    const levels = [
      configValidation.level,
      tokenValidation?.level,
      requestValidation?.level
    ].filter(Boolean);

    let overallLevel = SECURITY_LEVELS.SECURE;
    if (levels.includes(SECURITY_LEVELS.VULNERABLE)) {
      overallLevel = SECURITY_LEVELS.VULNERABLE;
    } else if (levels.includes(SECURITY_LEVELS.WARNING)) {
      overallLevel = SECURITY_LEVELS.WARNING;
    }

    return {
      provider,
      overallSecurity: overallLevel,
      summary: {
        totalIssues: allIssues.length,
        criticalIssues: allIssues.filter(issue => 
          issue.includes('expired') || 
          issue.includes('HTTPS') || 
          issue.includes('configured')
        ).length,
        warningIssues: allIssues.length - allIssues.filter(issue => 
          issue.includes('expired') || 
          issue.includes('HTTPS') || 
          issue.includes('configured')
        ).length
      },
      validations: {
        configuration: configValidation,
        token: tokenValidation,
        request: requestValidation
      },
      allIssues,
      allRecommendations,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Check if operation is secure enough to proceed
   * @param {Object} securityReport - Security report from generateSecurityReport
   * @param {string} minLevel - Minimum required security level
   * @returns {boolean} - Whether operation can proceed
   */
  static canProceedSecurely(securityReport, minLevel = SECURITY_LEVELS.WARNING) {
    if (minLevel === SECURITY_LEVELS.SECURE) {
      return securityReport.overallSecurity === SECURITY_LEVELS.SECURE;
    } else if (minLevel === SECURITY_LEVELS.WARNING) {
      return securityReport.overallSecurity !== SECURITY_LEVELS.VULNERABLE;
    }
    return true; // Allow all levels
  }
}

/**
 * Security monitoring utilities
 */
export class OAuth2SecurityMonitor {
  constructor() {
    this.securityEvents = [];
    this.maxEvents = 1000;
  }

  /**
   * Log security event
   * @param {Object} event - Security event
   */
  logSecurityEvent(event) {
    const securityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      id: this.generateEventId()
    };

    this.securityEvents.unshift(securityEvent);
    
    // Keep only recent events
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(0, this.maxEvents);
    }

    // Console log critical events
    if (event.level === SECURITY_LEVELS.VULNERABLE) {
      console.warn('OAuth2 Security Event (CRITICAL):', securityEvent);
    }
  }

  /**
   * Get recent security events
   * @param {number} limit - Number of events to return
   * @returns {Array} - Recent security events
   */
  getRecentEvents(limit = 10) {
    return this.securityEvents.slice(0, limit);
  }

  /**
   * Get security statistics
   * @returns {Object} - Security statistics
   */
  getSecurityStats() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.securityEvents.filter(event => 
      new Date(event.timestamp) > last24Hours
    );

    return {
      totalEvents: this.securityEvents.length,
      recentEvents: recentEvents.length,
      criticalEvents: recentEvents.filter(event => 
        event.level === SECURITY_LEVELS.VULNERABLE
      ).length,
      warningEvents: recentEvents.filter(event => 
        event.level === SECURITY_LEVELS.WARNING
      ).length,
      lastEvent: this.securityEvents[0]?.timestamp || null
    };
  }

  /**
   * Generate unique event ID
   * @returns {string} - Event ID
   */
  generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const oauth2SecurityMonitor = new OAuth2SecurityMonitor();
export default OAuth2SecurityValidator;
# OAuth2 Setup Guide for FinanceFlow Email Receipt Processing

This guide provides comprehensive instructions for setting up OAuth2 authentication for Gmail and Microsoft Outlook/Office 365 email receipt processing in FinanceFlow.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Gmail OAuth2 Setup](#gmail-oauth2-setup)
4. [Microsoft Outlook OAuth2 Setup](#microsoft-outlook-oauth2-setup)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)

## Overview

FinanceFlow uses OAuth2 authentication to securely access user email accounts for automated receipt processing. This implementation supports:

- **Gmail**: Using Google APIs and OAuth2 with PKCE
- **Microsoft Outlook**: Using Microsoft Graph API and MSAL
- **Security Features**: Token management, automatic refresh, error handling
- **Testing Tools**: Comprehensive validation and monitoring

### Features
- ✅ Secure OAuth2 authentication with PKCE
- ✅ Automatic token refresh
- ✅ Multi-provider support (Gmail, Outlook)
- ✅ Email search and receipt detection
- ✅ Security monitoring and validation
- ✅ Comprehensive error handling
- ✅ Testing and debugging tools

## Prerequisites

Before setting up OAuth2 authentication, ensure you have:

1. **Developer Accounts**:
   - Google Cloud Console account
   - Microsoft Azure account (for Outlook)

2. **Application Domain**:
   - HTTPS domain for production (required by OAuth2 providers)
   - Localhost is acceptable for development

3. **Dependencies**:
   ```bash
   npm install googleapis @azure/msal-browser
   ```

## Gmail OAuth2 Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

### Step 2: Configure OAuth2 Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless using Google Workspace)
3. Fill in required information:
   - **App name**: FinanceFlow
   - **User support email**: Your email
   - **App domain**: Your domain (e.g., `https://yourapp.com`)
   - **Developer contact**: Your email

4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.metadata`

### Step 3: Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Configure:
   - **Name**: FinanceFlow Gmail Integration
   - **Authorized origins**: 
     - `http://localhost:5173` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:5173/oauth2/gmail/callback`
     - `https://yourdomain.com/oauth2/gmail/callback`

5. Save and note the **Client ID** and **Client Secret**

### Step 4: Environment Configuration

Add to your `.env` file:
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:5173/oauth2/gmail/callback
```

## Microsoft Outlook OAuth2 Setup

### Step 1: Register Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Configure:
   - **Name**: FinanceFlow Outlook Integration
   - **Supported account types**: Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI**: 
     - Type: Single-page application (SPA)
     - URI: `http://localhost:5173` (development)

### Step 2: Configure API Permissions

1. In your app registration, go to "API permissions"
2. Click "Add a permission" > "Microsoft Graph"
3. Select "Delegated permissions"
4. Add these permissions:
   - `Mail.Read`
   - `Mail.ReadBasic`
   - `User.Read`

5. Click "Grant admin consent" (if you have admin privileges)

### Step 3: Configure Authentication

1. Go to "Authentication" in your app registration
2. Under "Single-page application", add redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)

3. Under "Advanced settings":
   - Enable "Access tokens"
   - Enable "ID tokens"

### Step 4: Environment Configuration

Add to your `.env` file:
```env
REACT_APP_MICROSOFT_CLIENT_ID=your-microsoft-client-id
REACT_APP_MICROSOFT_TENANT_ID=common
REACT_APP_MICROSOFT_REDIRECT_URI=http://localhost:5173
```

## Configuration

### OAuth2 Configuration File

The OAuth2 configuration is managed in `src/config/oauth2Config.js`:

```javascript
export const OAUTH2_CONFIG = {
  gmail: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI,
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata'
    ]
  },
  outlook: {
    clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
    tenantId: process.env.REACT_APP_MICROSOFT_TENANT_ID,
    redirectUri: process.env.REACT_APP_MICROSOFT_REDIRECT_URI,
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/User.Read'
    ]
  }
};
```

### Provider Configuration

Each provider has specific configuration in `OAUTH2_PROVIDERS`:

```javascript
export const OAUTH2_PROVIDERS = {
  gmail: {
    name: 'gmail',
    displayName: 'Gmail',
    icon: '📧',
    color: '#ea4335',
    description: 'Connect your Gmail account for receipt processing',
    setupUrl: 'https://console.cloud.google.com/',
    supportedFeatures: ['email-search', 'receipt-detection', 'attachments'],
    limitations: ['Read-only access', 'Rate limited API calls']
  },
  outlook: {
    name: 'outlook',
    displayName: 'Outlook',
    icon: '📬',
    color: '#0078d4',
    description: 'Connect your Outlook/Office 365 account',
    setupUrl: 'https://portal.azure.com/',
    supportedFeatures: ['email-search', 'receipt-detection', 'folders'],
    limitations: ['Requires Microsoft Graph permissions']
  }
};
```

## Testing

### Using the Test Dashboard

1. Navigate to Email Receipt Processor > Security tab > Testing & Validation
2. Select providers to test
3. Click "Run Tests"
4. Review results and export if needed

### Manual Testing

```javascript
import { oauth2TestSuite } from '../utils/oauth2Testing';

// Run tests for all providers
const results = await oauth2TestSuite.runAllTests(['gmail', 'outlook']);
console.log('Test results:', results);

// Export results
const htmlReport = oauth2TestSuite.exportResults('html');
```

### Test Categories

1. **Configuration Tests**: Verify OAuth2 setup
2. **Service Tests**: Check service initialization
3. **Token Tests**: Validate token operations
4. **API Tests**: Test email API calls
5. **Security Tests**: Verify security features
6. **Integration Tests**: Test system integration

## Security Considerations

### Token Security

- Tokens are stored in localStorage (consider encryption for production)
- Automatic token refresh prevents expiration
- Secure token validation and health monitoring

### OAuth2 Security Features

- **PKCE (Proof Key for Code Exchange)**: Implemented for Gmail
- **State Parameter**: CSRF protection for all flows
- **HTTPS Enforcement**: Required for production
- **Scope Limitation**: Minimal required permissions

### Security Monitoring

The application includes comprehensive security monitoring:

```javascript
import { oauth2SecurityMonitor } from '../utils/oauth2Security';

// Monitor security events
oauth2SecurityMonitor.logSecurityEvent({
  type: 'connection_attempt',
  level: 'secure',
  message: 'OAuth2 connection initiated',
  provider: 'gmail'
});

// Get security statistics
const stats = oauth2SecurityMonitor.getSecurityStats();
```

### Best Practices

1. **Environment Variables**: Never commit credentials to version control
2. **HTTPS Only**: Use HTTPS in production
3. **Token Rotation**: Implement regular token refresh
4. **Error Handling**: Comprehensive error boundaries
5. **Logging**: Security event monitoring
6. **Access Control**: Minimal required scopes

## Troubleshooting

### Common Issues

#### Gmail Issues

**Error: `invalid_client`**
- Solution: Verify Client ID and Client Secret in environment variables
- Check: Google Cloud Console credentials configuration

**Error: `redirect_uri_mismatch`**
- Solution: Ensure redirect URI matches exactly in Google Cloud Console
- Check: Protocol (http vs https) and port numbers

**Error: `access_denied`**
- Solution: User denied permission or app not verified
- Check: OAuth consent screen configuration

#### Outlook Issues

**Error: `AADSTS50011: redirect_uri_mismatch`**
- Solution: Verify redirect URI in Azure app registration
- Check: Single-page application configuration

**Error: `AADSTS65001: consent_required`**
- Solution: User needs to consent to permissions
- Check: API permissions configuration

**Error: `invalid_scope`**
- Solution: Verify Microsoft Graph API permissions
- Check: Delegated permissions vs Application permissions

### Debug Mode

Enable debug logging:

```javascript
// Set in development environment
localStorage.setItem('oauth2_debug', 'true');

// View debug information in OAuth2AuthFlow component
<OAuth2AuthFlow showAdvanced={true} />
```

### Network Issues

**CORS Errors**:
- Ensure proper origin configuration in OAuth2 providers
- Check browser network tab for blocked requests

**Timeout Issues**:
- Increase timeout values in service configurations
- Check network connectivity and firewall settings

## API Reference

### Gmail OAuth2 Service

```javascript
import gmailOAuth2Service from '../services/gmailOAuth2';

// Initialize service
await gmailOAuth2Service.initialize();

// Get authorization URL
const authUrl = gmailOAuth2Service.getAuthUrl();

// Handle callback
const result = await gmailOAuth2Service.handleAuthCallback(code, state);

// Search emails
const emails = await gmailOAuth2Service.searchReceiptEmails({
  keywords: ['receipt', 'invoice'],
  maxResults: 50
});
```

### Outlook OAuth2 Service

```javascript
import outlookOAuth2Service from '../services/outlookOAuth2';

// Initialize service
await outlookOAuth2Service.initialize();

// Sign in with popup
const result = await outlookOAuth2Service.signInPopup();

// Get messages
const messages = await outlookOAuth2Service.getMessages({
  filter: "contains(subject,'receipt')",
  top: 50
});
```

### Token Manager

```javascript
import tokenManager from '../services/tokenManager';

// Initialize token manager
await tokenManager.initialize();

// Get access token
const token = await tokenManager.getAccessToken('gmail');

// Validate token
const validation = await tokenManager.validateToken('outlook');

// Monitor token health
const health = await tokenManager.monitorTokenHealth();
```

### Security Validator

```javascript
import OAuth2SecurityValidator from '../utils/oauth2Security';

// Generate security report
const report = OAuth2SecurityValidator.generateSecurityReport('gmail');

// Check if operation can proceed
const canProceed = OAuth2SecurityValidator.canProceedSecurely(report);
```

## Support

For additional support:

1. **Security Tab**: Use the built-in security monitoring and testing tools
2. **Browser Console**: Check for error messages and debug information
3. **Network Tab**: Monitor OAuth2 requests and responses
4. **Provider Documentation**:
   - [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
   - [Microsoft Graph Authentication](https://docs.microsoft.com/en-us/graph/auth/)

## Changelog

### Version 1.0 (Current)
- Initial OAuth2 implementation
- Gmail and Outlook support
- Security monitoring and testing
- Comprehensive error handling
- Token management with automatic refresh

---

*This documentation is maintained as part of the FinanceFlow project. For updates and additional information, refer to the project repository.*
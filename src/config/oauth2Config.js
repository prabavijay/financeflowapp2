/**
 * OAuth2 Configuration for Email Providers
 * Supports Gmail (Google) and Outlook (Microsoft) OAuth2 authentication
 */

// OAuth2 Configuration
export const OAUTH2_CONFIG = {
  // Gmail/Google OAuth2 Configuration
  gmail: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '', // Not used in frontend
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/oauth/callback/gmail` : 'http://localhost:5173/oauth/callback/gmail',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ],
    discoveryUrl: 'https://accounts.google.com/.well-known/openid_configuration',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },

  // Microsoft/Outlook OAuth2 Configuration
  outlook: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || 'your-microsoft-client-id',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/oauth/callback/outlook` : 'http://localhost:5173/oauth/callback/outlook',
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.ReadBasic',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/offline_access'
    ],
    graphEndpoint: 'https://graph.microsoft.com/v1.0',
    userInfoEndpoint: 'https://graph.microsoft.com/v1.0/me',
    mailEndpoint: 'https://graph.microsoft.com/v1.0/me/messages'
  },

  // Yahoo OAuth2 Configuration (future implementation)
  yahoo: {
    clientId: import.meta.env.VITE_YAHOO_CLIENT_ID || 'your-yahoo-client-id',
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/oauth/callback/yahoo` : 'http://localhost:5173/oauth/callback/yahoo',
    scopes: ['mail-r', 'openid', 'profile'],
    authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
    tokenUrl: 'https://api.login.yahoo.com/oauth2/get_token'
  }
};

// MSAL (Microsoft Authentication Library) Configuration
export const MSAL_CONFIG = {
  auth: {
    clientId: OAUTH2_CONFIG.outlook.clientId,
    authority: OAUTH2_CONFIG.outlook.authority,
    redirectUri: OAUTH2_CONFIG.outlook.redirectUri,
    postLogoutRedirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
    navigateToLoginRequestUrl: false
  },
  cache: {
    cacheLocation: 'localStorage', // Store tokens in localStorage
    storeAuthStateInCookie: true, // Recommended for IE11 or Edge
    secureCookies: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case 'Error':
            console.error(message);
            break;
          case 'Info':
            console.info(message);
            break;
          case 'Verbose':
            console.debug(message);
            break;
          case 'Warning':
            console.warn(message);
            break;
        }
      },
      piiLoggingEnabled: false
    },
    allowNativeBroker: false
  }
};

// OAuth2 Scopes for different operations
export const OAUTH2_SCOPES = {
  gmail: {
    read: ['https://www.googleapis.com/auth/gmail.readonly'],
    metadata: ['https://www.googleapis.com/auth/gmail.metadata'],
    profile: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    full: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  },
  outlook: {
    read: ['https://graph.microsoft.com/Mail.Read'],
    metadata: ['https://graph.microsoft.com/Mail.ReadBasic'],
    profile: ['https://graph.microsoft.com/User.Read'],
    offline: ['https://graph.microsoft.com/offline_access'],
    full: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.ReadBasic',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/offline_access'
    ]
  }
};

// OAuth2 Error Codes and Messages
export const OAUTH2_ERRORS = {
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  INVALID_SCOPE: 'invalid_scope',
  ACCESS_DENIED: 'access_denied',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
  INVALID_REQUEST: 'invalid_request',
  LOGIN_REQUIRED: 'login_required',
  CONSENT_REQUIRED: 'consent_required',
  INTERACTION_REQUIRED: 'interaction_required',
  TOKEN_EXPIRED: 'token_expired',
  NETWORK_ERROR: 'network_error'
};

// OAuth2 Error Messages
export const OAUTH2_ERROR_MESSAGES = {
  [OAUTH2_ERRORS.INVALID_CLIENT]: 'Invalid client configuration. Please check your OAuth2 settings.',
  [OAUTH2_ERRORS.INVALID_GRANT]: 'Invalid or expired authorization grant.',
  [OAUTH2_ERRORS.INVALID_SCOPE]: 'Requested scope is invalid or not supported.',
  [OAUTH2_ERRORS.ACCESS_DENIED]: 'Access denied. User cancelled the authorization.',
  [OAUTH2_ERRORS.UNAUTHORIZED_CLIENT]: 'Client is not authorized to use this method.',
  [OAUTH2_ERRORS.UNSUPPORTED_RESPONSE_TYPE]: 'Unsupported response type.',
  [OAUTH2_ERRORS.INVALID_REQUEST]: 'Invalid OAuth2 request.',
  [OAUTH2_ERRORS.LOGIN_REQUIRED]: 'Login is required to continue.',
  [OAUTH2_ERRORS.CONSENT_REQUIRED]: 'User consent is required.',
  [OAUTH2_ERRORS.INTERACTION_REQUIRED]: 'User interaction is required.',
  [OAUTH2_ERRORS.TOKEN_EXPIRED]: 'Access token has expired. Please re-authenticate.',
  [OAUTH2_ERRORS.NETWORK_ERROR]: 'Network error occurred during authentication.'
};

// Token storage keys
export const TOKEN_STORAGE = {
  GMAIL_ACCESS_TOKEN: 'gmail_access_token',
  GMAIL_REFRESH_TOKEN: 'gmail_refresh_token',
  GMAIL_TOKEN_EXPIRES: 'gmail_token_expires',
  OUTLOOK_ACCESS_TOKEN: 'outlook_access_token',
  OUTLOOK_REFRESH_TOKEN: 'outlook_refresh_token',
  OUTLOOK_TOKEN_EXPIRES: 'outlook_token_expires',
  USER_INFO: 'oauth2_user_info'
};

// OAuth2 Provider Information
export const OAUTH2_PROVIDERS = {
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    displayName: 'Google Gmail',
    icon: '📧',
    color: '#db4437',
    description: 'Connect your Gmail account securely using Google OAuth2',
    requiresSetup: true,
    setupUrl: 'https://console.developers.google.com/',
    supportedFeatures: ['read', 'search', 'attachments', 'labels'],
    limitations: ['No folder creation', 'Read-only access']
  },
  outlook: {
    id: 'outlook',
    name: 'Outlook',
    displayName: 'Microsoft Outlook',
    icon: '📬',
    color: '#0078d4',
    description: 'Connect your Outlook/Hotmail account using Microsoft OAuth2',
    requiresSetup: true,
    setupUrl: 'https://portal.azure.com/',
    supportedFeatures: ['read', 'search', 'attachments', 'folders'],
    limitations: ['Read-only access', 'Microsoft 365 integration']
  },
  yahoo: {
    id: 'yahoo',
    name: 'Yahoo',
    displayName: 'Yahoo Mail',
    icon: '📮',
    color: '#410093',
    description: 'Connect your Yahoo Mail account (Coming Soon)',
    requiresSetup: true,
    setupUrl: 'https://developer.yahoo.com/',
    supportedFeatures: ['read', 'search'],
    limitations: ['Limited API access', 'Under development'],
    comingSoon: true
  }
};

// Development/Testing Configuration
export const DEV_CONFIG = {
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  mockAuth: import.meta.env.VITE_MOCK_OAUTH === 'true',
  skipTokenValidation: import.meta.env.VITE_SKIP_TOKEN_VALIDATION === 'true',
  testUserEmail: import.meta.env.VITE_TEST_USER_EMAIL || 'test@example.com'
};

// Export default configuration
export default OAUTH2_CONFIG;
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  ExternalLink,
  Lock,
  User,
  Settings,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { OAUTH2_PROVIDERS, OAUTH2_ERROR_MESSAGES } from '../config/oauth2Config';
import gmailOAuth2Service from '../services/gmailOAuth2';
import outlookOAuth2Service from '../services/outlookOAuth2';

export default function OAuth2AuthFlow({ 
  provider, 
  onAuthSuccess, 
  onAuthError, 
  isOpen, 
  onClose,
  showAdvanced = false 
}) {
  const [authState, setAuthState] = useState('idle'); // idle, authenticating, success, error
  const [authProgress, setAuthProgress] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showTokens, setShowTokens] = useState(false);
  const [authService, setAuthService] = useState(null);

  const providerConfig = OAUTH2_PROVIDERS[provider];

  useEffect(() => {
    if (provider && isOpen) {
      initializeService();
    }
  }, [provider, isOpen]);

  const initializeService = async () => {
    try {
      let service;
      if (provider === 'gmail') {
        service = gmailOAuth2Service;
      } else if (provider === 'outlook') {
        service = outlookOAuth2Service;
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      await service.initialize();
      setAuthService(service);

      // Check if already authenticated
      if (service.isAuthenticated()) {
        setAuthState('success');
        setUserInfo(service.userInfo);
      }
    } catch (error) {
      console.error('Error initializing OAuth2 service:', error);
      setError({
        code: 'initialization_error',
        message: error.message
      });
      setAuthState('error');
    }
  };

  const handleAuth = async () => {
    if (!authService) {
      toast.error('Authentication service not initialized');
      return;
    }

    try {
      setAuthState('authenticating');
      setAuthProgress(10);
      setError(null);

      let result;
      if (provider === 'gmail') {
        // Gmail uses redirect flow
        setAuthProgress(30);
        const authUrl = authService.getAuthUrl();
        setAuthProgress(50);
        
        // Open popup for authentication
        const popup = window.open(
          authUrl, 
          'gmail-auth', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Monitor popup for callback
        result = await monitorAuthPopup(popup, 'gmail');
      } else if (provider === 'outlook') {
        // Outlook uses popup flow
        setAuthProgress(30);
        result = await authService.signInPopup();
        setAuthProgress(80);
      }

      setAuthProgress(90);

      if (result && result.success) {
        setAuthState('success');
        setUserInfo(result.user);
        setAuthProgress(100);
        
        toast.success(`Successfully connected to ${providerConfig.displayName}`);
        
        if (onAuthSuccess) {
          onAuthSuccess({
            provider,
            user: result.user,
            accessToken: result.accessToken
          });
        }
      } else {
        throw new Error(result?.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthState('error');
      setError({
        code: error.errorCode || 'auth_error',
        message: error.message || 'Authentication failed'
      });
      setAuthProgress(0);
      
      toast.error(`Authentication failed: ${error.message}`);
      
      if (onAuthError) {
        onAuthError({
          provider,
          error: error.message,
          code: error.errorCode
        });
      }
    }
  };

  const handleSignOut = async () => {
    if (!authService) return;

    try {
      await authService.signOut();
      setAuthState('idle');
      setUserInfo(null);
      setError(null);
      
      toast.success(`Signed out from ${providerConfig.displayName}`);
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error(`Sign out failed: ${error.message}`);
    }
  };

  const handleRefreshToken = async () => {
    if (!authService) return;

    try {
      if (provider === 'gmail') {
        const success = await authService.refreshToken();
        if (success) {
          toast.success('Token refreshed successfully');
        } else {
          toast.error('Token refresh failed');
        }
      } else if (provider === 'outlook') {
        // For Outlook, token refresh is handled automatically by MSAL
        toast.success('Token will be refreshed automatically');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      toast.error(`Token refresh failed: ${error.message}`);
    }
  };

  const monitorAuthPopup = (popup, provider) => {
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentication popup was closed'));
        }
      }, 1000);

      // Listen for messages from popup
      const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'oauth2-callback') {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          popup.close();

          if (event.data.success) {
            resolve(event.data);
          } else {
            reject(new Error(event.data.error));
          }
        }
      };

      window.addEventListener('message', messageListener);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  };

  const renderAuthenticationState = () => {
    switch (authState) {
      case 'idle':
        return (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">{providerConfig.icon}</div>
            <h3 className="text-xl font-semibold">{providerConfig.displayName}</h3>
            <p className="text-gray-600">{providerConfig.description}</p>
            
            {providerConfig.comingSoon ? (
              <Badge variant="secondary" className="mb-4">
                Coming Soon
              </Badge>
            ) : (
              <Button 
                onClick={handleAuth}
                className="w-full"
                style={{ backgroundColor: providerConfig.color }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Connect {providerConfig.name}
              </Button>
            )}

            <div className="text-sm text-gray-500 space-y-1">
              <p><strong>Supported Features:</strong></p>
              <div className="flex flex-wrap gap-1 justify-center">
                {providerConfig.supportedFeatures.map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {providerConfig.limitations && (
              <div className="text-sm text-gray-500">
                <p><strong>Limitations:</strong></p>
                <ul className="text-xs space-y-1">
                  {providerConfig.limitations.map((limitation, index) => (
                    <li key={index}>• {limitation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'authenticating':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Authenticating...</h3>
            <p className="text-gray-600">
              Please complete the authentication in the popup window
            </p>
            <Progress value={authProgress} className="w-full" />
            <p className="text-sm text-gray-500">
              {authProgress < 30 && 'Initializing authentication...'}
              {authProgress >= 30 && authProgress < 80 && 'Waiting for user consent...'}
              {authProgress >= 80 && 'Finalizing authentication...'}
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Connected Successfully!</h3>
            
            {userInfo && (
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{userInfo.name}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm text-gray-600">{userInfo.email}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={handleRefreshToken}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold">Authentication Failed</h3>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {OAUTH2_ERROR_MESSAGES[error.code] || error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-center">
              <Button onClick={handleAuth}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => {
                setAuthState('idle');
                setError(null);
              }}>
                Cancel
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderAdvancedInfo = () => {
    if (!showAdvanced) return null;

    return (
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Required:</strong> You need to configure OAuth2 credentials for {providerConfig.displayName}.
              <br />
              <a 
                href={providerConfig.setupUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
              >
                Visit Developer Console <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          <div className="text-sm space-y-2">
            <h4 className="font-medium">Required Scopes:</h4>
            <div className="bg-gray-50 p-3 rounded-lg">
              <code className="text-xs">
                {provider === 'gmail' ? 
                  'https://www.googleapis.com/auth/gmail.readonly' :
                  'https://graph.microsoft.com/Mail.Read'
                }
              </code>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Features:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• OAuth2 with PKCE (Proof Key for Code Exchange)</li>
                <li>• Secure token storage with automatic refresh</li>
                <li>• Read-only access to email messages</li>
                <li>• No password storage required</li>
              </ul>
            </AlertDescription>
          </Alert>

          {authService && authService.isAuthenticated() && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Access Tokens</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTokens(!showTokens)}
                >
                  {showTokens ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
              
              {showTokens && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Tokens are encrypted and stored securely in localStorage
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
            <div><strong>Provider:</strong> {provider}</div>
            <div><strong>State:</strong> {authState}</div>
            <div><strong>Service Initialized:</strong> {authService ? 'Yes' : 'No'}</div>
            <div><strong>Authenticated:</strong> {authService?.isAuthenticated() ? 'Yes' : 'No'}</div>
            {userInfo && (
              <div><strong>User ID:</strong> {userInfo.id}</div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg text-sm">
              <div><strong>Error Code:</strong> {error.code}</div>
              <div><strong>Error Message:</strong> {error.message}</div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    );
  };

  if (!providerConfig) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unsupported OAuth2 provider: {provider}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Connect {providerConfig.displayName}
          </DialogTitle>
          <DialogDescription>
            Securely connect your email account to automatically process receipt emails
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {renderAuthenticationState()}
            </CardContent>
          </Card>

          {renderAdvancedInfo()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
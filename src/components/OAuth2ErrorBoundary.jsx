import React from 'react';
import { AlertCircle, RefreshCw, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { OAUTH2_ERROR_MESSAGES, OAUTH2_PROVIDERS } from '../config/oauth2Config';

/**
 * OAuth2 Error Boundary Component
 * Provides comprehensive error handling and recovery for OAuth2 operations
 */
export default class OAuth2ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      provider: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
      provider: this.props.provider
    });

    // Log error for debugging
    console.error('OAuth2 Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  getErrorCode = (error) => {
    if (!error) return 'unknown_error';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network')) return 'network_error';
    if (message.includes('timeout')) return 'timeout_error';
    if (message.includes('invalid_client')) return 'invalid_client';
    if (message.includes('invalid_grant')) return 'invalid_grant';
    if (message.includes('access_denied')) return 'access_denied';
    if (message.includes('consent_required')) return 'consent_required';
    if (message.includes('interaction_required')) return 'interaction_required';
    if (message.includes('popup')) return 'popup_blocked';
    if (message.includes('cors')) return 'cors_error';
    
    return 'unknown_error';
  };

  getErrorSeverity = (errorCode) => {
    const criticalErrors = ['invalid_client', 'cors_error', 'configuration_error'];
    const warningErrors = ['network_error', 'timeout_error', 'popup_blocked'];
    
    if (criticalErrors.includes(errorCode)) return 'critical';
    if (warningErrors.includes(errorCode)) return 'warning';
    return 'error';
  };

  getRecoveryInstructions = (errorCode, provider) => {
    const providerConfig = OAUTH2_PROVIDERS[provider];
    const instructions = {
      network_error: [
        'Check your internet connection',
        'Verify firewall settings',
        'Try again in a few moments'
      ],
      timeout_error: [
        'The authentication process timed out',
        'Check your internet connection',
        'Try authenticating again'
      ],
      invalid_client: [
        'OAuth2 client configuration is invalid',
        'Contact system administrator',
        `Verify ${providerConfig?.displayName} app credentials`
      ],
      invalid_grant: [
        'Authorization grant is invalid or expired',
        'Clear browser cache and cookies',
        'Try authenticating again'
      ],
      access_denied: [
        'You denied access to the application',
        'Grant the required permissions',
        'Try authenticating again'
      ],
      consent_required: [
        'Additional consent is required',
        'Review and accept permissions',
        'Try authenticating again'
      ],
      interaction_required: [
        'User interaction is required',
        'Complete the authentication flow',
        'Ensure popup blockers are disabled'
      ],
      popup_blocked: [
        'Authentication popup was blocked',
        'Allow popups for this site',
        'Check browser popup settings'
      ],
      cors_error: [
        'Cross-origin request blocked',
        'Check OAuth2 configuration',
        'Verify allowed origins in provider settings'
      ],
      unknown_error: [
        'An unexpected error occurred',
        'Try refreshing the page',
        'Contact support if the problem persists'
      ]
    };

    return instructions[errorCode] || instructions.unknown_error;
  };

  renderErrorCard = () => {
    const { error, provider, retryCount } = this.state;
    const errorCode = this.getErrorCode(error);
    const severity = this.getErrorSeverity(errorCode);
    const instructions = this.getRecoveryInstructions(errorCode, provider);
    const providerConfig = OAUTH2_PROVIDERS[provider];

    const severityColors = {
      critical: 'border-red-500 bg-red-50',
      warning: 'border-yellow-500 bg-yellow-50',
      error: 'border-orange-500 bg-orange-50'
    };

    const severityIcons = {
      critical: '🚨',
      warning: '⚠️',
      error: '❌'
    };

    return (
      <Card className={`max-w-2xl mx-auto ${severityColors[severity]}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{severityIcons[severity]}</div>
            <div>
              <CardTitle className="flex items-center gap-2">
                OAuth2 Authentication Error
                <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'}>
                  {severity.toUpperCase()}
                </Badge>
              </CardTitle>
              {providerConfig && (
                <p className="text-sm text-gray-600 mt-1">
                  {providerConfig.icon} {providerConfig.displayName}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant={severity === 'critical' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {OAUTH2_ERROR_MESSAGES[errorCode] || error?.message}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recovery Steps:</h4>
            <ol className="text-sm space-y-1 pl-4">
              {instructions.map((instruction, index) => (
                <li key={index} className="list-decimal">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {retryCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Retry attempt #{retryCount}. If the problem persists, try clearing your browser cache.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={this.handleRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button variant="outline" onClick={this.handleReset}>
              Reset
            </Button>

            {providerConfig?.setupUrl && (
              <Button 
                variant="outline"
                onClick={() => window.open(providerConfig.setupUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Help
              </Button>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600">
                Technical Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                <div><strong>Error Code:</strong> {errorCode}</div>
                <div><strong>Provider:</strong> {provider}</div>
                <div><strong>Message:</strong> {error?.message}</div>
                <div><strong>Stack:</strong></div>
                <pre className="mt-1 whitespace-pre-wrap">{error?.stack}</pre>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    );
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          {this.renderErrorCard()}
        </div>
      );
    }

    return this.props.children;
  }
}
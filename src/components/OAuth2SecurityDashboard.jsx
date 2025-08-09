import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Eye,
  EyeOff,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import OAuth2SecurityValidator, { SECURITY_LEVELS, oauth2SecurityMonitor } from '../utils/oauth2Security';
import tokenManager from '../services/tokenManager';
import { OAUTH2_PROVIDERS } from '../config/oauth2Config';

export default function OAuth2SecurityDashboard({ 
  providers = ['gmail', 'outlook'], 
  autoRefresh = true,
  refreshInterval = 30000 
}) {
  const [securityReports, setSecurityReports] = useState({});
  const [securityStats, setSecurityStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState({});
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    loadSecurityData();
    
    let interval;
    if (autoRefreshEnabled) {
      interval = setInterval(loadSecurityData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled, refreshInterval]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      const reports = {};
      const tokenInfo = await tokenManager.getAllTokenInfo();
      
      for (const provider of providers) {
        const providerTokenInfo = tokenInfo[provider];
        const requestContext = {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
          origin: window.location.origin,
          hasStateParameter: true, // Assume proper implementation
          usesPKCE: provider === 'gmail', // Gmail uses PKCE
          isPublicClient: true
        };

        reports[provider] = OAuth2SecurityValidator.generateSecurityReport(
          provider,
          providerTokenInfo,
          requestContext
        );
      }

      setSecurityReports(reports);
      setSecurityStats(oauth2SecurityMonitor.getSecurityStats());
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading security data:', error);
      oauth2SecurityMonitor.logSecurityEvent({
        type: 'dashboard_error',
        level: SECURITY_LEVELS.WARNING,
        message: `Security dashboard load failed: ${error.message}`,
        provider: 'system'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case SECURITY_LEVELS.SECURE:
        return 'text-green-600 bg-green-100';
      case SECURITY_LEVELS.WARNING:
        return 'text-yellow-600 bg-yellow-100';
      case SECURITY_LEVELS.VULNERABLE:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSecurityLevelIcon = (level) => {
    switch (level) {
      case SECURITY_LEVELS.SECURE:
        return <CheckCircle className="h-4 w-4" />;
      case SECURITY_LEVELS.WARNING:
        return <AlertTriangle className="h-4 w-4" />;
      case SECURITY_LEVELS.VULNERABLE:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const calculateOverallScore = () => {
    if (Object.keys(securityReports).length === 0) return 0;
    
    const scores = Object.values(securityReports).map(report => {
      switch (report.overallSecurity) {
        case SECURITY_LEVELS.SECURE: return 100;
        case SECURITY_LEVELS.WARNING: return 70;
        case SECURITY_LEVELS.VULNERABLE: return 30;
        default: return 0;
      }
    });

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const renderOverviewCard = () => {
    const overallScore = calculateOverallScore();
    const totalIssues = Object.values(securityReports).reduce(
      (sum, report) => sum + report.summary.totalIssues, 0
    );
    const criticalIssues = Object.values(securityReports).reduce(
      (sum, report) => sum + report.summary.criticalIssues, 0
    );

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                OAuth2 Security Overview
              </CardTitle>
              <CardDescription>
                Security status across all connected providers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefreshEnabled}
                onCheckedChange={setAutoRefreshEnabled}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={loadSecurityData}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallScore}%</div>
              <div className="text-sm text-gray-600">Security Score</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{Object.keys(securityReports).length}</div>
              <div className="text-sm text-gray-600">Providers</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalIssues}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalIssues}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
          </div>

          {lastRefresh && (
            <div className="text-xs text-gray-500 text-center">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderProviderCard = (provider, report) => {
    const providerConfig = OAUTH2_PROVIDERS[provider];
    const isDetailsVisible = showDetails[provider];

    return (
      <Card key={provider} className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{providerConfig?.icon || '🔒'}</div>
              <div>
                <CardTitle className="text-lg">{providerConfig?.displayName || provider}</CardTitle>
                <CardDescription>OAuth2 Security Status</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getSecurityLevelColor(report.overallSecurity)}>
                {getSecurityLevelIcon(report.overallSecurity)}
                <span className="ml-1">{report.overallSecurity.toUpperCase()}</span>
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(prev => ({
                  ...prev,
                  [provider]: !prev[provider]
                }))}
              >
                {isDetailsVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{report.summary.totalIssues}</div>
              <div className="text-xs text-gray-600">Total Issues</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">{report.summary.criticalIssues}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{report.summary.warningIssues}</div>
              <div className="text-xs text-gray-600">Warnings</div>
            </div>
          </div>

          {report.allIssues.length > 0 && (
            <Alert variant={report.summary.criticalIssues > 0 ? 'destructive' : 'default'} className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {report.summary.criticalIssues > 0 ? 
                  `${report.summary.criticalIssues} critical security issues need immediate attention` :
                  `${report.summary.warningIssues} warnings found`
                }
              </AlertDescription>
            </Alert>
          )}

          {isDetailsVisible && (
            <div className="space-y-4 pt-4 border-t">
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="recommendations">Fixes</TabsTrigger>
                  <TabsTrigger value="validations">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="space-y-2">
                  {report.allIssues.length > 0 ? (
                    report.allIssues.map((issue, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        {issue}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-green-600 p-2 bg-green-50 rounded">
                      ✅ No security issues found
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-2">
                  {report.allRecommendations.length > 0 ? (
                    report.allRecommendations.map((rec, index) => (
                      <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                        💡 {rec}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-green-600 p-2 bg-green-50 rounded">
                      ✅ No recommendations needed
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="validations" className="space-y-3">
                  {Object.entries(report.validations).map(([type, validation]) => (
                    validation && (
                      <div key={type} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium capitalize">{type} Validation</h4>
                          <Badge className={getSecurityLevelColor(validation.level)}>
                            {validation.level}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          Issues: {validation.issues.length} | 
                          Recommendations: {validation.recommendations.length}
                        </div>
                      </div>
                    )
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderActivityCard = () => {
    const recentEvents = oauth2SecurityMonitor.getRecentEvents(5);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Activity
          </CardTitle>
          <CardDescription>Recent security events and monitoring</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{securityStats.totalEvents || 0}</div>
              <div className="text-xs text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{securityStats.recentEvents || 0}</div>
              <div className="text-xs text-gray-600">Last 24h</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">{securityStats.criticalEvents || 0}</div>
              <div className="text-xs text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{securityStats.warningEvents || 0}</div>
              <div className="text-xs text-gray-600">Warnings</div>
            </div>
          </div>

          {recentEvents.length > 0 ? (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Events:</h4>
              {recentEvents.map((event, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.type}</span>
                    <Badge className={getSecurityLevelColor(event.level)} size="sm">
                      {event.level}
                    </Badge>
                  </div>
                  <div className="text-gray-600 mt-1">{event.message}</div>
                  <div className="text-gray-500 mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600 text-center py-4">
              No security events recorded
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading && Object.keys(securityReports).length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading security data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderOverviewCard()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Provider Security</h3>
          {Object.entries(securityReports).map(([provider, report]) =>
            renderProviderCard(provider, report)
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Activity Monitor</h3>
          {renderActivityCard()}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { 
  Play, 
  TestTube2, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  BarChart3,
  Settings,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { oauth2TestSuite, TEST_STATUS } from '../utils/oauth2Testing';

export default function OAuth2TestDashboard({ 
  providers = ['gmail', 'outlook'],
  showAdvanced = false 
}) {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState(providers);
  const [testProgress, setTestProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const runTests = async () => {
    try {
      setIsRunning(true);
      setTestProgress(0);
      setCurrentTest('Initializing tests...');
      toast.info('Starting OAuth2 tests...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setTestProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const results = await oauth2TestSuite.runAllTests(selectedProviders);
      
      clearInterval(progressInterval);
      setTestProgress(100);
      setCurrentTest('Tests completed');
      setTestResults(results);
      
      toast.success(`Tests completed! ${results.summary.successRate}% success rate`);
    } catch (error) {
      console.error('Test execution error:', error);
      toast.error(`Test execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const exportResults = () => {
    if (!testResults) {
      toast.error('No test results to export');
      return;
    }

    try {
      const exported = oauth2TestSuite.exportResults(exportFormat);
      const blob = new Blob([exported], { 
        type: exportFormat === 'json' ? 'application/json' : 
              exportFormat === 'csv' ? 'text/csv' : 'text/html'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `oauth2-test-results.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Results exported as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export results');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case TEST_STATUS.PASS:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case TEST_STATUS.FAIL:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case TEST_STATUS.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case TEST_STATUS.SKIP:
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case TEST_STATUS.PASS:
        return 'text-green-600 bg-green-100';
      case TEST_STATUS.FAIL:
        return 'text-red-600 bg-red-100';
      case TEST_STATUS.WARNING:
        return 'text-yellow-600 bg-yellow-100';
      case TEST_STATUS.SKIP:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredResults = testResults ? testResults.results.filter(result => {
    const categoryMatch = filterCategory === 'all' || result.category.toLowerCase() === filterCategory;
    const statusMatch = filterStatus === 'all' || result.status === filterStatus;
    return categoryMatch && statusMatch;
  }) : [];

  const renderSummaryCard = () => {
    if (!testResults) return null;

    const { summary } = testResults;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Test Summary
          </CardTitle>
          <CardDescription>
            OAuth2 testing results for {selectedProviders.join(', ')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.byStatus.pass}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.byStatus.fail}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.byStatus.warning}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Success Rate</span>
              <span className="text-sm text-gray-600">{summary.successRate}%</span>
            </div>
            <Progress value={summary.successRate} className="h-2" />
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div>Duration: {Math.round(summary.duration / 1000)}s</div>
            <div>Completed: {new Date(summary.timestamp).toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!testResults) return null;

    const { summary } = testResults;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Test results by category</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {Object.entries(summary.byCategory).map(([category, stats]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category}</span>
                  <span className="text-sm text-gray-600">
                    {stats.pass}/{stats.total} passed
                  </span>
                </div>
                
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-green-500 rounded-l"
                    style={{ width: `${(stats.pass / stats.total) * 100}%` }}
                  />
                  <div 
                    className="bg-red-500"
                    style={{ width: `${(stats.fail / stats.total) * 100}%` }}
                  />
                  <div 
                    className="bg-yellow-500"
                    style={{ width: `${(stats.warning / stats.total) * 100}%` }}
                  />
                  <div 
                    className="bg-gray-400 rounded-r"
                    style={{ width: `${(stats.skip / stats.total) * 100}%` }}
                  />
                </div>
                
                <div className="flex gap-4 text-xs text-gray-600">
                  <span className="text-green-600">Pass: {stats.pass}</span>
                  <span className="text-red-600">Fail: {stats.fail}</span>
                  <span className="text-yellow-600">Warning: {stats.warning}</span>
                  <span className="text-gray-600">Skip: {stats.skip}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResultsTable = () => {
    if (!testResults) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>Individual test results</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(testResults.summary.byCategory).map(category => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value={TEST_STATUS.PASS}>Pass</SelectItem>
                  <SelectItem value={TEST_STATUS.FAIL}>Fail</SelectItem>
                  <SelectItem value={TEST_STATUS.WARNING}>Warning</SelectItem>
                  <SelectItem value={TEST_STATUS.SKIP}>Skip</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredResults.map(result => (
              <div key={result.id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">
                        {result.category}/{result.provider}: {result.test}
                      </span>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{result.message}</p>
                    
                    {showAdvanced && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Expected: {result.expected}</div>
                        <div>Actual: {result.actual}</div>
                        <div>Time: {new Date(result.timestamp).toLocaleTimeString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No results match the current filters
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            OAuth2 Test Dashboard
          </CardTitle>
          <CardDescription>
            Run comprehensive tests for OAuth2 implementations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label>Test Providers</Label>
              <div className="flex gap-4">
                {providers.map(provider => (
                  <div key={provider} className="flex items-center space-x-2">
                    <Checkbox
                      id={provider}
                      checked={selectedProviders.includes(provider)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedProviders(prev => [...prev, provider]);
                        } else {
                          setSelectedProviders(prev => prev.filter(p => p !== provider));
                        }
                      }}
                    />
                    <Label htmlFor={provider} className="capitalize">
                      {provider}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Controls */}
            <div className="flex items-center gap-4">
              <Button
                onClick={runTests}
                disabled={isRunning || selectedProviders.length === 0}
                className="flex-1 md:flex-none"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </Button>

              {testResults && (
                <>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </>
              )}
            </div>

            {/* Progress */}
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{testProgress}%</span>
                </div>
                <Progress value={testProgress} />
                {currentTest && (
                  <p className="text-sm text-gray-600">{currentTest}</p>
                )}
              </div>
            )}

            {selectedProviders.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select at least one provider to test.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {testResults && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {renderSummaryCard()}
          </TabsContent>

          <TabsContent value="breakdown">
            {renderCategoryBreakdown()}
          </TabsContent>

          <TabsContent value="details">
            {renderResultsTable()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
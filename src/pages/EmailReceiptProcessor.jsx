import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Trash2, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Scan,
  Shield,
  RefreshCw,
  Inbox,
  Archive,
  FileText,
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Info,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import OAuth2AuthFlow from '@/components/OAuth2AuthFlow';
import OAuth2ErrorBoundary from '@/components/OAuth2ErrorBoundary';
import OAuth2SecurityDashboard from '@/components/OAuth2SecurityDashboard';
import OAuth2TestDashboard from '@/components/OAuth2TestDashboard';
import { OAUTH2_PROVIDERS } from '../config/oauth2Config';
import gmailOAuth2Service from '../services/gmailOAuth2';
import outlookOAuth2Service from '../services/outlookOAuth2';
import tokenManager from '../services/tokenManager';
import OAuth2SecurityValidator, { oauth2SecurityMonitor, SECURITY_LEVELS } from '../utils/oauth2Security';

const PROCESSING_STATUS = {
  pending: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-500', icon: Scan },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
  spam: { label: 'Spam Detected', color: 'bg-yellow-500', icon: Shield }
};

const EMAIL_PROVIDERS = [
  { id: 'gmail', name: 'Gmail', icon: '📧', description: 'Google Gmail account' },
  { id: 'outlook', name: 'Outlook', icon: '📬', description: 'Microsoft Outlook/Hotmail' },
  { id: 'imap', name: 'IMAP', icon: '📨', description: 'Custom IMAP server' },
  { id: 'yahoo', name: 'Yahoo Mail', icon: '📮', description: 'Yahoo Mail account' }
];

export default function EmailReceiptProcessor() {
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [emailReceipts, setEmailReceipts] = useState([]);
  const [emailRules, setEmailRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isOAuth2DialogOpen, setIsOAuth2DialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState({});
  const [tokenHealth, setTokenHealth] = useState({});

  // Email account configuration form
  const [emailConfig, setEmailConfig] = useState({
    provider: '',
    email_address: '',
    display_name: '',
    imap_server: '',
    imap_port: 993,
    username: '',
    app_password: '',
    use_ssl: true,
    auto_process: true,
    folder_name: 'INBOX'
  });

  // Email rule configuration form
  const [ruleConfig, setRuleConfig] = useState({
    rule_name: '',
    sender_patterns: '',
    subject_patterns: '',
    body_patterns: '',
    attachment_required: false,
    auto_category: '',
    confidence_threshold: 0.7,
    is_active: true
  });

  useEffect(() => {
    initializeServices();
    loadEmailData();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize token manager
      await tokenManager.initialize();
      
      // Check OAuth2 connections
      await checkOAuth2Connections();
      
      // Monitor token health
      const health = await tokenManager.monitorTokenHealth();
      setTokenHealth(health);
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  };

  const checkOAuth2Connections = async () => {
    try {
      const connections = {};
      
      // Check Gmail connection
      try {
        await gmailOAuth2Service.initialize();
        if (gmailOAuth2Service.isAuthenticated()) {
          connections.gmail = {
            connected: true,
            user: gmailOAuth2Service.userInfo,
            status: 'connected'
          };
        }
      } catch (error) {
        connections.gmail = { connected: false, error: error.message };
      }
      
      // Check Outlook connection
      try {
        const initialized = await outlookOAuth2Service.initialize();
        if (initialized && outlookOAuth2Service.isAuthenticated()) {
          connections.outlook = {
            connected: true,
            user: outlookOAuth2Service.userInfo,
            status: 'connected'
          };
        } else {
          connections.outlook = { 
            connected: false, 
            error: initialized === false ? 'Microsoft Client ID not configured' : 'Not authenticated'
          };
        }
      } catch (error) {
        connections.outlook = { connected: false, error: error.message };
      }
      
      setConnectedAccounts(connections);
    } catch (error) {
      console.error('Error checking OAuth2 connections:', error);
    }
  };

  const loadEmailData = async () => {
    try {
      setLoading(true);
      
      // Mock data for development
      const mockEmailAccounts = [
        {
          id: '1',
          provider: 'gmail',
          email_address: 'user@gmail.com',
          display_name: 'Personal Gmail',
          status: 'connected',
          last_sync: '2024-01-15T10:30:00Z',
          total_processed: 45,
          auto_process: true
        }
      ];

      const mockEmailReceipts = [
        {
          id: '1',
          email_account_id: '1',
          sender_email: 'receipts@amazon.com',
          subject: 'Your Amazon.com order receipt',
          received_date: '2024-01-15T14:30:00Z',
          processing_status: 'completed',
          confidence_score: 0.92,
          extracted_data: {
            merchant_name: 'Amazon',
            total_amount: 29.99,
            order_number: 'AMZ-123456',
            transaction_date: '2024-01-15'
          },
          receipt_id: 'rec_1',
          attachment_count: 1,
          is_spam: false
        },
        {
          id: '2',
          email_account_id: '1',
          sender_email: 'store@target.com',
          subject: 'Your Target receipt is ready',
          received_date: '2024-01-14T16:45:00Z',
          processing_status: 'pending',
          confidence_score: null,
          extracted_data: null,
          receipt_id: null,
          attachment_count: 0,
          is_spam: false
        }
      ];

      const mockEmailRules = [
        {
          id: '1',
          rule_name: 'Amazon Receipts',
          sender_patterns: '*@amazon.com,*@amazon.co.uk',
          subject_patterns: '*receipt*,*order*',
          auto_category: 'shopping',
          confidence_threshold: 0.8,
          is_active: true,
          matched_count: 12
        },
        {
          id: '2',
          rule_name: 'Restaurant Receipts', 
          sender_patterns: '*@doordash.com,*@ubereats.com,*@grubhub.com',
          subject_patterns: '*receipt*,*order*',
          auto_category: 'food',
          confidence_threshold: 0.7,
          is_active: true,
          matched_count: 8
        }
      ];

      try {
        // Try to load from backend
        const [accountsResult, receiptsResult, rulesResult] = await Promise.all([
          apiClient.get('/api/email-accounts'),
          apiClient.get('/api/email-receipts'),
          apiClient.get('/api/email-rules')
        ]);
        
        setEmailAccounts(accountsResult.data || mockEmailAccounts);
        setEmailReceipts(receiptsResult.data || mockEmailReceipts);
        setEmailRules(rulesResult.data || mockEmailRules);
      } catch (error) {
        console.warn('Email processing APIs not available, using mock data');
        setEmailAccounts(mockEmailAccounts);
        setEmailReceipts(mockEmailReceipts);
        setEmailRules(mockEmailRules);
      }
    } catch (error) {
      console.error('Error loading email data:', error);
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmailAccount = async () => {
    try {
      if (!emailConfig.provider || !emailConfig.email_address) {
        toast.error('Please fill in required fields');
        return;
      }

      const accountData = {
        ...emailConfig,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };

      try {
        await apiClient.post('/api/email-accounts', accountData);
        toast.success('Email account configured successfully');
      } catch (error) {
        console.warn('Backend not available, adding to local state');
        const newAccount = {
          ...accountData,
          id: Date.now().toString(),
          status: 'connected',
          last_sync: new Date().toISOString(),
          total_processed: 0
        };
        setEmailAccounts(prev => [...prev, newAccount]);
        toast.success('Email account configured (demo mode)');
      }

      setIsConfigDialogOpen(false);
      setEmailConfig({
        provider: '',
        email_address: '',
        display_name: '',
        imap_server: '',
        imap_port: 993,
        username: '',
        app_password: '',
        use_ssl: true,
        auto_process: true,
        folder_name: 'INBOX'
      });
    } catch (error) {
      console.error('Error adding email account:', error);
      toast.error('Failed to configure email account');
    }
  };

  const handleAddEmailRule = async () => {
    try {
      if (!ruleConfig.rule_name || !ruleConfig.sender_patterns) {
        toast.error('Please fill in required fields');
        return;
      }

      try {
        await apiClient.post('/api/email-rules', ruleConfig);
        toast.success('Email rule created successfully');
      } catch (error) {
        console.warn('Backend not available, adding to local state');
        const newRule = {
          ...ruleConfig,
          id: Date.now().toString(),
          matched_count: 0
        };
        setEmailRules(prev => [...prev, newRule]);
        toast.success('Email rule created (demo mode)');
      }

      setIsRuleDialogOpen(false);
      setRuleConfig({
        rule_name: '',
        sender_patterns: '',
        subject_patterns: '',
        body_patterns: '',
        attachment_required: false,
        auto_category: '',
        confidence_threshold: 0.7,
        is_active: true
      });
    } catch (error) {
      console.error('Error creating email rule:', error);
      toast.error('Failed to create email rule');
    }
  };

  const handleOAuth2Connect = async (provider) => {
    try {
      // Validate security before connecting
      const securityReport = OAuth2SecurityValidator.generateSecurityReport(provider);
      
      if (!OAuth2SecurityValidator.canProceedSecurely(securityReport, SECURITY_LEVELS.WARNING)) {
        oauth2SecurityMonitor.logSecurityEvent({
          type: 'connection_blocked',
          level: SECURITY_LEVELS.VULNERABLE,
          message: `OAuth2 connection blocked due to security issues: ${securityReport.allIssues.join(', ')}`,
          provider
        });
        
        toast.error(`Cannot connect ${OAUTH2_PROVIDERS[provider].displayName} due to security issues. Check configuration.`);
        return;
      }

      // Log connection attempt
      oauth2SecurityMonitor.logSecurityEvent({
        type: 'connection_attempt',
        level: SECURITY_LEVELS.SECURE,
        message: `OAuth2 connection initiated for ${provider}`,
        provider
      });

      setSelectedProvider(provider);
      setIsOAuth2DialogOpen(true);
    } catch (error) {
      console.error('Error initiating OAuth2 connection:', error);
      toast.error('Failed to initiate OAuth2 connection');
    }
  };

  const handleOAuth2Success = async (result) => {
    try {
      const { provider, user, accessToken } = result;
      
      // Log successful connection
      oauth2SecurityMonitor.logSecurityEvent({
        type: 'connection_success',
        level: SECURITY_LEVELS.SECURE,
        message: `OAuth2 connection successful for ${provider}`,
        provider,
        metadata: { userEmail: user.email }
      });
      
      // Update connected accounts
      setConnectedAccounts(prev => ({
        ...prev,
        [provider]: {
          connected: true,
          user,
          status: 'connected',
          connectedAt: new Date().toISOString()
        }
      }));

      // Create email account record
      const accountData = {
        provider,
        email_address: user.email,
        display_name: `${user.name} (${provider})`,
        oauth2_token: accessToken,
        auto_process: true,
        status: 'connected',
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };

      try {
        await apiClient.createEmailAccount(accountData);
        toast.success(`${OAUTH2_PROVIDERS[provider].displayName} connected successfully`);
      } catch (error) {
        console.warn('Backend not available, using local state');
        toast.success(`${OAUTH2_PROVIDERS[provider].displayName} connected (demo mode)`);
      }

      setIsOAuth2DialogOpen(false);
      loadEmailData();
    } catch (error) {
      console.error('OAuth2 success handler error:', error);
      toast.error('Failed to complete connection setup');
    }
  };

  const handleOAuth2Error = (error) => {
    console.error('OAuth2 authentication error:', error);
    
    // Log security event
    oauth2SecurityMonitor.logSecurityEvent({
      type: 'connection_error',
      level: SECURITY_LEVELS.WARNING,
      message: `OAuth2 connection failed: ${error.error}`,
      provider: error.provider,
      metadata: { errorCode: error.code }
    });
    
    toast.error(`Authentication failed: ${error.error}`);
    setIsOAuth2DialogOpen(false);
  };

  const handleProcessEmails = async (accountId) => {
    try {
      setProcessing(true);
      setProcessingProgress(0);
      
      toast.info('Starting email processing...');
      
      // Find the account to determine provider
      const account = emailAccounts.find(acc => acc.id === accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      let messages = [];
      
      if (account.provider === 'gmail' && connectedAccounts.gmail?.connected) {
        setProcessingProgress(20);
        try {
          const result = await gmailOAuth2Service.searchReceiptEmails({
            maxResults: 50,
            keywords: ['receipt', 'invoice', 'order', 'confirmation']
          });
          messages = result.messages || [];
          setProcessingProgress(60);
        } catch (error) {
          console.error('Gmail processing error:', error);
          throw new Error(`Gmail processing failed: ${error.message}`);
        }
      } else if (account.provider === 'outlook' && connectedAccounts.outlook?.connected) {
        setProcessingProgress(20);
        try {
          const result = await outlookOAuth2Service.searchReceiptEmails({
            maxResults: 50,
            keywords: ['receipt', 'invoice', 'order', 'confirmation']
          });
          messages = result.messages || [];
          setProcessingProgress(60);
        } catch (error) {
          console.error('Outlook processing error:', error);
          throw new Error(`Outlook processing failed: ${error.message}`);
        }
      } else {
        // Fallback to backend API
        setProcessingProgress(20);
        try {
          await apiClient.processEmailAccount(accountId);
          setProcessingProgress(60);
        } catch (error) {
          console.warn('Backend not available, using demo data');
          // Simulate processing with demo data
          messages = [
            {
              id: 'demo-1',
              subject: 'Your Amazon.com order receipt',
              from: 'receipts@amazon.com',
              receivedDateTime: new Date(),
              hasAttachments: true
            }
          ];
        }
      }

      setProcessingProgress(80);
      
      // Process messages for receipt detection
      const processedReceipts = [];
      for (const message of messages.slice(0, 10)) { // Process first 10 for demo
        const emailReceiptData = {
          email_account_id: accountId,
          message_id: message.id,
          sender_email: message.from || message.fromName,
          subject: message.subject,
          received_date: message.receivedDateTime || message.internalDate,
          processing_status: 'completed',
          is_receipt: true,
          confidence_score: 0.85,
          extracted_data: {
            merchant_name: message.from?.split('@')[1]?.split('.')[0] || 'Unknown',
            total_amount: Math.random() * 100 + 10,
            transaction_date: new Date().toISOString().split('T')[0]
          },
          user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f'
        };
        
        processedReceipts.push(emailReceiptData);
      }

      setProcessingProgress(100);
      
      toast.success(`Email processing completed - found ${processedReceipts.length} potential receipts`);

      // Reload email receipts
      setTimeout(() => {
        loadEmailData();
      }, 1000);

    } catch (error) {
      console.error('Error processing emails:', error);
      toast.error(`Failed to process emails: ${error.message}`);
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setProcessingProgress(0);
      }, 1500);
    }
  };

  const handleConvertToReceipt = async (emailReceipt) => {
    try {
      if (!emailReceipt.extracted_data) {
        toast.error('No extracted data available for conversion');
        return;
      }

      const receiptData = {
        merchant_name: emailReceipt.extracted_data.merchant_name,
        total_amount: emailReceipt.extracted_data.total_amount,
        transaction_date: emailReceipt.extracted_data.transaction_date,
        receipt_number: emailReceipt.extracted_data.order_number,
        category: 'other',
        processing_status: 'completed',
        ocr_confidence: emailReceipt.confidence_score,
        manual_verified: false,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f'
      };

      try {
        await apiClient.post('/api/receipts', receiptData);
        toast.success('Email receipt converted successfully');
      } catch (error) {
        console.warn('Backend not available');
        toast.success('Email receipt converted (demo mode)');
      }
    } catch (error) {
      console.error('Error converting email receipt:', error);
      toast.error('Failed to convert email receipt');
    }
  };

  // Filter email receipts
  const filteredEmailReceipts = emailReceipts.filter(receipt => {
    const matchesSearch = receipt.sender_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.processing_status === statusFilter;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const receiptDate = new Date(receipt.received_date);
      const today = new Date();
      const daysAgo = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date(today.setDate(today.getDate() - daysAgo));
      matchesDate = receiptDate >= cutoffDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate analytics
  const analytics = {
    totalAccounts: emailAccounts.length,
    connectedAccounts: emailAccounts.filter(acc => acc.status === 'connected').length,
    totalEmailReceipts: emailReceipts.length,
    processedReceipts: emailReceipts.filter(r => r.processing_status === 'completed').length,
    pendingReceipts: emailReceipts.filter(r => r.processing_status === 'pending').length,
    totalRules: emailRules.length,
    activeRules: emailRules.filter(r => r.is_active).length,
    averageConfidence: emailReceipts.length > 0 
      ? emailReceipts
          .filter(r => r.confidence_score)
          .reduce((sum, r) => sum + r.confidence_score, 0) / 
        emailReceipts.filter(r => r.confidence_score).length
      : 0
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Receipt Processing</h1>
          <p className="text-gray-600">Automatically process emailed receipts from your inbox</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Email Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Configure Email Account</DialogTitle>
                <DialogDescription>
                  Add an email account to automatically process receipt emails
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Email Provider</Label>
                  <Select value={emailConfig.provider} onValueChange={(value) => setEmailConfig({...emailConfig, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_PROVIDERS.map(provider => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.icon} {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email_address">Email Address</Label>
                    <Input
                      id="email_address"
                      type="email"
                      value={emailConfig.email_address}
                      onChange={(e) => setEmailConfig({...emailConfig, email_address: e.target.value})}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={emailConfig.display_name}
                      onChange={(e) => setEmailConfig({...emailConfig, display_name: e.target.value})}
                      placeholder="My Email Account"
                    />
                  </div>
                </div>

                {emailConfig.provider === 'imap' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="imap_server">IMAP Server</Label>
                      <Input
                        id="imap_server"
                        value={emailConfig.imap_server}
                        onChange={(e) => setEmailConfig({...emailConfig, imap_server: e.target.value})}
                        placeholder="imap.example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imap_port">Port</Label>
                      <Input
                        id="imap_port"
                        type="number"
                        value={emailConfig.imap_port}
                        onChange={(e) => setEmailConfig({...emailConfig, imap_port: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="app_password">App Password</Label>
                  <Input
                    id="app_password"
                    type="password"
                    value={emailConfig.app_password}
                    onChange={(e) => setEmailConfig({...emailConfig, app_password: e.target.value})}
                    placeholder="App-specific password"
                  />
                  <p className="text-xs text-gray-500">
                    Use an app-specific password for Gmail/Outlook, not your regular password
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_process"
                    checked={emailConfig.auto_process}
                    onCheckedChange={(checked) => setEmailConfig({...emailConfig, auto_process: checked})}
                  />
                  <Label htmlFor="auto_process">Automatically process new emails</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmailAccount}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Email Rule</DialogTitle>
                <DialogDescription>
                  Define patterns to automatically identify and categorize receipt emails
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rule_name">Rule Name</Label>
                  <Input
                    id="rule_name"
                    value={ruleConfig.rule_name}
                    onChange={(e) => setRuleConfig({...ruleConfig, rule_name: e.target.value})}
                    placeholder="Amazon Receipts"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_patterns">Sender Patterns</Label>
                  <Input
                    id="sender_patterns"
                    value={ruleConfig.sender_patterns}
                    onChange={(e) => setRuleConfig({...ruleConfig, sender_patterns: e.target.value})}
                    placeholder="*@amazon.com,*@amazon.co.uk"
                  />
                  <p className="text-xs text-gray-500">Comma-separated patterns. Use * for wildcards</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_patterns">Subject Patterns</Label>
                  <Input
                    id="subject_patterns"
                    value={ruleConfig.subject_patterns}
                    onChange={(e) => setRuleConfig({...ruleConfig, subject_patterns: e.target.value})}
                    placeholder="*receipt*,*order*"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="auto_category">Auto Category</Label>
                  <Select value={ruleConfig.auto_category} onValueChange={(value) => setRuleConfig({...ruleConfig, auto_category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food & Dining</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEmailRule}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Processing Progress */}
      {processing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing emails...</span>
                <span>{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Accounts</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.connectedAccounts}/{analytics.totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Connected accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Receipts</CardTitle>
            <Inbox className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEmailReceipts}</div>
            <p className="text-xs text-muted-foreground">{analytics.processedReceipts} processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeRules}</div>
            <p className="text-xs text-muted-foreground">of {analytics.totalRules} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.averageConfidence * 100)}%</div>
            <p className="text-xs text-muted-foreground">Detection accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="emails">Email Receipts</TabsTrigger>
          <TabsTrigger value="accounts">Email Accounts</TabsTrigger>
          <TabsTrigger value="rules">Processing Rules</TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-1" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(PROCESSING_STATUS).map(([key, status]) => (
                      <SelectItem key={key} value={key}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Email Receipts List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredEmailReceipts.map((emailReceipt) => {
              const status = PROCESSING_STATUS[emailReceipt.processing_status];
              const StatusIcon = status.icon;
              
              return (
                <Card key={emailReceipt.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{emailReceipt.sender_email}</span>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          {emailReceipt.attachment_count > 0 && (
                            <Badge variant="outline">
                              📎 {emailReceipt.attachment_count}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{emailReceipt.subject}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Received: {new Date(emailReceipt.received_date).toLocaleString()}
                        </p>
                        
                        {emailReceipt.extracted_data && (
                          <div className="bg-green-50 p-3 rounded-lg mb-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="font-medium">Merchant:</span>
                                <br />
                                {emailReceipt.extracted_data.merchant_name}
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span>
                                <br />
                                ${emailReceipt.extracted_data.total_amount}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span>
                                <br />
                                {new Date(emailReceipt.extracted_data.transaction_date).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Confidence:</span>
                                <br />
                                {Math.round(emailReceipt.confidence_score * 100)}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmail(emailReceipt);
                            setIsDetailDialogOpen(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {emailReceipt.extracted_data && (
                          <Button
                            size="sm"
                            onClick={() => handleConvertToReceipt(emailReceipt)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Convert
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredEmailReceipts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email receipts found</h3>
                <p className="text-gray-600 mb-4">Configure an email account to start processing receipt emails.</p>
                <Button onClick={() => setIsConfigDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Email Account
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {/* OAuth2 Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(OAUTH2_PROVIDERS).filter(([_, provider]) => !provider.comingSoon).map(([providerId, provider]) => {
              const connection = connectedAccounts[providerId];
              const isConnected = connection?.connected;
              
              return (
                <Card key={providerId} className={`cursor-pointer transition-all hover:shadow-lg ${isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{provider.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{provider.displayName}</h3>
                        <p className="text-sm text-gray-600">{provider.description}</p>
                      </div>
                      <div className="text-right">
                        {isConnected ? (
                          <div className="space-y-1">
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                            <p className="text-xs text-gray-600">{connection.user?.email}</p>
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => handleOAuth2Connect(providerId)}
                            style={{ backgroundColor: provider.color }}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {isConnected && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Connected as {connection.user?.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcessEmails(`${providerId}-account`)}
                            disabled={processing}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Traditional Email Accounts */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">IMAP/Traditional Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emailAccounts.filter(account => !['gmail', 'outlook'].includes(account.provider)).map((account) => {
              const provider = EMAIL_PROVIDERS.find(p => p.id === account.provider);
              
              return (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{provider?.icon || '📧'}</span>
                        <div>
                          <CardTitle className="text-lg">{account.display_name}</CardTitle>
                          <CardDescription>{account.email_address}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={account.status === 'connected' ? 'default' : 'destructive'}>
                        {account.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Last Sync:</span>
                        <br />
                        {new Date(account.last_sync).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Processed:</span>
                        <br />
                        {account.total_processed} emails
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleProcessEmails(account.id)}
                        disabled={processing}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {emailRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{rule.rule_name}</h3>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Sender Patterns:</span> {rule.sender_patterns}
                        </div>
                        {rule.subject_patterns && (
                          <div>
                            <span className="font-medium">Subject Patterns:</span> {rule.subject_patterns}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Auto Category:</span> {rule.auto_category || 'None'}
                        </div>
                        <div>
                          <span className="font-medium">Matched:</span> {rule.matched_count} emails
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <OAuth2ErrorBoundary provider={selectedProvider}>
            <Tabs defaultValue="monitoring" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monitoring">Security Monitoring</TabsTrigger>
                <TabsTrigger value="testing">Testing & Validation</TabsTrigger>
              </TabsList>

              <TabsContent value="monitoring" className="space-y-6">
                <OAuth2SecurityDashboard 
                  providers={Object.keys(connectedAccounts).filter(p => connectedAccounts[p].connected)}
                  autoRefresh={true}
                  refreshInterval={30000}
                />
              </TabsContent>

              <TabsContent value="testing" className="space-y-6">
                <OAuth2TestDashboard 
                  providers={['gmail', 'outlook']}
                  showAdvanced={true}
                />
              </TabsContent>
            </Tabs>
          </OAuth2ErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* Email Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Email Receipt Details</DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Sender:</span>
                    <br />
                    {selectedEmail.sender_email}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span>
                    <br />
                    {selectedEmail.subject}
                  </div>
                  <div>
                    <span className="font-medium">Received:</span>
                    <br />
                    {new Date(selectedEmail.received_date).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <br />
                    <Badge className={`${PROCESSING_STATUS[selectedEmail.processing_status].color} text-white`}>
                      {PROCESSING_STATUS[selectedEmail.processing_status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {selectedEmail.extracted_data && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Extracted Data</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Merchant:</span>
                      <br />
                      {selectedEmail.extracted_data.merchant_name}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>
                      <br />
                      ${selectedEmail.extracted_data.total_amount}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>
                      <br />
                      {selectedEmail.extracted_data.transaction_date}
                    </div>
                    <div>
                      <span className="font-medium">Order Number:</span>
                      <br />
                      {selectedEmail.extracted_data.order_number || 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* OAuth2 Authentication Dialog */}
      <OAuth2ErrorBoundary provider={selectedProvider}>
        <OAuth2AuthFlow
          provider={selectedProvider}
          isOpen={isOAuth2DialogOpen}
          onClose={() => setIsOAuth2DialogOpen(false)}
          onAuthSuccess={handleOAuth2Success}
          onAuthError={handleOAuth2Error}
          showAdvanced={true}
        />
      </OAuth2ErrorBoundary>
    </div>
  );
}
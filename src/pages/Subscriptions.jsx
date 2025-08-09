import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle, Key, Eye, EyeOff, Copy, Lock, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { detectSubscriptions } from '@/utils/subscriptionDetection';

const BILLING_FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'paused', label: 'Paused', color: 'bg-yellow-500' }
];

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [subscriptions, setSubscriptions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetectDialogOpen, setIsDetectDialogOpen] = useState(false);
  const [detectedSubscriptions, setDetectedSubscriptions] = useState([]);
  const [showPasswords, setShowPasswords] = useState({});
  const [newSubscription, setNewSubscription] = useState({
    name: '',
    category: '',
    amount: '',
    billing_frequency: 'monthly',
    next_billing_date: '',
    provider: '',
    status: 'active',
    auto_renew: true,
    notes: ''
  });
  const [newAccount, setNewAccount] = useState({
    purpose: '',
    account_name: '',
    url: '',
    login_name: '',
    encrypted_password: '',
    category: 'other',
    notes: '',
    status: 'active'
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load subscriptions from database
      const subscriptionsResult = await apiClient.getSubscriptions();
      const subscriptionsData = subscriptionsResult.data || subscriptionsResult || [];
      
      // Load accounts from database
      const accountsResult = await apiClient.getAccounts();
      const accountsData = accountsResult.data || accountsResult || [];
      
      // Load expenses from database  
      const expensesResult = await apiClient.getExpenses();
      const expensesData = expensesResult.data || expensesResult || [];
      
      // Use local categories since backend endpoint doesn't exist yet
      const categoriesData = [
        { id: '1', name: 'streaming', description: 'Video and music streaming services', icon: 'play-circle', color: '#e74c3c' },
        { id: '2', name: 'software', description: 'Software and SaaS applications', icon: 'laptop', color: '#3498db' },
        { id: '3', name: 'utilities', description: 'Internet, phone, and utility services', icon: 'zap', color: '#f39c12' },
        { id: '4', name: 'fitness', description: 'Gym, fitness apps, and health services', icon: 'activity', color: '#2ecc71' },
        { id: '5', name: 'news', description: 'News and magazine subscriptions', icon: 'newspaper', color: '#9b59b6' },
        { id: '6', name: 'productivity', description: 'Productivity and business tools', icon: 'briefcase', color: '#34495e' },
        { id: '7', name: 'gaming', description: 'Gaming platforms and services', icon: 'gamepad-2', color: '#e67e22' },
        { id: '8', name: 'shopping', description: 'Shopping and delivery services', icon: 'shopping-cart', color: '#1abc9c' },
        { id: '9', name: 'financial', description: 'Financial and investment services', icon: 'dollar-sign', color: '#27ae60' },
        { id: '10', name: 'other', description: 'Other subscription services', icon: 'more-horizontal', color: '#95a5a6' }
      ];
      
      setSubscriptions(subscriptionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      
      // Set empty arrays as fallback
      setSubscriptions([]);
      setAccounts([]);
      setCategories([]);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || subscription.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate analytics
  const analytics = {
    totalActive: subscriptions.filter(s => s.status === 'active').length,
    totalMonthly: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const multiplier = {
          'weekly': 4.33,
          'bi-weekly': 2.17,
          'monthly': 1,
          'quarterly': 1/3,
          'yearly': 1/12
        }[s.billing_frequency] || 1;
        return sum + (parseFloat(s.amount) * multiplier);
      }, 0),
    totalYearly: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const multiplier = {
          'weekly': 52,
          'bi-weekly': 26,
          'monthly': 12,
          'quarterly': 4,
          'yearly': 1
        }[s.billing_frequency] || 12;
        return sum + (parseFloat(s.amount) * multiplier);
      }, 0),
    upcomingRenewals: subscriptions.filter(s => {
      if (s.status !== 'active') return false;
      const nextDate = new Date(s.next_billing_date);
      const today = new Date();
      const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    try {
      const subscriptionData = {
        ...newSubscription,
        amount: parseFloat(newSubscription.amount),
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };
      
      await apiClient.createSubscription(subscriptionData);
      toast.success('Subscription added successfully');
      setIsAddDialogOpen(false);
      setNewSubscription({
        name: '',
        category: '',
        amount: '',
        billing_frequency: 'monthly',
        next_billing_date: '',
        provider: '',
        status: 'active',
        auto_renew: true,
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding subscription:', error);
      toast.error('Failed to add subscription');
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const accountData = {
        ...newAccount,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };
      
      await apiClient.createAccount(accountData);
      toast.success('Account added successfully');
      setIsAddDialogOpen(false);
      setNewAccount({
        purpose: '',
        account_name: '',
        url: '',
        login_name: '',
        encrypted_password: '',
        category: 'other',
        notes: '',
        status: 'active'
      });
      loadData();
    } catch (error) {
      console.error('Error adding account:', error);
      toast.error('Failed to add account');
    }
  };

  const handleDetectSubscriptions = async () => {
    try {
      setLoading(true);
      const detected = detectSubscriptions(expenses);
      setDetectedSubscriptions(detected);
      setIsDetectDialogOpen(true);
    } catch (error) {
      console.error('Error detecting subscriptions:', error);
      toast.error('Failed to detect subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetectedSubscription = async (detectedSub) => {
    try {
      const subscriptionData = {
        ...detectedSub,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };
      
      await apiClient.createSubscription(subscriptionData);
      toast.success(`Added ${detectedSub.name} to subscriptions`);
      
      // Remove from detected list
      setDetectedSubscriptions(prev => prev.filter(s => s !== detectedSub));
      loadData();
    } catch (error) {
      console.error('Error adding detected subscription:', error);
      toast.error('Failed to add subscription');
    }
  };

  const handleStatusChange = async (subscriptionId, newStatus) => {
    try {
      await apiClient.updateSubscription(subscriptionId, { status: newStatus });
      toast.success('Subscription status updated');
      loadData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions & Accounts</h1>
          <p className="text-gray-600">Manage subscriptions and secure account credentials</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDetectSubscriptions} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Detect Subscriptions
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {activeTab === 'subscriptions' ? 'Add Subscription' : 'Add Account'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{activeTab === 'subscriptions' ? 'Add New Subscription' : 'Add New Account'}</DialogTitle>
                <DialogDescription>
                  {activeTab === 'subscriptions' 
                    ? 'Add a new subscription to track its costs and renewals.'
                    : 'Add secure account credentials with encrypted storage.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              {activeTab === 'subscriptions' ? (
                <form onSubmit={handleAddSubscription} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={newSubscription.name}
                      onChange={(e) => setNewSubscription({...newSubscription, name: e.target.value})}
                      placeholder="Netflix, Spotify, etc."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      value={newSubscription.provider}
                      onChange={(e) => setNewSubscription({...newSubscription, provider: e.target.value})}
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newSubscription.amount}
                      onChange={(e) => setNewSubscription({...newSubscription, amount: e.target.value})}
                      placeholder="9.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Billing Frequency</Label>
                    <Select
                      value={newSubscription.billing_frequency}
                      onValueChange={(value) => setNewSubscription({...newSubscription, billing_frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BILLING_FREQUENCIES.map(freq => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newSubscription.category}
                      onValueChange={(value) => setNewSubscription({...newSubscription, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_billing">Next Billing Date</Label>
                    <Input
                      id="next_billing"
                      type="date"
                      value={newSubscription.next_billing_date}
                      onChange={(e) => setNewSubscription({...newSubscription, next_billing_date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto_renew"
                    checked={newSubscription.auto_renew}
                    onCheckedChange={(checked) => setNewSubscription({...newSubscription, auto_renew: checked})}
                  />
                  <Label htmlFor="auto_renew">Auto-renew enabled</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newSubscription.notes}
                    onChange={(e) => setNewSubscription({...newSubscription, notes: e.target.value})}
                    placeholder="Additional notes about this subscription..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Subscription</Button>
                </div>
              </form>
              ) : (
                <form onSubmit={handleAddAccount} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose</Label>
                      <Input
                        id="purpose"
                        value={newAccount.purpose}
                        onChange={(e) => setNewAccount({...newAccount, purpose: e.target.value})}
                        placeholder="Banking, Utilities, etc."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account_name">Account Name</Label>
                      <Input
                        id="account_name"
                        value={newAccount.account_name}
                        onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                        placeholder="Chase Banking"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      value={newAccount.url}
                      onChange={(e) => setNewAccount({...newAccount, url: e.target.value})}
                      placeholder="https://chase.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="login_name">Login/Username</Label>
                      <Input
                        id="login_name"
                        value={newAccount.login_name}
                        onChange={(e) => setNewAccount({...newAccount, login_name: e.target.value})}
                        placeholder="username or email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="encrypted_password">Password</Label>
                      <Input
                        id="encrypted_password"
                        type="password"
                        value={newAccount.encrypted_password}
                        onChange={(e) => setNewAccount({...newAccount, encrypted_password: e.target.value})}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newAccount.category}
                      onValueChange={(value) => setNewAccount({...newAccount, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="subscription">Subscription</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newAccount.notes}
                      onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                      placeholder="Additional notes, password hints, etc."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Account</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tab Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscription Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalActive}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalMonthly.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yearly Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics.totalYearly.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.upcomingRenewals}</div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscriptions.map((subscription) => (
              <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{subscription.name}</CardTitle>
                      <CardDescription>{subscription.provider}</CardDescription>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${STATUS_OPTIONS.find(s => s.value === subscription.status)?.color} text-white`}
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${subscription.amount}</span>
                    <Badge variant="outline">{subscription.billing_frequency}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="capitalize">{subscription.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Billing:</span>
                      <span>{new Date(subscription.next_billing_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-renew:</span>
                      <span>{subscription.auto_renew ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {subscription.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">{subscription.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(subscription.id, subscription.status === 'active' ? 'paused' : 'active')}
                    >
                      {subscription.status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(subscription.id, 'cancelled')}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSubscriptions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
                <p className="text-gray-600 mb-4">Start by adding a subscription or detecting them from your expenses.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Subscription
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {/* Account Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                <Key className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.length}</div>
                <p className="text-xs text-muted-foreground">Stored securely</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">By Category</CardTitle>
                <Lock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Set(accounts.map(a => a.category)).size}</div>
                <p className="text-xs text-muted-foreground">Categories</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">Active accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
                <Lock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">AES-256</div>
                <p className="text-xs text-muted-foreground">Encryption</p>
              </CardContent>
            </Card>
          </div>

          {/* Account Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accounts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.filter(account => 
              account.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
              account.account_name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{account.account_name}</CardTitle>
                      <CardDescription>{account.purpose}</CardDescription>
                    </div>
                    <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
                      {account.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {account.url && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Website:</span>
                        <a 
                          href={account.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                        >
                          {account.url}
                        </a>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Username:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{account.login_name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(account.login_name)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Password:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {showPasswords[account.id] ? account.encrypted_password : '••••••••'}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPasswords(prev => ({...prev, [account.id]: !prev[account.id]}))}
                          className="h-6 w-6 p-0"
                        >
                          {showPasswords[account.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(account.encrypted_password)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Category:</span>
                      <Badge variant="outline" className="capitalize">
                        {account.category}
                      </Badge>
                    </div>
                  </div>

                  {account.notes && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600">{account.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts stored</h3>
                <p className="text-gray-600 mb-4">Securely store your account credentials with encryption.</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detected Subscriptions Dialog */}
      <Dialog open={isDetectDialogOpen} onOpenChange={setIsDetectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detected Subscriptions</DialogTitle>
            <DialogDescription>
              We found these potential subscriptions in your expense history. Click to add them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {detectedSubscriptions.length === 0 ? (
              <p className="text-center text-gray-600 py-4">
                No subscription patterns detected in your expenses.
              </p>
            ) : (
              detectedSubscriptions.map((sub, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{sub.name}</h4>
                    <p className="text-sm text-gray-600">
                      ${sub.amount} • {sub.billing_frequency} • {sub.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confidence: {Math.round(sub.confidence * 100)}%
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddDetectedSubscription(sub)}
                  >
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
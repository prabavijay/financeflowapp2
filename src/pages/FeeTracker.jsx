import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, DollarSign, TrendingDown, Eye, EyeOff, Target, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { detectFees, getFeeAnalytics, getFeeRecommendations } from '@/utils/feeDetection';

const CATEGORY_TYPES = [
  { value: 'banking', label: 'Banking', color: 'bg-blue-500', icon: Building },
  { value: 'investment', label: 'Investment', color: 'bg-green-500', icon: TrendingDown },
  { value: 'credit_card', label: 'Credit Card', color: 'bg-red-500', icon: DollarSign },
  { value: 'other', label: 'Other', color: 'bg-gray-500', icon: AlertTriangle }
];

const DISPUTE_STATUS = [
  { value: 'none', label: 'No Dispute', color: 'bg-gray-500' },
  { value: 'pending', label: 'Dispute Pending', color: 'bg-yellow-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'denied', label: 'Denied', color: 'bg-red-500' }
];

export default function FeeTracker() {
  const [fees, setFees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [institutionFilter, setInstitutionFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetectDialogOpen, setIsDetectDialogOpen] = useState(false);
  const [detectedFees, setDetectedFees] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [newFee, setNewFee] = useState({
    fee_category_name: '',
    category_type: 'banking',
    amount: '',
    description: '',
    institution_name: '',
    account_type: '',
    date: '',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load fees from API (with fallback for mock data)
      let feesData = [];
      try {
        const feesResult = await apiClient.getFees({ timeRange });
        feesData = feesResult.data || feesResult || [];
      } catch (error) {
        console.warn('Fees API not available, using empty array');
        feesData = [];
      }
      
      // Load expenses for detection
      let expensesData = [];
      try {
        const expensesResult = await apiClient.getExpenses();
        expensesData = expensesResult.data || expensesResult || [];
      } catch (error) {
        console.warn('Expenses API not available');
        expensesData = [];
      }
      
      // Use local categories since backend endpoint may not exist yet
      const categoriesData = [
        // Banking Fees
        { id: '1', name: 'Overdraft Fee', category_type: 'banking', description: 'Fee charged when account balance goes negative', icon: 'alert-triangle', color: '#e74c3c' },
        { id: '2', name: 'ATM Fee', category_type: 'banking', description: 'Fee for using out-of-network ATMs', icon: 'credit-card', color: '#f39c12' },
        { id: '3', name: 'Monthly Maintenance', category_type: 'banking', description: 'Monthly account maintenance fee', icon: 'calendar', color: '#3498db' },
        { id: '4', name: 'Wire Transfer Fee', category_type: 'banking', description: 'Fee for domestic and international wire transfers', icon: 'send', color: '#9b59b6' },
        { id: '5', name: 'NSF Fee', category_type: 'banking', description: 'Non-sufficient funds fee', icon: 'x-circle', color: '#e74c3c' },
        { id: '6', name: 'Foreign Transaction', category_type: 'banking', description: 'Fee for international transactions', icon: 'globe', color: '#f39c12' },
        
        // Investment Fees
        { id: '7', name: 'Management Fee', category_type: 'investment', description: 'Annual portfolio management fee', icon: 'briefcase', color: '#2ecc71' },
        { id: '8', name: 'Trading Commission', category_type: 'investment', description: 'Fee per stock/bond trade', icon: 'trending-up', color: '#3498db' },
        { id: '9', name: 'Expense Ratio', category_type: 'investment', description: 'Annual mutual fund/ETF expense ratio', icon: 'percent', color: '#9b59b6' },
        { id: '10', name: 'Advisory Fee', category_type: 'investment', description: 'Financial advisor consultation fee', icon: 'user-check', color: '#2ecc71' },
        
        // Credit Card Fees
        { id: '11', name: 'Annual Fee', category_type: 'credit_card', description: 'Yearly credit card membership fee', icon: 'credit-card', color: '#e67e22' },
        { id: '12', name: 'Late Payment Fee', category_type: 'credit_card', description: 'Fee for late credit card payments', icon: 'clock', color: '#e74c3c' },
        { id: '13', name: 'Cash Advance Fee', category_type: 'credit_card', description: 'Fee for cash advances', icon: 'dollar-sign', color: '#f39c12' },
        { id: '14', name: 'Balance Transfer Fee', category_type: 'credit_card', description: 'Fee for transferring balances', icon: 'refresh-cw', color: '#3498db' },
        
        // Other Fees
        { id: '15', name: 'Service Fee', category_type: 'other', description: 'General service fees', icon: 'settings', color: '#95a5a6' },
        { id: '16', name: 'Processing Fee', category_type: 'other', description: 'Payment or transaction processing fee', icon: 'loader', color: '#95a5a6' }
      ];
      
      setFees(feesData);
      setCategories(categoriesData);
      setExpenses(expensesData);
      
      // Calculate analytics
      const analyticsData = getFeeAnalytics(feesData, timeRange);
      setAnalytics(analyticsData);
      
      // Generate recommendations
      const recommendationsData = getFeeRecommendations(feesData, analyticsData);
      setRecommendations(recommendationsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load fee data');
      
      // Set empty arrays as fallback
      setFees([]);
      setCategories([]);
      setExpenses([]);
      setAnalytics(null);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique institutions for filter
  const institutions = [...new Set(fees.map(fee => fee.institution_name).filter(Boolean))];

  // Filter fees based on search and filters
  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.institution_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.fee_category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || fee.category_type === categoryFilter;
    const matchesInstitution = institutionFilter === 'all' || fee.institution_name === institutionFilter;
    
    return matchesSearch && matchesCategory && matchesInstitution;
  });

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const feeData = {
        ...newFee,
        amount: parseFloat(newFee.amount),
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f', // TODO: Get from auth context
        detected_automatically: false,
        detection_confidence: 1.0
      };
      
      await apiClient.createFee(feeData);
      toast.success('Fee added successfully');
      setIsAddDialogOpen(false);
      setNewFee({
        fee_category_name: '',
        category_type: 'banking',
        amount: '',
        description: '',
        institution_name: '',
        account_type: '',
        date: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error adding fee:', error);
      toast.error('Failed to add fee');
    }
  };

  const handleDetectFees = async () => {
    try {
      setLoading(true);
      const detected = detectFees(expenses, fees);
      setDetectedFees(detected);
      setIsDetectDialogOpen(true);
    } catch (error) {
      console.error('Error detecting fees:', error);
      toast.error('Failed to detect fees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetectedFee = async (detectedFee) => {
    try {
      const feeData = {
        ...detectedFee,
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };
      
      await apiClient.createFee(feeData);
      toast.success(`Added ${detectedFee.fee_category_name} fee`);
      
      // Remove from detected list
      setDetectedFees(prev => prev.filter(f => f !== detectedFee));
      loadData();
    } catch (error) {
      console.error('Error adding detected fee:', error);
      toast.error('Failed to add fee');
    }
  };

  const handleDisputeFee = async (feeId, disputeReason) => {
    try {
      await apiClient.disputeFee(feeId, { reason: disputeReason });
      toast.success('Fee dispute submitted');
      loadData();
    } catch (error) {
      console.error('Error disputing fee:', error);
      toast.error('Failed to submit dispute');
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
          <h1 className="text-3xl font-bold text-gray-900">Fee Tracker</h1>
          <p className="text-gray-600">Monitor and minimize banking and investment fees</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDetectFees} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Detect Fees
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Fee</DialogTitle>
                <DialogDescription>
                  Manually add a fee that wasn&apos;t automatically detected.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddFee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fee_category">Fee Type</Label>
                    <Select
                      value={newFee.fee_category_name}
                      onValueChange={(value) => {
                        const category = categories.find(c => c.name === value);
                        setNewFee({
                          ...newFee, 
                          fee_category_name: value,
                          category_type: category?.category_type || 'other'
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee type" />
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
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newFee.amount}
                      onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
                      placeholder="35.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newFee.description}
                    onChange={(e) => setNewFee({...newFee, description: e.target.value})}
                    placeholder="Overdraft fee for account ending in 1234"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={newFee.institution_name}
                      onChange={(e) => setNewFee({...newFee, institution_name: e.target.value})}
                      placeholder="Chase Bank"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select
                      value={newFee.account_type}
                      onValueChange={(value) => setNewFee({...newFee, account_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newFee.date}
                    onChange={(e) => setNewFee({...newFee, date: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newFee.notes}
                    onChange={(e) => setNewFee({...newFee, notes: e.target.value})}
                    placeholder="Additional context about this fee..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Fee</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalFees}</div>
              <p className="text-xs text-muted-foreground">Past {timeRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Past {timeRange}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averageFee.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Per incident</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avoidable Fees</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avoidableFees.length}</div>
              <p className="text-xs text-muted-foreground">Could be prevented</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && showRecommendations && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-900">Fee Optimization Recommendations</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecommendations(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  rec.priority === 'high' ? 'bg-red-500' : 
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <p className="text-sm text-gray-700 mt-2">{rec.action}</p>
                  {rec.potential_savings && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Potential annual savings: ${rec.potential_savings.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search fees by description, institution, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="quarter">Quarter</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Institutions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map(institution => (
                  <SelectItem key={institution} value={institution}>
                    {institution}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFees.map((fee) => {
          const categoryType = CATEGORY_TYPES.find(t => t.value === fee.category_type);
          const disputeStatus = DISPUTE_STATUS.find(s => s.value === fee.dispute_status || 'none');
          const CategoryIcon = categoryType?.icon || AlertTriangle;

          return (
            <Card key={fee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{fee.fee_category_name || fee.description}</CardTitle>
                      <CardDescription>
                        {fee.institution_name && `${fee.institution_name} • `}
                        {fee.account_type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${categoryType?.color} text-white`}
                  >
                    {categoryType?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-red-600">${fee.amount}</span>
                  <span className="text-sm text-gray-600">
                    {new Date(fee.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="line-clamp-2">{fee.description}</p>
                  
                  {fee.detected_automatically && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>Auto-detected ({Math.round(fee.detection_confidence * 100)}% confidence)</span>
                    </div>
                  )}
                  
                  {fee.dispute_status && fee.dispute_status !== 'none' && (
                    <Badge 
                      variant="outline" 
                      className={`${disputeStatus?.color} text-white text-xs`}
                    >
                      {disputeStatus?.label}
                    </Badge>
                  )}
                </div>

                {fee.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 line-clamp-2">{fee.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {!fee.is_disputed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisputeFee(fee.id, 'Manual dispute request')}
                    >
                      Dispute
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this fee?')) {
                        // Handle delete
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFees.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fees found</h3>
            <p className="text-gray-600 mb-4">Start by adding fees manually or detecting them from your expenses.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Fee
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detected Fees Dialog */}
      <Dialog open={isDetectDialogOpen} onOpenChange={setIsDetectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detected Fees</DialogTitle>
            <DialogDescription>
              We found these potential fees in your expense history. Click to add them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {detectedFees.length === 0 ? (
              <p className="text-center text-gray-600 py-4">
                No fee patterns detected in your expenses.
              </p>
            ) : (
              detectedFees.map((fee, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{fee.fee_category_name}</h4>
                    <p className="text-sm text-gray-600">
                      ${fee.amount} • {fee.institution_name || 'Unknown'} • {fee.category_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      Confidence: {Math.round(fee.detection_confidence * 100)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {fee.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddDetectedFee(fee)}
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
import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, MapPin, DollarSign, Plane, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { 
  CURRENCIES, 
  getPopularCurrencies, 
  detectCurrencyFromDestination, 
  formatCurrency, 
  calculateBudgetBreakdown,
  estimateDailyBudget,
  convertCurrency
} from '@/utils/currencyConverter';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: 'bg-blue-500', icon: Clock },
  { value: 'active', label: 'Active', color: 'bg-green-500', icon: CheckCircle },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: AlertCircle }
];

export default function TravelBudgets() {
  const [travelBudgets, setTravelBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [budgetBreakdown, setBudgetBreakdown] = useState([]);
  const [newBudget, setNewBudget] = useState({
    trip_name: '',
    destination: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    currency: 'USD',
    status: 'planning',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Update currency when destination changes
  useEffect(() => {
    if (newBudget.destination && !newBudget.currency) {
      const detectedCurrency = detectCurrencyFromDestination(newBudget.destination);
      setNewBudget(prev => ({ ...prev, currency: detectedCurrency }));
    }
  }, [newBudget.destination]);

  // Calculate budget breakdown when categories or total budget changes
  useEffect(() => {
    if (categories.length > 0 && newBudget.total_budget) {
      const breakdown = calculateBudgetBreakdown(parseFloat(newBudget.total_budget), categories);
      setBudgetBreakdown(breakdown);
    }
  }, [categories, newBudget.total_budget]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load travel budgets - use fallback for API errors
      let budgetsData = [];
      try {
        const budgetsResult = await apiClient.getTravelBudgets();
        budgetsData = budgetsResult.data || budgetsResult || [];
      } catch (error) {
        console.warn('Travel budgets API not available, using empty array');
        budgetsData = [];
      }
      
      // Use local categories since backend endpoint may not exist yet
      const categoriesData = [
        { id: '1', name: 'accommodation', description: 'Hotels, Airbnb, hostels', icon: 'bed', color: '#3498db', typical_percentage: 35.00 },
        { id: '2', name: 'transportation', description: 'Flights, trains, buses, car rental', icon: 'plane', color: '#e74c3c', typical_percentage: 25.00 },
        { id: '3', name: 'food', description: 'Restaurants, groceries, street food', icon: 'utensils', color: '#f39c12', typical_percentage: 20.00 },
        { id: '4', name: 'activities', description: 'Tours, attractions, entertainment', icon: 'map-pin', color: '#2ecc71', typical_percentage: 15.00 },
        { id: '5', name: 'shopping', description: 'Souvenirs, clothing, gifts', icon: 'shopping-bag', color: '#9b59b6', typical_percentage: 3.00 },
        { id: '6', name: 'miscellaneous', description: 'Insurance, visas, tips, other', icon: 'help-circle', color: '#95a5a6', typical_percentage: 2.00 }
      ];
      
      setTravelBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load travel budget data');
      
      // Set empty arrays as fallback
      setTravelBudgets([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter budgets based on search and filters
  const filteredBudgets = travelBudgets.filter(budget => {
    const matchesSearch = budget.trip_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate analytics
  const analytics = {
    totalBudgets: travelBudgets.length,
    activeBudgets: travelBudgets.filter(b => b.status === 'active').length,
    totalPlanned: travelBudgets
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + parseFloat(b.total_budget || 0), 0),
    totalSpent: travelBudgets
      .reduce((sum, b) => sum + parseFloat(b.actual_spent || 0), 0),
    upcomingTrips: travelBudgets.filter(b => {
      if (b.status !== 'planning' && b.status !== 'active') return false;
      const startDate = new Date(b.start_date);
      const today = new Date();
      const diffDays = Math.ceil((startDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30;
    }).length
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...newBudget,
        total_budget: parseFloat(newBudget.total_budget),
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f' // TODO: Get from auth context
      };
      
      await apiClient.createTravelBudget(budgetData);
      toast.success('Travel budget created successfully');
      setIsAddDialogOpen(false);
      setNewBudget({
        trip_name: '',
        destination: '',
        start_date: '',
        end_date: '',
        total_budget: '',
        currency: 'USD',
        status: 'planning',
        notes: ''
      });
      setBudgetBreakdown([]);
      loadData();
    } catch (error) {
      console.error('Error creating travel budget:', error);
      toast.error('Failed to create travel budget');
    }
  };

  const handleStatusChange = async (budgetId, newStatus) => {
    try {
      await apiClient.updateTravelBudget(budgetId, { status: newStatus });
      toast.success('Travel budget status updated');
      loadData();
    } catch (error) {
      console.error('Error updating travel budget:', error);
      toast.error('Failed to update travel budget');
    }
  };

  const handleViewDetails = (budget) => {
    setSelectedBudget(budget);
    setIsDetailDialogOpen(true);
  };

  const calculateProgress = (budget) => {
    const spent = parseFloat(budget.actual_spent || 0);
    const total = parseFloat(budget.total_budget || 1);
    return Math.min((spent / total) * 100, 100);
  };

  const getDaysUntilTrip = (startDate) => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTripDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
          <h1 className="text-3xl font-bold text-gray-900">Travel Budget Planner</h1>
          <p className="text-gray-600">Plan and track your travel expenses with multi-currency support</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Plan New Travel Budget</DialogTitle>
              <DialogDescription>
                Create a comprehensive budget for your upcoming trip with automatic currency detection.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trip_name">Trip Name</Label>
                  <Input
                    id="trip_name"
                    value={newBudget.trip_name}
                    onChange={(e) => setNewBudget({...newBudget, trip_name: e.target.value})}
                    placeholder="Europe Vacation 2025"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={newBudget.destination}
                    onChange={(e) => setNewBudget({...newBudget, destination: e.target.value})}
                    placeholder="Paris, France"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newBudget.start_date}
                    onChange={(e) => setNewBudget({...newBudget, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newBudget.end_date}
                    onChange={(e) => setNewBudget({...newBudget, end_date: e.target.value})}
                    min={newBudget.start_date}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newBudget.status}
                    onValueChange={(value) => setNewBudget({...newBudget, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.slice(0, 2).map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_budget">Total Budget</Label>
                  <Input
                    id="total_budget"
                    type="number"
                    step="0.01"
                    value={newBudget.total_budget}
                    onChange={(e) => setNewBudget({...newBudget, total_budget: e.target.value})}
                    placeholder="5000.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={newBudget.currency}
                    onValueChange={(value) => setNewBudget({...newBudget, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getPopularCurrencies().map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Budget Breakdown Preview */}
              {budgetBreakdown.length > 0 && (
                <div className="space-y-2">
                  <Label>Suggested Budget Breakdown</Label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {budgetBreakdown.map(category => (
                      <div key={category.id} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="capitalize">{category.name}</span>
                        <span className="font-medium">
                          {formatCurrency(category.suggestedAmount, newBudget.currency)} ({category.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily Budget Preview */}
              {newBudget.start_date && newBudget.end_date && newBudget.total_budget && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Budget Overview</h4>
                  {(() => {
                    const dailyInfo = estimateDailyBudget(
                      parseFloat(newBudget.total_budget), 
                      newBudget.start_date, 
                      newBudget.end_date
                    );
                    return (
                      <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
                        <div>
                          <span className="block font-medium">Trip Duration</span>
                          <span>{dailyInfo.totalDays} days</span>
                        </div>
                        <div>
                          <span className="block font-medium">Daily Budget</span>
                          <span>{formatCurrency(dailyInfo.dailyBudget, newBudget.currency)}</span>
                        </div>
                        <div>
                          <span className="block font-medium">Weekly Budget</span>
                          <span>{formatCurrency(dailyInfo.weeklyBudget, newBudget.currency)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newBudget.notes}
                  onChange={(e) => setNewBudget({...newBudget, notes: e.target.value})}
                  placeholder="Special considerations, planned activities, etc."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Travel Budget</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Plane className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBudgets}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeBudgets}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planned</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalPlanned.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Budget allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.upcomingTrips}</div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search trips by name or destination..."
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

      {/* Travel Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map((budget) => {
          const progress = calculateProgress(budget);
          const daysUntil = getDaysUntilTrip(budget.start_date);
          const duration = getTripDuration(budget.start_date, budget.end_date);
          const statusOption = STATUS_OPTIONS.find(s => s.value === budget.status);
          const StatusIcon = statusOption?.icon || Clock;

          return (
            <Card key={budget.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{budget.trip_name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {budget.destination}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${statusOption?.color} text-white flex items-center gap-1`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusOption?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {formatCurrency(budget.total_budget, budget.currency)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {duration} days
                  </span>
                </div>
                
                {/* Budget Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Spent: {formatCurrency(budget.actual_spent || 0, budget.currency)}</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{new Date(budget.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>{new Date(budget.end_date).toLocaleDateString()}</span>
                  </div>
                  {daysUntil >= 0 && budget.status !== 'completed' && (
                    <div className="flex justify-between">
                      <span>Starts in:</span>
                      <span className="font-medium">
                        {daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                      </span>
                    </div>
                  )}
                </div>

                {budget.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 line-clamp-2">{budget.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(budget)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {budget.status === 'planning' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(budget.id, 'active')}
                    >
                      Start Trip
                    </Button>
                  )}
                  {budget.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(budget.id, 'completed')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBudgets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Plane className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No travel budgets found</h3>
            <p className="text-gray-600 mb-4">Start planning your next adventure with a travel budget.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Plan Your First Trip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Budget Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedBudget?.trip_name}</DialogTitle>
            <DialogDescription>
              Detailed view and expense tracking for your trip
            </DialogDescription>
          </DialogHeader>
          {selectedBudget && (
            <div className="space-y-6">
              {/* Trip Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Destination</Label>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedBudget.destination}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Duration</Label>
                  <p>{getTripDuration(selectedBudget.start_date, selectedBudget.end_date)} days</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Budget</Label>
                  <p className="text-lg font-bold">
                    {formatCurrency(selectedBudget.total_budget, selectedBudget.currency)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Spent</Label>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(selectedBudget.actual_spent || 0, selectedBudget.currency)}
                  </p>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm font-medium">Budget Usage</Label>
                  <span className="text-sm font-medium">
                    {calculateProgress(selectedBudget).toFixed(1)}%
                  </span>
                </div>
                <Progress value={calculateProgress(selectedBudget)} className="h-3" />
              </div>

              {selectedBudget.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                    {selectedBudget.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
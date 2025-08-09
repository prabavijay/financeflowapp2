import React, { useState, useEffect } from "react";
import { Income } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Plus, Edit, Calendar, DollarSign, Filter } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

const INCOME_CATEGORIES = [
  { value: 'salary', label: 'Salary', color: 'bg-blue-100 text-blue-800' },
  { value: 'freelance', label: 'Freelance', color: 'bg-purple-100 text-purple-800' },
  { value: 'investment', label: 'Investment', color: 'bg-green-100 text-green-800' },
  { value: 'rental', label: 'Rental', color: 'bg-orange-100 text-orange-800' },
  { value: 'business', label: 'Business', color: 'bg-red-100 text-red-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one-time', label: 'One-time' }
];

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    frequency: 'monthly',
    category: 'salary',
    date_received: '',
    description: '',
    is_recurring: false
  });

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const data = await Income.list('-date_received');
      setIncomes(data || []);
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingIncome) {
        await Income.update(editingIncome.id, data);
      } else {
        await Income.create(data);
      }

      setIsDialogOpen(false);
      setEditingIncome(null);
      setFormData({
        source: '',
        amount: '',
        frequency: 'monthly',
        category: 'salary',
        date_received: '',
        description: '',
        is_recurring: false
      });
      loadIncomes();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      source: income.source || '',
      amount: income.amount?.toString() || '',
      frequency: income.frequency || 'monthly',
      category: income.category || 'salary',
      date_received: income.date_received || '',
      description: income.description || '',
      is_recurring: income.is_recurring || false
    });
    setIsDialogOpen(true);
  };

  const filteredIncomes = filter === 'all' 
    ? incomes 
    : incomes.filter(income => income.category === filter);

  const totalIncome = filteredIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);

  const getCategoryData = () => {
    const categoryTotals = {};
    incomes.forEach(income => {
      categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category: INCOME_CATEGORIES.find(c => c.value === category)?.label || category,
      amount
    }));
  };

  const getMonthlyData = () => {
    const monthlyTotals = {};
    incomes.forEach(income => {
      const month = format(new Date(income.date_received), 'MMM yyyy');
      monthlyTotals[month] = (monthlyTotals[month] || 0) + income.amount;
    });

    return Object.entries(monthlyTotals).map(([month, amount]) => ({
      month,
      amount
    }));
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your income sources</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Edit Income' : 'Add New Income'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source">Income Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder="e.g., Salary, Freelance Project"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_received">Date Received</Label>
                  <Input
                    id="date_received"
                    type="date"
                    value={formData.date_received}
                    onChange={(e) => setFormData({...formData, date_received: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked})}
                />
                <Label htmlFor="is_recurring">Recurring Income</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingIncome ? 'Update' : 'Add'} Income
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-green-700">
              {filteredIncomes.length} income sources
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Average Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              ${filteredIncomes.length > 0 ? (totalIncome / filteredIncomes.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-blue-700">
              Per source
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Recurring Income</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ${incomes.filter(i => i.is_recurring).reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-purple-700">
              Monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-500" />
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        {INCOME_CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant={filter === category.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(category.value)}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCategoryData()}>
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Income Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMonthlyData()}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Income List */}
      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredIncomes.map((income) => (
              <div key={income.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{income.source}</h3>
                    <Badge className={INCOME_CATEGORIES.find(c => c.value === income.category)?.color}>
                      {INCOME_CATEGORIES.find(c => c.value === income.category)?.label}
                    </Badge>
                    {income.is_recurring && (
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {income.frequency}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(income.date_received), 'MMM d, yyyy')}
                    {income.description && ` • ${income.description}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${income.amount?.toFixed(2)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(income)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredIncomes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No income records found</p>
                <p className="text-sm">Add your first income to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
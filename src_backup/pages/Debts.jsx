import React, { useState, useEffect } from "react";
import { Debt } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, Plus, Edit, TrendingDown, DollarSign, AlertTriangle, Target } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', color: 'bg-red-100 text-red-800' },
  { value: 'loan', label: 'Personal Loan', color: 'bg-blue-100 text-blue-800' },
  { value: 'mortgage', label: 'Mortgage', color: 'bg-green-100 text-green-800' },
  { value: 'student_loan', label: 'Student Loan', color: 'bg-purple-100 text-purple-800' },
  { value: 'personal_loan', label: 'Personal Loan', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const PRIORITIES = [
  { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' }
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#f97316'];

export default function DebtsPage() {
  const [debts, setDebts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    original_amount: '',
    interest_rate: '',
    minimum_payment: '',
    due_date: '',
    type: 'credit_card',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const data = await Debt.list('-balance');
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        balance: parseFloat(formData.balance),
        original_amount: parseFloat(formData.original_amount),
        interest_rate: parseFloat(formData.interest_rate),
        minimum_payment: parseFloat(formData.minimum_payment)
      };

      if (editingDebt) {
        await Debt.update(editingDebt.id, data);
      } else {
        await Debt.create(data);
      }

      setIsDialogOpen(false);
      setEditingDebt(null);
      setFormData({
        name: '',
        balance: '',
        original_amount: '',
        interest_rate: '',
        minimum_payment: '',
        due_date: '',
        type: 'credit_card',
        priority: 'medium',
        notes: ''
      });
      loadDebts();
    } catch (error) {
      console.error('Error saving debt:', error);
    }
  };

  const handleEdit = (debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name || '',
      balance: debt.balance?.toString() || '',
      original_amount: debt.original_amount?.toString() || '',
      interest_rate: debt.interest_rate?.toString() || '',
      minimum_payment: debt.minimum_payment?.toString() || '',
      due_date: debt.due_date || '',
      type: debt.type || 'credit_card',
      priority: debt.priority || 'medium',
      notes: debt.notes || ''
    });
    setIsDialogOpen(true);
  };

  const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + (debt.minimum_payment || 0), 0);
  const averageInterestRate = debts.length > 0 
    ? debts.reduce((sum, debt) => sum + (debt.interest_rate || 0), 0) / debts.length 
    : 0;

  const getDebtsByType = () => {
    const typeData = {};
    debts.forEach(debt => {
      typeData[debt.type] = (typeData[debt.type] || 0) + debt.balance;
    });

    return Object.entries(typeData).map(([type, balance]) => ({
      name: DEBT_TYPES.find(t => t.value === type)?.label || type,
      value: balance
    }));
  };

  const getDebtsByPriority = () => {
    const priorityData = {};
    debts.forEach(debt => {
      priorityData[debt.priority] = (priorityData[debt.priority] || 0) + debt.balance;
    });

    return Object.entries(priorityData).map(([priority, balance]) => ({
      priority: PRIORITIES.find(p => p.value === priority)?.label || priority,
      balance
    }));
  };

  const calculatePayoffTime = (debt) => {
    if (!debt.balance || !debt.minimum_payment || !debt.interest_rate) return 'N/A';
    
    const monthlyRate = debt.interest_rate / 100 / 12;
    const months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / debt.minimum_payment) / Math.log(1 + monthlyRate)
    );
    
    if (months <= 0 || !isFinite(months)) return 'N/A';
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years}y ${remainingMonths}m`;
    } else {
      return `${remainingMonths}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Debt Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your debts strategically</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDebt ? 'Edit Debt' : 'Add New Debt'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Debt Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Chase Credit Card, Student Loan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="balance">Current Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_amount">Original Amount</Label>
                  <Input
                    id="original_amount"
                    type="number"
                    step="0.01"
                    value={formData.original_amount}
                    onChange={(e) => setFormData({...formData, original_amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                    placeholder="18.99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimum_payment">Minimum Payment</Label>
                  <Input
                    id="minimum_payment"
                    type="number"
                    step="0.01"
                    value={formData.minimum_payment}
                    onChange={(e) => setFormData({...formData, minimum_payment: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Debt Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEBT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingDebt ? 'Update' : 'Add'} Debt
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Debt</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${totalDebt.toFixed(2)}</div>
            <p className="text-xs text-red-700">
              {debts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Min. Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${totalMinimumPayment.toFixed(2)}</div>
            <p className="text-xs text-orange-700">
              Monthly minimum
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Avg. Interest Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{averageInterestRate.toFixed(1)}%</div>
            <p className="text-xs text-purple-700">
              Across all debts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-red-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {debts.filter(d => d.priority === 'high').length}
            </div>
            <p className="text-xs text-yellow-700">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Debt by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getDebtsByType()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getDebtsByType().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debt by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getDebtsByPriority()}>
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="balance" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Debt List */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debts.map((debt) => (
              <div key={debt.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{debt.name}</h3>
                    <Badge className={DEBT_TYPES.find(t => t.value === debt.type)?.color}>
                      {DEBT_TYPES.find(t => t.value === debt.type)?.label}
                    </Badge>
                    <Badge className={PRIORITIES.find(p => p.value === debt.priority)?.color}>
                      {PRIORITIES.find(p => p.value === debt.priority)?.label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Balance:</span> ${debt.balance?.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Interest:</span> {debt.interest_rate}%
                    </div>
                    <div>
                      <span className="font-medium">Min. Payment:</span> ${debt.minimum_payment?.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Payoff Time:</span> {calculatePayoffTime(debt)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Due: {format(new Date(debt.due_date), 'MMM d, yyyy')}
                    {debt.notes && ` • ${debt.notes}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">${debt.balance?.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      {debt.original_amount ? `of $${debt.original_amount.toFixed(2)}` : ''}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(debt)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {debts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No debts found</p>
                <p className="text-sm">Add your first debt to start tracking</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
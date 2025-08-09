import React, { useState, useEffect } from "react";
import { Bill } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt, Plus, Edit, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

const BILL_CATEGORIES = [
  { value: 'utilities', label: 'Utilities', color: 'bg-blue-100 text-blue-800' },
  { value: 'rent', label: 'Rent', color: 'bg-purple-100 text-purple-800' },
  { value: 'mortgage', label: 'Mortgage', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'insurance', label: 'Insurance', color: 'bg-green-100 text-green-800' },
  { value: 'phone', label: 'Phone', color: 'bg-pink-100 text-pink-800' },
  { value: 'internet', label: 'Internet', color: 'bg-teal-100 text-teal-800' },
  { value: 'subscription', label: 'Subscription', color: 'bg-orange-100 text-orange-800' },
  { value: 'loan', label: 'Loan', color: 'bg-red-100 text-red-800' },
  { value: 'credit_card', label: 'Credit Card', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: '',
    category: 'utilities',
    status: 'pending',
    is_recurring: true,
    frequency: 'monthly',
    auto_pay: false,
    notes: ''
  });

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await Bill.list('-due_date');
      setBills(data || []);
    } catch (error) {
      console.error('Error loading bills:', error);
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

      if (editingBill) {
        await Bill.update(editingBill.id, data);
      } else {
        await Bill.create(data);
      }

      setIsDialogOpen(false);
      setEditingBill(null);
      setFormData({
        name: '',
        amount: '',
        due_date: '',
        category: 'utilities',
        status: 'pending',
        is_recurring: true,
        frequency: 'monthly',
        auto_pay: false,
        notes: ''
      });
      loadBills();
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      name: bill.name || '',
      amount: bill.amount?.toString() || '',
      due_date: bill.due_date || '',
      category: bill.category || 'utilities',
      status: bill.status || 'pending',
      is_recurring: bill.is_recurring || true,
      frequency: bill.frequency || 'monthly',
      auto_pay: bill.auto_pay || false,
      notes: bill.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (billId, newStatus) => {
    try {
      const bill = bills.find(b => b.id === billId);
      await Bill.update(billId, { ...bill, status: newStatus });
      loadBills();
    } catch (error) {
      console.error('Error updating bill status:', error);
    }
  };

  const filteredBills = filter === 'all' 
    ? bills 
    : bills.filter(bill => bill.status === filter);

  const getUpcomingBills = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return bills.filter(bill => {
      const dueDate = new Date(bill.due_date);
      return bill.status === 'pending' && dueDate >= today && dueDate <= nextWeek;
    });
  };

  const getOverdueBills = () => {
    const today = new Date();
    return bills.filter(bill => {
      const dueDate = new Date(bill.due_date);
      return bill.status === 'pending' && isBefore(dueDate, today);
    });
  };

  const totalBills = filteredBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
  const upcomingBills = getUpcomingBills();
  const overdueBills = getOverdueBills();

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
          <h1 className="text-3xl font-bold text-gray-900">Bills & Payments</h1>
          <p className="text-gray-600 mt-1">Track and manage your recurring bills</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBill ? 'Edit Bill' : 'Add New Bill'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bill Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Electric Bill, Netflix"
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
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
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
                      {BILL_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked})}
                />
                <Label htmlFor="is_recurring">Recurring Bill</Label>
              </div>

              {formData.is_recurring && (
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
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_pay"
                  checked={formData.auto_pay}
                  onCheckedChange={(checked) => setFormData({...formData, auto_pay: checked})}
                />
                <Label htmlFor="auto_pay">Auto-Pay Enabled</Label>
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
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {editingBill ? 'Update' : 'Add'} Bill
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Total Bills</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${totalBills.toFixed(2)}</div>
            <p className="text-xs text-orange-700">
              {filteredBills.length} bills
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue Bills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{overdueBills.length}</div>
            <p className="text-xs text-red-700">
              ${overdueBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Due This Week</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{upcomingBills.length}</div>
            <p className="text-xs text-yellow-700">
              ${upcomingBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Paid Bills</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {bills.filter(b => b.status === 'paid').length}
            </div>
            <p className="text-xs text-green-700">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Bills
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'paid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('paid')}
        >
          Paid
        </Button>
        <Button
          variant={filter === 'overdue' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('overdue')}
        >
          Overdue
        </Button>
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Bills (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{bill.name}</h3>
                      <Badge className={BILL_CATEGORIES.find(c => c.value === bill.category)?.color}>
                        {BILL_CATEGORIES.find(c => c.value === bill.category)?.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Due: {format(new Date(bill.due_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${bill.amount.toFixed(2)}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(bill.id, 'paid')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
              {upcomingBills.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No bills due in the next 7 days</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Bills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Overdue Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{bill.name}</h3>
                      <Badge className={BILL_CATEGORIES.find(c => c.value === bill.category)?.color}>
                        {BILL_CATEGORIES.find(c => c.value === bill.category)?.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-red-600">
                      Overdue: {format(new Date(bill.due_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-bold text-red-600">${bill.amount.toFixed(2)}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(bill.id, 'paid')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
              {overdueBills.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p>No overdue bills!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Bills */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                    <Badge className={BILL_CATEGORIES.find(c => c.value === bill.category)?.color}>
                      {BILL_CATEGORIES.find(c => c.value === bill.category)?.label}
                    </Badge>
                    <Badge variant={bill.status === 'paid' ? 'default' : bill.status === 'overdue' ? 'destructive' : 'secondary'}>
                      {bill.status}
                    </Badge>
                    {bill.auto_pay && (
                      <Badge variant="outline">Auto-Pay</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Due: {format(new Date(bill.due_date), 'MMM d, yyyy')}
                    {bill.is_recurring && ` • ${bill.frequency}`}
                    {bill.notes && ` • ${bill.notes}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">${bill.amount?.toFixed(2)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(bill)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredBills.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No bills found</p>
                <p className="text-sm">Add your first bill to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
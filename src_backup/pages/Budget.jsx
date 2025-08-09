
import React, { useState, useEffect, useMemo } from 'react';
import { BudgetItem } from '@/api/entities';
import { Income } from '@/api/entities';
import { Expense } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, ArrowRight, TrendingUp, TrendingDown, Target, FileText, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, getDaysInMonth } from 'date-fns';

const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'semi-monthly', label: 'Semi-Monthly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' }
];

const BudgetItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState(
    item || {
      name: '',
      type: 'expense',
      amount: '',
      category: '',
      frequency: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      day_of_month_1: 1,
      day_of_month_2: 15,
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      amount: parseFloat(formData.amount),
      day_of_month_1: parseInt(formData.day_of_month_1),
      day_of_month_2: formData.day_of_month_2 ? parseInt(formData.day_of_month_2) : null,
    };
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="frequency">Frequency</Label>
        <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{FREQUENCY_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
      </div>
      {['monthly', 'semi-monthly'].includes(formData.frequency) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="day_of_month_1">Day of Month 1</Label>
            <Input id="day_of_month_1" type="number" min="1" max="31" value={formData.day_of_month_1} onChange={(e) => setFormData({ ...formData, day_of_month_1: e.target.value })} />
          </div>
          {formData.frequency === 'semi-monthly' && (
            <div className="space-y-2">
              <Label htmlFor="day_of_month_2">Day of Month 2</Label>
              <Input id="day_of_month_2" type="number" min="1" max="31" value={formData.day_of_month_2} onChange={(e) => setFormData({ ...formData, day_of_month_2: e.target.value })} />
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Item</Button>
      </div>
    </form>
  );
};

export default function BudgetPage() {
  const [budgetItems, setBudgetItems] = useState([]);
  const [actuals, setActuals] = useState({ income: [], expenses: [] });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const period = useMemo(() => ({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  }), [currentMonth]);

  const loadData = async () => {
    const items = await BudgetItem.list();
    setBudgetItems(items || []);
    // In a real app, you'd filter actuals by the period
    const [income, expenses] = await Promise.all([Income.list(), Expense.list()]);
    setActuals({ income: income || [], expenses: expenses || [] });
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handleSaveItem = async (data) => {
    if (editingItem) {
      await BudgetItem.update(editingItem.id, data);
    } else {
      await BudgetItem.create(data);
    }
    await loadData();
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id) => {
    await BudgetItem.delete(id);
    await loadData();
  };
  
  const projectedEvents = useMemo(() => {
    const events = [];
    const daysInPeriod = eachDayOfInterval({ start: period.start, end: period.end });

    budgetItems.forEach(item => {
      const itemStartDate = new Date(item.start_date);
      daysInPeriod.forEach(day => {
        let shouldAdd = false;
        if (day < itemStartDate) return;

        switch (item.frequency) {
          case 'one-time':
            if (isSameDay(day, itemStartDate)) shouldAdd = true;
            break;
          case 'monthly':
            if (day.getDate() === item.day_of_month_1) shouldAdd = true;
            break;
          case 'semi-monthly':
            if (day.getDate() === item.day_of_month_1 || day.getDate() === item.day_of_month_2) shouldAdd = true;
            break;
          case 'weekly':
            if (day.getDay() === itemStartDate.getDay()) shouldAdd = true;
            break;
          case 'bi-weekly':
            const diffDays = (day.getTime() - itemStartDate.getTime()) / (1000 * 3600 * 24);
            if (diffDays % 14 === 0) shouldAdd = true;
            break;
          case 'yearly':
            if(day.getMonth() === itemStartDate.getMonth() && day.getDate() === itemStartDate.getDate()) shouldAdd = true;
            break;
        }

        if (shouldAdd) {
          events.push({ ...item, date: day });
        }
      });
    });
    return events.sort((a,b) => a.date - b.date);
  }, [budgetItems, period]);

  const projectedIncome = projectedEvents.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const projectedExpenses = projectedEvents.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const projectedNet = projectedIncome - projectedExpenses;
  
  const actualIncome = actuals.income
    .filter(i => new Date(i.date_received) >= period.start && new Date(i.date_received) <= period.end)
    .reduce((sum, i) => sum + i.amount, 0);
  
  const actualExpenses = actuals.expenses
    .filter(e => new Date(e.date) >= period.start && new Date(e.date) <= period.end)
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetVsActualProgress = projectedExpenses > 0 ? (actualExpenses / projectedExpenses) * 100 : 0;

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Planner</h1>
          <div className="flex items-center gap-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>Prev</Button>
            <h2 className="text-xl font-semibold text-gray-700">{format(currentMonth, 'MMMM yyyy')}</h2>
            <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>Next</Button>
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" /> Add Budget Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Budget Item</DialogTitle></DialogHeader>
            <BudgetItemForm
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => { setIsFormOpen(false); setEditingItem(null); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-green-800"><TrendingUp /> Projected Income</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-900">${projectedIncome.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-red-800"><TrendingDown /> Projected Expenses</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-900">${projectedExpenses.toFixed(2)}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader><CardTitle className="flex items-center gap-2 text-blue-800"><Target/> Projected Net</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-900">${projectedNet.toFixed(2)}</p></CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Budget vs Actual Expenses</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-bold text-red-600">${actualExpenses.toFixed(2)} <span className="text-sm font-normal text-gray-500">spent</span></p>
                  <p className="text-lg font-bold text-gray-800">${projectedExpenses.toFixed(2)} <span className="text-sm font-normal text-gray-500">budgeted</span></p>
              </div>
              <Progress value={budgetVsActualProgress} className="w-full" />
              <p className="text-right text-sm text-gray-600 mt-1">${(projectedExpenses - actualExpenses).toFixed(2)} remaining</p>
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText /> Budget Items</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {budgetItems.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border">
                <div>
                  <p className="font-semibold">{item.name} <span className={`text-sm font-normal ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>(${item.type})</span></p>
                  <p className="text-xs text-gray-500">{item.category} | ${item.amount.toFixed(2)} | {item.frequency}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => {setEditingItem(item); setIsFormOpen(true);}}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar /> Projected Events for {format(currentMonth, 'MMMM')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {projectedEvents.map((event, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border">
                <div>
                  <p className="font-semibold">{format(event.date, 'MMM do')} - {event.name}</p>
                </div>
                <p className={`font-bold ${event.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {event.type === 'income' ? '+' : '-'}${event.amount.toFixed(2)}
                </p>
              </div>
            ))}
            {projectedEvents.length === 0 && <p className="text-gray-500 text-center py-4">No budget events for this month.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

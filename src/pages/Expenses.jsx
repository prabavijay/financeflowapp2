import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Plus, 
  TrendingDown, 
  CreditCard, 
  ShoppingBag, 
  Car,
  Home,
  Utensils,
  Heart,
  Gamepad2,
  GraduationCap,
  Plane,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Search,
  Filter,
  Receipt
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts'

const Expenses = () => {
  const [expenseData, setExpenseData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('Personal')
  const [formData, setFormData] = useState({
    description: '',
    category: 'food',
    amount: '',
    payment_method: 'credit_card',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    frequency: '',
    owner: 'Personal'
  })

  const expenseCategories = [
    { value: 'food', label: 'Food & Dining', icon: Utensils, color: 'emerald' },
    { value: 'transportation', label: 'Transportation', icon: Car, color: 'blue' },
    { value: 'housing', label: 'Housing', icon: Home, color: 'purple' },
    { value: 'utilities', label: 'Utilities', icon: Home, color: 'slate' },
    { value: 'healthcare', label: 'Healthcare', icon: Heart, color: 'red' },
    { value: 'entertainment', label: 'Entertainment', icon: Gamepad2, color: 'indigo' },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'pink' },
    { value: 'insurance', label: 'Insurance', icon: ShoppingBag, color: 'yellow' },
    { value: 'debt_payments', label: 'Debt Payments', icon: CreditCard, color: 'red' },
    { value: 'other', label: 'Other', icon: DollarSign, color: 'gray' }
  ]

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' }
  ]

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  useEffect(() => {
    loadExpenseData()
  }, [])

  const loadExpenseData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getExpenses()
      if (response.success) {
        setExpenseData(response.data)
        setError(null)
      } else {
        setError('Failed to load expense data')
      }
    } catch (err) {
      console.error('Error loading expense data:', err)
      setError('Failed to connect to backend. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    try {
      const expenseDataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date
      }
      
      const response = await apiClient.createExpense(expenseDataToSend)
      if (response.success) {
        // Reload expense data to get updated list
        await loadExpenseData()
        setFormData({
          description: '',
          category: 'food',
          amount: '',
          payment_method: 'credit_card',
          date: new Date().toISOString().split('T')[0],
          is_recurring: false,
          frequency: '',
          owner: 'Personal'
        })
        setShowAddForm(false)
        setError(null)
      } else {
        setError('Failed to add expense record')
      }
    } catch (err) {
      console.error('Error adding expense:', err)
      setError('Failed to add expense record')
    }
  }

  const getCategoryInfo = (category) => {
    return expenseCategories.find(cat => cat.value === category) || expenseCategories[0]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateMonthlyTotal = () => {
    return expenseData.reduce((total, expense) => total + parseFloat(expense.amount), 0)
  }

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const response = await apiClient.deleteExpense(id)
        if (response.success) {
          await loadExpenseData()
        } else {
          setError('Failed to delete expense')
        }
      } catch (err) {
        console.error('Error deleting expense:', err)
        setError('Failed to delete expense')
      }
    }
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      payment_method: expense.payment_method,
      date: expense.date.split('T')[0],
      is_recurring: expense.is_recurring || false,
      frequency: expense.frequency || '',
      owner: expense.owner || 'Personal'
    })
    setShowEditForm(true)
  }

  const handleUpdateExpense = async (e) => {
    e.preventDefault()
    try {
      const expenseDataToSend = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: formData.date,
        frequency: formData.is_recurring ? formData.frequency : null
      }
      
      // Remove empty frequency if not recurring
      if (!formData.is_recurring || !formData.frequency) {
        delete expenseDataToSend.frequency
      }
      
      const response = await apiClient.updateExpense(editingExpense.id, expenseDataToSend)
      if (response.success) {
        await loadExpenseData()
        setFormData({
          description: '',
          category: 'food',
          amount: '',
          payment_method: 'credit_card',
          date: new Date().toISOString().split('T')[0],
          is_recurring: false,
          frequency: '',
          owner: 'Personal'
        })
        setShowEditForm(false)
        setEditingExpense(null)
        setError(null)
      } else {
        setError('Failed to update expense record')
      }
    } catch (err) {
      console.error('Error updating expense:', err)
      setError(`Failed to update expense: ${err.message}`)
    }
  }

  const getFilteredExpenseData = () => {
    let filteredData = expenseData
    
    // Filter by owner (Personal/Spouse/Family)
    if (activeTab === 'Family') {
      filteredData = filteredData.filter(expense => 
        expense.owner === 'Personal' || 
        expense.owner === 'Spouse' || 
        !expense.owner
      )
    } else {
      filteredData = filteredData.filter(expense => expense.owner === activeTab || !expense.owner)
    }
    
    // Filter by search term
    if (searchTerm) {
      filteredData = filteredData.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filteredData
  }

  // Chart data calculations
  const getExpensesByCategory = () => {
    const filteredData = getFilteredExpenseData()
    const categoryTotals = {}
    
    filteredData.forEach(expense => {
      const category = expense.category
      if (categoryTotals[category]) {
        categoryTotals[category] += parseFloat(expense.amount)
      } else {
        categoryTotals[category] = parseFloat(expense.amount)
      }
    })

    return Object.keys(categoryTotals).map(category => {
      const categoryInfo = getCategoryInfo(category)
      return {
        name: categoryInfo.label,
        value: categoryTotals[category],
        color: categoryInfo.color === 'emerald' ? '#10b981' : 
               categoryInfo.color === 'blue' ? '#3b82f6' :
               categoryInfo.color === 'purple' ? '#8b5cf6' :
               categoryInfo.color === 'slate' ? '#64748b' :
               categoryInfo.color === 'red' ? '#ef4444' :
               categoryInfo.color === 'indigo' ? '#6366f1' :
               categoryInfo.color === 'pink' ? '#ec4899' :
               categoryInfo.color === 'yellow' ? '#f59e0b' : '#6b7280'
      }
    })
  }


  const getMonthlyExpenseTrend = () => {
    // Mock data for trend - in real app, this would come from API
    return [
      { month: 'Jan', total: 6800 },
      { month: 'Feb', total: 7200 },
      { month: 'Mar', total: 6900 },
      { month: 'Apr', total: 7500 },
      { month: 'May', total: 7100 },
      { month: 'Jun', total: calculateMonthlyTotal() }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading expense data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="text-left mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Expense Tracking
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base">
            Track and categorize your spending to better understand your financial habits
          </p>
        </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tabs and Summary Cards */}
        <div className="flex items-center justify-between mb-4">
          {/* Tabs */}
          <TabsList className="ff-outline-tabs grid w-full grid-cols-2 max-w-md bg-transparent border border-emerald-500/40 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Personal</TabsTrigger>
            <TabsTrigger value="Business" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Business</TabsTrigger>
          </TabsList>
          
          {/* Monthly Total */}
          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Monthly Total</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculateMonthlyTotal())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {getFilteredExpenseData().length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Expenses by Category Chart */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-base">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getExpensesByCategory()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getExpensesByCategory().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>


          {/* Monthly Trend Chart */}
          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-base">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getMonthlyExpenseTrend()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Total']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 mb-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-5 h-5 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-700/90 px-3 py-2 rounded-lg border border-slate-600 outline-none text-white placeholder-slate-400 text-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            style={{ color: 'white !important' }}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50">
          <Filter className="w-5 h-5" />
          Filters
        </button>
        </div>

        {/* Expense Table */}
        <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Expense Transactions</h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Detailed breakdown of all spending with subtotals</p>
              </div>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                    <Plus className="w-4 h-4" />
                    Add Expense
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                      Track a new expense to monitor your spending patterns.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="e.g., Grocery shopping, Gas, Restaurant"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select
                          value={formData.payment_method}
                          onValueChange={(value) => setFormData({...formData, payment_method: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map(method => (
                              <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="recurring"
                        checked={formData.is_recurring}
                        onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked})}
                      />
                      <Label htmlFor="recurring">This is a recurring expense</Label>
                    </div>

                    {formData.is_recurring && (
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                          value={formData.frequency}
                          onValueChange={(value) => setFormData({...formData, frequency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            {frequencies.map(freq => (
                              <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="owner">Owner</Label>
                      <Select
                        value={formData.owner}
                        onValueChange={(value) => setFormData({...formData, owner: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Personal">Personal</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        Add Expense
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

        {getFilteredExpenseData().length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-slate-300 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-cyan-100 mb-2">No Expenses Found</h3>
            <p className="text-slate-600 dark:text-cyan-300">Add your first expense to get started with tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-200 to-slate-300 dark:from-gray-700 dark:to-gray-800 border-b-4 border-slate-400 dark:border-gray-500">
                <tr>
                  <th className="text-left p-6 font-bold text-slate-900 dark:text-white text-lg uppercase tracking-wide">Description</th>
                  <th className="text-left p-6 font-bold text-slate-900 dark:text-white text-lg uppercase tracking-wide">Category</th>
                  <th className="text-left p-6 font-bold text-slate-900 dark:text-white text-lg uppercase tracking-wide">Payment Method</th>
                  <th className="text-right p-6 font-bold text-slate-900 dark:text-white text-lg uppercase tracking-wide">Amount</th>
                  <th className="text-left p-6 font-bold text-slate-900 dark:text-white text-lg uppercase tracking-wide">Date</th>
                  <th className="text-left p-6 font-bold text-slate-900 dark:text-white text-lg uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredExpenseData().map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category)
                  const CategoryIcon = categoryInfo.icon
                  
                  return (
                    <tr key={expense.id} className="border-b border-slate-100 dark:border-gray-700/30 hover:bg-slate-50 dark:hover:bg-gray-700/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 rounded-lg`}>
                            <CategoryIcon className={`w-5 h-5 text-${categoryInfo.color}-600 dark:text-${categoryInfo.color}-400`} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-cyan-100">{expense.description}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 font-semibold rounded-full bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-300`}>
                          {categoryInfo.label}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                          <span className="font-semibold text-slate-600 dark:text-cyan-300 capitalize">
                            {expense.payment_method.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-bold text-red-600 dark:text-red-400">
                          -{formatCurrency(expense.amount)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                          <span className="font-semibold text-slate-600 dark:text-cyan-300">
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Dialog open={showEditForm && editingExpense?.id === expense.id} onOpenChange={(open) => {
                            if (!open) {
                              setShowEditForm(false)
                              setEditingExpense(null)
                            }
                          }}>
                            <DialogTrigger asChild>
                              <button 
                                onClick={() => handleEditExpense(expense)}
                                className="p-2 text-slate-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Expense</DialogTitle>
                                <DialogDescription>
                                  Update the details of this expense record.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <form onSubmit={handleUpdateExpense} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Input
                                    id="edit-description"
                                    type="text"
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="e.g., Grocery shopping, Gas, Restaurant"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select
                                      value={formData.category}
                                      onValueChange={(value) => setFormData({...formData, category: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {expenseCategories.map(cat => (
                                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-payment-method">Payment Method</Label>
                                    <Select
                                      value={formData.payment_method}
                                      onValueChange={(value) => setFormData({...formData, payment_method: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {paymentMethods.map(method => (
                                          <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <Input
                                      id="edit-amount"
                                      type="number"
                                      required
                                      min="0"
                                      step="0.01"
                                      value={formData.amount}
                                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                      placeholder="0.00"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-date">Date</Label>
                                    <Input
                                      id="edit-date"
                                      type="date"
                                      required
                                      value={formData.date}
                                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id="edit-recurring"
                                    checked={formData.is_recurring}
                                    onCheckedChange={(checked) => setFormData({...formData, is_recurring: checked})}
                                  />
                                  <Label htmlFor="edit-recurring">This is a recurring expense</Label>
                                </div>

                                {formData.is_recurring && (
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-frequency">Frequency</Label>
                                    <Select
                                      value={formData.frequency}
                                      onValueChange={(value) => setFormData({...formData, frequency: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select frequency" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {frequencies.map(freq => (
                                          <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label htmlFor="edit-owner">Owner</Label>
                                  <Select
                                    value={formData.owner}
                                    onValueChange={(value) => setFormData({...formData, owner: value})}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Personal">Personal</SelectItem>
                                      <SelectItem value="Business">Business</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowEditForm(false)
                                      setEditingExpense(null)
                                      setFormData({
                                        description: '',
                                        category: 'food',
                                        amount: '',
                                        payment_method: 'credit_card',
                                        date: new Date().toISOString().split('T')[0],
                                        is_recurring: false,
                                        frequency: '',
                                        owner: 'Personal'
                                      })
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" className="flex-1">
                                    Update Expense
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <button 
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-slate-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                
                {/* Subtotal Row */}
                <tr className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-600 dark:to-gray-700 border-t-4 border-slate-400 dark:border-gray-500 font-bold">
                  <td colSpan="3" className="p-6 text-right text-slate-900 dark:text-white text-lg">
                    Total Expenses:
                  </td>
                  <td className="p-6 text-right text-red-600 dark:text-red-400 font-bold text-xl">
                    -{formatCurrency(calculateMonthlyTotal())}
                  </td>
                  <td colSpan="3" className="p-6"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Tab Content */}
        {['Personal', 'Business'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {/* Content is shared across tabs, filtered by activeTab */}
          </TabsContent>
        ))}
      </Tabs>



      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default Expenses
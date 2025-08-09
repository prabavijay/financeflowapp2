import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Edit,
  Trash2,
  Receipt
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts'

const Budget = () => {
  const [activeTab, setActiveTab] = useState('Personal')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [budgets, setBudgets] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddItemForm, setShowAddItemForm] = useState(false)
  const [budgetComparison, setBudgetComparison] = useState(null)
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'expense',
    amount: '',
    category: 'Food',
    frequency: 'monthly',
    payee: '',
    day_of_month_1: 1,
    owner: 'Personal'
  })

  const tabs = ['Personal', 'Spouse', 'Family']
  
  const expenseCategories = [
    'Food', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 
    'Entertainment', 'Shopping', 'Insurance', 'Other'
  ]
  
  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'semi-monthly', label: 'Semi-monthly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  const getCurrentMonthYear = () => {
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()
    return { month, year }
  }

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const getFilteredBudgetData = () => {
    if (activeTab === 'Family') {
      return currentBudget.items.filter(item => 
        item.owner === 'Personal' || 
        item.owner === 'Spouse' || 
        !item.owner
      )
    }
    return currentBudget.items.filter(item => item.owner === activeTab || !item.owner)
  }

  // Helper functions for budget analysis
  const getCategoryTotals = () => {
    if (!currentBudget?.items) return {}
    
    const filteredItems = getFilteredBudgetData()
    const totals = {}
    
    filteredItems.forEach(item => {
      const category = item.category
      if (!totals[category]) {
        totals[category] = { planned: 0, count: 0 }
      }
      totals[category].planned += parseFloat(item.amount || 0)
      totals[category].count += 1
    })
    
    return totals
  }

  const getTotalBudgetAmount = () => {
    const categoryTotals = getCategoryTotals()
    return Object.values(categoryTotals).reduce((sum, cat) => sum + cat.planned, 0)
  }

  const duplicateItem = (item) => {
    setNewItem({
      name: item.name + ' (Copy)',
      type: item.type,
      amount: item.amount.toString(),
      category: item.category,
      frequency: item.frequency,
      payee: item.payee || '',
      day_of_month_1: item.day_of_month_1 || 1,
      owner: activeTab
    })
    setShowAddItemForm(true)
  }

  // Chart data
  const getBudgetByCategory = () => {
    const filteredData = getFilteredBudgetData().filter(item => item.type === 'expense')
    const categoryTotals = {}
    
    filteredData.forEach(item => {
      const category = item.category
      const monthlyAmount = item.monthly_amount || item.amount
      if (categoryTotals[category]) {
        categoryTotals[category] += monthlyAmount
      } else {
        categoryTotals[category] = monthlyAmount
      }
    })

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
    return Object.keys(categoryTotals).map((category, index) => ({
      name: category,
      value: categoryTotals[category],
      color: colors[index % colors.length]
    }))
  }

  const getBudgetVsActual = () => {
    if (!budgetComparison) return []
    
    return [{
      name: 'Budget vs Actual',
      budgeted: budgetComparison.comparison.budget_total,
      actual: budgetComparison.comparison.actual_total,
      remaining: budgetComparison.comparison.remaining
    }]
  }

  const getMonthlyTrend = () => {
    // Mock monthly trend data - in real app this would come from historical data
    const currentTotal = currentBudget.summary.total_expenses
    return [
      { month: 'Jan', planned: currentTotal * 0.9, actual: currentTotal * 0.95 },
      { month: 'Feb', planned: currentTotal * 0.95, actual: currentTotal * 1.02 },
      { month: 'Mar', planned: currentTotal, actual: currentTotal * 0.98 },
      { month: 'Apr', planned: currentTotal * 1.05, actual: currentTotal * 1.08 },
      { month: 'May', planned: currentTotal * 1.1, actual: currentTotal * 1.05 },
      { month: 'Jun', planned: currentTotal * 1.08, actual: currentTotal }
    ]
  }

  const loadBudgetData = async () => {
    try {
      setLoading(true)
      const { month, year } = getCurrentMonthYear()
      
      // Load budgets for each tab
      const budgetPromises = tabs.map(async (tab) => {
        const response = await apiClient.getBudgets({ month, year })
        if (response.success) {
          // Find or create budget for this tab
          let budget = response.data.find(b => b.name === `${tab} Budget ${formatMonth(currentDate)}`)
          
          if (!budget) {
            // Create a new budget for this tab
            const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
            const endDate = new Date(year, month, 0).toISOString().split('T')[0]
            
            const createResponse = await apiClient.createBudget({
              name: `${tab} Budget ${formatMonth(currentDate)}`,
              start_date: startDate,
              end_date: endDate,
              notes: `Budget for ${tab} - ${formatMonth(currentDate)}`
            })
            
            if (createResponse.success) {
              budget = { ...createResponse.data, items: [], summary: { total_income: 0, total_expenses: 0, projected_net: 0 } }
            }
          } else {
            // Load budget details with items
            const detailResponse = await apiClient.getBudget(budget.id, { month, year })
            if (detailResponse.success) {
              budget = detailResponse.data
            }
          }
          
          return [tab, budget]
        }
        return [tab, null]
      })
      
      const results = await Promise.all(budgetPromises)
      const budgetsObj = Object.fromEntries(results)
      setBudgets(budgetsObj)
      
      // Load budget comparison for active tab
      if (budgetsObj[activeTab]) {
        loadBudgetComparison(budgetsObj[activeTab].id)
      }
      
      setError(null)
    } catch (err) {
      console.error('Error loading budget data:', err)
      setError('Failed to load budget data')
    } finally {
      setLoading(false)
    }
  }

  const loadBudgetComparison = async (budgetId) => {
    try {
      const { month, year } = getCurrentMonthYear()
      const response = await apiClient.getBudgetComparison(budgetId, month, year)
      if (response.success) {
        setBudgetComparison(response.data)
      }
    } catch (err) {
      console.error('Error loading budget comparison:', err)
    }
  }

  const handleAddBudgetItem = async (e) => {
    e.preventDefault()
    const currentBudget = budgets[activeTab]
    if (!currentBudget) return

    try {
      const itemData = {
        name: newItem.name,
        type: newItem.type,
        amount: parseFloat(newItem.amount),
        category: newItem.category,
        frequency: newItem.frequency,
        start_date: new Date().toISOString().split('T')[0],
        day_of_month_1: parseInt(newItem.day_of_month_1)
      }

      const response = await apiClient.addBudgetItem(currentBudget.id, itemData)
      if (response.success) {
        await loadBudgetData()
        setNewItem({
          name: '',
          type: 'expense',
          amount: '',
          category: 'Food',
          frequency: 'monthly',
          payee: '',
          day_of_month_1: 1,
          owner: 'Personal'
        })
        setShowAddItemForm(false)
      } else {
        setError('Failed to add budget item')
      }
    } catch (err) {
      console.error('Error adding budget item:', err)
      setError('Failed to add budget item')
    }
  }

  const handleDeleteBudgetItem = async (itemId) => {
    try {
      const response = await apiClient.deleteBudgetItem(itemId)
      if (response.success) {
        await loadBudgetData()
      } else {
        setError('Failed to delete budget item')
      }
    } catch (err) {
      console.error('Error deleting budget item:', err)
      setError('Failed to delete budget item')
    }
  }

  // Keyboard shortcuts for productivity
  useEffect(() => {
    const handleKeyboardShortcuts = (e) => {
      // Only activate shortcuts when not in form inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setShowAddItemForm(true)
      } else if (e.key === 'Escape') {
        setShowAddItemForm(false)
      } else if (e.key === '1' && e.altKey) {
        e.preventDefault()
        setActiveTab('Personal')
      } else if (e.key === '2' && e.altKey) {
        e.preventDefault()
        setActiveTab('Spouse')
      } else if (e.key === '3' && e.altKey) {
        e.preventDefault()
        setActiveTab('Family')
      }
    }

    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [])

  useEffect(() => {
    loadBudgetData()
  }, [currentDate, activeTab])

  const currentBudget = budgets[activeTab] || { items: [], summary: { total_income: 0, total_expenses: 0, projected_net: 0 }, projected_events: [] }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading budget data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Budget Planner
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Plan and track your monthly budget by category to achieve your financial goals
            </p>
          </div>
          
          {/* Keyboard Shortcuts Indicator */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">Quick Actions:</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div><kbd className="bg-slate-300 dark:bg-slate-600 px-1 rounded text-xs">⌘+N</kbd> New item</div>
              <div><kbd className="bg-slate-300 dark:bg-slate-600 px-1 rounded text-xs">Alt+1/2/3</kbd> Switch tabs</div>
              <div><kbd className="bg-slate-300 dark:bg-slate-600 px-1 rounded text-xs">Esc</kbd> Cancel</div>
            </div>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tabs */}
        <div className="flex justify-start mb-4">
          <TabsList className="ff-outline-tabs grid w-full grid-cols-3 max-w-md bg-transparent border border-emerald-500/40 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Personal</TabsTrigger>
            <TabsTrigger value="Spouse" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Spouse</TabsTrigger>
            <TabsTrigger value="Family" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Family</TabsTrigger>
          </TabsList>
        </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => navigateMonth(-1)}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Prev
        </button>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {formatMonth(currentDate)}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl shadow-md p-6 border border-emerald-200 dark:border-emerald-700/50">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Projected Income</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(currentBudget.summary.total_income)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl shadow-md p-6 border border-red-200 dark:border-red-700/50">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Projected Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(currentBudget.summary.total_expenses)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-md p-6 border border-blue-200 dark:border-blue-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Projected Net</h3>
          </div>
          <p className={`text-3xl font-bold ${currentBudget.summary.projected_net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(currentBudget.summary.projected_net)}
          </p>
        </div>

        {/* Budget Health Indicator */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl shadow-md p-6 border border-purple-200 dark:border-purple-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Budget Health</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${currentBudget.summary.projected_net >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <p className={`text-lg font-bold ${currentBudget.summary.projected_net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {currentBudget.summary.projected_net >= 0 ? 'Healthy' : 'Over Budget'}
            </p>
          </div>
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {Object.keys(getCategoryTotals()).length} categories planned
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {getFilteredBudgetData().length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Budget by Category Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Budget by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getBudgetByCategory()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getBudgetByCategory().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget vs Actual Expenses */}
          {budgetComparison && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Budget vs Actual Expenses</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                  Track how your actual spending compares to your planned budget for this month
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(budgetComparison.comparison.actual_total)} spent
                  </span>
                  <div className="text-xs text-red-500">Actual expenses so far</div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-200 rounded-full h-3 relative">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((budgetComparison.comparison.actual_total / budgetComparison.comparison.budget_total) * 100, 100)}%` 
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-700">
                        {Math.round((budgetComparison.comparison.actual_total / budgetComparison.comparison.budget_total) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 font-medium">
                    {formatCurrency(budgetComparison.comparison.budget_total)} budgeted
                  </span>
                  <div className="text-xs text-slate-500">Total planned budget</div>
                  <div className={`text-sm font-medium mt-1 ${budgetComparison.comparison.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(budgetComparison.comparison.remaining))} {budgetComparison.comparison.remaining >= 0 ? 'remaining' : 'over budget'}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                  <span>Money already spent this month</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                  <span>Budget remaining or overspent amount</span>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Trend Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Monthly Spending Trend</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Compare your planned budget vs actual spending over the past 6 months
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getMonthlyTrend()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  name="Planned Budget"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  name="Actual Spending"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend and Explanation */}
            <div className="border-t border-slate-100 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-500" style={{borderTop: '3px dashed #3b82f6'}}></div>
                    <span className="text-sm font-medium text-blue-600">Blue Dashed Line</span>
                  </div>
                  <span className="text-sm text-slate-600">Your planned budget amounts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-red-500"></div>
                    <span className="text-sm font-medium text-red-600">Red Solid Line</span>
                  </div>
                  <span className="text-sm text-slate-600">Your actual spending amounts</span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="text-xs text-slate-600">
                  <strong>Tip:</strong> When the red line is below blue, you&apos;re under budget. When red is above blue, you&apos;re overspending.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Expense Planner */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-700/50 overflow-hidden">
        <div className="bg-emerald-100 dark:bg-emerald-800/30 px-6 py-4 border-b border-emerald-200 dark:border-emerald-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">EXPENSE PLANNER</h3>
            </div>
            <button
              onClick={() => setShowAddItemForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Budget Item
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-8 gap-4 pb-3 mb-4 text-sm font-medium text-slate-700 dark:text-slate-300 border-b border-emerald-200 dark:border-emerald-700/30">
            <div>CATEGORY</div>
            <div>DESCRIPTION</div>
            <div>PAYEE</div>
            <div>FREQUENT</div>
            <div>AMOUNT</div>
            <div>RUNNING TOTAL</div>
            <div>REMAINING</div>
            <div>ACTION</div>
          </div>

          {/* New Item Row (if adding) */}
          {showAddItemForm && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 mb-4 border-2 border-emerald-300 animate-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleAddBudgetItem} className="grid grid-cols-8 gap-4">
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  required
                  autoFocus
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="New expense description"
                  className="px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                />
                
                <input
                  type="text"
                  value={newItem.payee}
                  onChange={(e) => setNewItem({...newItem, payee: e.target.value})}
                  placeholder="Payee"
                  className="px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                />
                
                <select
                  value={newItem.frequency}
                  onChange={(e) => setNewItem({...newItem, frequency: e.target.value})}
                  className="px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>{freq.label}</option>
                  ))}
                </select>
                
                <div className="flex items-center">
                  <span className="mr-2 text-emerald-600 font-medium">$</span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newItem.amount}
                    onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                    {newItem.amount ? formatCurrency(parseFloat(newItem.amount)) : '$0.00'}
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="text-sm text-slate-500">
                    (Preview)
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg py-2 px-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddItemForm(false)}
                    className="px-3 py-2 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Existing Items */}
          {getFilteredBudgetData().filter(item => item.type === 'expense').map((item, index, items) => {
            // Calculate running total up to current item
            const runningTotal = items.slice(0, index + 1).reduce((sum, currentItem) => sum + (currentItem.monthly_amount || currentItem.amount), 0)
            // Calculate remaining income after this item
            const remaining = currentBudget.summary.total_income - runningTotal
            
            return (
              <div key={item.id} className="grid grid-cols-8 gap-4 py-2 text-sm border-b border-emerald-100/50 dark:border-emerald-700/20 last:border-b-0">
                <div className="font-medium text-slate-900 dark:text-white">{item.category}</div>
                <div className="text-slate-700 dark:text-slate-300">{item.name}</div>
                <div className="text-slate-500 dark:text-slate-400">-</div>
                <div className="capitalize text-slate-700 dark:text-slate-300">{item.frequency}</div>
                <div className="text-slate-900 dark:text-white">{formatCurrency(item.amount)}</div>
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(runningTotal)}</div>
                <div className={`font-semibold ${remaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(remaining)}
                </div>
                <div className="flex gap-1">
                  <button className="w-6 h-6 text-slate-400 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBudgetItem(item.id)}
                    className="w-6 h-6 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Total Row */}
          <div className="grid grid-cols-8 gap-4 pt-4 mt-4 border-t border-emerald-300/50 dark:border-emerald-700/30 font-semibold text-emerald-800 dark:text-emerald-200">
            <div className="col-span-4">TOTAL PLANNED EXPENSES:</div>
            <div></div>
            <div className="text-lg">{formatCurrency(getFilteredBudgetData().filter(item => item.type === 'expense').reduce((total, item) => total + (item.monthly_amount || item.amount), 0))}</div>
            <div className={`text-lg ${currentBudget.summary.projected_net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(currentBudget.summary.projected_net)}
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Category Summary - Recreated */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-700/50 overflow-hidden">
        <div className="bg-emerald-100 dark:bg-emerald-800/30 px-6 py-4 border-b border-emerald-200 dark:border-emerald-700/50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Category Summary</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(getCategoryTotals()).map(([category, data]) => {
              const percentage = getTotalBudgetAmount() > 0 ? (data.planned / getTotalBudgetAmount() * 100) : 0
              return (
                <div key={category} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-base">{category}</span>
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full font-medium">
                        {data.count} items
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white text-base">{formatCurrency(data.planned)}</span>
                  </div>
                  
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-3">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{percentage.toFixed(1)}% of budget</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

        {/* Tab Content */}
        {['Personal', 'Spouse', 'Family'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {/* Content is shared across tabs, filtered by activeTab */}
          </TabsContent>
        ))}
      </Tabs>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default Budget
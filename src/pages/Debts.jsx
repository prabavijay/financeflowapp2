import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Calendar, 
  TrendingDown, 
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

const Debts = () => {
  const [debtData, setDebtData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [activeTab, setActiveTab] = useState('Personal')
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card',
    balance: '',
    interest_rate: '',
    minimum_payment: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    owner: 'Personal'
  })

  const debtTypes = [
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard, color: 'red' },
    { value: 'personal_loan', label: 'Personal Loan', icon: CreditCard, color: 'orange' },
    { value: 'auto_loan', label: 'Auto Loan', icon: CreditCard, color: 'blue' },
    { value: 'mortgage', label: 'Mortgage', icon: CreditCard, color: 'green' },
    { value: 'student_loan', label: 'Student Loan', icon: CreditCard, color: 'purple' },
    { value: 'other', label: 'Other', icon: CreditCard, color: 'gray' }
  ]

  useEffect(() => {
    loadDebtData()
  }, [])

  const loadDebtData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getDebts()
      if (response.success && response.data) {
        setDebtData(response.data)
      } else {
        setDebtData([])
      }
      setError(null)
    } catch (err) {
      console.error('Error loading debt data:', err)
      setError('Failed to load debt data')
      setDebtData([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddDebt = async (e) => {
    e.preventDefault()
    try {
      const debtDataToSend = {
        ...formData,
        balance: parseFloat(formData.balance),
        interest_rate: parseFloat(formData.interest_rate),
        minimum_payment: parseFloat(formData.minimum_payment)
      }
      
      const response = await apiClient.createDebt(debtDataToSend)
      if (response.success) {
        await loadDebtData()
        setFormData({
          name: '',
          type: 'credit_card',
          balance: '',
          interest_rate: '',
          minimum_payment: '',
          due_date: new Date().toISOString().split('T')[0],
          notes: '',
          owner: 'Personal'
        })
        setShowAddForm(false)
        setError(null)
      } else {
        setError('Failed to add debt')
      }
    } catch (err) {
      console.error('Error adding debt:', err)
      setError('Failed to add debt')
    }
  }

  const handleEditDebt = (debt) => {
    setEditingDebt(debt)
    setFormData({
      name: debt.name,
      type: debt.type,
      balance: debt.balance.toString(),
      interest_rate: debt.interest_rate.toString(),
      minimum_payment: debt.minimum_payment.toString(),
      due_date: debt.due_date,
      notes: debt.notes || '',
      owner: debt.owner || 'Personal'
    })
    setShowEditForm(true)
  }

  const handleUpdateDebt = async (e) => {
    e.preventDefault()
    try {
      const debtDataToSend = {
        ...formData,
        balance: parseFloat(formData.balance),
        interest_rate: parseFloat(formData.interest_rate),
        minimum_payment: parseFloat(formData.minimum_payment)
      }
      
      const response = await apiClient.updateDebt(editingDebt.id, debtDataToSend)
      if (response.success) {
        await loadDebtData()
        setFormData({
          name: '',
          type: 'credit_card',
          balance: '',
          interest_rate: '',
          minimum_payment: '',
          due_date: new Date().toISOString().split('T')[0],
          notes: '',
          owner: 'Personal'
        })
        setShowEditForm(false)
        setEditingDebt(null)
        setError(null)
      } else {
        setError('Failed to update debt')
      }
    } catch (err) {
      console.error('Error updating debt:', err)
      setError('Failed to update debt')
    }
  }

  const handleDeleteDebt = async (id) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      try {
        const response = await apiClient.deleteDebt(id)
        if (response.success) {
          await loadDebtData()
        } else {
          setError('Failed to delete debt')
        }
      } catch (err) {
        console.error('Error deleting debt:', err)
        setError('Failed to delete debt')
      }
    }
  }

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortValue = (debt, field) => {
    const isCredit = debt.type === 'credit_card'
    const creditLimit = debt.credit_limit || (isCredit ? debt.balance * 1.5 : null)
    const available = isCredit && creditLimit ? creditLimit - (debt.balance || 0) : null
    const monthlyInterest = ((debt.balance || 0) * (debt.interest_rate || 0) / 100) / 12
    const yearlyInterest = (debt.balance || 0) * (debt.interest_rate || 0) / 100

    switch (field) {
      case 'limit':
        return creditLimit || 0
      case 'balance':
        return debt.balance || 0
      case 'available':
        return available || 0
      case 'interest_rate':
        return debt.interest_rate || 0
      case 'minimum_payment':
        return debt.minimum_payment || 0
      case 'monthly_interest':
        return monthlyInterest
      case 'yearly_interest':
        return yearlyInterest
      default:
        return 0
    }
  }

  const getFilteredDebtData = () => {
    let filtered = debtData.filter(debt => debt.owner === activeTab)
    
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = getSortValue(a, sortField)
        const bValue = getSortValue(b, sortField)
        
        if (sortDirection === 'asc') {
          return aValue - bValue
        } else {
          return bValue - aValue
        }
      })
    }
    
    return filtered
  }

  const calculateTotalDebt = () => {
    return getFilteredDebtData().reduce((total, debt) => total + (debt.balance || 0), 0)
  }

  const calculateTotalMinimumPayments = () => {
    return getFilteredDebtData().reduce((total, debt) => total + (debt.minimum_payment || 0), 0)
  }

  const calculateTotalInterestCost = () => {
    return getFilteredDebtData().reduce((total, debt) => {
      const monthlyInterestCost = ((debt.balance || 0) * (debt.interest_rate || 0) / 100) / 12
      return total + monthlyInterestCost
    }, 0)
  }

  const getTypeInfo = (type) => {
    return debtTypes.find(t => t.value === type) || debtTypes[0]
  }

  const getDebtsByType = () => {
    const typeMap = {}
    getFilteredDebtData().forEach(debt => {
      const typeInfo = getTypeInfo(debt.type)
      if (!typeMap[typeInfo.label]) {
        typeMap[typeInfo.label] = { name: typeInfo.label, value: 0, color: `#${typeInfo.color === 'red' ? 'ef4444' : typeInfo.color === 'orange' ? 'f97316' : typeInfo.color === 'blue' ? '3b82f6' : typeInfo.color === 'green' ? '10b981' : typeInfo.color === 'purple' ? '8b5cf6' : '6b7280'}` }
      }
      typeMap[typeInfo.label].value += debt.balance || 0
    })
    return Object.values(typeMap)
  }

  const getInterestCosts = () => {
    return getFilteredDebtData().map(debt => {
      // Calculate monthly interest cost: (balance * interest_rate / 100) / 12
      const monthlyInterestCost = ((debt.balance || 0) * (debt.interest_rate || 0) / 100) / 12
      return {
        name: debt.name.substring(0, 10) + (debt.name.length > 10 ? '...' : ''),
        cost: monthlyInterestCost
      }
    })
  }

  const getPayoffProjection = () => {
    const months = 12
    const projections = []
    let currentBalance = calculateTotalDebt()
    
    for (let i = 0; i <= months; i++) {
      projections.push({
        month: `Month ${i}`,
        balance: Math.max(0, currentBalance)
      })
      currentBalance -= calculateTotalMinimumPayments()
    }
    
    return projections
  }

  const SortableHeader = ({ field, children, className = "text-right p-4 font-semibold text-slate-900 dark:text-white" }) => (
    <th 
      className={`${className} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600/30 transition-colors`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1 justify-end">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading debt data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            Debt Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
            Track and manage all your debts and loans to regain financial freedom
          </p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tabs */}
        <div className="flex justify-start mb-8">
          <TabsList className="ff-outline-tabs grid w-full grid-cols-3 max-w-md bg-transparent border border-emerald-500/40 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Personal</TabsTrigger>
            <TabsTrigger value="Spouse" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Spouse</TabsTrigger>
            <TabsTrigger value="Family" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Family</TabsTrigger>
          </TabsList>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Total Debt</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculateTotalDebt())}
                </p>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">Monthly Payments</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculateTotalMinimumPayments())}
                </p>
              </div>
              <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Monthly Interest Cost</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(calculateTotalInterestCost())}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {getFilteredDebtData().length} accounts
                </p>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        {getFilteredDebtData().length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Debt by Type Chart */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-lg">Debt by Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={getDebtsByType()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getDebtsByType().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Interest Cost Chart */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-lg">Monthly Interest Cost</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  How much you&apos;re paying in interest each month per debt
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={getInterestCosts()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Monthly Interest']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payoff Projection Chart */}
            <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-lg">Payoff Projection</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={getPayoffProjection()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
        </div>
      )}

        {/* Debts Table */}
        <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-8 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Debt Portfolio</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg mt-2">Manage all your debts and track payoff progress</p>
              </div>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                    <Plus className="w-5 h-5" />
                    Add Debt
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Debt</DialogTitle>
                    <DialogDescription>
                      Add a debt or loan account to track balances and payments.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleAddDebt} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Debt Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Chase Credit Card"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {debtTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="owner">Owner</Label>
                        <Select value={formData.owner} onValueChange={(value) => setFormData({...formData, owner: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Personal">Personal</SelectItem>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="balance">Balance</Label>
                        <Input
                          id="balance"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.balance}
                          onChange={(e) => setFormData({...formData, balance: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                        <Input
                          id="interest_rate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.interest_rate}
                          onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                          placeholder="18.24"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minimum_payment">Minimum Payment</Label>
                        <Input
                          id="minimum_payment"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.minimum_payment}
                          onChange={(e) => setFormData({...formData, minimum_payment: e.target.value})}
                          placeholder="25.00"
                          required
                        />
                      </div>
                      <div>
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

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional details about this debt..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                      >
                        Add Debt
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

        {getFilteredDebtData().length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Debts Found</h3>
            <p className="text-slate-600">Add your first debt to start tracking and managing payments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-200/50 dark:border-slate-600/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Creditor</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Type</th>
                  <SortableHeader field="limit">Limit</SortableHeader>
                  <SortableHeader field="balance">Balance</SortableHeader>
                  <SortableHeader field="available">Available</SortableHeader>
                  <SortableHeader field="interest_rate">Interest Rate</SortableHeader>
                  <SortableHeader field="minimum_payment">Min Payment</SortableHeader>
                  <SortableHeader field="monthly_interest">Monthly Interest</SortableHeader>
                  <SortableHeader field="yearly_interest">Yearly Interest</SortableHeader>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Due Date</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredDebtData().map((debt) => {
                  const typeInfo = getTypeInfo(debt.type)
                  const TypeIcon = typeInfo.icon
                  
                  // Calculate interest costs
                  const monthlyInterest = ((debt.balance || 0) * (debt.interest_rate || 0) / 100) / 12
                  const yearlyInterest = (debt.balance || 0) * (debt.interest_rate || 0) / 100
                  
                  // Calculate limit and available (assume credit limit for credit cards, N/A for loans)
                  const isCredit = debt.type === 'credit_card'
                  const creditLimit = debt.credit_limit || (isCredit ? debt.balance * 1.5 : null) // Assume 1.5x balance if no limit set
                  const available = isCredit && creditLimit ? creditLimit - (debt.balance || 0) : null
                  
                  return (
                    <tr key={debt.id} className="border-b border-slate-200/30 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30 rounded-lg`}>
                            <TypeIcon className={`w-5 h-5 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400`} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white text-sm">{debt.name}</div>
                            {debt.notes && (
                              <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                                {debt.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${typeInfo.color}-100 dark:bg-${typeInfo.color}-900/30 text-${typeInfo.color}-700 dark:text-${typeInfo.color}-300`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {creditLimit ? formatCurrency(creditLimit) : 
                           isCredit ? 'N/A' : '-'}
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(debt.balance)}
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {available !== null ? formatCurrency(Math.max(0, available)) : 
                           isCredit ? 'N/A' : '-'}
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {debt.interest_rate}%
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(debt.minimum_payment)}
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(monthlyInterest)}
                        </div>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(yearlyInterest)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="text-xs text-slate-600 dark:text-slate-400">
                            {new Date(debt.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                            <DialogTrigger asChild>
                              <button 
                                onClick={() => handleEditDebt(debt)}
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Debt</DialogTitle>
                                <DialogDescription>
                                  Update debt information and payment details.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <form onSubmit={handleUpdateDebt} className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Debt Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Chase Credit Card"
                                    required
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {debtTypes.map(type => (
                                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-owner">Owner</Label>
                                    <Select value={formData.owner} onValueChange={(value) => setFormData({...formData, owner: value})}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                        <SelectItem value="Spouse">Spouse</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-balance">Balance</Label>
                                    <Input
                                      id="edit-balance"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={formData.balance}
                                      onChange={(e) => setFormData({...formData, balance: e.target.value})}
                                      placeholder="0.00"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-interest_rate">Interest Rate (%)</Label>
                                    <Input
                                      id="edit-interest_rate"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={formData.interest_rate}
                                      onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                                      placeholder="18.24"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-minimum_payment">Minimum Payment</Label>
                                    <Input
                                      id="edit-minimum_payment"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={formData.minimum_payment}
                                      onChange={(e) => setFormData({...formData, minimum_payment: e.target.value})}
                                      placeholder="25.00"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-due_date">Due Date</Label>
                                    <Input
                                      id="edit-due_date"
                                      type="date"
                                      value={formData.due_date}
                                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                      required
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="edit-notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="edit-notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Additional details about this debt..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-4 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowEditForm(false)
                                      setEditingDebt(null)
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                                  >
                                    Update Debt
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <button 
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

        {/* Tab Content */}
        {['Personal', 'Spouse', 'Family'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {/* Content is shared across tabs, filtered by activeTab */}
          </TabsContent>
        ))}
      </Tabs>



      {error && (
        <div className="bg-red-100/80 dark:bg-red-900/30 border border-red-200/50 dark:border-red-700/50 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
      </div>
    </div>
  )
}

export default Debts
import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import {
  Plus,
  TrendingUp,
  Wallet,
  Building,
  Briefcase,
  Home,
  DollarSign,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  Legend
} from 'recharts'

const Income = () => {
  const [incomeData, setIncomeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('Personal')
  const [formData, setFormData] = useState({
    source: '',
    category: 'salary',
    amount: '',
    frequency: 'monthly',
    description: '',
    date: new Date().toISOString().split('T')[0],
    owner: 'Personal'
  })

  const incomeCategories = [
    { value: 'salary', label: 'Salary', icon: Briefcase, color: 'cyan' },
    { value: 'freelance', label: 'Freelance', icon: Wallet, color: 'cyan' },
    { value: 'investment', label: 'Investment', icon: TrendingUp, color: 'blue' },
    { value: 'rental', label: 'Rental', icon: Home, color: 'slate' },
    { value: 'business', label: 'Business', icon: Building, color: 'purple' },
    { value: 'other', label: 'Other', icon: DollarSign, color: 'indigo' }
  ]

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  useEffect(() => {
    loadIncomeData()
  }, [])

  const loadIncomeData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getIncome()
      if (response.success) {
        setIncomeData(response.data)
        setError(null)
      } else {
        setError('Failed to load income data')
      }
    } catch (err) {
      console.error('Error loading income data:', err)
      setError('Failed to connect to backend. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddIncome = async (e) => {
    e.preventDefault()
    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date_received: formData.date
      }

      const response = await apiClient.createIncome(incomeData)
      if (response.success) {
        // Reload income data to get updated list
        await loadIncomeData()
        setFormData({
          source: '',
          category: 'salary',
          amount: '',
          frequency: 'monthly',
          description: '',
          date: new Date().toISOString().split('T')[0],
          owner: 'Personal'
        })
        setShowAddForm(false)
        setError(null)
      } else {
        setError('Failed to add income record')
      }
    } catch (err) {
      console.error('Error adding income:', err)
      setError('Failed to add income record')
    }
  }

  const getCategoryInfo = (category) => {
    return incomeCategories.find(cat => cat.value === category) || incomeCategories[0]
  }

  const getFilteredIncomeData = () => {
    if (activeTab === 'Family') {
      return incomeData.filter(income =>
        income.owner === 'Personal' ||
        income.owner === 'Spouse' ||
        !income.owner
      )
    }
    return incomeData.filter(income => income.owner === activeTab || !income.owner)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateMonthlyTotal = () => {
    const filteredData = getFilteredIncomeData()
    if (!filteredData || filteredData.length === 0) return 0
    return filteredData.reduce((total, income) => {
      if (!income.amount || isNaN(income.amount)) return total
      let monthlyAmount = parseFloat(income.amount)
      switch (income.frequency) {
        case 'weekly': monthlyAmount = monthlyAmount * 4.33; break
        case 'bi-weekly': monthlyAmount = monthlyAmount * 2.17; break
        case 'semi-monthly': monthlyAmount = monthlyAmount * 2; break
        case 'quarterly': monthlyAmount = monthlyAmount / 3; break
        case 'yearly': monthlyAmount = monthlyAmount / 12; break
        default: break
      }
      return total + monthlyAmount
    }, 0)
  }

  const calculateMonthlyAmount = (amount, frequency) => {
    if (!amount || isNaN(amount)) return 0
    const numAmount = parseFloat(amount)
    switch (frequency) {
      case 'weekly': return numAmount * 4.33
      case 'bi-weekly': return numAmount * 2.17
      case 'semi-monthly': return numAmount * 2
      case 'quarterly': return numAmount / 3
      case 'yearly': return numAmount / 12
      default: return numAmount
    }
  }

  const calculateBiWeeklyAmount = (amount, frequency) => {
    if (!amount || isNaN(amount)) return 0
    const numAmount = parseFloat(amount)
    switch (frequency) {
      case 'weekly': return numAmount * 2
      case 'bi-weekly': return numAmount
      case 'semi-monthly': return numAmount * 1.08 // 26/24
      case 'monthly': return numAmount / 2.17 // 12/26*2
      case 'quarterly': return numAmount / 6.5 // 26/4 bi-weekly periods per quarter
      case 'yearly': return numAmount / 26
      default: return numAmount
    }
  }

  const calculateYearlyAmount = (amount, frequency) => {
    if (!amount || isNaN(amount)) return 0
    const numAmount = parseFloat(amount)
    switch (frequency) {
      case 'weekly': return numAmount * 52
      case 'bi-weekly': return numAmount * 26
      case 'semi-monthly': return numAmount * 24
      case 'monthly': return numAmount * 12
      case 'quarterly': return numAmount * 4
      default: return numAmount
    }
  }

  // Chart data calculations
  const getIncomeByCategory = () => {
    const filteredData = getFilteredIncomeData()
    const categoryTotals = {}

    filteredData.forEach(income => {
      const category = income.category
      const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency)
      if (categoryTotals[category]) {
        categoryTotals[category] += monthlyAmount
      } else {
        categoryTotals[category] = monthlyAmount
      }
    })

    return Object.keys(categoryTotals).map(category => {
      const categoryInfo = getCategoryInfo(category)
      return {
        name: categoryInfo.label,
        value: categoryTotals[category],
        color: categoryInfo.color === 'cyan' ? '#00d4ff' :
               categoryInfo.color === 'blue' ? '#3b82f6' :
               categoryInfo.color === 'slate' ? '#64748b' :
               categoryInfo.color === 'purple' ? '#8b5cf6' : '#6366f1'
      }
    })
  }

  const getIncomeByFrequency = () => {
    const filteredData = getFilteredIncomeData()
    const frequencyTotals = {}

    filteredData.forEach(income => {
      const frequency = income.frequency
      const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency)
      if (frequencyTotals[frequency]) {
        frequencyTotals[frequency] += monthlyAmount
      } else {
        frequencyTotals[frequency] = monthlyAmount
      }
    })

    return Object.keys(frequencyTotals).map(frequency => {
      const freq = frequencies.find(f => f.value === frequency)
      return {
        name: freq ? freq.label : frequency,
        value: frequencyTotals[frequency]
      }
    })
  }

  const handleEditIncome = (income) => {
    setEditingId(income.id)
    setFormData({
      source: income.source,
      category: income.category,
      amount: income.amount.toString(),
      frequency: income.frequency,
      description: income.description || '',
      date: income.date_received ? new Date(income.date_received).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      owner: income.owner || 'Personal'
    })
    setShowEditForm(true)
  }

  const handleUpdateIncome = async (e) => {
    e.preventDefault()
    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date_received: formData.date
      }

      const response = await apiClient.updateIncome(editingId, incomeData)

      // Handle different response formats - some APIs return success field, others just return the data
      const isSuccess = response.success !== false && response !== null && response !== undefined

      if (isSuccess) {
        await loadIncomeData()
        setFormData({
          source: '',
          category: 'salary',
          amount: '',
          frequency: 'monthly',
          description: '',
          date: new Date().toISOString().split('T')[0],
          owner: 'Personal'
        })
        setShowEditForm(false)
        setEditingId(null)
        setError(null)
      } else {
        setError('Failed to update income record')
      }
    } catch (err) {
      console.error('Error updating income:', err)
      setError('Failed to update income record')
    }
  }

  const handleDeleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      // Optimistically remove from UI immediately
      setIncomeData(prev => prev.filter(item => item.id !== id))
      try {
        const response = await apiClient.deleteIncome(id)
        const isSuccess = response.success !== false && response !== null && response !== undefined
        if (!isSuccess) {
          // Revert if truly failed
          await loadIncomeData()
          setError('Failed to delete income')
        }
      } catch (err) {
        console.error('Error deleting income:', err)
        await loadIncomeData()
        setError('Failed to delete income')
      }
    }
  }

  const handleClearAll = async () => {
    const filtered = getFilteredIncomeData()
    if (filtered.length === 0) return
    if (!window.confirm(`Delete all ${filtered.length} income record(s) for ${activeTab}? This cannot be undone.`)) return

    const idsToDelete = filtered.map(i => i.id)
    setIncomeData(prev => prev.filter(item => !idsToDelete.includes(item.id)))
    try {
      await Promise.all(idsToDelete.map(id => apiClient.deleteIncome(id)))
    } catch (err) {
      console.error('Error clearing income records:', err)
      await loadIncomeData()
      setError('Some records could not be deleted')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading income data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
          Income Tracking
        </h1>
        <p className="text-slate-400 text-lg">Manage and track your income sources with comprehensive analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          {/* Tabs */}
          <TabsList className="ff-outline-tabs grid w-full grid-cols-3 max-w-md bg-transparent border border-cyan-500/30 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-400 rounded-md hover:text-cyan-400 hover:border-cyan-400/50 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent">
              Personal
            </TabsTrigger>
            <TabsTrigger value="Spouse" className="bg-transparent border border-transparent text-slate-400 rounded-md hover:text-cyan-400 hover:border-cyan-400/50 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent">
              Spouse
            </TabsTrigger>
            <TabsTrigger value="Family" className="bg-transparent border border-transparent text-slate-400 rounded-md hover:text-cyan-400 hover:border-cyan-400/50 data-[state=active]:text-cyan-400 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent">
              Family
            </TabsTrigger>
          </TabsList>

          {/* Monthly Total */}
          <div className="glass-card glass-card-hover p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-cyan-300">Monthly Total</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(calculateMonthlyTotal())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {['Personal', 'Spouse', 'Family'].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {/* Income Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Income Sources{activeTab !== 'Personal' && ` (${activeTab})`}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Complete overview of all income streams with subtotals</p>
            </div>
            <div className="flex items-center gap-2">
              {getFilteredIncomeData().length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-400 hover:text-red-300 rounded-lg transition-all duration-300 font-medium bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_15px_rgba(0,212,255,0.15)] text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                  <Plus className="w-4 h-4" />
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Income</DialogTitle>
                  <DialogDescription>
                    Add a new income source to track your earnings.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddIncome} className="space-y-6">
                  <div>
                    <Label htmlFor="source">Income Source</Label>
                    <Input
                      id="source"
                      type="text"
                      required
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      placeholder="e.g., Primary Job, Freelance Work"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {incomeCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map(freq => (
                            <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date Received</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
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
                          <SelectItem value="Joint">Joint</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows="3"
                      placeholder="Additional details about this income source..."
                    />
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
                    <Button
                      type="submit"
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                    >
                      Add Income
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </div>

        {getFilteredIncomeData().length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-20 h-20 text-slate-500 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-white mb-3">No Income Sources Found</h3>
            <p className="text-slate-400">Add your first income source to get started with tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xl">
              <thead className="bg-[rgba(35,52,78,0.9)] backdrop-blur-sm border-b-2 border-cyan-800/20 border-cyan-700">
                <tr>
                  <th className="text-left p-6 font-bold !text-white !text-lg">Source</th>
                  <th className="text-left p-6 font-bold !text-white !text-lg">Category</th>
                  <th className="text-left p-6 font-bold !text-white !text-lg">Frequency</th>
                  <th className="text-right p-6 font-bold !text-white !text-lg">Amount</th>
                  <th className="text-right p-6 font-bold !text-purple-200 !text-lg">Bi-weekly</th>
                  <th className="text-right p-6 font-bold !text-cyan-200 !text-lg">Monthly</th>
                  <th className="text-right p-6 font-bold !text-blue-200 !text-lg">Annual</th>
                  <th className="text-left p-6 font-bold !text-white !text-lg">Date</th>
                  <th className="text-left p-6 font-bold !text-white !text-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredIncomeData().map((income) => {
                  const categoryInfo = getCategoryInfo(income.category)
                  const CategoryIcon = categoryInfo.icon
                  const biWeeklyAmount = calculateBiWeeklyAmount(income.amount, income.frequency)
                  const monthlyAmount = calculateMonthlyAmount(income.amount, income.frequency)
                  const yearlyAmount = calculateYearlyAmount(income.amount, income.frequency)

                  return (
                    <tr key={income.id} className="border-b border-white/10 hover:bg-white/10 transition-colors duration-200">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 bg-${categoryInfo.color}-900/30 rounded-xl`}>
                            <CategoryIcon className={`w-6 h-6 text-${categoryInfo.color}-300`} />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xl">{income.source}</div>
                            {income.description && (
                              <div className="text-base text-slate-400 truncate max-w-[200px] mt-1">
                                {income.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                        <span className={`inline-flex px-3 py-1.5 text-xl font-medium rounded-full bg-${categoryInfo.color}-900/30 text-${categoryInfo.color}-200`}>
                          {categoryInfo.label}
                        </span>
                      </td>

                      <td className="p-6">
                        <span className="inline-flex px-3 py-1.5 text-xl font-medium rounded-full bg-slate-700 text-slate-300">
                          {(() => {
                            const freq = frequencies.find(f => f.value === income.frequency)
                            return freq ? freq.label : income.frequency
                          })()}
                        </span>
                      </td>

                      <td className="p-6 text-right">
                        <div className="font-bold text-white text-xl">
                          {formatCurrency(income.amount)}
                        </div>
                      </td>

                      <td className="p-6 text-right">
                        <div className="font-bold text-purple-400 text-xl">
                          {formatCurrency(biWeeklyAmount)}
                        </div>
                      </td>

                      <td className="p-6 text-right">
                        <div className="font-bold text-cyan-400 text-xl">
                          {formatCurrency(monthlyAmount)}
                        </div>
                      </td>

                      <td className="p-6 text-right">
                        <div className="font-bold text-blue-400 text-xl">
                          {formatCurrency(yearlyAmount)}
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-xl text-slate-400">
                            {new Date(income.date_received).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditIncome(income)}
                            className="p-2.5 text-slate-400 hover:text-blue-400 transition-colors rounded-xl hover:bg-blue-500/10"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(income.id)}
                            className="p-2.5 text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {/* Subtotal Row */}
                <tr className="bg-gradient-to-r from-cyan-900/20 to-cyan-900/20   border-t-4 border-cyan-500/30 border-cyan-600 shadow-lg">
                  <td colSpan="4" className="p-8 text-right text-white font-bold text-xl">
                    Total Income:
                  </td>
                  <td className="p-8 text-right text-cyan-200 font-bold text-2xl shadow-sm">
                    {formatCurrency(calculateMonthlyTotal())}
                  </td>
                  <td className="p-8 text-right text-blue-200 font-bold text-2xl shadow-sm">
                    {formatCurrency(calculateMonthlyTotal() * 12)}
                  </td>
                  <td colSpan="2" className="p-8">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Income Form Modal */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
            <DialogDescription>
              Update your income source information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateIncome} className="space-y-6">
            <div>
              <Label htmlFor="edit-source">Income Source</Label>
              <Input
                id="edit-source"
                type="text"
                required
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                placeholder="e.g., Primary Job, Freelance Work"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date Received</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
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
                    <SelectItem value="Joint">Joint</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Additional details about this income source..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingId(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-cyan-500 hover:bg-cyan-600 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
              >
                Update Income
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-lg border border-red-400/50 z-50">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Income
import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { useProfile } from '../contexts/ProfileContext'
import { 
  Plus, 
  Calendar, 
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  Edit,
  Trash2,
  Receipt,
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
import { Switch } from '@/components/ui/switch'

const Bills = () => {
  const { selectedProfile, setSelectedProfile } = useProfile()
  const [billData, setBillData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [sortField, setSortField] = useState('due_date')
  const [sortDirection, setSortDirection] = useState('asc')
  const [formData, setFormData] = useState({
    name: '',
    category: 'utilities',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    frequency: 'monthly',
    auto_pay: false,
    payment_method: '',
    notes: '',
    owner: 'Personal'
  })

  const billCategories = [
    { value: 'utilities', label: 'Utilities', icon: Calendar, color: 'blue' },
    { value: 'subscription', label: 'Subscription', icon: CreditCard, color: 'purple' },
    { value: 'insurance', label: 'Insurance', icon: CheckCircle, color: 'green' },
    { value: 'rent', label: 'Rent/Mortgage', icon: DollarSign, color: 'slate' },
    { value: 'loan', label: 'Loan Payment', icon: Receipt, color: 'red' }
  ]

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  useEffect(() => {
    loadBillData()
  }, [])

  const loadBillData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getBills()
      if (response.success) {
        setBillData(response.data)
        setError(null)
      } else {
        setError('Failed to load bill data')
      }
    } catch (err) {
      console.error('Error loading bill data:', err)
      setError('Failed to connect to backend. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (category) => {
    return billCategories.find(cat => cat.value === category) || billCategories[0]
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortedBillData = (bills) => {
    return [...bills].sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'amount':
          aValue = parseFloat(a.amount) || 0
          bValue = parseFloat(b.amount) || 0
          break
        case 'due_date':
          aValue = new Date(a.due_date)
          bValue = new Date(b.due_date)
          break
        case 'status':
          aValue = getBillStatus(a)
          bValue = getBillStatus(b)
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const getFilteredBillData = () => {
    let filtered
    if (selectedProfile === 'Family') {
      filtered = billData.filter(bill => 
        bill.owner === 'Personal' || 
        bill.owner === 'Spouse' || 
        !bill.owner
      )
    } else {
      filtered = billData.filter(bill => bill.owner === selectedProfile || !bill.owner)
    }
    
    return getSortedBillData(filtered)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateMonthlyAmount = (amount, frequency) => {
    // Safety check for amount
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      console.warn('Invalid amount:', amount)
      return 0
    }
    
    // Safety check for frequency
    if (!frequency) {
      console.warn('No frequency provided, defaulting to monthly')
      return numAmount
    }
    
    switch (frequency.toLowerCase()) {
      case 'weekly': return numAmount * 4.33
      case 'bi-weekly': return numAmount * 2.17  // 26 payments per year / 12 months = 2.17
      case 'quarterly': return numAmount / 3
      case 'yearly': return numAmount / 12
      case 'monthly':
      default: return numAmount
    }
  }

  const calculateTotalMonthly = () => {
    const filteredData = getFilteredBillData()
    
    const total = filteredData.reduce((total, bill) => {
      // Safety check for bill object
      if (!bill || typeof bill !== 'object') {
        console.warn('Invalid bill object:', bill)
        return total
      }
      
      const monthlyAmount = calculateMonthlyAmount(bill.amount, bill.frequency)
      return total + monthlyAmount
    }, 0)
    
    // Final safety check
    return isNaN(total) ? 0 : total
  }

  const getDaysUntilDue = (dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getBillStatus = (bill) => {
    if (bill.status === 'paid') return 'paid'
    const daysUntil = getDaysUntilDue(bill.due_date)
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 3) return 'due_soon'
    return 'upcoming'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'emerald'
      case 'overdue': return 'red'
      case 'due_soon': return 'yellow'
      default: return 'blue'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return CheckCircle
      case 'overdue': return AlertTriangle
      case 'due_soon': return Clock
      default: return Calendar
    }
  }

  const SortableHeader = ({ field, children, className = "text-left" }) => (
    <th 
      className={`${className} p-4 font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <ChevronUp 
            className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-500'}`} 
          />
          <ChevronDown 
            className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-500'}`} 
          />
        </div>
      </div>
    </th>
  )


  const handleAddBill = async (e) => {
    e.preventDefault()
    try {
      const billDataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      }
      
      const response = await apiClient.createBill(billDataToSend)
      if (response.success) {
        await loadBillData()
        setFormData({
          name: '',
          category: 'utilities',
          amount: '',
          due_date: new Date().toISOString().split('T')[0],
          frequency: 'monthly',
          auto_pay: false,
          payment_method: '',
          notes: '',
          owner: 'Personal'
        })
        setShowAddForm(false)
        setError(null)
      } else {
        setError('Failed to add bill')
      }
    } catch (err) {
      console.error('Error adding bill:', err)
      setError('Failed to add bill')
    }
  }

  const handleEditBill = (bill) => {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      category: bill.category,
      amount: bill.amount.toString(),
      due_date: bill.due_date,
      frequency: bill.frequency,
      auto_pay: bill.auto_pay || false,
      payment_method: bill.payment_method || '',
      notes: bill.notes || '',
      owner: bill.owner || 'Personal'
    })
    setShowEditForm(true)
  }

  const handleUpdateBill = async (e) => {
    e.preventDefault()
    try {
      const billDataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      }
      
      const response = await apiClient.updateBill(editingBill.id, billDataToSend)
      if (response.success) {
        await loadBillData()
        setFormData({
          name: '',
          category: 'utilities',
          amount: '',
          due_date: new Date().toISOString().split('T')[0],
          frequency: 'monthly',
          auto_pay: false,
          payment_method: '',
          notes: '',
          owner: 'Personal'
        })
        setShowEditForm(false)
        setEditingBill(null)
        setError(null)
      } else {
        setError('Failed to update bill')
      }
    } catch (err) {
      console.error('Error updating bill:', err)
      setError('Failed to update bill')
    }
  }

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        const response = await apiClient.deleteBill(id)
        if (response.success) {
          await loadBillData()
        } else {
          setError('Failed to delete bill')
        }
      } catch (err) {
        console.error('Error deleting bill:', err)
        setError('Failed to delete bill')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading bill data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Bills Management ({selectedProfile})
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Keep track of due dates and payment status to stay on top of your financial obligations
          </p>
        </div>

      <Tabs value={selectedProfile} onValueChange={setSelectedProfile} className="space-y-4">
        {/* Tabs */}
        <div className="flex justify-start mb-4">
          <TabsList className="ff-outline-tabs grid w-full grid-cols-3 max-w-md bg-transparent border border-emerald-500/40 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Personal</TabsTrigger>
            <TabsTrigger value="Spouse" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Spouse</TabsTrigger>
            <TabsTrigger value="Family" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Family</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Payment Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Paid Bills */}
          <div className="bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Paid</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {getFilteredBillData().filter(bill => getBillStatus(bill) === 'paid').length}
                </p>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Overdue Bills */}
          <div className="bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Overdue</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {getFilteredBillData().filter(bill => getBillStatus(bill) === 'overdue').length}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Due Soon Bills */}
          <div className="bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Due Soon</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {getFilteredBillData().filter(bill => getBillStatus(bill) === 'due_soon').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

        </div>

        {/* Upcoming Bills Alert Section */}
        {getFilteredBillData().length > 0 && (
          <div className="mb-4 max-w-2xl">
            {/* Overdue & Due Soon Bills */}
            <div className="bg-gradient-to-br from-white/90 to-slate-50/80 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Urgent Attention Required
              </h3>
              <div className="space-y-3">
                {getFilteredBillData()
                  .filter(bill => ['overdue', 'due_soon'].includes(getBillStatus(bill)))
                  .slice(0, 4)
                  .map(bill => {
                    const status = getBillStatus(bill)
                    const daysUntil = getDaysUntilDue(bill.due_date)
                    const statusColor = getStatusColor(status)
                    
                    return (
                      <div key={bill.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full bg-${statusColor}-500`}></div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{bill.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                               daysUntil === 0 ? 'Due today' : `Due in ${daysUntil} days`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(bill.amount)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{bill.frequency}</p>
                        </div>
                      </div>
                    )
                  })}
                {getFilteredBillData().filter(bill => ['overdue', 'due_soon'].includes(getBillStatus(bill))).length === 0 && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400">All bills are up to date!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Bill Payments</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Track payment status and due dates</p>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                  <Plus className="w-4 h-4" />
                  Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Bill</DialogTitle>
                  <DialogDescription>
                    Add a new bill to track its due dates and payments.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleAddBill} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Bill Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Electric Bill, Rent, etc."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="rent">Rent/Mortgage</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                          <SelectItem value="loan">Loan</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="one-time">One-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="auto_pay"
                      checked={formData.auto_pay}
                      onCheckedChange={(checked) => setFormData({...formData, auto_pay: checked})}
                    />
                    <Label htmlFor="auto_pay">Auto Pay Enabled</Label>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes..."
                      rows="3"
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
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Add Bill
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {getFilteredBillData().length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Bills Found</h3>
            <p className="text-slate-600">Add your first bill to get started with payment tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <SortableHeader field="name">Bill Name</SortableHeader>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-600">Category</th>
                  <SortableHeader field="amount" className="text-right w-28 border-l border-slate-200 dark:border-slate-600">Amount</SortableHeader>
                  <SortableHeader field="due_date" className="text-left border-l border-slate-200 dark:border-slate-600">Due Date</SortableHeader>
                  <SortableHeader field="status" className="text-left border-l border-slate-200 dark:border-slate-600">Status</SortableHeader>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white w-20 border-l border-slate-200 dark:border-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredBillData().map((bill) => {
                  const categoryInfo = getCategoryInfo(bill.category)
                  const CategoryIcon = categoryInfo.icon
                  const status = getBillStatus(bill)
                  const statusColor = getStatusColor(status)
                  const StatusIcon = getStatusIcon(status)
                  const daysUntil = getDaysUntilDue(bill.due_date)
                  
                  return (
                    <tr key={bill.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 rounded-lg`}>
                            <CategoryIcon className={`w-5 h-5 text-${categoryInfo.color}-600 dark:text-${categoryInfo.color}-400`} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{bill.name}</div>
                            {bill.notes && (
                              <div className="text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                                {bill.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4 border-l border-slate-200 dark:border-slate-600">
                        <span className={`inline-flex px-2 py-1 font-semibold rounded-full bg-${categoryInfo.color}-50 dark:bg-${categoryInfo.color}-900/30 text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-300`}>
                          {categoryInfo.label}
                        </span>
                      </td>
                      
                      <td className="p-4 text-right border-l border-slate-200 dark:border-slate-600">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(bill.amount)}
                        </div>
                        <div className="font-semibold text-slate-500 dark:text-slate-300 capitalize">
                          {bill.frequency}
                        </div>
                      </td>
                      
                      <td className="p-4 border-l border-slate-200 dark:border-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-300" />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {new Date(bill.due_date).toLocaleDateString()}
                            </span>
                            {bill.status !== 'paid' && (
                              <div className={`font-semibold ${daysUntil < 0 ? 'text-red-600 dark:text-red-400' : daysUntil <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : 
                                 daysUntil === 0 ? 'Due today' :
                                 `${daysUntil} days left`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4 border-l border-slate-200 dark:border-slate-600">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 font-semibold rounded-full bg-${statusColor}-50 dark:bg-${statusColor}-900/30 text-${statusColor}-700 dark:text-${statusColor}-300`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                          </span>
                          {bill.auto_pay && (
                            <span className="inline-flex px-2 py-1 font-semibold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                              Auto-pay
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4 border-l border-slate-200 dark:border-slate-600">
                        <div className="flex items-center gap-1">
                          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                            <DialogTrigger asChild>
                              <button 
                                onClick={() => handleEditBill(bill)}
                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Bill</DialogTitle>
                                <DialogDescription>
                                  Update bill information and payment details.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <form onSubmit={handleUpdateBill} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-name">Bill Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={formData.name}
                                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      placeholder="Electric Bill, Rent, etc."
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="utilities">Utilities</SelectItem>
                                        <SelectItem value="rent">Rent/Mortgage</SelectItem>
                                        <SelectItem value="insurance">Insurance</SelectItem>
                                        <SelectItem value="subscription">Subscription</SelectItem>
                                        <SelectItem value="loan">Loan</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <Input
                                      id="edit-amount"
                                      type="number"
                                      step="0.01"
                                      value={formData.amount}
                                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                      placeholder="0.00"
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

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-frequency">Frequency</Label>
                                    <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                        <SelectItem value="one-time">One-time</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-payment_method">Payment Method</Label>
                                    <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="debit_card">Debit Card</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="check">Check</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    id="edit-auto_pay"
                                    checked={formData.auto_pay}
                                    onCheckedChange={(checked) => setFormData({...formData, auto_pay: checked})}
                                  />
                                  <Label htmlFor="edit-auto_pay">Auto Pay Enabled</Label>
                                </div>

                                <div>
                                  <Label htmlFor="edit-notes">Notes (Optional)</Label>
                                  <Textarea
                                    id="edit-notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Additional notes..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                      setShowEditForm(false)
                                      setEditingBill(null)
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    Update Bill
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <button 
                            onClick={() => handleDeleteBill(bill.id)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
            {/* Content is shared across tabs, filtered by selectedProfile */}
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

export default Bills
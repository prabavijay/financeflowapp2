import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  CreditCard,
  Building,
  Car,
  Home,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  Calendar,
  Calculator,
  Shield,
  Target
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CreditLoans = () => {
  const [creditProducts, setCreditProducts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [activeTab, setActiveTab] = useState('Personal')
  const [newProduct, setNewProduct] = useState({
    type: 'credit_card',
    name: '',
    provider: '',
    current_balance: '',
    interest_rate: '',
    monthly_payment: '',
    payment_due_date: 1,
    credit_limit: '',
    original_loan_amount: '',
    loan_term_months: '',
    status: 'active',
    owner: 'Personal'
  })

  const creditTypes = [
    { value: 'all', label: 'All Products', icon: Calculator },
    { value: 'credit_card', label: 'Credit Cards', icon: CreditCard },
    { value: 'personal_loan', label: 'Personal Loans', icon: DollarSign },
    { value: 'auto_loan', label: 'Auto Loans', icon: Car },
    { value: 'mortgage', label: 'Mortgages', icon: Home },
    { value: 'student_loan', label: 'Student Loans', icon: GraduationCap },
    { value: 'line_of_credit', label: 'Lines of Credit', icon: Building }
  ]

  useEffect(() => {
    loadCreditData()
  }, [selectedType])

  const loadCreditData = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = selectedType !== 'all' ? { type: selectedType } : {}
      
      // Load products safely
      try {
        const productsResponse = await apiClient.getCreditProducts(params)
        if (productsResponse && productsResponse.success) {
          setCreditProducts(productsResponse.data || [])
        } else {
          setCreditProducts([])
        }
      } catch (productError) {
        console.error('Error loading products:', productError)
        setCreditProducts([])
      }
      
      // Load analytics safely
      try {
        const analyticsResponse = await apiClient.getCreditAnalytics()
        if (analyticsResponse && analyticsResponse.success) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (analyticsError) {
        console.error('Error loading analytics:', analyticsError)
        // Don't set error for analytics failure, just skip
      }
      
    } catch (err) {
      console.error('Error loading credit data:', err)
      setError('Failed to load credit data. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...newProduct,
        current_balance: parseFloat(newProduct.current_balance) || 0,
        interest_rate: parseFloat(newProduct.interest_rate) || 0,
        monthly_payment: parseFloat(newProduct.monthly_payment) || 0,
        payment_due_date: parseInt(newProduct.payment_due_date),
        credit_limit: newProduct.credit_limit ? parseFloat(newProduct.credit_limit) : null,
        original_loan_amount: newProduct.original_loan_amount ? parseFloat(newProduct.original_loan_amount) : null,
        loan_term_months: newProduct.loan_term_months ? parseInt(newProduct.loan_term_months) : null
      }

      const response = await apiClient.createCreditProduct(productData)
      if (response.success) {
        await loadCreditData()
        setNewProduct({
          type: 'credit_card',
          name: '',
          provider: '',
          current_balance: '',
          interest_rate: '',
          monthly_payment: '',
          payment_due_date: 1,
          credit_limit: '',
          original_loan_amount: '',
          loan_term_months: '',
          status: 'active',
          owner: 'Personal'
        })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Error adding credit product:', err)
      setError('Failed to add credit product')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this credit product?')) {
      try {
        const response = await apiClient.deleteCreditProduct(id)
        if (response.success) {
          await loadCreditData()
        }
      } catch (err) {
        console.error('Error deleting credit product:', err)
        setError('Failed to delete credit product')
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatPercentage = (rate) => {
    return `${(rate || 0).toFixed(1)}%`
  }

  const getFilteredCreditData = () => {
    if (activeTab === 'Family') {
      return creditProducts // show all data for Family tab
    }
    return creditProducts.filter(product => product.owner === activeTab || !product.owner)
  }

  const getTypeIcon = (type) => {
    const typeConfig = creditTypes.find(t => t.value === type)
    const Icon = typeConfig?.icon || Calculator
    return <Icon className="w-4 h-4" />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-100'
      case 'closed': return 'text-slate-600 bg-slate-100'
      case 'frozen': return 'text-blue-600 bg-blue-100'
      case 'delinquent': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 bg-slate-100'
    }
  }

  const getRiskLevel = (product) => {
    if (product.type === 'credit_card' && product.credit_utilization) {
      const utilization = parseFloat(product.credit_utilization)
      if (utilization > 80) return { level: 'high', color: 'text-red-600', icon: AlertTriangle }
      if (utilization > 50) return { level: 'medium', color: 'text-yellow-600', icon: AlertTriangle }
      return { level: 'low', color: 'text-emerald-600', icon: CheckCircle }
    }
    return { level: 'low', color: 'text-slate-600', icon: CheckCircle }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading credit data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Credit & Loans</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Comprehensive view of all credit products and loan accounts with detailed analytics</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105">
              <Plus className="w-5 h-5" />
              Add Credit Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Credit Product</DialogTitle>
              <DialogDescription>
                Add a credit card, loan, or other credit product to track.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newProduct.type} onValueChange={(value) => setNewProduct({...newProduct, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {creditTypes.slice(1).map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Chase Freedom Card"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={newProduct.provider}
                    onChange={(e) => setNewProduct({...newProduct, provider: e.target.value})}
                    placeholder="Chase, Wells Fargo"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_balance">Current Balance</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.current_balance}
                    onChange={(e) => setNewProduct({...newProduct, current_balance: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newProduct.interest_rate}
                    onChange={(e) => setNewProduct({...newProduct, interest_rate: e.target.value})}
                    placeholder="18.24"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_payment">Monthly Payment</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.monthly_payment}
                    onChange={(e) => setNewProduct({...newProduct, monthly_payment: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="number"
                    min="1"
                    max="31"
                    value={newProduct.payment_due_date}
                    onChange={(e) => setNewProduct({...newProduct, payment_due_date: e.target.value})}
                    placeholder="15"
                  />
                </div>
              </div>

              {newProduct.type === 'credit_card' && (
                <div>
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.credit_limit}
                    onChange={(e) => setNewProduct({...newProduct, credit_limit: e.target.value})}
                    placeholder="5000.00"
                  />
                </div>
              )}

              {newProduct.type !== 'credit_card' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="original_amount">Original Loan Amount</Label>
                    <Input
                      id="original_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newProduct.original_loan_amount}
                      onChange={(e) => setNewProduct({...newProduct, original_loan_amount: e.target.value})}
                      placeholder="25000.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loan_term">Loan Term (months)</Label>
                    <Input
                      id="loan_term"
                      type="number"
                      min="1"
                      value={newProduct.loan_term_months}
                      onChange={(e) => setNewProduct({...newProduct, loan_term_months: e.target.value})}
                      placeholder="60"
                    />
                  </div>
                </div>
              )}

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
                  className="flex-1"
                >
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="credit-loans-tabs space-y-4">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <TabsList className="ff-outline-tabs grid w-full grid-cols-3 max-w-md bg-transparent border border-emerald-500/40 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Personal</TabsTrigger>
            <TabsTrigger value="Spouse" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Spouse</TabsTrigger>
            <TabsTrigger value="Family" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">Family</TabsTrigger>
          </TabsList>
        </div>

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Accounts</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics?.summary?.total_accounts || 0}</p>
            <p className="text-sm text-slate-600 mt-1">Active credit products</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-md p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <span className="text-sm font-medium text-red-600">Total Debt</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics?.summary?.total_debt || 0)}</p>
            <p className="text-sm text-slate-600 mt-1">Across all accounts</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-md p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Monthly Payments</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics?.summary?.total_monthly_payments || 0)}</p>
            <p className="text-sm text-slate-600 mt-1">Total obligations</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Credit Utilization</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics?.summary?.avg_credit_utilization || '0.0'}%</p>
            <p className="text-sm text-slate-600 mt-1">Average across cards</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
        {creditTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedType === type.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Credit Products Table */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {selectedType === 'all' ? 'All Credit Products' : creditTypes.find(t => t.value === selectedType)?.label}
          </h2>
          <p className="text-slate-600 text-sm mt-1">Detailed information for debt reduction planning</p>
        </div>

        {getFilteredCreditData().length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Credit Products Found</h3>
            <p className="text-slate-600">Add your first credit card, loan, or mortgage to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-900">Product</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Provider</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Current Balance</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Interest Rate</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Monthly Payment</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Credit Details</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Due Date</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Risk/Status</th>
                  <th className="text-left p-4 font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredCreditData().map((product) => {
                  const risk = getRiskLevel(product)
                  const RiskIcon = risk.icon
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(product.type)}
                          <div>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-600 capitalize">{product.type.replace('_', ' ')}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{product.provider}</div>
                        {product.account_number && (
                          <div className="text-sm text-slate-600">**** {product.account_number?.toString().slice(-4)}</div>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="font-bold text-red-600">{formatCurrency(product.current_balance)}</div>
                        {product.original_loan_amount && (
                          <div className="text-sm text-slate-600">
                            of {formatCurrency(product.original_loan_amount)}
                          </div>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{formatPercentage(product.interest_rate)}</div>
                        <div className="text-sm text-slate-600">APR</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{formatCurrency(product.monthly_payment)}</div>
                        {product.auto_pay_enabled && (
                          <div className="text-xs text-emerald-600 font-medium">Auto-pay</div>
                        )}
                      </td>
                      
                      <td className="p-4">
                        {product.type === 'credit_card' ? (
                          <div>
                            <div className="font-semibold text-slate-900">
                              {formatCurrency(product.credit_limit)} limit
                            </div>
                            <div className="text-sm text-slate-600">
                              {formatCurrency(product.available_credit)} available
                            </div>
                            <div className="text-xs text-slate-500">
                              {product.credit_utilization || '0'}% utilization
                            </div>
                          </div>
                        ) : (
                          <div>
                            {product.remaining_payments && (
                              <div className="text-sm text-slate-600">
                                {product.remaining_payments} payments left
                              </div>
                            )}
                            {product.months_to_payoff && (
                              <div className="text-sm text-slate-600">
                                {product.months_to_payoff} months to payoff
                              </div>
                            )}
                            {product.loan_term_months && (
                              <div className="text-xs text-slate-500">
                                {product.loan_term_months} month term
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{product.payment_due_date}</div>
                        <div className="text-sm text-slate-600">of each month</div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <RiskIcon className={`w-4 h-4 ${risk.color}`} />
                          <span className={`text-sm font-medium ${risk.color} capitalize`}>
                            {risk.level} risk
                          </span>
                        </div>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default CreditLoans
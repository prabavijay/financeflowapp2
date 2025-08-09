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
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  Calculator
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CreditLoansNew = () => {
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
      case 'closed': return 'text-slate-600 dark:text-slate-300 bg-slate-100'
      case 'frozen': return 'text-blue-600 bg-blue-100'
      case 'delinquent': return 'text-red-600 bg-red-100'
      default: return 'text-slate-600 dark:text-slate-300 bg-slate-100'
    }
  }

  const getRiskLevel = (product) => {
    if (product.type === 'credit_card' && product.credit_utilization) {
      const utilization = parseFloat(product.credit_utilization)
      if (utilization > 80) return { level: 'high', color: 'text-red-600', icon: AlertTriangle }
      if (utilization > 50) return { level: 'medium', color: 'text-yellow-600', icon: AlertTriangle }
      return { level: 'low', color: 'text-emerald-600', icon: CheckCircle }
    }
    return { level: 'low', color: 'text-slate-600 dark:text-slate-300', icon: CheckCircle }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading credit data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Credit & Loans</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Comprehensive view of all credit products and loan accounts</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Credit Product
        </button>
      </div>

      {/* Clean Shadcn UI Tabs - No external CSS interference */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-start mb-6">
          <TabsList className="ff-outline-tabs grid w-full grid-cols-3 max-w-md bg-transparent border border-emerald-500/40 rounded-lg">
            <TabsTrigger value="Personal" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">
              Personal
            </TabsTrigger>
            <TabsTrigger value="Spouse" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">
              Spouse
            </TabsTrigger>
            <TabsTrigger value="Family" className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent">
              Family
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="Personal" className="space-y-6">
          {/* Analytics Summary Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Accounts</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.summary?.total_accounts || 0}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Active credit products</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-red-700/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Total Debt</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(analytics?.summary?.total_debt || 0)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Across all accounts</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/50 dark:border-orange-700/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Monthly Payments</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(analytics?.summary?.total_monthly_payments || 0)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Total obligations</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Credit Utilization</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics?.summary?.avg_credit_utilization || '0.0'}%</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Average across cards</p>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 overflow-x-auto border border-slate-200/50 dark:border-slate-700/50">
            {creditTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedType === type.value
                      ? 'bg-white/90 dark:bg-slate-700/80 text-emerald-600 dark:text-emerald-400 shadow-md border border-emerald-200/50 dark:border-emerald-700/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              )
            })}
          </div>

          {/* Credit Products Table */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {selectedType === 'all' ? 'All Credit Products' : creditTypes.find(t => t.value === selectedType)?.label}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Personal credit products and loans</p>
            </div>

            {getFilteredCreditData().length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Credit Products Found</h3>
                <p className="text-slate-600 dark:text-slate-300">Add your first credit card, loan, or mortgage to get started.</p>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-slate-600 dark:text-slate-300">Credit products for {activeTab} profile would be displayed here.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="Spouse" className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Spouse Credit Products</h2>
            <p className="text-slate-600 dark:text-slate-300">Credit products for Spouse profile would be displayed here.</p>
          </div>
        </TabsContent>

        <TabsContent value="Family" className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Family Credit Products</h2>
            <p className="text-slate-600 dark:text-slate-300">All family credit products would be displayed here.</p>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default CreditLoansNew
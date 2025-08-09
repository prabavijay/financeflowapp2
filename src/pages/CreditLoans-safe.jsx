import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Calculator,
  Plus,
  TrendingDown,
  DollarSign,
  Percent
} from 'lucide-react'

const CreditLoansSafe = () => {
  const [creditProducts, setCreditProducts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('Personal')

  useEffect(() => {
    loadCreditData()
  }, [])

  const loadCreditData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading credit data...')
      
      // Test basic API connectivity first
      const healthCheck = await fetch('http://localhost:3001/health')
      if (!healthCheck.ok) {
        throw new Error('Backend not accessible')
      }
      
      // Load credit products
      try {
        const productsResponse = await apiClient.getCreditProducts()
        console.log('Products response:', productsResponse)
        
        if (productsResponse && productsResponse.success) {
          setCreditProducts(productsResponse.data || [])
        } else {
          setCreditProducts([])
        }
      } catch (productError) {
        console.error('Error loading products:', productError)
        setCreditProducts([])
      }
      
      // Load analytics (safely)
      try {
        const analyticsResponse = await apiClient.getCreditAnalytics()
        console.log('Analytics response:', analyticsResponse)
        
        if (analyticsResponse && analyticsResponse.success) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (analyticsError) {
        console.error('Error loading analytics:', analyticsError)
        // Analytics failure shouldn't break the page
      }
      
    } catch (err) {
      console.error('Error in loadCreditData:', err)
      setError(`Failed to load credit data: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredCreditData = () => {
    if (activeTab === 'Family') {
      return creditProducts
    }
    return creditProducts.filter(product => product.owner === activeTab || !product.owner)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading credit data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Credit & Loans</h1>
          <p className="text-slate-600 mt-1">Comprehensive view of all credit products and loan accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Add Credit Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-gray-800/50 p-1 rounded-lg w-fit">
        {['Personal', 'Spouse', 'Family'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-slate-900 dark:text-cyan-100 shadow-sm'
                : 'text-slate-600 dark:text-cyan-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadCreditData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Total Accounts</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics.summary?.total_accounts || 0}</p>
            <p className="text-sm text-slate-600 mt-1">Active credit products</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-md p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <span className="text-sm font-medium text-red-600">Total Debt</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics.summary?.total_debt || 0)}</p>
            <p className="text-sm text-slate-600 mt-1">Across all accounts</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-md p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Monthly Payments</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics.summary?.total_monthly_payments || 0)}</p>
            <p className="text-sm text-slate-600 mt-1">Total obligations</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Credit Utilization</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{analytics.summary?.avg_credit_utilization || '0.0'}%</p>
            <p className="text-sm text-slate-600 mt-1">Average across cards</p>
          </div>
        </div>
      )}

      {/* Credit Products Table */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">All Credit Products</h2>
          <p className="text-slate-600 text-sm mt-1">Detailed information for debt reduction planning</p>
        </div>

        {getFilteredCreditData().length === 0 ? (
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Credit Products Found</h3>
            <p className="text-slate-600">Add your first credit card, loan, or mortgage to get started.</p>
            <div className="mt-4 text-sm text-slate-500">
              {error ? 'There was an error loading data.' : 'Database might be empty or backend not connected.'}
            </div>
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
                </tr>
              </thead>
              <tbody>
                {getFilteredCreditData().map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-sm text-slate-600 capitalize">{product.type?.replace('_', ' ')}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{product.provider}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-red-600">{formatCurrency(product.current_balance)}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{product.interest_rate}%</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{formatCurrency(product.monthly_payment)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 p-4 rounded-lg text-sm">
        <strong>Debug Info:</strong>
        <div>Products loaded: {getFilteredCreditData().length}</div>
        <div>Analytics loaded: {analytics ? 'Yes' : 'No'}</div>
        <div>Error: {error || 'None'}</div>
      </div>
    </div>
  )
}

export default CreditLoansSafe
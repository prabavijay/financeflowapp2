import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Sparkles,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Target,
  Lightbulb,
  Calculator,
  Zap
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DebtReduction = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [debtData, setDebtData] = useState([])
  const [creditData, setCreditData] = useState([])
  const [combinedDebts, setCombinedDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aiStrategies, setAiStrategies] = useState(null)

  const tabs = [
    { id: 'overview', label: 'Debt Overview', icon: Calculator },
    { id: 'strategies', label: 'AI Strategies', icon: Sparkles },
    { id: 'action-plan', label: 'Action Plan', icon: Target },
    { id: 'insights', label: 'Insights', icon: Lightbulb }
  ]

  useEffect(() => {
    loadDebtData()
  }, [])

  const loadDebtData = async () => {
    try {
      setLoading(true)
      
      // Load both debts and credit products
      const [debtsResponse, creditResponse] = await Promise.all([
        apiClient.getDebts(),
        apiClient.getCreditProducts()
      ])
      
      if (debtsResponse.success) {
        setDebtData(debtsResponse.data)
      }
      
      if (creditResponse.success) {
        setCreditData(creditResponse.data)
      }
      
      // Combine debt data with credit products for comprehensive analysis
      const combined = []
      
      // Add existing debts
      if (debtsResponse.success) {
        debtsResponse.data.forEach(debt => {
          combined.push({
            id: `debt_${debt.id}`,
            name: debt.name,
            balance: debt.balance,
            interest_rate: debt.interest_rate,
            minimum_payment: debt.minimum_payment,
            type: debt.type,
            source: 'debts',
            original_data: debt
          })
        })
      }
      
      // Add credit products with balances as debts
      if (creditResponse.success) {
        creditResponse.data
          .filter(product => product.current_balance > 0)
          .forEach(product => {
            combined.push({
              id: `credit_${product.id}`,
              name: product.name,
              balance: product.current_balance,
              interest_rate: product.interest_rate,
              minimum_payment: product.monthly_payment,
              type: product.type,
              source: 'credit',
              credit_limit: product.credit_limit,
              utilization: product.credit_utilization,
              original_data: product
            })
          })
      }
      
      setCombinedDebts(combined)
      generateAIStrategies(combined)
      setError(null)
    } catch (err) {
      console.error('Error loading debt data:', err)
      setError('Failed to connect to backend. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const generateAIStrategies = (debts) => {
    if (debts.length === 0) return

    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0)
    const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0)
    const totalInterest = debts.reduce((sum, debt) => sum + (debt.total_interest || 0), 0)
    const avgInterestRate = debts.reduce((sum, debt) => sum + (debt.balance * debt.interest_rate), 0) / totalDebt

    // Sort debts for different strategies
    const snowballOrder = [...debts].sort((a, b) => a.balance - b.balance)
    const avalancheOrder = [...debts].sort((a, b) => b.interest_rate - a.interest_rate)

    // Calculate recommended extra payment
    const recommendedExtra = Math.min(Math.max(totalMinPayments * 0.4, 200), 1000)
    const targetPayment = totalMinPayments + recommendedExtra

    // Calculate payoff timelines
    const snowballTimeline = calculatePayoffTimeline(snowballOrder, targetPayment, 'snowball')
    const avalancheTimeline = calculatePayoffTimeline(avalancheOrder, targetPayment, 'avalanche')

    setAiStrategies({
      totalDebt,
      totalMinPayments,
      totalInterest,
      avgInterestRate,
      recommendedExtra,
      targetPayment,
      snowballOrder,
      avalancheOrder,
      snowballTimeline,
      avalancheTimeline,
      snowballSavings: Math.max(0, totalInterest - snowballTimeline.totalInterest),
      avalancheSavings: Math.max(0, totalInterest - avalancheTimeline.totalInterest)
    })
  }

  const calculatePayoffTimeline = (debts, totalPayment, strategy) => {
    let remainingPayment = totalPayment
    let totalMonths = 0
    let totalInterest = 0
    const payoffOrder = []

    debts.forEach((debt, index) => {
      if (index === 0) {
        // Apply extra payment to first debt in strategy
        const extraPayment = remainingPayment - debt.minimum_payment
        const monthsToPayoff = Math.ceil(debt.balance / (debt.minimum_payment + extraPayment))
        const interestPaid = (debt.minimum_payment + extraPayment) * monthsToPayoff - debt.balance
        
        payoffOrder.push({
          ...debt,
          monthsToPayoff,
          interestPaid: Math.max(0, interestPaid),
          paymentAmount: debt.minimum_payment + extraPayment
        })
        
        totalMonths = Math.max(totalMonths, monthsToPayoff)
        totalInterest += Math.max(0, interestPaid)
        remainingPayment -= debt.minimum_payment
      } else {
        // Minimum payments for other debts
        const monthsToPayoff = debt.months_to_payoff || Math.ceil(debt.balance / debt.minimum_payment)
        payoffOrder.push({
          ...debt,
          monthsToPayoff,
          interestPaid: debt.total_interest || 0,
          paymentAmount: debt.minimum_payment
        })
        
        totalMonths = Math.max(totalMonths, monthsToPayoff)
        totalInterest += debt.total_interest || 0
      }
    })

    return {
      totalMonths,
      totalInterest,
      payoffOrder
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatMonths = (months) => {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (years === 0) return `${months} months`
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Analyzing debt data...</p>
        </div>
      </div>
    )
  }

  if (!aiStrategies) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Debt Data Available</h2>
        <p className="text-slate-600 dark:text-slate-300">Add some debts to get AI-powered reduction strategies.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Debt Reduction Strategies</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">AI-powered strategies to become debt-free faster</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
          <Sparkles className="w-5 h-5" />
          Generate AI Strategies
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-red-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Total Debt</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(aiStrategies.totalDebt)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{debtData.length} debts to eliminate</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/50 dark:border-orange-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Monthly Payments</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(aiStrategies.totalMinPayments)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Minimum required</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Interest</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(aiStrategies.totalInterest)}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">If paying minimums</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 dark:border-emerald-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Percent className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Avg Interest Rate</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{aiStrategies.avgInterestRate.toFixed(1)}%</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Across all debts</p>
        </div>
      </div>

      {/* Data Source Summary */}
      {(debtData.length > 0 || creditData.length > 0) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Comprehensive Debt Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{debtData.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Traditional Debts</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">From Debts page</div>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{creditData.filter(c => c.current_balance > 0).length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Credit Products</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">From Credit & Loans</div>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700/50">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{combinedDebts.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">Total Debt Items</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Combined for analysis</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-200/50 dark:border-blue-700/50">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Smart Integration:</strong> This analysis combines traditional debts with credit card balances and loan accounts 
              from your Credit & Loans page for a comprehensive debt reduction strategy.
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tabs */}
        <TabsList className="ff-outline-tabs grid w-full grid-cols-4 max-w-2xl bg-transparent border border-emerald-500/40 rounded-lg">
          {tabs.map((tab) => {
            const TabIcon = tab.icon
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="bg-transparent border border-transparent text-slate-600 dark:text-slate-300 rounded-md hover:text-emerald-500 hover:border-emerald-500/50 data-[state=active]:text-emerald-500 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent flex items-center gap-2">
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="overview">
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Current Debt Overview</h2>
            </div>
            <div className="p-6 space-y-6">
              {combinedDebts.map((debt) => (
                <div key={debt.id} className="border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{debt.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          debt.source === 'credit' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {debt.source === 'credit' ? 'Credit Product' : 'Debt'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          {debt.interest_rate}% APR
                        </span>
                        <span className="capitalize">{debt.type.replace('_', ' ')}</span>
                        {debt.source === 'credit' && debt.credit_limit && (
                          <span className="text-xs">
                            {debt.utilization}% utilization
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(debt.balance)}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">Min: {formatCurrency(debt.minimum_payment)}</div>
                      {debt.credit_limit && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Limit: {formatCurrency(debt.credit_limit)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {debt.source === 'credit' && debt.credit_limit ? (
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Credit Utilization:</span>
                          <span>{debt.utilization}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              parseFloat(debt.utilization) > 80 ? 'bg-red-500' :
                              parseFloat(debt.utilization) > 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(parseFloat(debt.utilization), 100)}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300 mt-3">
                          <div>Available: {formatCurrency(debt.credit_limit - debt.balance)}</div>
                          <div>Monthly Interest: {formatCurrency((debt.balance * debt.interest_rate / 100) / 12)}</div>
                          <div>Provider: {debt.original_data.provider}</div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span>{debt.original_data.original_amount ? `${(((debt.original_data.original_amount - debt.balance) / debt.original_data.original_amount) * 100).toFixed(1)}%` : '0%'}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-slate-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: debt.original_data.original_amount ? `${((debt.original_data.original_amount - debt.balance) / debt.original_data.original_amount) * 100}%` : '0%'
                            }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-300 mt-3">
                          <div>Total Interest: {formatCurrency(debt.original_data.total_interest || 0)}</div>
                          <div>Monthly Interest: {formatCurrency((debt.balance * debt.interest_rate / 100) / 12)}</div>
                          <div>{debt.original_data.months_to_payoff ? `${debt.original_data.months_to_payoff} months` : 'Calculating...'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="strategies">
        <div className="space-y-6">
          {/* AI Payment Recommendations */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 dark:border-purple-700/50">
            <div className="p-6 border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-200">AI-Powered Debt Reduction Strategies</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Monthly Payment Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700/50">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(aiStrategies.totalMinPayments)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Current Minimums</div>
                  </div>
                  <div className="text-center p-4 bg-blue-100/80 dark:bg-blue-900/30 backdrop-blur-lg rounded-lg shadow-md border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(aiStrategies.recommendedExtra)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Recommended Extra</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-100/80 dark:bg-emerald-900/30 backdrop-blur-lg rounded-lg shadow-md border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(aiStrategies.targetPayment)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">Target Total Payment</div>
                  </div>
                </div>
              </div>

              {/* Strategy Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Debt Snowball */}
                <div className="border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-md">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Debt Snowball</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Focus on paying off the smallest debts first while making minimum payments on larger debts.</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-emerald-600">Pros:</span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 ml-4">
                        <li>Psychological boost from quick wins</li>
                        <li>Increases motivation to pay off debt</li>
                        <li>Easier to manage smaller payments first</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-red-600">Cons:</span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 ml-4">
                        <li>Potentially more interest paid over time</li>
                        <li>May take longer to reduce total debt</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50/80 dark:bg-emerald-900/30 backdrop-blur-sm rounded-lg p-3 border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Timeline: {formatMonths(aiStrategies.snowballTimeline.totalMonths)}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Save: {formatCurrency(aiStrategies.snowballSavings)}</div>
                  </div>
                </div>

                {/* Debt Avalanche */}
                <div className="border border-slate-200/50 dark:border-slate-700/50 rounded-lg p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-md">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Debt Avalanche</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Prioritize paying off debts with the highest interest rates first.</p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-emerald-600">Pros:</span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 ml-4">
                        <li>Minimizes total interest paid over time</li>
                        <li>Faster overall debt reduction in terms of interest</li>
                        <li>Saves money in the long run</li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-red-600">Cons:</span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 ml-4">
                        <li>May take longer to see significant progress</li>
                        <li>Can be less motivating without quick wins</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur-sm rounded-lg p-3 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Timeline: {formatMonths(aiStrategies.avalancheTimeline.totalMonths)}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Save: {formatCurrency(aiStrategies.avalancheSavings)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="action-plan">
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recommended Payoff Order</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Based on debt avalanche strategy for maximum interest savings</p>
            </div>
            <div className="p-6 space-y-4">
              {aiStrategies.avalancheOrder.map((debt, index) => (
                <div key={debt.id} className="flex items-center gap-4 p-4 bg-slate-50/80 dark:bg-slate-700/50 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{debt.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Highest interest rate increases debt cost significantly.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 dark:text-white">{formatCurrency(debt.balance)}</div>
                    <div className="text-sm text-red-600">{debt.interest_rate}% APR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Action Steps</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Make minimum payments on all debts except for the {aiStrategies.avalancheOrder[0]?.name}.</h3>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Allocate any extra funds available to the {aiStrategies.avalancheOrder[0]?.name} until it is paid off.</h3>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Once the {aiStrategies.avalancheOrder[0]?.name} is paid off, redirect those funds to the {aiStrategies.avalancheOrder[1]?.name}.</h3>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Continue paying minimums on the remaining debts until the {aiStrategies.avalancheOrder[1]?.name} is also paid off.</h3>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">After paying off both high-interest debts, focus on the remaining debt. Ensure to reevaluate your financial situation for adjustments.</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </TabsContent>

        <TabsContent value="insights">
        <div className="space-y-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Key Insights</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Paying down high-interest debts first reduces total interest paid over time.</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">By focusing on the highest interest rate debts first, you can save thousands in interest payments and become debt-free faster.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Creating a dedicated extra payment strategy increases the pace of debt repayment.</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Even an extra {formatCurrency(100)} per month can significantly reduce your debt timeline and total interest paid.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Regular reviews of financial situation can help in adjusting payment strategies to optimize savings.</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">Review your debt strategy quarterly to take advantage of windfalls, pay raises, or changes in your financial situation.</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-lg p-6 border border-purple-200/50 dark:border-purple-700/50 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Smart Savings Tip</h3>
                </div>
                <p className="text-purple-700 dark:text-purple-300">
                  By following the debt avalanche strategy and paying an extra {formatCurrency(aiStrategies.recommendedExtra)} per month, 
                  you could save approximately <span className="font-bold">{formatCurrency(Math.max(aiStrategies.avalancheSavings, aiStrategies.snowballSavings))}</span> in interest 
                  and become debt-free <span className="font-bold">{formatMonths(Math.max(aiStrategies.avalancheTimeline.totalMonths, aiStrategies.snowballTimeline.totalMonths))}</span> faster.
                </p>
              </div>
            </div>
          </div>
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

export default DebtReduction
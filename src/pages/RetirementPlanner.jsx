import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Calculator,
  TrendingUp,
  Target,
  Calendar,
  DollarSign,
  PiggyBank,
  Briefcase,
  Home,
  AlertCircle,
  Info,
  Settings,
  BarChart3,
  Percent,
  Clock,
  Award,
  Zap,
  CheckCircle
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'

const RetirementPlanner = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('calculator')
  const [loading, setLoading] = useState(false)
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    assets: []
  })

  // Retirement Planning Inputs
  const [retirementData, setRetirementData] = useState({
    currentAge: 35,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    expectedReturn: 7,
    inflationRate: 3,
    retirementIncome: 80, // percentage of current income needed
    socialSecurityBenefit: 2000,
    pensionBenefit: 0,
    healthcareCosts: 300,
    currentAnnualIncome: 75000
  })

  const [scenarios, setScenarios] = useState([
    { name: 'Conservative', return: 5, contribution: 800 },
    { name: 'Moderate', return: 7, contribution: 1000 },
    { name: 'Aggressive', return: 9, contribution: 1200 }
  ])

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      const [incomeResponse, expenseResponse, assetResponse] = await Promise.all([
        apiClient.getIncome(),
        apiClient.getExpenses(),
        apiClient.getAssets()
      ])

      setFinancialData({
        income: incomeResponse.success ? incomeResponse.data : [],
        expenses: expenseResponse.success ? expenseResponse.data : [],
        assets: assetResponse.success ? assetResponse.data : []
      })

      // Auto-calculate current income from data
      if (incomeResponse.success && incomeResponse.data.length > 0) {
        const annualIncome = incomeResponse.data.reduce((total, income) => {
          let annualAmount = parseFloat(income.amount || 0)
          switch (income.frequency) {
            case 'weekly': annualAmount *= 52; break
            case 'bi-weekly': annualAmount *= 26; break
            case 'monthly': annualAmount *= 12; break
            case 'yearly': break
            default: annualAmount *= 12; break
          }
          return total + annualAmount
        }, 0)

        setRetirementData(prev => ({
          ...prev,
          currentAnnualIncome: Math.round(annualIncome)
        }))
      }
    } catch (err) {
      console.error('Error loading financial data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Retirement Calculations
  const calculateRetirementProjection = () => {
    const { currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn } = retirementData
    const yearsToRetirement = retirementAge - currentAge
    const monthlyReturn = expectedReturn / 100 / 12
    const totalMonths = yearsToRetirement * 12

    // Future Value of Current Savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToRetirement)
    
    // Future Value of Monthly Contributions (Annuity)
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn)

    const totalRetirementSavings = futureValueCurrentSavings + futureValueContributions

    return {
      totalSavings: totalRetirementSavings,
      futureValueCurrentSavings,
      futureValueContributions,
      yearsToRetirement,
      monthlyReturn
    }
  }

  const calculateRetirementIncome = () => {
    const projection = calculateRetirementProjection()
    const { inflationRate, socialSecurityBenefit, pensionBenefit, healthcareCosts } = retirementData
    
    // Adjust for inflation
    const futureInflationMultiplier = Math.pow(1 + inflationRate / 100, projection.yearsToRetirement)
    const adjustedSocialSecurity = socialSecurityBenefit * futureInflationMultiplier
    const adjustedPension = pensionBenefit * futureInflationMultiplier
    const adjustedHealthcare = healthcareCosts * futureInflationMultiplier

    // 4% withdrawal rule
    const monthlyWithdrawal = (projection.totalSavings * 0.04) / 12
    const totalMonthlyIncome = monthlyWithdrawal + adjustedSocialSecurity + adjustedPension
    const netMonthlyIncome = totalMonthlyIncome - adjustedHealthcare

    // Required income (inflation adjusted)
    const currentMonthlyIncome = retirementData.currentAnnualIncome / 12
    const requiredMonthlyIncome = (currentMonthlyIncome * retirementData.retirementIncome / 100) * futureInflationMultiplier

    return {
      monthlyWithdrawal,
      totalMonthlyIncome,
      netMonthlyIncome,
      requiredMonthlyIncome,
      shortfall: Math.max(0, requiredMonthlyIncome - netMonthlyIncome),
      surplus: Math.max(0, netMonthlyIncome - requiredMonthlyIncome)
    }
  }

  const generateProjectionChart = () => {
    const projection = calculateRetirementProjection()
    const data = []
    
    for (let year = 0; year <= projection.yearsToRetirement; year++) {
      const currentAge = retirementData.currentAge + year
      const yearsFromNow = year
      
      // Calculate portfolio value at this year
      const futureValueCurrentSavings = retirementData.currentSavings * 
        Math.pow(1 + retirementData.expectedReturn / 100, yearsFromNow)
      
      const monthsContributed = yearsFromNow * 12
      const monthlyReturn = retirementData.expectedReturn / 100 / 12
      const futureValueContributions = monthsContributed > 0 ? 
        retirementData.monthlyContribution * ((Math.pow(1 + monthlyReturn, monthsContributed) - 1) / monthlyReturn) : 0

      const totalValue = futureValueCurrentSavings + futureValueContributions

      data.push({
        age: currentAge,
        year: new Date().getFullYear() + year,
        portfolioValue: Math.round(totalValue),
        contributions: Math.round(futureValueContributions),
        growth: Math.round(futureValueCurrentSavings)
      })
    }

    return data
  }

  const generateScenarioComparison = () => {
    return scenarios.map(scenario => {
      const tempData = {
        ...retirementData,
        expectedReturn: scenario.return,
        monthlyContribution: scenario.contribution
      }
      
      const yearsToRetirement = tempData.retirementAge - tempData.currentAge
      const monthlyReturn = scenario.return / 100 / 12
      const totalMonths = yearsToRetirement * 12

      const futureValueCurrentSavings = tempData.currentSavings * 
        Math.pow(1 + scenario.return / 100, yearsToRetirement)
      
      const futureValueContributions = scenario.contribution * 
        ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn)

      const totalSavings = futureValueCurrentSavings + futureValueContributions
      const monthlyIncome = (totalSavings * 0.04) / 12

      return {
        name: scenario.name,
        totalSavings: Math.round(totalSavings),
        monthlyIncome: Math.round(monthlyIncome),
        return: scenario.return,
        contribution: scenario.contribution
      }
    })
  }

  const getRetirementReadiness = () => {
    const income = calculateRetirementIncome()
    const coverage = (income.netMonthlyIncome / income.requiredMonthlyIncome) * 100
    
    if (coverage >= 100) return { status: 'excellent', color: 'emerald', message: 'On track for retirement!' }
    if (coverage >= 80) return { status: 'good', color: 'blue', message: 'Good progress, minor adjustments needed' }
    if (coverage >= 60) return { status: 'fair', color: 'yellow', message: 'Moderate adjustments required' }
    return { status: 'needs-work', color: 'red', message: 'Significant planning required' }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatLargeCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return formatCurrency(amount)
  }

  const projection = calculateRetirementProjection()
  const income = calculateRetirementIncome()
  const readiness = getRetirementReadiness()
  const chartData = generateProjectionChart()
  const scenarioData = generateScenarioComparison()

  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'projections', label: 'Projections', icon: TrendingUp },
    { id: 'scenarios', label: 'Scenarios', icon: BarChart3 },
    { id: 'optimization', label: 'Optimization', icon: Target }
  ]

  const renderCalculator = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Current Age
              </label>
              <input
                type="number"
                value={retirementData.currentAge}
                onChange={(e) => setRetirementData(prev => ({ ...prev, currentAge: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Retirement Age
              </label>
              <input
                type="number"
                value={retirementData.retirementAge}
                onChange={(e) => setRetirementData(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Current Annual Income
              </label>
              <input
                type="number"
                value={retirementData.currentAnnualIncome}
                onChange={(e) => setRetirementData(prev => ({ ...prev, currentAnnualIncome: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
            Savings & Contributions
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Current Retirement Savings
              </label>
              <input
                type="number"
                value={retirementData.currentSavings}
                onChange={(e) => setRetirementData(prev => ({ ...prev, currentSavings: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Monthly Contribution
              </label>
              <input
                type="number"
                value={retirementData.monthlyContribution}
                onChange={(e) => setRetirementData(prev => ({ ...prev, monthlyContribution: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Expected Annual Return (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={retirementData.expectedReturn}
                onChange={(e) => setRetirementData(prev => ({ ...prev, expectedReturn: parseFloat(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
            Retirement Planning
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Retirement Income Need (% of current)
              </label>
              <input
                type="number"
                value={retirementData.retirementIncome}
                onChange={(e) => setRetirementData(prev => ({ ...prev, retirementIncome: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Expected Social Security (monthly)
              </label>
              <input
                type="number"
                value={retirementData.socialSecurityBenefit}
                onChange={(e) => setRetirementData(prev => ({ ...prev, socialSecurityBenefit: parseInt(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                Inflation Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={retirementData.inflationRate}
                onChange={(e) => setRetirementData(prev => ({ ...prev, inflationRate: parseFloat(e.target.value) || 0 }))}
                className={`w-full mt-1 px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-cyan-100' : 'bg-white border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Retirement Readiness */}
        <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 bg-gradient-to-r from-${readiness.color}-500 to-${readiness.color}-600 rounded-xl`}>
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                Retirement Readiness
              </h3>
              <p className={`text-${readiness.color}-600 font-medium`}>{readiness.message}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                {projection.yearsToRetirement}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Years to Retirement</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                {formatLargeCurrency(projection.totalSavings)}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Projected Savings</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                {formatCurrency(income.netMonthlyIncome)}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Monthly Income</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-slate-50'}`}>
              <div className={`text-2xl font-bold ${income.shortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {income.shortfall > 0 ? `-${formatCurrency(income.shortfall)}` : `+${formatCurrency(income.surplus)}`}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Monthly Gap</div>
            </div>
          </div>
        </div>

        {/* Income Breakdown */}
        <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
            Retirement Income Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-cyan-300' : 'text-slate-600'}>Portfolio Withdrawal (4%)</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatCurrency(income.monthlyWithdrawal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-cyan-300' : 'text-slate-600'}>Social Security</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatCurrency(retirementData.socialSecurityBenefit * Math.pow(1 + retirementData.inflationRate / 100, projection.yearsToRetirement))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-cyan-300' : 'text-slate-600'}>Pension</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatCurrency(retirementData.pensionBenefit)}
                </span>
              </div>
              <hr className={isDarkMode ? 'border-gray-600' : 'border-slate-200'} />
              <div className="flex justify-between font-semibold">
                <span className={isDarkMode ? 'text-cyan-100' : 'text-slate-900'}>Total Monthly Income</span>
                <span className={isDarkMode ? 'text-cyan-100' : 'text-slate-900'}>
                  {formatCurrency(income.totalMonthlyIncome)}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-cyan-300' : 'text-slate-600'}>Healthcare Costs</span>
                <span className={`font-medium text-red-600`}>
                  -{formatCurrency(retirementData.healthcareCosts * Math.pow(1 + retirementData.inflationRate / 100, projection.yearsToRetirement))}
                </span>
              </div>
              <hr className={isDarkMode ? 'border-gray-600' : 'border-slate-200'} />
              <div className="flex justify-between font-semibold">
                <span className={isDarkMode ? 'text-cyan-100' : 'text-slate-900'}>Net Monthly Income</span>
                <span className={isDarkMode ? 'text-cyan-100' : 'text-slate-900'}>
                  {formatCurrency(income.netMonthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-cyan-300' : 'text-slate-600'}>Required Income</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatCurrency(income.requiredMonthlyIncome)}
                </span>
              </div>
              <div className={`flex justify-between font-semibold ${income.shortfall > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                <span>{income.shortfall > 0 ? 'Shortfall' : 'Surplus'}</span>
                <span>
                  {income.shortfall > 0 ? formatCurrency(income.shortfall) : formatCurrency(income.surplus)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {income.shortfall > 0 && (
          <div className={`rounded-xl shadow-lg border border-amber-200 p-6 bg-gradient-to-r from-amber-50 to-orange-50 ${isDarkMode ? 'dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-700/50' : ''}`}>
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                  Recommendations to Close Gap
                </h3>
                <div className="space-y-2 text-sm">
                  <p className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>
                    • Increase monthly contribution by {formatCurrency(income.shortfall * 12 / 0.04 / projection.yearsToRetirement / 12)} to meet retirement goals
                  </p>
                  <p className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>
                    • Consider working {Math.ceil(income.shortfall / income.monthlyWithdrawal * 12)} additional years
                  </p>
                  <p className={isDarkMode ? 'text-amber-300' : 'text-amber-700'}>
                    • Reduce retirement income needs by {Math.ceil((income.shortfall / income.requiredMonthlyIncome) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderProjections = () => (
    <div className="space-y-8">
      {/* Portfolio Growth Chart */}
      <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
          Portfolio Growth Projection
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e2e8f0'} />
            <XAxis 
              dataKey="age" 
              stroke={isDarkMode ? '#9ca3af' : '#64748b'}
              fontSize={12}
            />
            <YAxis 
              stroke={isDarkMode ? '#9ca3af' : '#64748b'}
              fontSize={12}
              tickFormatter={(value) => formatLargeCurrency(value)}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#f3f4f6' : '#1f2937'
              }}
              formatter={(value, name) => [formatCurrency(value), name]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="growth"
              stackId="1"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              name="Current Savings Growth"
            />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.6}
              name="Future Contributions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Milestones */}
      <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
          Retirement Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              age: Math.round(retirementData.currentAge + projection.yearsToRetirement * 0.25),
              label: '25% to Retirement',
              value: chartData[Math.floor(chartData.length * 0.25)]?.portfolioValue || 0,
              icon: Clock
            },
            {
              age: Math.round(retirementData.currentAge + projection.yearsToRetirement * 0.5),
              label: 'Halfway Point',
              value: chartData[Math.floor(chartData.length * 0.5)]?.portfolioValue || 0,
              icon: Target
            },
            {
              age: retirementData.retirementAge,
              label: 'Retirement',
              value: projection.totalSavings,
              icon: Award
            }
          ].map((milestone, index) => (
            <div key={index} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3 mb-2">
                <milestone.icon className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-slate-700'}`}>
                  {milestone.label}
                </span>
              </div>
              <div className={`text-xl font-bold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                Age {milestone.age}
              </div>
              <div className={`text-lg font-semibold ${isDarkMode ? 'text-green-400' : 'text-emerald-600'}`}>
                {formatLargeCurrency(milestone.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderScenarios = () => (
    <div className="space-y-8">
      {/* Scenario Comparison */}
      <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
          Investment Strategy Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e2e8f0'} />
            <XAxis 
              dataKey="name" 
              stroke={isDarkMode ? '#9ca3af' : '#64748b'}
              fontSize={12}
            />
            <YAxis 
              stroke={isDarkMode ? '#9ca3af' : '#64748b'}
              fontSize={12}
              tickFormatter={(value) => formatLargeCurrency(value)}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
                borderRadius: '8px',
                color: isDarkMode ? '#f3f4f6' : '#1f2937'
              }}
              formatter={(value, name) => [
                name === 'totalSavings' ? formatCurrency(value) : 
                name === 'monthlyIncome' ? formatCurrency(value) :
                name === 'return' ? `${value}%` : formatCurrency(value),
                name === 'totalSavings' ? 'Total Savings' :
                name === 'monthlyIncome' ? 'Monthly Income' :
                name === 'return' ? 'Expected Return' : 'Monthly Contribution'
              ]}
            />
            <Legend />
            <Bar dataKey="totalSavings" fill="#8b5cf6" name="Total Savings" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarioData.map((scenario, index) => (
          <div key={index} className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${
                scenario.name === 'Conservative' ? 'bg-blue-100 text-blue-600' :
                scenario.name === 'Moderate' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                {scenario.name}
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Expected Return</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>{scenario.return}%</span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Monthly Contribution</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatCurrency(scenario.contribution)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Total at Retirement</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatLargeCurrency(scenario.totalSavings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Monthly Income</span>
                <span className={`font-medium ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                  {formatCurrency(scenario.monthlyIncome)}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setRetirementData(prev => ({
                  ...prev,
                  expectedReturn: scenario.return,
                  monthlyContribution: scenario.contribution
                }))
                setActiveTab('calculator')
              }}
              className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                scenario.name === 'Conservative' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                scenario.name === 'Moderate' ? 'bg-green-600 hover:bg-green-700 text-white' :
                'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Use This Strategy
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderOptimization = () => (
    <div className="space-y-8">
      {/* Optimization Strategies */}
      <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
          Retirement Optimization Strategies
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Maximize Employer Match',
              description: 'Ensure you\'re contributing enough to get full employer 401(k) match',
              impact: 'High',
              icon: Briefcase,
              color: 'green',
              tips: [
                'Contribute at least to employer match limit',
                'Consider increasing contribution with salary raises',
                'Review match policies annually'
              ]
            },
            {
              title: 'Tax-Advantaged Accounts',
              description: 'Maximize contributions to 401(k), IRA, and Roth IRA accounts',
              impact: 'High',
              icon: PiggyBank,
              color: 'blue',
              tips: [
                'Max out 401(k) contributions ($23,000 in 2024)',
                'Contribute to IRA/Roth IRA ($7,000 in 2024)',
                'Consider backdoor Roth conversions'
              ]
            },
            {
              title: 'Debt Reduction',
              description: 'Pay off high-interest debt to free up money for retirement',
              impact: 'Medium',
              icon: AlertCircle,
              color: 'orange',
              tips: [
                'Prioritize high-interest debt first',
                'Consider debt consolidation',
                'Redirect debt payments to retirement savings'
              ]
            },
            {
              title: 'Investment Diversification',
              description: 'Optimize asset allocation based on age and risk tolerance',
              impact: 'Medium',
              icon: BarChart3,
              color: 'purple',
              tips: [
                'Follow age-based asset allocation rules',
                'Rebalance portfolio annually',
                'Consider low-cost index funds'
              ]
            }
          ].map((strategy, index) => (
            <div key={index} className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-${strategy.color}-100 rounded-lg`}>
                  <strategy.icon className={`w-6 h-6 text-${strategy.color}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
                      {strategy.title}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.impact === 'High' ? 'bg-green-100 text-green-700' :
                      strategy.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {strategy.impact} Impact
                    </span>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>
                    {strategy.description}
                  </p>
                  <ul className="space-y-1">
                    {strategy.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
          Quick Optimization Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: 'Increase Monthly Contribution by $100',
              impact: `+${formatLargeCurrency(100 * ((Math.pow(1 + retirementData.expectedReturn / 100 / 12, projection.yearsToRetirement * 12) - 1) / (retirementData.expectedReturn / 100 / 12)))}`,
              action: () => setRetirementData(prev => ({ ...prev, monthlyContribution: prev.monthlyContribution + 100 }))
            },
            {
              label: 'Work 2 Extra Years',
              impact: `+${formatLargeCurrency(retirementData.monthlyContribution * 24 * Math.pow(1 + retirementData.expectedReturn / 100, 2))}`,
              action: () => setRetirementData(prev => ({ ...prev, retirementAge: prev.retirementAge + 2 }))
            },
            {
              label: 'Increase Return by 1%',
              impact: `+${formatLargeCurrency((calculateRetirementProjection().totalSavings * 0.1))}`,
              action: () => setRetirementData(prev => ({ ...prev, expectedReturn: prev.expectedReturn + 1 }))
            }
          ].map((action, index) => (
            <div key={index} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-sm mb-2 ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>
                {action.label}
              </div>
              <div className={`text-lg font-semibold mb-3 text-green-600`}>
                {action.impact}
              </div>
              <button
                onClick={() => {
                  action.action()
                  setActiveTab('calculator')
                }}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${isDarkMode ? 'border-cyan-600' : 'border-blue-600'}`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>Loading retirement data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-cyan-100' : 'text-slate-900'}`}>
            Retirement Planner
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-cyan-300' : 'text-slate-600'}`}>
            Plan and optimize your retirement strategy with sophisticated calculations
          </p>
        </div>
        <div className={`p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl`}>
          <Calculator className="w-8 h-8 text-white" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Tabs */}
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="calculator">
          {renderCalculator()}
        </TabsContent>
        
        <TabsContent value="projections">
          {renderProjections()}
        </TabsContent>
        
        <TabsContent value="scenarios">
          {renderScenarios()}
        </TabsContent>
        
        <TabsContent value="optimization">
          {renderOptimization()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RetirementPlanner
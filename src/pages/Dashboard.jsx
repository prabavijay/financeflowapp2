import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    loading: true,
    error: null,
    backendStatus: null
  })

  // Simple navigation function for Next.js
  const handleNavigation = (path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Test backend connection
      const status = await apiClient.status()
      setDashboardData(prev => ({
        ...prev,
        backendStatus: status,
        loading: false
      }))
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        error: 'Unable to connect to backend server',
        loading: false
      }))
    }
  }

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Backend Connection Error</h3>
            <p className="text-red-700">{dashboardData.error}</p>
            <p className="text-sm text-red-600 mt-2">
              Make sure the backend server is running on port 3001
            </p>
            <button 
              onClick={loadDashboardData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Sample data (will be replaced with real data from backend)
  const financialMetrics = {
    monthlyIncome: 10066,
    monthlyExpenses: 7277,
    netWorth: 2036424,
    savingsRate: -3,
    totalDebt: 60924,
    totalAssets: 150000,
    creditUtilization: 68
  }

  // Chart data
  const monthlyTrendData = [
    { month: 'Jan', income: 9500, expenses: 7200, savings: 2300 },
    { month: 'Feb', income: 9800, expenses: 7100, savings: 2700 },
    { month: 'Mar', income: 10200, expenses: 7300, savings: 2900 },
    { month: 'Apr', income: 9900, expenses: 7500, savings: 2400 },
    { month: 'May', income: 10400, expenses: 7200, savings: 3200 },
    { month: 'Jun', income: 10066, expenses: 7277, savings: 2789 }
  ]

  const expenseBreakdownData = [
    { name: 'Housing', value: 2500, color: '#8B5CF6' },
    { name: 'Food', value: 1200, color: '#06B6D4' },
    { name: 'Transportation', value: 800, color: '#84CC16' },
    { name: 'Utilities', value: 400, color: '#F59E0B' },
    { name: 'Entertainment', value: 600, color: '#EF4444' },
    { name: 'Healthcare', value: 500, color: '#10B981' },
    { name: 'Other', value: 1277, color: '#6B7280' }
  ]

  const assetAllocationData = [
    { name: 'Real Estate', value: 85000, color: '#8B5CF6' },
    { name: 'Investments', value: 45000, color: '#06B6D4' },
    { name: 'Cash & Savings', value: 15000, color: '#84CC16' },
    { name: 'Retirement', value: 5000, color: '#F59E0B' }
  ]

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium text-${color}-700 dark:text-${color}-300`}>{title}</p>
          <p className={`text-2xl font-bold text-slate-900 dark:text-white mt-1`}>
            {typeof value === 'number' ? 
              (value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `$${value}`) 
              : value
            }
          </p>
          {trend && (
            <p className={`text-xs ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'} mt-1 font-medium`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Financial Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base">
              Get a comprehensive overview of your financial health and track your progress towards your goals
            </p>
          </div>
          <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 backdrop-blur-lg rounded-xl px-4 py-2 border border-emerald-200/50 dark:border-emerald-700/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Backend Connected ({dashboardData.backendStatus?.environment})
              </span>
            </div>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <MetricCard
          title="Monthly Income"
          value={financialMetrics.monthlyIncome}
          icon={TrendingUp}
          trend={5}
          color="emerald"
        />
        <MetricCard
          title="Monthly Expenses"
          value={financialMetrics.monthlyExpenses}
          icon={TrendingDown}
          trend={-2}
          color="slate"
        />
        <MetricCard
          title="Net Worth"
          value={financialMetrics.netWorth}
          icon={PiggyBank}
          trend={8}
          color="blue"
        />
        <MetricCard
          title="Savings Rate"
          value={`${financialMetrics.savingsRate}%`}
          icon={DollarSign}
          trend={financialMetrics.savingsRate}
          color={financialMetrics.savingsRate >= 0 ? "emerald" : "slate"}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard
          title="Total Debt"
          value={financialMetrics.totalDebt}
          icon={CreditCard}
          color="slate"
        />
        <MetricCard
          title="Total Assets"
          value={financialMetrics.totalAssets}
          icon={Building2}
          color="purple"
        />
        <MetricCard
          title="Credit Utilization"
          value={`${financialMetrics.creditUtilization}%`}
          icon={CreditCard}
          color={financialMetrics.creditUtilization > 30 ? "slate" : "teal"}
        />
      </div>

      {/* Backend Status Info */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-3">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-600">Database:</span>
            <span className="ml-2 text-slate-900 font-semibold">
              {dashboardData.backendStatus?.features?.database || 'PostgreSQL 17'}
            </span>
          </div>
          <div>
            <span className="font-medium text-slate-600">Authentication:</span>
            <span className="ml-2 text-slate-900 font-semibold">
              {dashboardData.backendStatus?.features?.authentication || 'JWT'}
            </span>
          </div>
          <div>
            <span className="font-medium text-slate-600">Entities:</span>
            <span className="ml-2 text-slate-900 font-semibold">
              {dashboardData.backendStatus?.features?.entities?.length || 10} Available
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Chart */}
        <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-lg">Monthly Financial Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
              <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Chart */}
        <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-lg">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdownData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {expenseBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Allocation Chart */}
      <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-lg">Asset Allocation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assetAllocationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8 hover:shadow-2xl transition-all duration-300">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-6 text-lg">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <button 
            onClick={() => handleNavigation('/income')}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-emerald-100/80 to-emerald-200/80 dark:from-emerald-900/30 dark:to-emerald-800/30 hover:from-emerald-200/90 hover:to-emerald-300/90 dark:hover:from-emerald-800/40 dark:hover:to-emerald-700/40 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-700/50"
          >
            <TrendingUp className="w-8 h-8 text-emerald-700 dark:text-emerald-300" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Add Income</span>
          </button>
          <button 
            onClick={() => handleNavigation('/expenses')}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/30 dark:to-slate-700/30 hover:from-slate-200/90 hover:to-slate-300/90 dark:hover:from-slate-700/40 dark:hover:to-slate-600/40 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50"
          >
            <TrendingDown className="w-8 h-8 text-slate-700 dark:text-slate-300" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Add Expense</span>
          </button>
          <button 
            onClick={() => handleNavigation('/bills')}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-100/80 to-blue-200/80 dark:from-blue-900/30 dark:to-blue-800/30 hover:from-blue-200/90 hover:to-blue-300/90 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50"
          >
            <CreditCard className="w-8 h-8 text-blue-700 dark:text-blue-300" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Pay Bill</span>
          </button>
          <button 
            onClick={() => handleNavigation('/budget')}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-teal-100/80 to-teal-200/80 dark:from-teal-900/30 dark:to-teal-800/30 hover:from-teal-200/90 hover:to-teal-300/90 dark:hover:from-teal-800/40 dark:hover:to-teal-700/40 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-teal-200/50 dark:border-teal-700/50"
          >
            <PiggyBank className="w-8 h-8 text-teal-700 dark:text-teal-300" />
            <span className="text-sm font-medium text-teal-800 dark:text-teal-200">View Budget</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Dashboard
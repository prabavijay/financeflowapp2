import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Building2,
  AlertCircle,
  BarChart3,
  Wallet
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
  const [summaryData, setSummaryData] = useState(null)

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
      const status = await apiClient.status()
      setDashboardData(prev => ({
        ...prev,
        backendStatus: status,
        loading: false
      }))

      // Load summary data from API
      try {
        const summary = await apiClient.getDashboardSummary()
        if (summary && summary.success) {
          setSummaryData(summary.data)
        }
      } catch (e) {
        console.error('Error loading dashboard summary:', e)
      }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="glass-card border-t-2 border-t-red-400 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="font-semibold text-white">Backend Connection Error</h3>
            <p className="text-slate-400">{dashboardData.error}</p>
            <p className="text-sm text-slate-500 mt-2">
              Make sure the backend server is running on port 3001
            </p>
            <button
              onClick={loadDashboardData}
              className="mt-3 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors shadow-glow-cyan"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }

  const metrics = summaryData?.metrics || {}
  const monthlyTrendData = summaryData?.monthlyTrend || []
  const expenseBreakdownData = summaryData?.expenseBreakdown || []
  const assetAllocationData = summaryData?.assetAllocation || []

  const hasData = summaryData && (
    metrics.monthlyIncome > 0 ||
    metrics.monthlyExpenses > 0 ||
    metrics.totalAssets > 0 ||
    monthlyTrendData.length > 0
  )

  const accentStyles = {
    cyan: { border: 'border-t-cyan-400', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    coral: { border: 'border-t-red-400', text: 'text-red-400', bg: 'bg-red-500/10' },
    amber: { border: 'border-t-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10' },
    green: { border: 'border-t-green-400', text: 'text-green-400', bg: 'bg-green-500/10' },
    purple: { border: 'border-t-purple-400', text: 'text-purple-400', bg: 'bg-purple-500/10' },
    slate: { border: 'border-t-slate-400', text: 'text-slate-400', bg: 'bg-slate-500/10' },
    blue: { border: 'border-t-blue-400', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  }

  const MetricCard = ({ title, value, icon: Icon, trend, color = "cyan" }) => {
    const accent = accentStyles[color] || accentStyles.cyan
    return (
      <div className={`glass-card glass-card-hover p-6 border-t-2 ${accent.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-white mt-2">
              {typeof value === 'number'
                ? (value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `$${value}`)
                : value
              }
            </p>
            {trend !== undefined && trend !== null && (
              <p className={`text-xs mt-1 font-medium ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {trend > 0 ? '+' : ''}{Math.abs(trend)}% {trend > 0 ? '↗' : trend < 0 ? '↘' : ''}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${accent.bg}`}>
            <Icon className={`w-6 h-6 ${accent.text}`} />
          </div>
        </div>
      </div>
    )
  }

  const darkTooltipStyle = {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    border: '1px solid rgba(100, 150, 255, 0.15)',
    borderRadius: '12px',
    color: '#f8fafc',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Financial Dashboard
            </h1>
            <p className="text-slate-400 text-base">
              Get a comprehensive overview of your financial health and track your progress towards your goals
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">
              Backend Connected ({dashboardData.backendStatus?.environment})
            </span>
          </div>
        </div>

        {!hasData ? (
          /* Empty State - New User Welcome */
          <div className="space-y-6">
            <div className="glass-card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to FinanceFlow</h2>
              <p className="text-slate-400 max-w-lg mx-auto mb-8">
                Start managing your finances by adding your income, expenses, bills, and assets.
                Your dashboard will come to life with charts and insights as you add data.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => handleNavigation('/income')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-cyan-500/30 hover:shadow-glow-cyan rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Add Income</span>
                </button>
                <button
                  onClick={() => handleNavigation('/expenses')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(249,112,102,0.15)] rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingDown className="w-8 h-8 text-red-400" />
                  <span className="text-sm font-medium text-slate-300">Add Expense</span>
                </button>
                <button
                  onClick={() => handleNavigation('/bills')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <CreditCard className="w-8 h-8 text-purple-400" />
                  <span className="text-sm font-medium text-slate-300">Add Bill</span>
                </button>
                <button
                  onClick={() => handleNavigation('/assets')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Building2 className="w-8 h-8 text-amber-400" />
                  <span className="text-sm font-medium text-slate-300">Add Asset</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-3">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-400">Database:</span>
                  <span className="ml-2 text-white font-semibold">
                    {dashboardData.backendStatus?.features?.database || 'PostgreSQL 17'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-400">Authentication:</span>
                  <span className="ml-2 text-white font-semibold">
                    {dashboardData.backendStatus?.features?.authentication || 'JWT'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-400">Entities:</span>
                  <span className="ml-2 text-white font-semibold">
                    {dashboardData.backendStatus?.features?.entities?.length || 10} Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Data-rich Dashboard */
          <>
            {/* Financial Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Monthly Income"
                value={metrics.monthlyIncome || 0}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                title="Monthly Expenses"
                value={metrics.monthlyExpenses || 0}
                icon={TrendingDown}
                color="coral"
              />
              <MetricCard
                title="Net Worth"
                value={metrics.netWorth || 0}
                icon={PiggyBank}
                color="cyan"
              />
              <MetricCard
                title="Savings Rate"
                value={metrics.savingsRate != null ? `${metrics.savingsRate}%` : '$0'}
                icon={DollarSign}
                color={metrics.savingsRate >= 0 ? "green" : "amber"}
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Debt"
                value={metrics.totalDebt || 0}
                icon={CreditCard}
                color="coral"
              />
              <MetricCard
                title="Total Assets"
                value={metrics.totalAssets || 0}
                icon={Building2}
                color="purple"
              />
              <MetricCard
                title="Credit Utilization"
                value={metrics.creditUtilization != null ? `${metrics.creditUtilization}%` : '0%'}
                icon={BarChart3}
                color={metrics.creditUtilization > 30 ? "amber" : "green"}
              />
            </div>

            {/* System Status */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-3">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-400">Database:</span>
                  <span className="ml-2 text-white font-semibold">
                    {dashboardData.backendStatus?.features?.database || 'PostgreSQL 17'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-400">Authentication:</span>
                  <span className="ml-2 text-white font-semibold">
                    {dashboardData.backendStatus?.features?.authentication || 'JWT'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-400">Entities:</span>
                  <span className="ml-2 text-white font-semibold">
                    {dashboardData.backendStatus?.features?.entities?.length || 10} Available
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {monthlyTrendData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card glass-card-hover p-8">
                  <h3 className="font-semibold text-white mb-6 text-lg">Monthly Financial Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,255,0.06)" />
                      <XAxis dataKey="month" stroke="#334155" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis stroke="#334155" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip contentStyle={darkTooltipStyle} />
                      <Legend wrapperStyle={{color: '#94a3b8'}} />
                      <Line type="monotone" dataKey="income" stroke="#00d4ff" strokeWidth={3} name="Income" dot={{fill: '#00d4ff', r: 4}} />
                      <Line type="monotone" dataKey="expenses" stroke="#f97066" strokeWidth={3} name="Expenses" dot={{fill: '#f97066', r: 4}} />
                      <Line type="monotone" dataKey="savings" stroke="#a855f7" strokeWidth={3} name="Savings" dot={{fill: '#a855f7', r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {expenseBreakdownData.length > 0 && (
                  <div className="glass-card glass-card-hover p-8">
                    <h3 className="font-semibold text-white mb-6 text-lg">Expense Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expenseBreakdownData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          stroke="rgba(30, 41, 59, 0.8)"
                          strokeWidth={2}
                        >
                          {expenseBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`$${value}`, 'Amount']}
                          contentStyle={darkTooltipStyle}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Asset Allocation Chart */}
            {assetAllocationData.length > 0 && (
              <div className="glass-card glass-card-hover p-8">
                <h3 className="font-semibold text-white mb-6 text-lg">Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetAllocationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,255,0.06)" />
                    <XAxis dataKey="name" stroke="#334155" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis stroke="#334155" tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                      contentStyle={darkTooltipStyle}
                    />
                    <Bar dataKey="value" fill="#00d4ff" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Quick Actions */}
            <div className="glass-card glass-card-hover p-8">
              <h3 className="font-semibold text-white mb-6 text-lg">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <button
                  onClick={() => handleNavigation('/income')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-cyan-500/30 hover:shadow-glow-cyan rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Add Income</span>
                </button>
                <button
                  onClick={() => handleNavigation('/expenses')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(249,112,102,0.15)] rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingDown className="w-8 h-8 text-red-400" />
                  <span className="text-sm font-medium text-slate-300">Add Expense</span>
                </button>
                <button
                  onClick={() => handleNavigation('/bills')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <CreditCard className="w-8 h-8 text-purple-400" />
                  <span className="text-sm font-medium text-slate-300">Pay Bill</span>
                </button>
                <button
                  onClick={() => handleNavigation('/budget')}
                  className="flex flex-col items-center gap-3 p-6 glass-card hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.15)] rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <PiggyBank className="w-8 h-8 text-amber-400" />
                  <span className="text-sm font-medium text-slate-300">View Budget</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard

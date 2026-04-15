import React, { useState, useEffect } from 'react'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon,
  Search, Plus, Eye, EyeOff, Star, StarOff, Target, Calendar,
  Activity, BarChart3, Wallet, Award, AlertTriangle, Info
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const StockTracker = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('portfolio')
  const [portfolioData, setPortfolioData] = useState([])
  const [watchlistData, setWatchlistData] = useState([])
  const [portfolioAnalytics, setPortfolioAnalytics] = useState({
    totalValue: 0,
    totalCost: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    stockCount: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y')
  const [showValues, setShowValues] = useState(true)

  const performanceData = []
  const sectorData = []

  const COLORS = ['#00d4ff', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

  useEffect(() => {
    // Load from API when available
    const loadData = async () => {
      try {
        const response = await apiClient.getStocks?.()
        if (response?.success && response.data?.length > 0) {
          setPortfolioData(response.data)
          const totalValue = response.data.reduce((sum, stock) => sum + (stock.marketValue || 0), 0)
          const totalCost = response.data.reduce((sum, stock) => sum + ((stock.shares || 0) * (stock.avgCost || 0)), 0)
          const totalReturn = totalValue - totalCost
          const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0
          const dayChange = response.data.reduce((sum, stock) => sum + ((stock.shares || 0) * (stock.dayChange || 0)), 0)
          const dayChangePercent = (totalValue - dayChange) > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0
          setPortfolioAnalytics({ totalValue, totalCost, totalReturn, totalReturnPercent, dayChange, dayChangePercent, stockCount: response.data.length })
        } else {
          setPortfolioAnalytics({ totalValue: 0, totalCost: 0, totalReturn: 0, totalReturnPercent: 0, dayChange: 0, dayChangePercent: 0, stockCount: 0 })
        }
      } catch (e) {
        console.error('Error loading stocks:', e)
        setPortfolioAnalytics({ totalValue: 0, totalCost: 0, totalReturn: 0, totalReturnPercent: 0, dayChange: 0, dayChangePercent: 0, stockCount: 0 })
      }
    }
    loadData()
  }, [])

  const tabs = [
    { id: 'portfolio', name: 'Portfolio', icon: Wallet },
    { id: 'watchlist', name: 'Watchlist', icon: Eye },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'research', name: 'Research', icon: Search }
  ]

  const timeframes = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y']

  const formatCurrency = (value) => {
    if (!showValues) return '••••••'
    if (value === undefined || value === null || isNaN(value)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00%'
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const renderPortfolioTab = () => (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                Total Value
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                {formatCurrency(portfolioAnalytics.totalValue)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-500/10'}`}>
              <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-400'}`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                Day Change
              </p>
              <p className={`text-2xl font-bold ${portfolioAnalytics.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {showValues ? formatCurrency(portfolioAnalytics.dayChange) : '••••••'}
              </p>
              <p className={`text-sm ${portfolioAnalytics.dayChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(portfolioAnalytics.dayChangePercent)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${portfolioAnalytics.dayChange >= 0 ? (isDarkMode ? 'bg-green-900/30' : 'bg-green-500/10') : (isDarkMode ? 'bg-red-900/30' : 'bg-red-500/10')}`}>
              {portfolioAnalytics.dayChange >= 0 ? 
                <TrendingUp className="w-6 h-6 text-green-500" /> : 
                <TrendingDown className="w-6 h-6 text-red-500" />
              }
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                Total Return
              </p>
              <p className={`text-2xl font-bold ${portfolioAnalytics.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {showValues ? formatCurrency(portfolioAnalytics.totalReturn) : '••••••'}
              </p>
              <p className={`text-sm ${portfolioAnalytics.totalReturnPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(portfolioAnalytics.totalReturnPercent)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
              <Award className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-400'}`} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                Holdings
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                {portfolioAnalytics.stockCount}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                Stocks
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-100'}`}>
              <PieIcon className={`w-6 h-6 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Holdings Table */}
      <div className={`rounded-xl glass-card border shadow-sm overflow-hidden`}>
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
              Portfolio Holdings
            </h3>
            <button
              onClick={() => setShowValues(!showValues)}
              className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/10'} transition-colors`}
            >
              {showValues ? 
                <Eye className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} /> : 
                <EyeOff className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
              }
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Stock
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Shares
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Avg Cost
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Current Price
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Market Value
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Day Change
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} uppercase tracking-wider`}>
                  Total Return
                </th>
              </tr>
            </thead>
            <tbody className={`bg-slate-800 divide-y divide-slate-700`}>
              {portfolioData.map((stock) => (
                <tr key={stock.id} className={`${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>
                        {stock.symbol}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                        {stock.name}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-white'}`}>
                    {stock.shares}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-white'}`}>
                    {formatCurrency(stock.avgCost)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-white'}`}>
                    {formatCurrency(stock.currentPrice)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {formatCurrency(stock.marketValue)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                    <div className={`flex items-center ${stock.dayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {stock.dayChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      <span>{formatPercent(stock.dayChangePercent)}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                    <div className={stock.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}>
                      <div className="font-medium">{showValues ? formatCurrency(stock.totalReturn) : '••••••'}</div>
                      <div className="text-xs">{formatPercent(stock.totalReturnPercent)}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderWatchlistTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
          Watchlist
        </h3>
        <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2`}>
          <Plus className="w-4 h-4" />
          Add Stock
        </button>
      </div>

      <div className="grid gap-4">
        {watchlistData.map((stock, index) => (
          <div key={index} className={`p-6 rounded-xl glass-card border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {stock.symbol}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                    {stock.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {formatCurrency(stock.price)}
                  </p>
                  <div className={`flex items-center ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    <span>{formatPercent(stock.changePercent)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/10'} transition-colors`}>
                  <Star className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Buy
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Volume</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>{stock.volume}</p>
              </div>
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Market Cap</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>{stock.marketCap}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
          Portfolio Analytics
        </h3>
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-blue-600 text-white'
                  : isDarkMode 
                    ? 'bg-slate-700 text-gray-300 hover:bg-white/10' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Performance Chart */}
      <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
        <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
          Portfolio vs S&P 500
        </h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="month" 
                stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
              />
              <YAxis 
                stroke={isDarkMode ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#FFFFFF' : '#000000'
                }}
                formatter={(value) => [formatCurrency(value), '']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="portfolio"
                stackId="1"
                stroke="#00d4ff"
                fill="#00d4ff"
                fillOpacity={0.3}
                name="Your Portfolio"
              />
              <Area
                type="monotone"
                dataKey="benchmark"
                stackId="2"
                stroke="#6B7280"
                fill="#6B7280"
                fillOpacity={0.2}
                name="S&P 500"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Sector Allocation
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent}%`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#FFFFFF' : '#000000'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Performance Metrics
          </h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Sharpe Ratio</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>1.42</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Beta</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>1.18</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Volatility</span>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>18.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Max Drawdown</span>
              <span className={`font-medium text-red-500`}>-12.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>Alpha</span>
              <span className={`font-medium text-green-500`}>+2.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderResearchTab = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'bg-slate-700 border-white/10 text-white placeholder-gray-400' 
                : 'bg-slate-700 border-slate-600 text-cyan-100 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Market Movers
          </h4>
          <div className="space-y-3">
            {[
              { symbol: 'NVDA', change: 5.2, reason: 'Earnings beat' },
              { symbol: 'TSLA', change: -3.8, reason: 'Production concerns' },
              { symbol: 'AAPL', change: 2.1, reason: 'New product launch' },
              { symbol: 'AMZN', change: 1.9, reason: 'Cloud growth' }
            ].map((stock, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-opacity-50 hover:bg-opacity-75 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    {stock.symbol}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
                    {stock.reason}
                  </span>
                </div>
                <div className={`flex items-center ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span className="font-medium">{formatPercent(stock.change)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-xl glass-card border shadow-sm`}>
          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
            Market News
          </h4>
          <div className="space-y-4">
            {[
              {
                title: 'Tech Stocks Rally on AI Optimism',
                time: '2 hours ago',
                source: 'Financial Times'
              },
              {
                title: 'Fed Signals Potential Rate Cuts',
                time: '4 hours ago',
                source: 'Reuters'
              },
              {
                title: 'Q3 Earnings Season Preview',
                time: '6 hours ago',
                source: 'Bloomberg'
              }
            ].map((news, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}>
                <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-white'} mb-1`}>
                  {news.title}
                </h5>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-400'} flex items-center gap-2`}>
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-2`}>
            Stock Investment Tracker
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-400'}`}>
            Monitor your portfolio performance and discover investment opportunities
          </p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="portfolio">
            {renderPortfolioTab()}
          </TabsContent>
          
          <TabsContent value="watchlist">
            {renderWatchlistTab()}
          </TabsContent>
          
          <TabsContent value="analytics">
            {renderAnalyticsTab()}
          </TabsContent>
          
          <TabsContent value="research">
            {renderResearchTab()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default StockTracker
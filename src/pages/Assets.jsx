import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Plus, 
  TrendingUp, 
  Home,
  Car,
  PiggyBank,
  Landmark,
  Trophy,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Percent,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const Assets = () => {
  const [assetData, setAssetData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    purchase_price: '',
    purchase_date: '',
    category: 'investment',
    description: '',
    location: '',
    appreciation_rate: ''
  })

  const assetCategories = [
    { value: 'real_estate', label: 'Real Estate', icon: Home, color: 'emerald' },
    { value: 'vehicle', label: 'Vehicles', icon: Car, color: 'blue' },
    { value: 'investment', label: 'Investments', icon: TrendingUp, color: 'purple' },
    { value: 'savings', label: 'Savings', icon: PiggyBank, color: 'green' },
    { value: 'retirement', label: 'Retirement', icon: Landmark, color: 'indigo' },
    { value: 'other', label: 'Other', icon: Trophy, color: 'slate' }
  ]

  useEffect(() => {
    loadAssetData()
  }, [])

  const loadAssetData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAssets()
      if (response.success) {
        setAssetData(response.data)
        setError(null)
      } else {
        setError('Failed to load asset data')
      }
    } catch (err) {
      console.error('Error loading asset data:', err)
      setError('Failed to connect to backend. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAsset = async (e) => {
    e.preventDefault()
    try {
      const assetDataToSend = {
        ...formData,
        value: parseFloat(formData.value),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        purchase_date: formData.purchase_date || undefined,
        appreciation_rate: formData.appreciation_rate ? parseFloat(formData.appreciation_rate) : undefined
      }
      
      const response = await apiClient.createAsset(assetDataToSend)
      if (response.success) {
        await loadAssetData()
        setFormData({
          name: '',
          value: '',
          purchase_price: '',
          purchase_date: '',
          category: 'investment',
          description: '',
          location: '',
          appreciation_rate: ''
        })
        setShowAddForm(false)
        setError(null)
      } else {
        setError('Failed to add asset record')
      }
    } catch (err) {
      console.error('Error adding asset:', err)
      setError('Failed to add asset record')
    }
  }

  const getAssetCategoryInfo = (category) => {
    return assetCategories.find(cat => cat.value === category) || assetCategories[0]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateTotalValue = () => {
    return assetData.reduce((total, asset) => total + asset.value, 0)
  }

  const calculateTotalAppreciation = () => {
    return assetData.reduce((total, asset) => {
      return total + (asset.appreciation_amount || 0)
    }, 0)
  }

  const calculateAppreciationPercent = () => {
    const totalPurchasePrice = assetData.reduce((total, asset) => {
      return total + (asset.purchase_price || 0)
    }, 0)
    
    if (totalPurchasePrice === 0) return 0
    
    const totalCurrentValue = calculateTotalValue()
    return ((totalCurrentValue - totalPurchasePrice) / totalPurchasePrice) * 100
  }

  // Chart data
  const getAssetsByCategory = () => {
    const categoryTotals = {}
    
    assetData.forEach(asset => {
      const category = asset.category
      if (categoryTotals[category]) {
        categoryTotals[category] += parseFloat(asset.value)
      } else {
        categoryTotals[category] = parseFloat(asset.value)
      }
    })

    return Object.keys(categoryTotals).map(category => {
      const categoryInfo = getAssetCategoryInfo(category)
      return {
        name: categoryInfo.label,
        value: categoryTotals[category],
        color: categoryInfo.color === 'emerald' ? '#10b981' :
               categoryInfo.color === 'blue' ? '#3b82f6' :
               categoryInfo.color === 'purple' ? '#8b5cf6' :
               categoryInfo.color === 'green' ? '#22c55e' :
               categoryInfo.color === 'indigo' ? '#6366f1' : '#64748b'
      }
    })
  }

  const getAppreciationData = () => {
    return assetData.filter(asset => asset.purchase_price).map(asset => ({
      name: asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name,
      appreciation: parseFloat(((asset.value - asset.purchase_price) / asset.purchase_price * 100).toFixed(1)),
      value: parseFloat(asset.value)
    })).sort((a, b) => b.appreciation - a.appreciation)
  }

  const getValueTrend = () => {
    // Mock trend data - in real app this would come from historical data
    const currentTotal = calculateTotalValue()
    return [
      { month: '6 months ago', value: currentTotal * 0.85 },
      { month: '5 months ago', value: currentTotal * 0.88 },
      { month: '4 months ago', value: currentTotal * 0.92 },
      { month: '3 months ago', value: currentTotal * 0.95 },
      { month: '2 months ago', value: currentTotal * 0.98 },
      { month: 'Last month', value: currentTotal * 0.99 },
      { month: 'Current', value: currentTotal }
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading asset data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-cyan-100">Asset Portfolio</h1>
          <p className="text-slate-600 dark:text-cyan-300 mt-1">Track and manage your valuable assets</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-colors">
              <Plus className="w-5 h-5" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Add a new asset to track its value and performance.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Primary Residence, Tesla Model 3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assetCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Current Value</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="250000.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_price">Purchase Price (Optional)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                    placeholder="200000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="purchase_date">Purchase Date (Optional)</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <Label htmlFor="appreciation_rate">Expected Appreciation Rate % (Optional)</Label>
                <Input
                  id="appreciation_rate"
                  type="number"
                  step="0.01"
                  value={formData.appreciation_rate}
                  onChange={(e) => setFormData({...formData, appreciation_rate: e.target.value})}
                  placeholder="5.0"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details about this asset..."
                  rows={3}
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Add Asset
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card-purple">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Value</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(calculateTotalValue())}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="metric-card-emerald">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Total Appreciation</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(calculateTotalAppreciation())}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              {calculateTotalAppreciation() >= 0 ? (
                <ArrowUp className="w-6 h-6 text-emerald-600" />
              ) : (
                <ArrowDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="metric-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Appreciation %</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {calculateAppreciationPercent().toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="metric-card-slate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Assets</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{assetData.length}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {assetData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assets by Category Chart */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Assets by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getAssetsByCategory()}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getAssetsByCategory().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Appreciation Performance Chart */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Appreciation Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getAppreciationData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Appreciation']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="appreciation" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Value Trend Chart */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Portfolio Value Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={getValueTrend()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg border border-slate-200 dark:border-gray-700/50">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-5 h-5 text-slate-400 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-cyan-100 placeholder-slate-500 dark:placeholder-gray-400"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-cyan-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Asset Table */}
      <div className="bg-white dark:bg-gray-800/80 rounded-xl shadow-md border border-slate-200 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-slate-200 dark:border-gray-700/50">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-cyan-100">Asset Portfolio</h2>
          <p className="text-slate-600 dark:text-cyan-300 text-sm mt-1">Comprehensive asset tracking with appreciation analysis and subtotals</p>
        </div>

        {assetData.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-slate-300 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-cyan-100 mb-2">No Assets Found</h3>
            <p className="text-slate-600 dark:text-cyan-300">Add your first asset to get started with portfolio tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700/50 border-b border-slate-200 dark:border-gray-600/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-cyan-100">Asset Name</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-cyan-100">Category</th>
                  <th className="text-right p-4 font-semibold text-slate-900 dark:text-cyan-100">Current Value</th>
                  <th className="text-right p-4 font-semibold text-slate-900 dark:text-cyan-100">Purchase Price</th>
                  <th className="text-right p-4 font-semibold text-slate-900 dark:text-cyan-100">Appreciation</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-cyan-100">Purchase Date</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-cyan-100">Location</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-cyan-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assetData.map((asset) => {
                  const categoryInfo = getAssetCategoryInfo(asset.category)
                  const CategoryIcon = categoryInfo.icon
                  const appreciationAmount = asset.appreciation_amount || (asset.purchase_price ? (asset.value - asset.purchase_price) : 0)
                  const appreciationPercent = asset.appreciation_percent || (asset.purchase_price && asset.purchase_price > 0 ? ((asset.value - asset.purchase_price) / asset.purchase_price) * 100 : 0)
                  
                  return (
                    <tr key={asset.id} className="border-b border-slate-100 dark:border-gray-700/30 hover:bg-slate-50 dark:hover:bg-gray-700/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 rounded-lg`}>
                            <CategoryIcon className={`w-5 h-5 text-${categoryInfo.color}-600 dark:text-${categoryInfo.color}-400`} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-cyan-100">{asset.name}</div>
                            {asset.description && (
                              <div className="text-sm text-slate-600 dark:text-cyan-300 truncate max-w-[200px]">
                                {asset.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full bg-${categoryInfo.color}-100 dark:bg-${categoryInfo.color}-900/30 text-${categoryInfo.color}-700 dark:text-${categoryInfo.color}-300`}>
                          {categoryInfo.label}
                        </span>
                      </td>
                      
                      <td className="p-4 text-right">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(asset.value)}
                        </div>
                        {asset.annual_appreciation !== null && asset.annual_appreciation !== 0 && (
                          <div className={`text-sm ${asset.annual_appreciation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {asset.annual_appreciation >= 0 ? '+' : ''}{asset.annual_appreciation.toFixed(1)}% annually
                          </div>
                        )}
                      </td>
                      
                      <td className="p-4 text-right">
                        {asset.purchase_price ? (
                          <div className="font-bold text-slate-600 dark:text-gray-300">
                            {formatCurrency(asset.purchase_price)}
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-sm">No data</span>
                        )}
                      </td>
                      
                      <td className="p-4 text-right">
                        {asset.purchase_price && appreciationAmount !== 0 ? (
                          <div className="flex flex-col items-end">
                            <div className={`font-bold flex items-center gap-1 ${
                              appreciationAmount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {appreciationAmount >= 0 ? (
                                <ArrowUp className="w-4 h-4" />
                              ) : (
                                <ArrowDown className="w-4 h-4" />
                              )}
                              {appreciationAmount >= 0 ? '+' : ''}{formatCurrency(appreciationAmount)}
                            </div>
                            <div className={`text-sm ${
                              appreciationPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {appreciationPercent >= 0 ? '+' : ''}{appreciationPercent.toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-sm">No data</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        {asset.purchase_date ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                            <span className="text-sm text-slate-600 dark:text-cyan-300">
                              {new Date(asset.purchase_date).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-sm">No date</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        {asset.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 dark:text-gray-400" />
                            <span className="text-sm text-slate-600 dark:text-cyan-300 truncate max-w-[120px]">
                              {asset.location}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-sm">No location</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="p-2 text-slate-400 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 h-auto">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <button className="p-2 text-slate-400 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                
                {/* Subtotal Row */}
                <tr className="bg-slate-50 dark:bg-gray-700/50 border-t-2 border-slate-300 dark:border-gray-600 font-semibold">
                  <td colSpan="2" className="p-4 text-right text-slate-900 dark:text-cyan-100">
                    Total Asset Portfolio:
                  </td>
                  <td className="p-4 text-right text-purple-600 dark:text-purple-400 font-bold text-lg">
                    {formatCurrency(calculateTotalValue())}
                  </td>
                  <td className="p-4 text-right text-slate-600 dark:text-gray-300 font-bold">
                    {formatCurrency(assetData.reduce((total, asset) => total + (asset.purchase_price || 0), 0))}
                    <div className="text-sm font-normal text-slate-500 dark:text-gray-400">total cost</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className={`font-bold flex items-center justify-end gap-1 ${
                      calculateTotalAppreciation() >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateTotalAppreciation() >= 0 ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                      {formatCurrency(calculateTotalAppreciation())}
                    </div>
                    <div className={`text-sm ${
                      calculateAppreciationPercent() >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateAppreciationPercent() >= 0 ? '+' : ''}{calculateAppreciationPercent().toFixed(1)}%
                    </div>
                  </td>
                  <td colSpan="3" className="p-4 text-slate-600 dark:text-cyan-300 text-sm">
                    {assetData.length} {assetData.length === 1 ? 'asset' : 'assets'} in portfolio
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>


      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Assets
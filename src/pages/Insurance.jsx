import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { 
  Shield,
  Car,
  Home,
  Heart,
  Users,
  Briefcase,
  Plane,
  Building,
  Umbrella,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  Phone,
  Mail
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const Insurance = () => {
  const [policies, setPolicies] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [expiringPolicies, setExpiringPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [newPolicy, setNewPolicy] = useState({
    type: 'auto',
    name: '',
    provider: '',
    policy_number: '',
    coverage_amount: '',
    deductible: '',
    premium_amount: '',
    premium_frequency: 'monthly',
    effective_date: '',
    expiration_date: '',
    status: 'active'
  })

  const policyTypes = [
    { value: 'all', label: 'All Policies', icon: Shield },
    { value: 'auto', label: 'Auto Insurance', icon: Car },
    { value: 'home', label: 'Home Insurance', icon: Home },
    { value: 'health', label: 'Health Insurance', icon: Heart },
    { value: 'life', label: 'Life Insurance', icon: Users },
    { value: 'work_benefits', label: 'Work Benefits', icon: Briefcase },
    { value: 'travel', label: 'Travel Insurance', icon: Plane },
    { value: 'renters', label: 'Renters Insurance', icon: Building },
    { value: 'umbrella', label: 'Umbrella Policy', icon: Umbrella }
  ]

  useEffect(() => {
    loadInsuranceData()
  }, [selectedType])

  const loadInsuranceData = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = selectedType !== 'all' ? { type: selectedType } : {}
      
      // Load policies safely
      try {
        const policiesResponse = await apiClient.getInsurancePolicies(params)
        if (policiesResponse && policiesResponse.success) {
          setPolicies(policiesResponse.data || [])
        } else {
          setPolicies([])
        }
      } catch (policyError) {
        console.error('Error loading policies:', policyError)
        setPolicies([])
      }
      
      // Load analytics safely
      try {
        const analyticsResponse = await apiClient.getInsuranceAnalytics()
        if (analyticsResponse && analyticsResponse.success) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (analyticsError) {
        console.error('Error loading analytics:', analyticsError)
      }
      
      // Load expiring policies
      try {
        const expiringResponse = await apiClient.getExpiringPolicies(30)
        if (expiringResponse && expiringResponse.success) {
          setExpiringPolicies(expiringResponse.data || [])
        }
      } catch (expiringError) {
        console.error('Error loading expiring policies:', expiringError)
      }
      
    } catch (err) {
      console.error('Error loading insurance data:', err)
      setError('Failed to load insurance data. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPolicy = async (e) => {
    e.preventDefault()
    try {
      const policyData = {
        ...newPolicy,
        coverage_amount: newPolicy.coverage_amount ? parseFloat(newPolicy.coverage_amount) : null,
        deductible: newPolicy.deductible ? parseFloat(newPolicy.deductible) : null,
        premium_amount: parseFloat(newPolicy.premium_amount) || 0
      }

      const response = await apiClient.createInsurancePolicy(policyData)
      if (response.success) {
        await loadInsuranceData()
        setNewPolicy({
          type: 'auto',
          name: '',
          provider: '',
          policy_number: '',
          coverage_amount: '',
          deductible: '',
          premium_amount: '',
          premium_frequency: 'monthly',
          effective_date: '',
          expiration_date: '',
          status: 'active'
        })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Error adding policy:', err)
      setError('Failed to add insurance policy')
    }
  }

  const handleDeletePolicy = async (id) => {
    if (window.confirm('Are you sure you want to delete this insurance policy?')) {
      try {
        const response = await apiClient.deleteInsurancePolicy(id)
        if (response.success) {
          await loadInsuranceData()
        }
      } catch (err) {
        console.error('Error deleting policy:', err)
        setError('Failed to delete insurance policy')
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTypeIcon = (type) => {
    const typeConfig = policyTypes.find(t => t.value === type)
    const Icon = typeConfig?.icon || Shield
    return <Icon className="w-4 h-4" />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-600 bg-emerald-100'
      case 'expired': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-slate-600 dark:text-slate-300 bg-slate-100'
    }
  }

  const getExpirationStatusColor = (days) => {
    if (days < 0) return 'text-red-600 bg-red-100'
    if (days <= 30) return 'text-orange-600 bg-orange-100'
    if (days <= 90) return 'text-yellow-600 bg-yellow-100'
    return 'text-emerald-600 bg-emerald-100'
  }

  const getExpirationStatus = (days) => {
    if (days < 0) return 'Expired'
    if (days <= 30) return 'Expiring Soon'
    if (days <= 90) return 'Renewal Due'
    return 'Current'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">Loading insurance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">Insurance Policies</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">Comprehensive coverage management and policy tracking with expiration alerts</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105">
              <Plus className="w-5 h-5" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Insurance Policy</DialogTitle>
              <DialogDescription>
                Add a new insurance policy to track coverage and renewals.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddPolicy} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={newPolicy.type} onValueChange={(value) => setNewPolicy({...newPolicy, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {policyTypes.slice(1).map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                    placeholder="Honda Civic Auto Insurance"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={newPolicy.provider}
                    onChange={(e) => setNewPolicy({...newPolicy, provider: e.target.value})}
                    placeholder="State Farm, Geico"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input
                    id="policy_number"
                    value={newPolicy.policy_number}
                    onChange={(e) => setNewPolicy({...newPolicy, policy_number: e.target.value})}
                    placeholder="Policy number"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coverage_amount">Coverage Amount</Label>
                  <Input
                    id="coverage_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPolicy.coverage_amount}
                    onChange={(e) => setNewPolicy({...newPolicy, coverage_amount: e.target.value})}
                    placeholder="100000.00"
                  />
                </div>
                <div>
                  <Label htmlFor="deductible">Deductible</Label>
                  <Input
                    id="deductible"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPolicy.deductible}
                    onChange={(e) => setNewPolicy({...newPolicy, deductible: e.target.value})}
                    placeholder="1000.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="premium_amount">Premium Amount</Label>
                  <Input
                    id="premium_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPolicy.premium_amount}
                    onChange={(e) => setNewPolicy({...newPolicy, premium_amount: e.target.value})}
                    placeholder="150.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="premium_frequency">Premium Frequency</Label>
                  <Select value={newPolicy.premium_frequency} onValueChange={(value) => setNewPolicy({...newPolicy, premium_frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effective_date">Effective Date</Label>
                  <Input
                    id="effective_date"
                    type="date"
                    value={newPolicy.effective_date}
                    onChange={(e) => setNewPolicy({...newPolicy, effective_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="expiration_date">Expiration Date</Label>
                  <Input
                    id="expiration_date"
                    type="date"
                    value={newPolicy.expiration_date}
                    onChange={(e) => setNewPolicy({...newPolicy, expiration_date: e.target.value})}
                    required
                  />
                </div>
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
                  className="flex-1"
                >
                  Add Policy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadInsuranceData}
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Policies</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.summary?.total_policies || 0}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Active coverage</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-green-200/50 dark:border-green-700/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Total Coverage</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(analytics.summary?.total_coverage || 0)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Protection amount</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/50 dark:border-orange-700/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Annual Premiums</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(analytics.summary?.total_annual_premiums || 0)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Total yearly cost</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/50 dark:border-red-700/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Expiring Soon</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.summary?.expiring_soon || 0}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Next 30 days</p>
          </div>
        </div>
      )}

      {/* Expiring Policies Alert */}
      {expiringPolicies.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 backdrop-blur-sm border border-orange-200/50 dark:border-orange-700/50 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Policies Expiring Soon</h3>
          </div>
          <div className="space-y-3">
            {expiringPolicies.slice(0, 3).map((policy) => (
              <div key={policy.id} className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-lg shadow-md border border-slate-200/50 dark:border-slate-700/50 p-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(policy.type)}
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{policy.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">{policy.provider}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-600">
                    Expires {formatDate(policy.expiration_date)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {policy.days_until_expiration} days remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg p-1 overflow-x-auto border border-slate-200/50 dark:border-slate-700/50">
        {policyTypes.map((type) => {
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

      {/* Policies Table */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {selectedType === 'all' ? 'All Insurance Policies' : policyTypes.find(t => t.value === selectedType)?.label}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Policy details, coverage, and renewal information</p>
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Insurance Policies Found</h3>
            <p className="text-slate-600 dark:text-slate-300">Add your first insurance policy to get started with coverage tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 dark:bg-slate-700/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Policy</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Provider</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Coverage</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Premium</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Expiration</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-slate-100/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(policy.type)}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{policy.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-300 capitalize">{policy.type.replace('_', ' ')}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">#{policy.policy_number}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="font-medium text-slate-900 dark:text-white">{policy.provider}</div>
                      {policy.agent_name && (
                        <div className="text-sm text-slate-600 dark:text-slate-300">Agent: {policy.agent_name}</div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-bold text-green-600">{formatCurrency(policy.coverage_amount)}</div>
                      {policy.deductible && (
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          Deductible: {formatCurrency(policy.deductible)}
                        </div>
                      )}
                      {policy.coverage_type && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">{policy.coverage_type}</div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{formatCurrency(policy.premium_amount)}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 capitalize">{policy.premium_frequency}</div>
                      {policy.annual_premium && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {formatCurrency(policy.annual_premium)}/year
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{formatDate(policy.expiration_date)}</div>
                      {policy.days_until_expiration !== undefined && (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getExpirationStatusColor(policy.days_until_expiration)}`}>
                          {getExpirationStatus(policy.days_until_expiration)}
                        </span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
                        {policy.status}
                      </span>
                      {policy.auto_renew && (
                        <div className="text-xs text-green-600 mt-1">Auto-renew</div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <button 
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default Insurance
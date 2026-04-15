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
      case 'active': return 'text-cyan-400 bg-cyan-500/10'
      case 'expired': return 'text-red-400 bg-red-500/10'
      case 'cancelled': return 'text-slate-400 bg-white/10'
      case 'pending': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-slate-400 bg-white/10'
    }
  }

  const getExpirationStatusColor = (days) => {
    if (days < 0) return 'text-red-400 bg-red-500/10'
    if (days <= 30) return 'text-orange-400 bg-orange-500/10'
    if (days <= 90) return 'text-yellow-400 bg-yellow-500/10'
    return 'text-cyan-400 bg-cyan-500/10'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading insurance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">Insurance Policies</h1>
          <p className="text-slate-400 text-lg">Comprehensive coverage management and policy tracking with expiration alerts</p>
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
        <div className="glass-card border-t-2 border-t-red-400 p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadInsuranceData}
            className="mt-2 px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-blue-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-400">Total Policies</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.summary?.total_policies || 0}</p>
            <p className="text-sm text-slate-400 mt-1">Active coverage</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-green-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-400">Total Coverage</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(analytics.summary?.total_coverage || 0)}</p>
            <p className="text-sm text-slate-400 mt-1">Protection amount</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-amber-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <TrendingUp className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-400">Annual Premiums</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(analytics.summary?.total_annual_premiums || 0)}</p>
            <p className="text-sm text-slate-400 mt-1">Total yearly cost</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-red-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-400">Expiring Soon</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.summary?.expiring_soon || 0}</p>
            <p className="text-sm text-slate-400 mt-1">Next 30 days</p>
          </div>
        </div>
      )}

      {/* Expiring Policies Alert */}
      {expiringPolicies.length > 0 && (
        <div className="glass-card border-t-2 border-t-amber-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-400" />
            <h3 className="text-lg font-semibold text-orange-200">Policies Expiring Soon</h3>
          </div>
          <div className="space-y-3">
            {expiringPolicies.slice(0, 3).map((policy) => (
              <div key={policy.id} className="flex items-center justify-between glass-card backdrop-blur-lg rounded-lg shadow-md border border-white/10 p-3">
                <div className="flex items-center gap-3">
                  {getTypeIcon(policy.type)}
                  <div>
                    <div className="font-medium text-white">{policy.name}</div>
                    <div className="text-sm text-slate-400">{policy.provider}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-400">
                    Expires {formatDate(policy.expiration_date)}
                  </div>
                  <div className="text-sm text-slate-400">
                    {policy.days_until_expiration} days remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1 overflow-x-auto">
        {policyTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedType === type.value
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Policies Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {selectedType === 'all' ? 'All Insurance Policies' : policyTypes.find(t => t.value === selectedType)?.label}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Policy details, coverage, and renewal information</p>
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Insurance Policies Found</h3>
            <p className="text-slate-400">Add your first insurance policy to get started with coverage tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgba(35,52,78,0.5)] backdrop-blur-sm border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-semibold text-white">Policy</th>
                  <th className="text-left p-4 font-semibold text-white">Provider</th>
                  <th className="text-left p-4 font-semibold text-white">Coverage</th>
                  <th className="text-left p-4 font-semibold text-white">Premium</th>
                  <th className="text-left p-4 font-semibold text-white">Expiration</th>
                  <th className="text-left p-4 font-semibold text-white">Status</th>
                  <th className="text-left p-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(policy.type)}
                        <div>
                          <div className="font-semibold text-white">{policy.name}</div>
                          <div className="text-sm text-slate-400 capitalize">{policy.type.replace('_', ' ')}</div>
                          <div className="text-xs text-slate-400">#{policy.policy_number}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="font-medium text-white">{policy.provider}</div>
                      {policy.agent_name && (
                        <div className="text-sm text-slate-400">Agent: {policy.agent_name}</div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-bold text-green-400">{formatCurrency(policy.coverage_amount)}</div>
                      {policy.deductible && (
                        <div className="text-sm text-slate-400">
                          Deductible: {formatCurrency(policy.deductible)}
                        </div>
                      )}
                      {policy.coverage_type && (
                        <div className="text-xs text-slate-400">{policy.coverage_type}</div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-semibold text-white">{formatCurrency(policy.premium_amount)}</div>
                      <div className="text-sm text-slate-400 capitalize">{policy.premium_frequency}</div>
                      {policy.annual_premium && (
                        <div className="text-xs text-slate-400">
                          {formatCurrency(policy.annual_premium)}/year
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="font-semibold text-white">{formatDate(policy.expiration_date)}</div>
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
                        <div className="text-xs text-green-400 mt-1">Auto-renew</div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <button 
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
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
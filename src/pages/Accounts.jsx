import React, { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import {
  Key,
  Globe,
  User,
  Shield,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  CreditCard,
  Phone,
  Heart,
  ShoppingCart,
  Users,
  Briefcase,
  HelpCircle
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const Accounts = () => {
  const [accounts, setAccounts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [passwordHealth, setPasswordHealth] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [visiblePasswords, setVisiblePasswords] = useState({})
  const [newAccount, setNewAccount] = useState({
    purpose: '',
    account_name: '',
    url: '',
    login_name: '',
    password: '',
    category: 'financial',
    notes: '',
    status: 'active',
    password_reminder: ''
  })

  const categories = [
    { value: 'all', label: 'All Accounts', icon: Shield },
    { value: 'financial', label: 'Financial', icon: CreditCard },
    { value: 'utility', label: 'Utilities', icon: Building },
    { value: 'subscription', label: 'Subscriptions', icon: Globe },
    { value: 'government', label: 'Government', icon: Shield },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { value: 'social', label: 'Social Media', icon: Users },
    { value: 'work', label: 'Work', icon: Briefcase },
    { value: 'other', label: 'Other', icon: HelpCircle }
  ]

  useEffect(() => {
    loadAccountsData()
  }, [selectedCategory])

  const loadAccountsData = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {}

      try {
        const accountsResponse = await apiClient.getAccounts(params)
        if (accountsResponse && accountsResponse.success) {
          setAccounts(accountsResponse.data || [])
        } else {
          setAccounts([])
        }
      } catch (accountsError) {
        console.error('Error loading accounts:', accountsError)
        setAccounts([])
      }

      try {
        const analyticsResponse = await apiClient.getAccountsAnalytics()
        if (analyticsResponse && analyticsResponse.success) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (analyticsError) {
        console.error('Error loading analytics:', analyticsError)
      }

      try {
        const healthResponse = await apiClient.getPasswordHealth()
        if (healthResponse && healthResponse.success) {
          setPasswordHealth(healthResponse.data || [])
        }
      } catch (healthError) {
        console.error('Error loading password health:', healthError)
      }

    } catch (err) {
      console.error('Error loading accounts data:', err)
      setError('Failed to load accounts data. Please ensure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.createAccount(newAccount)
      if (response.success) {
        await loadAccountsData()
        setNewAccount({
          purpose: '',
          account_name: '',
          url: '',
          login_name: '',
          password: '',
          category: 'financial',
          notes: '',
          status: 'active',
          password_reminder: ''
        })
        setShowAddForm(false)
      }
    } catch (err) {
      console.error('Error adding account:', err)
      setError('Failed to add account')
    }
  }

  const handleDeleteAccount = async (id) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        const response = await apiClient.deleteAccount(id)
        if (response.success) {
          await loadAccountsData()
        }
      } catch (err) {
        console.error('Error deleting account:', err)
        setError('Failed to delete account')
      }
    }
  }

  const togglePasswordVisibility = async (accountId) => {
    if (visiblePasswords[accountId]) {
      setVisiblePasswords(prev => ({
        ...prev,
        [accountId]: null
      }))
    } else {
      try {
        const response = await apiClient.getAccountPassword(accountId)
        if (response.success) {
          setVisiblePasswords(prev => ({
            ...prev,
            [accountId]: response.password
          }))
        }
      } catch (err) {
        console.error('Error fetching password:', err)
        setError('Failed to fetch password')
      }
    }
  }

  const copyToClipboard = async (text, type = 'text') => {
    try {
      await navigator.clipboard.writeText(text)
      console.log(`${type} copied to clipboard`)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const getCategoryIcon = (category) => {
    const categoryConfig = categories.find(c => c.value === category)
    const Icon = categoryConfig?.icon || HelpCircle
    return <Icon className="w-4 h-4" />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-cyan-400 bg-cyan-500/10'
      case 'inactive': return 'text-slate-400 bg-white/10'
      case 'archived': return 'text-red-400 bg-red-500/10'
      default: return 'text-slate-400 bg-white/10'
    }
  }

  const getPasswordHealthColor = (health) => {
    switch (health) {
      case 'good': return 'text-cyan-400 bg-cyan-500/10'
      case 'warning': return 'text-yellow-400 bg-yellow-500/10'
      case 'urgent': return 'text-red-400 bg-red-500/10'
      default: return 'text-slate-400 bg-white/10'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading accounts data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">Account Management</h1>
          <p className="text-slate-400 text-lg">Secure storage and management of account credentials with advanced security features</p>
        </div>
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105">
              <Plus className="w-5 h-5" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Account Credentials</DialogTitle>
              <DialogDescription>
                Securely store account login information and credentials.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newAccount.category} onValueChange={(value) => setNewAccount({...newAccount, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map(category => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={newAccount.account_name}
                    onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                    placeholder="Chase Checking, Netflix"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={newAccount.purpose}
                  onChange={(e) => setNewAccount({...newAccount, purpose: e.target.value})}
                  placeholder="Primary banking, Streaming service"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={newAccount.url}
                  onChange={(e) => setNewAccount({...newAccount, url: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="login_name">Login Name/Email</Label>
                  <Input
                    id="login_name"
                    value={newAccount.login_name}
                    onChange={(e) => setNewAccount({...newAccount, login_name: e.target.value})}
                    placeholder="username or email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password_reminder">Password Reminder (Optional)</Label>
                <Input
                  id="password_reminder"
                  value={newAccount.password_reminder}
                  onChange={(e) => setNewAccount({...newAccount, password_reminder: e.target.value})}
                  placeholder="Hint to help remember password"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={newAccount.notes}
                  onChange={(e) => setNewAccount({...newAccount, notes: e.target.value})}
                  placeholder="Any additional information"
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
                  className="flex-1"
                >
                  Add Account
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
            onClick={loadAccountsData}
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
              <span className="text-sm font-medium text-blue-400">Total Accounts</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.summary?.total_accounts || 0}</p>
            <p className="text-sm text-slate-400 mt-1">Stored securely</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-green-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm font-medium text-green-400">Active Accounts</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.summary?.active_accounts || 0}</p>
            <p className="text-sm text-slate-400 mt-1">Ready to use</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-amber-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-400">With URLs</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.summary?.accounts_with_urls || 0}</p>
            <p className="text-sm text-slate-400 mt-1">Quick access</p>
          </div>

          <div className="glass-card glass-card-hover p-6 border-t-2 border-t-red-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-400">Need Update</span>
            </div>
            <p className="text-3xl font-bold text-white">{analytics.summary?.passwords_need_update || 0}</p>
            <p className="text-sm text-slate-400 mt-1">Password refresh</p>
          </div>
        </div>
      )}

      {/* Password Health Alert */}
      {passwordHealth.filter(account => account.password_health === 'urgent').length > 0 && (
        <div className="glass-card border-t-2 border-t-red-400 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Urgent Password Updates Required</h3>
          </div>
          <div className="space-y-2">
            {passwordHealth.filter(account => account.password_health === 'urgent').slice(0, 3).map((account) => (
              <div key={account.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(account.category)}
                  <div>
                    <div className="font-medium text-white">{account.account_name}</div>
                    <div className="text-sm text-slate-400">{account.purpose}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-red-400">Last updated {formatDate(account.last_updated_password)}</div>
                  <div className="text-sm text-slate-400">Update recommended</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1 overflow-x-auto">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category.value
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Accounts Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {selectedCategory === 'all' ? 'All Account Credentials' : categories.find(c => c.value === selectedCategory)?.label + ' Accounts'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Secure credential storage with encrypted passwords</p>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Account Credentials Found</h3>
            <p className="text-slate-400">Add your first account to get started with secure credential management.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[rgba(35,52,78,0.5)] border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-semibold text-white">Account</th>
                  <th className="text-left p-4 font-semibold text-white">URL</th>
                  <th className="text-left p-4 font-semibold text-white">Login</th>
                  <th className="text-left p-4 font-semibold text-white">Password</th>
                  <th className="text-left p-4 font-semibold text-white">Status</th>
                  <th className="text-left p-4 font-semibold text-white">Notes</th>
                  <th className="text-left p-4 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(account.category)}
                        <div>
                          <div className="font-semibold text-white">{account.account_name}</div>
                          <div className="text-sm text-slate-400">{account.purpose}</div>
                          <div className="text-xs text-slate-500 capitalize">{account.category.replace('_', ' ')}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {account.url ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={account.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm truncate max-w-[200px]"
                          >
                            {account.url_domain || account.url}
                          </a>
                          <button
                            onClick={() => copyToClipboard(account.url, 'URL')}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">No URL</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{account.login_name}</span>
                        <button
                          onClick={() => copyToClipboard(account.login_name, 'Login')}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-300">
                          {visiblePasswords[account.id] || '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(account.id)}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                        >
                          {visiblePasswords[account.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        {visiblePasswords[account.id] && (
                          <button
                            onClick={() => copyToClipboard(visiblePasswords[account.id], 'Password')}
                            className="p-1 text-slate-400 hover:text-cyan-400"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      {account.last_updated_password && (
                        <div className="text-xs text-slate-500 mt-1">
                          Updated {formatDate(account.last_updated_password)}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(account.status)}`}>
                        {account.status}
                      </span>
                    </td>

                    <td className="p-4">
                      {account.notes ? (
                        <span className="text-sm text-slate-400 truncate max-w-[150px] block">
                          {account.notes}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-sm">No notes</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="p-1 h-auto text-slate-400 hover:text-cyan-400">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
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

export default Accounts
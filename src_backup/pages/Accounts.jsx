import React, { useState, useEffect } from "react";
import { Account } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Key, 
  Plus, 
  Edit, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Copy, 
  Shield, 
  CreditCard,
  Building,
  Landmark,
  Globe,
  Mail,
  Phone,
  User
} from "lucide-react";
import { format } from "date-fns";

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account', color: 'bg-blue-100 text-blue-800', icon: Landmark },
  { value: 'credit_card', label: 'Credit Card', color: 'bg-purple-100 text-purple-800', icon: CreditCard },
  { value: 'investment', label: 'Investment', color: 'bg-green-100 text-green-800', icon: Building },
  { value: 'insurance', label: 'Insurance', color: 'bg-orange-100 text-orange-800', icon: Shield },
  { value: 'utility', label: 'Utility', color: 'bg-yellow-100 text-yellow-800', icon: Globe },
  { value: 'subscription', label: 'Subscription', color: 'bg-pink-100 text-pink-800', icon: Globe },
  { value: 'loan', label: 'Loan', color: 'bg-red-100 text-red-800', icon: Building },
  { value: 'benefits', label: 'Benefits', color: 'bg-indigo-100 text-indigo-800', icon: Shield },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800', icon: Globe }
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'bank',
    website_url: '',
    username: '',
    password: '',
    account_number: '',
    email_address: '',
    phone_number: '',
    notes: '',
    is_active: true,
    last_login: ''
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await Account.list('-created_date');
      setAccounts(data || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await Account.update(editingAccount.id, formData);
      } else {
        await Account.create(formData);
      }

      setIsDialogOpen(false);
      setEditingAccount(null);
      setFormData({
        account_name: '',
        account_type: 'bank',
        website_url: '',
        username: '',
        password: '',
        account_number: '',
        email_address: '',
        phone_number: '',
        notes: '',
        is_active: true,
        last_login: ''
      });
      loadAccounts();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name || '',
      account_type: account.account_type || 'bank',
      website_url: account.website_url || '',
      username: account.username || '',
      password: account.password || '',
      account_number: account.account_number || '',
      email_address: account.email_address || '',
      phone_number: account.phone_number || '',
      notes: account.notes || '',
      is_active: account.is_active !== undefined ? account.is_active : true,
      last_login: account.last_login || ''
    });
    setIsDialogOpen(true);
  };

  const togglePasswordVisibility = (accountId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredAccounts = filter === 'all' 
    ? accounts 
    : accounts.filter(account => account.account_type === filter);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Manager</h1>
          <p className="text-gray-600 mt-1">Securely manage your financial account credentials</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    placeholder="e.g., Chase Bank, Netflix"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_type">Account Type</Label>
                  <Select value={formData.account_type} onValueChange={(value) => setFormData({...formData, account_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Website URL</Label>
                <Input
                  id="website_url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Username or email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    placeholder="Account/Policy number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_address">Email Address</Label>
                  <Input
                    id="email_address"
                    type="email"
                    value={formData.email_address}
                    onChange={(e) => setFormData({...formData, email_address: e.target.value})}
                    placeholder="account@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_login">Last Login</Label>
                  <Input
                    id="last_login"
                    type="date"
                    value={formData.last_login}
                    onChange={(e) => setFormData({...formData, last_login: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Security questions, additional info..."
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active Account</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingAccount ? 'Update' : 'Add'} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Total Accounts</CardTitle>
            <Key className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{accounts.length}</div>
            <p className="text-xs text-indigo-700">
              {accounts.filter(a => a.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Most Common Type</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {accounts.length > 0 ? (
                ACCOUNT_TYPES.find(t => t.value === 
                  Object.entries(
                    accounts.reduce((acc, account) => {
                      acc[account.account_type] = (acc[account.account_type] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort(([,a], [,b]) => b - a)[0]?.[0]
                )?.label || 'N/A'
              ) : 'N/A'}
            </div>
            <p className="text-xs text-green-700">
              Account category
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {Math.round((accounts.filter(a => a.password && a.password.length >= 8).length / Math.max(accounts.length, 1)) * 100)}%
            </div>
            <p className="text-xs text-orange-700">
              Strong passwords
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Accounts
        </Button>
        {ACCOUNT_TYPES.map((type) => (
          <Button
            key={type.value}
            variant={filter === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccounts.map((account) => {
          const accountType = ACCOUNT_TYPES.find(t => t.value === account.account_type);
          const IconComponent = accountType?.icon || Globe;
          
          return (
            <Card key={account.id} className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.account_name}</h3>
                      <Badge className={accountType?.color}>
                        {accountType?.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.website_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(account.website_url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {account.username && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{account.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(account.username)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {account.password && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Password:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {visiblePasswords[account.id] ? account.password : '••••••••'}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => togglePasswordVisibility(account.id)}
                      >
                        {visiblePasswords[account.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(account.password)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {account.account_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Account #:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {account.account_number.length > 8 
                          ? `••••${account.account_number.slice(-4)}`
                          : account.account_number
                        }
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(account.account_number)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {account.email_address && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{account.email_address}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(account.email_address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {account.phone_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{account.phone_number}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(account.phone_number)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {account.last_login && (
                  <div className="text-xs text-gray-500">
                    Last login: {format(new Date(account.last_login), 'MMM d, yyyy')}
                  </div>
                )}

                {account.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {account.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {filteredAccounts.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No accounts found</p>
            <p className="text-sm">Add your first account to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
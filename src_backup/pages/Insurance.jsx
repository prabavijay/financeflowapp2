
import React, { useState, useEffect } from "react";
import { InsurancePolicy } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus, Edit, DollarSign, Calendar, Heart, Car, Home } from "lucide-react";
import { format, addDays } from "date-fns";

const POLICY_TYPES = [
  { value: 'health', label: 'Health', icon: Heart, color: 'bg-red-100 text-red-800' },
  { value: 'auto', label: 'Auto', icon: Car, color: 'bg-blue-100 text-blue-800' },
  { value: 'home', label: 'Home', icon: Home, color: 'bg-green-100 text-green-800' },
  { value: 'life', label: 'Life', icon: Heart, color: 'bg-purple-100 text-purple-800' },
  { value: 'disability', label: 'Disability', icon: Shield, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'travel', label: 'Travel', icon: Shield, color: 'bg-orange-100 text-orange-800' },
  { value: 'pet', label: 'Pet', icon: Heart, color: 'bg-pink-100 text-pink-800' },
  { value: 'other', label: 'Other', icon: Shield, color: 'bg-gray-100 text-gray-800' }
];

const PREMIUM_FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' }
];

export default function InsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    policy_name: '',
    provider: '',
    policy_number: '',
    type: 'health',
    premium: '',
    premium_frequency: 'monthly',
    coverage_amount: '',
    deductible: '',
    start_date: '',
    end_date: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await InsurancePolicy.list('-start_date');
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        premium: parseFloat(formData.premium),
        coverage_amount: parseFloat(formData.coverage_amount),
        deductible: parseFloat(formData.deductible)
      };

      if (editingPolicy) {
        await InsurancePolicy.update(editingPolicy.id, data);
      } else {
        await InsurancePolicy.create(data);
      }

      setIsDialogOpen(false);
      setEditingPolicy(null);
      setFormData({
        policy_name: '',
        provider: '',
        policy_number: '',
        type: 'health',
        premium: '',
        premium_frequency: 'monthly',
        coverage_amount: '',
        deductible: '',
        start_date: '',
        end_date: '',
        is_active: true,
        notes: ''
      });
      loadPolicies();
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      policy_name: policy.policy_name || '',
      provider: policy.provider || '',
      policy_number: policy.policy_number || '',
      type: policy.type || 'health',
      premium: policy.premium?.toString() || '',
      premium_frequency: policy.premium_frequency || 'monthly',
      coverage_amount: policy.coverage_amount?.toString() || '',
      deductible: policy.deductible?.toString() || '',
      start_date: policy.start_date || '',
      end_date: policy.end_date || '',
      is_active: policy.is_active !== undefined ? policy.is_active : true,
      notes: policy.notes || ''
    });
    setIsDialogOpen(true);
  };

  const totalMonthlyPremium = policies.reduce((sum, policy) => {
    if (policy.is_active) {
      switch (policy.premium_frequency) {
        case 'monthly': return sum + policy.premium;
        case 'quarterly': return sum + (policy.premium / 3);
        case 'semi-annually': return sum + (policy.premium / 6);
        case 'annually': return sum + (policy.premium / 12);
        default: return sum;
      }
    }
    return sum;
  }, 0);
  
  const totalCoverage = policies.filter(p => p.is_active).reduce((sum, policy) => sum + policy.coverage_amount, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Insurance Policies</h1>
          <p className="text-gray-600 mt-1">Manage and review your insurance coverage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Policy' : 'Add New Policy'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="policy_name">Policy Name</Label>
                <Input
                  id="policy_name"
                  value={formData.policy_name}
                  onChange={(e) => setFormData({...formData, policy_name: e.target.value})}
                  placeholder="e.g., Auto Insurance, Health Plan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => setFormData({...formData, provider: e.target.value})}
                    placeholder="e.g., State Farm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy_number">Policy Number</Label>
                  <Input
                    id="policy_number"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({...formData, policy_number: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Policy Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POLICY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="premium">Premium</Label>
                  <Input
                    id="premium"
                    type="number"
                    step="0.01"
                    value={formData.premium}
                    onChange={(e) => setFormData({...formData, premium: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premium_frequency">Premium Frequency</Label>
                  <Select value={formData.premium_frequency} onValueChange={(value) => setFormData({...formData, premium_frequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREMIUM_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coverage_amount">Coverage Amount</Label>
                  <Input
                    id="coverage_amount"
                    type="number"
                    step="0.01"
                    value={formData.coverage_amount}
                    onChange={(e) => setFormData({...formData, coverage_amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deductible">Deductible</Label>
                  <Input
                    id="deductible"
                    type="number"
                    step="0.01"
                    value={formData.deductible}
                    onChange={(e) => setFormData({...formData, deductible: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active Policy</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional policy details..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editingPolicy ? 'Update' : 'Add'} Policy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">Total Monthly Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">${totalMonthlyPremium.toFixed(2)}</div>
            <p className="text-xs text-teal-700">
              For {policies.filter(p => p.is_active).length} active policies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Coverage</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalCoverage.toLocaleString()}</div>
            <p className="text-xs text-blue-700">
              Total protection
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-red-50 border-pink-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-800">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">
              {policies.filter(p => p.end_date && new Date(p.end_date) > new Date() && new Date(p.end_date) < addDays(new Date(), 30)).length}
            </div>
            <p className="text-xs text-pink-700">
              In the next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {POLICY_TYPES.map(type => {
          const filteredPolicies = policies.filter(p => p.type === type.value);
          if (filteredPolicies.length === 0) return null;

          return (
            <Card key={type.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <type.icon className="w-5 h-5" />
                  {type.label} Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPolicies.map((policy) => (
                    <div key={policy.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{policy.policy_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{policy.provider}</Badge>
                            <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                              {policy.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">${policy.premium?.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 capitalize">{policy.premium_frequency}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(policy)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Coverage:</span>
                          <div className="font-medium">${policy.coverage_amount?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Deductible:</span>
                          <div className="font-medium">${policy.deductible?.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Start Date:</span>
                          <div className="font-medium">
                            {policy.start_date ? format(new Date(policy.start_date), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">End Date:</span>
                          <div className="font-medium">
                            {policy.end_date ? format(new Date(policy.end_date), 'MMM d, yyyy') : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Policy #:</span> {policy.policy_number}
                        {policy.notes && ` • ${policy.notes}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {policies.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No insurance policies found</p>
            <p className="text-sm">Add your policies to manage your coverage</p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Asset } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PiggyBank, Plus, Edit, TrendingUp, DollarSign, Home, Car } from "lucide-react";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

const ASSET_CATEGORIES = [
  { value: 'real_estate', label: 'Real Estate', color: 'bg-green-100 text-green-800', icon: Home },
  { value: 'vehicle', label: 'Vehicle', color: 'bg-blue-100 text-blue-800', icon: Car },
  { value: 'investment', label: 'Investment', color: 'bg-purple-100 text-purple-800', icon: TrendingUp },
  { value: 'savings', label: 'Savings', color: 'bg-yellow-100 text-yellow-800', icon: PiggyBank },
  { value: 'retirement', label: 'Retirement', color: 'bg-indigo-100 text-indigo-800', icon: DollarSign },
  { value: 'jewelry', label: 'Jewelry', color: 'bg-pink-100 text-pink-800', icon: PiggyBank },
  { value: 'art', label: 'Art', color: 'bg-red-100 text-red-800', icon: PiggyBank },
  { value: 'electronics', label: 'Electronics', color: 'bg-orange-100 text-orange-800', icon: PiggyBank },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800', icon: PiggyBank }
];

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#6366f1', '#ec4899', '#ef4444', '#f97316'];

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    purchase_price: '',
    purchase_date: '',
    category: 'savings',
    description: '',
    location: '',
    appreciation_rate: ''
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await Asset.list('-value');
      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        appreciation_rate: formData.appreciation_rate ? parseFloat(formData.appreciation_rate) : undefined
      };

      if (editingAsset) {
        await Asset.update(editingAsset.id, data);
      } else {
        await Asset.create(data);
      }

      setIsDialogOpen(false);
      setEditingAsset(null);
      setFormData({
        name: '',
        value: '',
        purchase_price: '',
        purchase_date: '',
        category: 'savings',
        description: '',
        location: '',
        appreciation_rate: ''
      });
      loadAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name || '',
      value: asset.value?.toString() || '',
      purchase_price: asset.purchase_price?.toString() || '',
      purchase_date: asset.purchase_date || '',
      category: asset.category || 'savings',
      description: asset.description || '',
      location: asset.location || '',
      appreciation_rate: asset.appreciation_rate?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
  const totalPurchasePrice = assets.reduce((sum, asset) => sum + (asset.purchase_price || 0), 0);
  const totalAppreciation = totalAssets - totalPurchasePrice;

  const getAssetsByCategory = () => {
    const categoryData = {};
    assets.forEach(asset => {
      categoryData[asset.category] = (categoryData[asset.category] || 0) + asset.value;
    });

    return Object.entries(categoryData).map(([category, value]) => ({
      name: ASSET_CATEGORIES.find(c => c.value === category)?.label || category,
      value: value
    }));
  };

  const getPerformanceData = () => {
    return assets.map(asset => ({
      name: asset.name,
      currentValue: asset.value,
      purchasePrice: asset.purchase_price || 0,
      appreciation: asset.value - (asset.purchase_price || 0)
    }));
  };

  const calculateAppreciationRate = (asset) => {
    if (!asset.purchase_price || !asset.value || asset.purchase_price === 0) return 0;
    return ((asset.value - asset.purchase_price) / asset.purchase_price) * 100;
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Asset Portfolio</h1>
          <p className="text-gray-600 mt-1">Track and manage your valuable assets</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Emergency Fund, 2018 Honda Civic"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Current Value</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location/Account</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., ABC Bank, Home garage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appreciation_rate">Appreciation Rate (%)</Label>
                <Input
                  id="appreciation_rate"
                  type="number"
                  step="0.01"
                  value={formData.appreciation_rate}
                  onChange={(e) => setFormData({...formData, appreciation_rate: e.target.value})}
                  placeholder="e.g., 7.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details about the asset..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingAsset ? 'Update' : 'Add'} Asset
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Assets</CardTitle>
            <PiggyBank className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${totalAssets.toFixed(2)}</div>
            <p className="text-xs text-green-700">
              {assets.length} assets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalPurchasePrice.toFixed(2)}</div>
            <p className="text-xs text-blue-700">
              Initial investment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Appreciation</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalAppreciation >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              ${totalAppreciation.toFixed(2)}
            </div>
            <p className="text-xs text-purple-700">
              {totalPurchasePrice > 0 ? `${((totalAppreciation / totalPurchasePrice) * 100).toFixed(1)}%` : '0%'} change
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Avg. Asset Value</CardTitle>
            <PiggyBank className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ${assets.length > 0 ? (totalAssets / assets.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-orange-700">
              Per asset
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getAssetsByCategory()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getAssetsByCategory().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getPerformanceData()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="currentValue" fill="#10b981" name="Current Value" />
                <Bar dataKey="purchasePrice" fill="#6b7280" name="Purchase Price" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Asset List */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => {
              const category = ASSET_CATEGORIES.find(c => c.value === asset.category);
              const IconComponent = category?.icon || PiggyBank;
              const appreciationRate = calculateAppreciationRate(asset);
              
              return (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                        <Badge className={category?.color}>
                          {category?.label}
                        </Badge>
                        {appreciationRate !== 0 && (
                          <Badge variant={appreciationRate > 0 ? 'default' : 'destructive'}>
                            {appreciationRate > 0 ? '+' : ''}{appreciationRate.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {asset.description}
                        {asset.location && ` • ${asset.location}`}
                        {asset.purchase_date && ` • Purchased ${format(new Date(asset.purchase_date), 'MMM yyyy')}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">${asset.value?.toFixed(2)}</div>
                      {asset.purchase_price && (
                        <div className="text-sm text-gray-500">
                          from ${asset.purchase_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(asset)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {assets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No assets found</p>
                <p className="text-sm">Add your first asset to start tracking</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
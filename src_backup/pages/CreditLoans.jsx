import React, { useState, useEffect } from "react";
import { CreditCard } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard as CreditCardIcon, Plus, Edit, AlertTriangle, CheckCircle, Percent } from "lucide-react";
import { format } from "date-fns";

const CARD_TYPES = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'american_express', label: 'American Express' },
  { value: 'discover', label: 'Discover' },
  { value: 'other', label: 'Other' }
];

export default function CreditLoansPage() {
  const [creditCards, setCreditCards] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    credit_limit: '',
    current_balance: '',
    apr: '',
    annual_fee: '',
    rewards_program: '',
    payment_due_date: '',
    minimum_payment: '',
    card_type: 'visa',
    is_active: true
  });

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    try {
      const data = await CreditCard.list('-credit_limit');
      setCreditCards(data || []);
    } catch (error) {
      console.error('Error loading credit cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        credit_limit: parseFloat(formData.credit_limit),
        current_balance: parseFloat(formData.current_balance),
        apr: parseFloat(formData.apr),
        annual_fee: parseFloat(formData.annual_fee),
        minimum_payment: parseFloat(formData.minimum_payment)
      };

      if (editingCard) {
        await CreditCard.update(editingCard.id, data);
      } else {
        await CreditCard.create(data);
      }

      setIsDialogOpen(false);
      setEditingCard(null);
      setFormData({
        name: '',
        credit_limit: '',
        current_balance: '',
        apr: '',
        annual_fee: '',
        rewards_program: '',
        payment_due_date: '',
        minimum_payment: '',
        card_type: 'visa',
        is_active: true
      });
      loadCreditCards();
    } catch (error) {
      console.error('Error saving credit card:', error);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name || '',
      credit_limit: card.credit_limit?.toString() || '',
      current_balance: card.current_balance?.toString() || '',
      apr: card.apr?.toString() || '',
      annual_fee: card.annual_fee?.toString() || '',
      rewards_program: card.rewards_program || '',
      payment_due_date: card.payment_due_date || '',
      minimum_payment: card.minimum_payment?.toString() || '',
      card_type: card.card_type || 'visa',
      is_active: card.is_active !== undefined ? card.is_active : true
    });
    setIsDialogOpen(true);
  };

  const calculateUtilization = (card) => {
    if (!card.credit_limit || card.credit_limit === 0) return 0;
    return (card.current_balance / card.credit_limit) * 100;
  };

  const getUtilizationColor = (utilization) => {
    if (utilization <= 30) return 'text-green-600';
    if (utilization <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationBadge = (utilization) => {
    if (utilization <= 30) return 'default';
    if (utilization <= 60) return 'secondary';
    return 'destructive';
  };

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + (card.credit_limit || 0), 0);
  const totalBalance = creditCards.reduce((sum, card) => sum + (card.current_balance || 0), 0);
  const totalAvailable = totalCreditLimit - totalBalance;
  const overallUtilization = totalCreditLimit > 0 ? (totalBalance / totalCreditLimit) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Credit Cards & Loans</h1>
          <p className="text-gray-600 mt-1">Manage and compare your credit products</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Credit Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Edit Credit Card' : 'Add New Credit Card'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Card Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Chase Freedom Unlimited"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_balance">Current Balance</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    value={formData.current_balance}
                    onChange={(e) => setFormData({...formData, current_balance: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apr">APR (%)</Label>
                  <Input
                    id="apr"
                    type="number"
                    step="0.01"
                    value={formData.apr}
                    onChange={(e) => setFormData({...formData, apr: e.target.value})}
                    placeholder="18.99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_fee">Annual Fee</Label>
                  <Input
                    id="annual_fee"
                    type="number"
                    step="0.01"
                    value={formData.annual_fee}
                    onChange={(e) => setFormData({...formData, annual_fee: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minimum_payment">Minimum Payment</Label>
                  <Input
                    id="minimum_payment"
                    type="number"
                    step="0.01"
                    value={formData.minimum_payment}
                    onChange={(e) => setFormData({...formData, minimum_payment: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_due_date">Payment Due Date</Label>
                  <Input
                    id="payment_due_date"
                    type="date"
                    value={formData.payment_due_date}
                    onChange={(e) => setFormData({...formData, payment_due_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_type">Card Type</Label>
                <Select value={formData.card_type} onValueChange={(value) => setFormData({...formData, card_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewards_program">Rewards Program</Label>
                <Input
                  id="rewards_program"
                  value={formData.rewards_program}
                  onChange={(e) => setFormData({...formData, rewards_program: e.target.value})}
                  placeholder="e.g., 1.5% cash back on all purchases"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Active Card</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingCard ? 'Update' : 'Add'} Card
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Credit Limit</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${totalCreditLimit.toFixed(2)}</div>
            <p className="text-xs text-blue-700">
              Across {creditCards.length} cards
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Balance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-red-700">
              Current debt
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Available Credit</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${totalAvailable.toFixed(2)}</div>
            <p className="text-xs text-green-700">
              Available to use
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Utilization Rate</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(overallUtilization)}`}>
              {overallUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-orange-700">
              {overallUtilization <= 30 ? 'Excellent' : overallUtilization <= 60 ? 'Good' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Utilization Guidelines */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5" />
            Credit Utilization Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-green-600 font-bold">0-30%</div>
              <div className="text-sm text-green-700">Excellent</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-yellow-600 font-bold">31-60%</div>
              <div className="text-sm text-yellow-700">Good</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-red-600 font-bold">61-100%</div>
              <div className="text-sm text-red-700">High</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Card List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Credit Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {creditCards.map((card) => {
              const utilization = calculateUtilization(card);
              
              return (
                <div key={card.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{card.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{card.card_type}</Badge>
                        <Badge variant={card.is_active ? 'default' : 'secondary'}>
                          {card.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">${card.current_balance?.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">
                          of ${card.credit_limit?.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(card)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">APR:</span>
                      <div className="font-medium">{card.apr}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Min. Payment:</span>
                      <div className="font-medium">${card.minimum_payment?.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Due Date:</span>
                      <div className="font-medium">
                        {card.payment_due_date ? format(new Date(card.payment_due_date), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Utilization:</span>
                      <div className={`font-medium ${getUtilizationColor(utilization)}`}>{utilization.toFixed(1)}%</div>
                    </div>
                  </div>
                  {card.rewards_program && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Rewards:</span> {card.rewards_program}
                    </div>
                  )}
                </div>
              );
            })}
            {creditCards.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CreditCardIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No credit cards found</p>
                <p className="text-sm">Add your credit cards to start tracking</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
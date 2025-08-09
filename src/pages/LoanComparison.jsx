import React, { useState, useEffect } from 'react';
import { Calculator, Search, DollarSign, TrendingUp, Award, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import apiClient from '@/api/client';
import { 
  calculateMonthlyPayment, 
  calculateTotalInterest, 
  compareLoanProducts, 
  calculateAffordability, 
  calculateLoanQualification,
  generateAmortizationSchedule,
  formatCurrency,
  formatPercentage 
} from '@/utils/loanCalculations';

const LOAN_TYPES = [
  { value: 'mortgage', label: 'Mortgage', icon: 'home', description: 'Home purchase or refinance' },
  { value: 'auto', label: 'Auto Loan', icon: 'car', description: 'Vehicle financing' },
  { value: 'personal', label: 'Personal Loan', icon: 'user', description: 'Unsecured personal loan' },
  { value: 'student', label: 'Student Loan', icon: 'graduation-cap', description: 'Education financing' },
  { value: 'home_equity', label: 'Home Equity', icon: 'home', description: 'Home equity loan or HELOC' },
  { value: 'business', label: 'Business Loan', icon: 'briefcase', description: 'Business financing' }
];

const CREDIT_SCORE_RANGES = [
  { value: 750, label: 'Excellent (750+)', color: 'text-green-600' },
  { value: 700, label: 'Good (700-749)', color: 'text-blue-600' },
  { value: 650, label: 'Fair (650-699)', color: 'text-yellow-600' },
  { value: 600, label: 'Poor (600-649)', color: 'text-orange-600' },
  { value: 550, label: 'Bad (550-599)', color: 'text-red-600' }
];

export default function LoanComparison() {
  const [loanProducts, setLoanProducts] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [affordabilityResults, setAffordabilityResults] = useState(null);
  const [qualificationResults, setQualificationResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState('compare');
  const [isComparisonDialogOpen, setIsComparisonDialogOpen] = useState(false);
  
  // Loan comparison parameters
  const [loanParams, setLoanParams] = useState({
    loanType: 'mortgage',
    loanAmount: '300000',
    termMonths: '360', // 30 years
    downPayment: '60000', // 20%
    creditScore: '750',
    annualIncome: '80000',
    monthlyDebts: '500'
  });

  // New comparison form
  const [newComparison, setNewComparison] = useState({
    comparison_name: '',
    loan_type: 'mortgage',
    loan_amount: '',
    term_months: '',
    down_payment: '',
    credit_score: '',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Recalculate when params change
  useEffect(() => {
    if (loanParams.loanAmount && loanParams.termMonths) {
      handleCalculateComparison();
    }
  }, [loanParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load loan products - use fallback for API errors
      let productsData = [];
      try {
        const productsResult = await apiClient.getLoanProducts();
        productsData = productsResult.data || productsResult || [];
      } catch (error) {
        console.warn('Loan products API not available, using sample data');
        productsData = getSampleLoanProducts();
      }
      
      // Load saved comparisons
      let comparisonsData = [];
      try {
        const comparisonsResult = await apiClient.getLoanComparisons();
        comparisonsData = comparisonsResult.data || comparisonsResult || [];
      } catch (error) {
        console.warn('Loan comparisons API not available');
        comparisonsData = [];
      }
      
      setLoanProducts(productsData);
      setComparisons(comparisonsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load loan data');
      
      // Set sample data as fallback
      setLoanProducts(getSampleLoanProducts());
      setComparisons([]);
    } finally {
      setLoading(false);
    }
  };

  const getSampleLoanProducts = () => [
    {
      id: '1',
      institution_name: 'Chase Bank',
      loan_type: 'mortgage',
      product_name: '30-Year Fixed Mortgage',
      interest_rate: 7.125,
      apr: 7.25,
      term_months: 360,
      minimum_amount: 100000,
      maximum_amount: 2000000,
      credit_score_min: 620,
      down_payment_min: 0.03,
      origination_fee: 0.5,
      closing_costs: 3000,
      points: 0,
      status: 'active'
    },
    {
      id: '2',
      institution_name: 'Wells Fargo',
      loan_type: 'mortgage',
      product_name: '30-Year Fixed Rate',
      interest_rate: 7.0,
      apr: 7.15,
      term_months: 360,
      minimum_amount: 100000,
      maximum_amount: 1500000,
      credit_score_min: 640,
      down_payment_min: 0.05,
      origination_fee: 0.0,
      closing_costs: 2500,
      points: 0,
      status: 'active'
    },
    {
      id: '3',
      institution_name: 'Bank of America',
      loan_type: 'mortgage',
      product_name: 'Preferred Rate Mortgage',
      interest_rate: 6.875,
      apr: 7.0,
      term_months: 360,
      minimum_amount: 150000,
      maximum_amount: 3000000,
      credit_score_min: 700,
      down_payment_min: 0.10,
      origination_fee: 0.0,
      closing_costs: 2800,
      points: 0.5,
      status: 'active'
    },
    // Auto loans
    {
      id: '4',
      institution_name: 'Capital One Auto',
      loan_type: 'auto',
      product_name: 'Auto Loan - New Vehicle',
      interest_rate: 5.99,
      apr: 6.15,
      term_months: 60,
      minimum_amount: 5000,
      maximum_amount: 100000,
      credit_score_min: 600,
      down_payment_min: 0.0,
      origination_fee: 0.0,
      closing_costs: 0,
      points: 0,
      status: 'active'
    },
    // Personal loans
    {
      id: '5',
      institution_name: 'Marcus by Goldman Sachs',
      loan_type: 'personal',
      product_name: 'Personal Loan',
      interest_rate: 8.99,
      apr: 8.99,
      term_months: 60,
      minimum_amount: 3500,
      maximum_amount: 40000,
      credit_score_min: 660,
      down_payment_min: 0.0,
      origination_fee: 0.0,
      closing_costs: 0,
      points: 0,
      status: 'active'
    }
  ];

  const handleCalculateComparison = async () => {
    try {
      setIsCalculating(true);
      
      const loanAmount = parseFloat(loanParams.loanAmount);
      const termMonths = parseInt(loanParams.termMonths);
      const downPayment = parseFloat(loanParams.downPayment || 0);
      const creditScore = parseInt(loanParams.creditScore);
      
      // Filter products by loan type
      const relevantProducts = loanProducts.filter(product => 
        product.loan_type === loanParams.loanType
      );
      
      // Calculate loan comparisons
      const comparisonsResult = compareLoanProducts(relevantProducts, {
        loanAmount,
        termMonths,
        downPayment,
        creditScore
      });
      
      setComparisonResults(comparisonsResult);
      
      // Calculate affordability
      const monthlyIncome = parseFloat(loanParams.annualIncome) / 12;
      const monthlyDebts = parseFloat(loanParams.monthlyDebts);
      const affordability = calculateAffordability(monthlyIncome, monthlyDebts);
      setAffordabilityResults(affordability);
      
      // Calculate loan qualification
      const qualification = calculateLoanQualification({
        creditScore: parseInt(loanParams.creditScore),
        annualIncome: parseFloat(loanParams.annualIncome),
        monthlyDebts: parseFloat(loanParams.monthlyDebts),
        downPayment: parseFloat(loanParams.downPayment || 0),
        employmentLength: 36 // Assume 3 years
      }, loanParams.loanType);
      
      setQualificationResults(qualification);
      
      // Generate amortization schedule for best option
      if (comparisonsResult.length > 0) {
        const bestLoan = comparisonsResult[0];
        const schedule = generateAmortizationSchedule(
          loanAmount - downPayment,
          bestLoan.interest_rate / 100,
          termMonths,
          bestLoan.calculations.monthlyPayment
        );
        setAmortizationSchedule(schedule.slice(0, 12)); // Show first year
      }
      
    } catch (error) {
      console.error('Error calculating loan comparison:', error);
      toast.error('Failed to calculate loan comparison');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveComparison = async (e) => {
    e.preventDefault();
    try {
      const comparisonData = {
        ...newComparison,
        loan_amount: parseFloat(newComparison.loan_amount),
        term_months: parseInt(newComparison.term_months),
        down_payment: parseFloat(newComparison.down_payment || 0),
        credit_score: parseInt(newComparison.credit_score),
        user_id: 'c905f9c7-9fce-4ac9-8e59-514701257b3f', // TODO: Get from auth context
        comparison_data: comparisonResults
      };
      
      await apiClient.createLoanComparison(comparisonData);
      toast.success('Loan comparison saved successfully');
      setIsComparisonDialogOpen(false);
      setNewComparison({
        comparison_name: '',
        loan_type: 'mortgage',
        loan_amount: '',
        term_months: '',
        down_payment: '',
        credit_score: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving comparison:', error);
      toast.error('Failed to save comparison');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Comparison Tool</h1>
          <p className="text-gray-600">Compare mortgage, auto, and personal loan options</p>
        </div>
        <Dialog open={isComparisonDialogOpen} onOpenChange={setIsComparisonDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={comparisonResults.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              Save Comparison
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Save Loan Comparison</DialogTitle>
              <DialogDescription>
                Save this comparison for future reference.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveComparison} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comparison_name">Comparison Name</Label>
                <Input
                  id="comparison_name"
                  value={newComparison.comparison_name}
                  onChange={(e) => setNewComparison({...newComparison, comparison_name: e.target.value})}
                  placeholder="My Home Purchase Comparison"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newComparison.notes}
                  onChange={(e) => setNewComparison({...newComparison, notes: e.target.value})}
                  placeholder="Additional notes about this comparison..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsComparisonDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Comparison</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compare">Compare Loans</TabsTrigger>
          <TabsTrigger value="qualify">Pre-Qualification</TabsTrigger>
          <TabsTrigger value="schedule">Amortization</TabsTrigger>
          <TabsTrigger value="saved">Saved Comparisons</TabsTrigger>
        </TabsList>

        {/* Loan Comparison Tab */}
        <TabsContent value="compare" className="space-y-6">
          {/* Loan Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Loan Parameters
              </CardTitle>
              <CardDescription>
                Enter your loan requirements to compare available options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select
                    value={loanParams.loanType}
                    onValueChange={(value) => setLoanParams({...loanParams, loanType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOAN_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={loanParams.loanAmount}
                    onChange={(e) => setLoanParams({...loanParams, loanAmount: e.target.value})}
                    placeholder="300000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termMonths">Term (Months)</Label>
                  <Select
                    value={loanParams.termMonths}
                    onValueChange={(value) => setLoanParams({...loanParams, termMonths: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="360">30 years (360 months)</SelectItem>
                      <SelectItem value="300">25 years (300 months)</SelectItem>
                      <SelectItem value="240">20 years (240 months)</SelectItem>
                      <SelectItem value="180">15 years (180 months)</SelectItem>
                      <SelectItem value="120">10 years (120 months)</SelectItem>
                      <SelectItem value="72">6 years (72 months)</SelectItem>
                      <SelectItem value="60">5 years (60 months)</SelectItem>
                      <SelectItem value="48">4 years (48 months)</SelectItem>
                      <SelectItem value="36">3 years (36 months)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={loanParams.downPayment}
                    onChange={(e) => setLoanParams({...loanParams, downPayment: e.target.value})}
                    placeholder="60000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditScore">Credit Score</Label>
                  <Select
                    value={loanParams.creditScore}
                    onValueChange={(value) => setLoanParams({...loanParams, creditScore: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CREDIT_SCORE_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value.toString()}>
                          <span className={range.color}>{range.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={loanParams.annualIncome}
                    onChange={(e) => setLoanParams({...loanParams, annualIncome: e.target.value})}
                    placeholder="80000"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCalculateComparison} disabled={isCalculating}>
                  {isCalculating ? 'Calculating...' : 'Compare Loans'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Affordability Analysis */}
          {affordabilityResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Affordability Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(affordabilityResults.maxAffordablePayment)}
                    </div>
                    <p className="text-sm text-gray-600">Max Affordable Payment</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {affordabilityResults.currentDTI.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">Current Debt-to-Income</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {affordabilityResults.maxDTI}%
                    </div>
                    <p className="text-sm text-gray-600">Maximum DTI Recommended</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${affordabilityResults.canAffordNewLoan ? 'text-green-600' : 'text-red-600'}`}>
                      {affordabilityResults.canAffordNewLoan ? 'Yes' : 'No'}
                    </div>
                    <p className="text-sm text-gray-600">Can Afford New Loan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loan Comparison Results */}
          {comparisonResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {comparisonResults.map((loan, index) => (
                <Card key={loan.id} className={`${index === 0 ? 'ring-2 ring-green-500' : ''} hover:shadow-lg transition-shadow`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{loan.product_name}</CardTitle>
                        <CardDescription>{loan.institution_name}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <Badge className="bg-green-500 text-white">
                            <Award className="h-3 w-3 mr-1" />
                            Best Deal
                          </Badge>
                        )}
                        <Badge variant="outline">#{loan.calculations.rank}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly Payment:</span>
                        <div className="font-semibold text-lg">{formatCurrency(loan.calculations.monthlyPayment)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Interest Rate:</span>
                        <div className="font-semibold">{formatPercentage(loan.interest_rate / 100)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Interest:</span>
                        <div className="font-semibold">{formatCurrency(loan.calculations.totalInterest)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">APR:</span>
                        <div className="font-semibold">{formatPercentage(loan.apr / 100)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Cost:</span>
                        <div className="font-semibold">{formatCurrency(loan.calculations.totalPayments)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Upfront Costs:</span>
                        <div className="font-semibold">{formatCurrency(loan.calculations.fees.totalUpfrontCosts)}</div>
                      </div>
                    </div>

                    {loan.calculations.savings > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-800">
                          <strong>Savings vs. most expensive:</strong>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(loan.calculations.savings)}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Requirements:</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div>Min Credit Score: {loan.credit_score_min || 'Not specified'}</div>
                        <div>Min Down Payment: {formatPercentage(loan.down_payment_min || 0)}</div>
                        <div>Loan Range: {formatCurrency(loan.minimum_amount)} - {formatCurrency(loan.maximum_amount)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pre-Qualification Tab */}
        <TabsContent value="qualify" className="space-y-6">
          {qualificationResults && (
            <>
              {/* Qualification Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Pre-Qualification Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      qualificationResults.qualificationLevel === 'excellent' ? 'text-green-600' :
                      qualificationResults.qualificationLevel === 'good' ? 'text-blue-600' :
                      qualificationResults.qualificationLevel === 'fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {qualificationResults.qualificationScore}
                    </div>
                    <div className="text-lg font-medium capitalize">
                      {qualificationResults.qualificationLevel} Qualification
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Estimated Rate: {formatPercentage(qualificationResults.estimatedRate)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Qualification Factors */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Qualification Factors</h4>
                      {qualificationResults.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm">{factor.factor}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={factor.impact > 0 ? 'default' : 'destructive'}>
                              {factor.status}
                            </Badge>
                            <span className={`text-sm font-medium ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {factor.impact > 0 ? '+' : ''}{factor.impact}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Improvement Recommendations</h4>
                      {qualificationResults.recommendations.length > 0 ? (
                        qualificationResults.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{rec.category}</Badge>
                              <Badge className={rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{rec.recommendation}</p>
                            <p className="text-xs text-gray-500 mt-1">Timeline: {rec.timeframe}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            You meet all qualification criteria for this loan type!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Amortization Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {amortizationSchedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Amortization Schedule (First Year)
                </CardTitle>
                <CardDescription>
                  Monthly payment breakdown for the best loan option
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2">Payment #</th>
                        <th className="pb-2">Payment Amount</th>
                        <th className="pb-2">Principal</th>
                        <th className="pb-2">Interest</th>
                        <th className="pb-2">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-1">
                      {amortizationSchedule.map((payment) => (
                        <tr key={payment.paymentNumber} className="border-b border-gray-100">
                          <td className="py-2">{payment.paymentNumber}</td>
                          <td className="py-2 font-medium">{formatCurrency(payment.paymentAmount)}</td>
                          <td className="py-2 text-green-600">{formatCurrency(payment.principalPayment)}</td>
                          <td className="py-2 text-red-600">{formatCurrency(payment.interestPayment)}</td>
                          <td className="py-2">{formatCurrency(payment.remainingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Saved Comparisons Tab */}
        <TabsContent value="saved" className="space-y-6">
          {comparisons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {comparisons.map((comparison) => (
                <Card key={comparison.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{comparison.comparison_name}</CardTitle>
                    <CardDescription>
                      {LOAN_TYPES.find(t => t.value === comparison.loan_type)?.label} • 
                      {formatCurrency(comparison.loan_amount)} • 
                      {Math.round(comparison.term_months / 12)} years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Down Payment:</span>
                        <span>{formatCurrency(comparison.down_payment || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Credit Score:</span>
                        <span>{comparison.credit_score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{new Date(comparison.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {comparison.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">{comparison.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved comparisons</h3>
                <p className="text-gray-600 mb-4">Create and save loan comparisons to reference later.</p>
                <Button onClick={() => setActiveTab('compare')}>
                  Start Comparing Loans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
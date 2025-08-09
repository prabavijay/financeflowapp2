import React, { useState, useEffect } from "react";
import { Debt } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles, TrendingDown, Calculator, Calendar, DollarSign } from "lucide-react";

export default function DebtReductionPage() {
  const [debts, setDebts] = useState([]);
  const [strategies, setStrategies] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const data = await Debt.list('-interest_rate');
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStrategies = async () => {
    setIsGenerating(true);
    try {
      const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
      const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
      const highestRate = Math.max(...debts.map(d => d.interest_rate));
      const averageRate = debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length;

      const debtDetails = debts.map(debt => ({
        name: debt.name,
        balance: debt.balance,
        rate: debt.interest_rate,
        minPayment: debt.minimum_payment,
        type: debt.type
      }));

      const prompt = `
        As a financial advisor, analyze these debts and provide comprehensive debt reduction strategies:
        
        Total Debt: $${totalDebt}
        Total Minimum Payments: $${totalMinPayments}
        Average Interest Rate: ${averageRate.toFixed(2)}%
        Highest Interest Rate: ${highestRate}%
        
        Debt Details:
        ${debtDetails.map(d => `- ${d.name}: $${d.balance} at ${d.rate}% (min: $${d.minPayment})`).join('\n')}
        
        Provide:
        1. Debt Snowball vs Avalanche comparison
        2. Recommended payoff order
        3. Specific action steps
        4. Timeline estimates
        5. Monthly payment recommendations
        6. Potential savings calculations
      `;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  pros: { type: "array", items: { type: "string" } },
                  cons: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  total_interest_saved: { type: "number" }
                }
              }
            },
            recommended_order: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  debt_name: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "number" }
                }
              }
            },
            action_steps: { type: "array", items: { type: "string" } },
            monthly_recommendations: {
              type: "object",
              properties: {
                minimum_total: { type: "number" },
                recommended_extra: { type: "number" },
                target_payment: { type: "number" }
              }
            },
            key_insights: { type: "array", items: { type: "string" } }
          }
        }
      });

      setStrategies(response);
    } catch (error) {
      console.error('Error generating strategies:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateDebtFreeDate = (debt) => {
    const monthlyRate = debt.interest_rate / 100 / 12;
    const months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / debt.minimum_payment) / Math.log(1 + monthlyRate)
    );
    
    if (months <= 0 || !isFinite(months)) return 'N/A';
    
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateTotalInterest = (debt) => {
    const monthlyRate = debt.interest_rate / 100 / 12;
    const months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / debt.minimum_payment) / Math.log(1 + monthlyRate)
    );
    
    if (months <= 0 || !isFinite(months)) return 0;
    
    return (debt.minimum_payment * months) - debt.balance;
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const totalMinPayments = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  const totalInterest = debts.reduce((sum, debt) => sum + calculateTotalInterest(debt), 0);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Debts to Analyze</h1>
          <p className="text-gray-600">Add some debts first to get AI-powered reduction strategies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debt Reduction Strategies</h1>
          <p className="text-gray-600 mt-1">AI-powered strategies to become debt-free faster</p>
        </div>
        <Button 
          onClick={generateStrategies}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Strategies
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Total Debt</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${totalDebt.toFixed(2)}</div>
            <p className="text-xs text-red-700">
              {debts.length} debts to eliminate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Monthly Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">${totalMinPayments.toFixed(2)}</div>
            <p className="text-xs text-orange-700">
              Minimum required
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Interest</CardTitle>
            <Calculator className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">${totalInterest.toFixed(2)}</div>
            <p className="text-xs text-purple-700">
              If paying minimums
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Avg. Interest Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {debts.length > 0 ? (debts.reduce((sum, debt) => sum + debt.interest_rate, 0) / debts.length).toFixed(1) : '0.0'}%
            </div>
            <p className="text-xs text-green-700">
              Across all debts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Debt Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Debt Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debts.map((debt) => (
              <div key={debt.id} className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{debt.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{debt.type.replace(/_/g, ' ')}</Badge>
                      <Badge variant={debt.interest_rate > 15 ? 'destructive' : debt.interest_rate > 10 ? 'default' : 'secondary'}>
                        {debt.interest_rate}% APR
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-red-600">${debt.balance.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">Min: ${debt.minimum_payment.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Payoff Date:</span>
                    <div className="font-medium">{calculateDebtFreeDate(debt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Interest:</span>
                    <div className="font-medium">${calculateTotalInterest(debt).toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Progress:</span>
                    <div className="font-medium">
                      {debt.original_amount ? 
                        `${(((debt.original_amount - debt.balance) / debt.original_amount) * 100).toFixed(1)}%` : 
                        'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Monthly Interest:</span>
                    <div className="font-medium">${((debt.balance * debt.interest_rate / 100) / 12).toFixed(2)}</div>
                  </div>
                </div>
                {debt.original_amount && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{(((debt.original_amount - debt.balance) / debt.original_amount) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={((debt.original_amount - debt.balance) / debt.original_amount) * 100} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Strategies */}
      {strategies && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI-Powered Debt Reduction Strategies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Monthly Recommendations */}
              <div className="bg-white p-6 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-gray-900 mb-4">Monthly Payment Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      ${strategies.monthly_recommendations.minimum_total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Current Minimums</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      ${strategies.monthly_recommendations.recommended_extra.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600">Recommended Extra</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      ${strategies.monthly_recommendations.target_payment.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">Target Total Payment</div>
                  </div>
                </div>
              </div>

              {/* Strategies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {strategies.strategies.map((strategy, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{strategy.name}</h3>
                    <p className="text-gray-600 mb-4">{strategy.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Pros:</h4>
                        <ul className="text-sm space-y-1">
                          {strategy.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Cons:</h4>
                        <ul className="text-sm space-y-1">
                          {strategy.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-500 mt-1">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Timeline: {strategy.timeline}</span>
                      <span className="font-medium text-green-600">
                        Save: ${strategy.total_interest_saved.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Order */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Recommended Payoff Order</h3>
                <div className="space-y-3">
                  {strategies.recommended_order.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {item.priority}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.debt_name}</div>
                        <div className="text-sm text-gray-600">{item.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Steps */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Action Steps</h3>
                <div className="space-y-3">
                  {strategies.action_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="text-gray-700">{step}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="space-y-2">
                  {strategies.key_insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="text-gray-700">{insight}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
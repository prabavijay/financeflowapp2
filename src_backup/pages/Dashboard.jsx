import React, { useState, useEffect } from "react";
import { 
  Income, 
  Expense, 
  Bill, 
  Debt, 
  Asset, 
  CreditCard, 
  InsurancePolicy 
} from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard as CreditCardIcon,
  PiggyBank,
  AlertTriangle,
  Target,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const COLORS = ['#4facfe', '#00f2fe', '#667eea', '#764ba2', '#f093fb', '#f5576c'];

export default function Dashboard() {
  const [data, setData] = useState({
    income: [],
    expenses: [],
    bills: [],
    debts: [],
    assets: [],
    creditCards: [],
    insurance: []
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [income, expenses, bills, debts, assets, creditCards, insurance] = await Promise.all([
        Income.list('-date_received'),
        Expense.list('-date'),
        Bill.list('-due_date'),
        Debt.list('-created_date'),
        Asset.list('-created_date'),
        CreditCard.list('-created_date'),
        InsurancePolicy.list('-created_date')
      ]);

      setData({
        income: income || [],
        expenses: expenses || [],
        bills: bills || [],
        debts: debts || [],
        assets: assets || [],
        creditCards: creditCards || [],
        insurance: insurance || []
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIInsights = async () => {
    setInsightsLoading(true);
    try {
      const currentMonth = new Date();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const monthlyIncome = data.income.filter(item => 
        new Date(item.date_received) >= monthStart && new Date(item.date_received) <= monthEnd
      ).reduce((sum, item) => sum + item.amount, 0);

      const monthlyExpenses = data.expenses.filter(item => 
        new Date(item.date) >= monthStart && new Date(item.date) <= monthEnd
      ).reduce((sum, item) => sum + item.amount, 0);

      const totalDebt = data.debts.reduce((sum, debt) => sum + debt.balance, 0);
      const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);

      const prompt = `
        As a financial advisor, provide personalized insights for this person's finances:
        
        Monthly Income: $${monthlyIncome}
        Monthly Expenses: $${monthlyExpenses}
        Total Debt: $${totalDebt}
        Total Assets: $${totalAssets}
        
        Number of Income Sources: ${data.income.length}
        Number of Debts: ${data.debts.length}
        Number of Assets: ${data.assets.length}
        
        Provide 3-4 key insights and actionable recommendations for improving their financial health.
        Focus on debt reduction, savings optimization, and expense management.
      `;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  action: { type: "string" }
                }
              }
            },
            financial_health_score: { type: "number" },
            summary: { type: "string" }
          }
        }
      });

      setAiInsights(response);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const calculateNetWorth = () => {
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalDebts = data.debts.reduce((sum, debt) => sum + debt.balance, 0);
    return totalAssets - totalDebts;
  };

  const getMonthlyData = () => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const monthlyIncome = data.income.filter(item => 
      new Date(item.date_received) >= monthStart && new Date(item.date_received) <= monthEnd
    ).reduce((sum, item) => sum + item.amount, 0);

    const monthlyExpenses = data.expenses.filter(item => 
      new Date(item.date) >= monthStart && new Date(item.date) <= monthEnd
    ).reduce((sum, item) => sum + item.amount, 0);

    return { monthlyIncome, monthlyExpenses };
  };

  const getUpcomingBills = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return data.bills.filter(bill => {
      const dueDate = new Date(bill.due_date);
      return dueDate >= today && dueDate <= nextWeek && bill.status === 'pending';
    });
  };

  const getExpenseBreakdown = () => {
    const categoryTotals = {};
    data.expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category.replace(/_/g, ' '),
      value: amount
    }));
  };

  const { monthlyIncome, monthlyExpenses } = getMonthlyData();
  const netWorth = calculateNetWorth();
  const upcomingBills = getUpcomingBills();
  const expenseBreakdown = getExpenseBreakdown();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1">Your complete financial overview</p>
        </div>
        <Button 
          onClick={generateAIInsights}
          disabled={insightsLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          {insightsLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Insights
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">${monthlyIncome.toFixed(2)}</div>
            <div className="flex items-center text-xs text-blue-700 mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              This month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">${monthlyExpenses.toFixed(2)}</div>
            <div className="flex items-center text-xs text-red-700 mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              This month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${netWorth.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-700 mt-1">
              <PiggyBank className="w-3 h-3 mr-1" />
              Assets - Debts
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {monthlyIncome > 0 ? (((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100).toFixed(1) : '0.0'}%
            </div>
            <div className="flex items-center text-xs text-purple-700 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              Monthly rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Sparkles className="w-5 h-5" />
              AI Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-sm text-indigo-700">
                <span className="font-medium">Financial Health Score: </span>
                <span className="text-2xl font-bold">{aiInsights.financial_health_score}/100</span>
              </div>
            </div>
            
            <p className="text-indigo-800 font-medium mb-4">{aiInsights.summary}</p>
            
            <div className="grid gap-3">
              {aiInsights.insights.map((insight, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-indigo-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{insight.description}</p>
                  <p className="text-indigo-600 text-sm font-medium">{insight.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Bills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingBills.length > 0 ? (
                upcomingBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{bill.name}</div>
                      <div className="text-sm text-gray-600">Due: {format(new Date(bill.due_date), 'MMM d, yyyy')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${bill.amount.toFixed(2)}</div>
                      <Badge variant={bill.status === 'overdue' ? 'destructive' : 'default'}>
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No upcoming bills in the next 7 days</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${data.debts.reduce((sum, debt) => sum + debt.balance, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Across {data.debts.length} accounts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.assets.reduce((sum, asset) => sum + asset.value, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Across {data.assets.length} assets
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Credit Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.creditCards.length > 0 ? (
                (data.creditCards.reduce((sum, card) => sum + card.current_balance, 0) / 
                 data.creditCards.reduce((sum, card) => sum + card.credit_limit, 0) * 100).toFixed(1)
              ) : '0.0'}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Across {data.creditCards.length} cards
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
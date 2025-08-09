import React, { useState } from 'react'
import { 
  BookOpen, 
  Star, 
  HelpCircle, 
  User, 
  Settings, 
  TestTube2,
  Lightbulb,
  ChevronRight,
  Home,
  TrendingUp,
  PieChart,
  Calendar,
  CreditCard,
  Building,
  Target,
  Calculator,
  Shield,
  Key,
  Clock,
  BarChart3,
  DollarSign,
  FileText,
  Database,
  Zap
} from 'lucide-react'

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState('beginner')

  const navigationTabs = [
    { id: 'beginner', label: "Beginner's Guide", icon: BookOpen, active: true },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'userguide', label: 'User Guide', icon: User },
    { id: 'deployment', label: 'Deployment', icon: Settings },
    { id: 'testguide', label: 'Test Guide', icon: TestTube2 },
    { id: 'protips', label: 'Pro Tips', icon: Lightbulb }
  ]

  const beginnerSteps = [
    {
      id: 1,
      title: 'Welcome & App Overview',
      duration: '3 minutes',
      description: 'Get familiar with FinanceFlow\'s interface and navigation',
      icon: Home,
      color: 'blue',
      details: [
        'Navigate through the sidebar menu',
        'Understand the dashboard layout',
        'Learn about the 11 main modules',
        'Explore the dark theme interface'
      ]
    },
    {
      id: 2,
      title: 'Data Setup & Configuration',
      duration: '5-8 minutes',
      description: 'Set up your financial accounts and initial data',
      icon: Database,
      color: 'green',
      details: [
        'Connect to PostgreSQL database',
        'Add your first income sources',
        'Set up recurring expenses',
        'Configure Personal/Spouse/Family tabs'
      ]
    },
    {
      id: 3,
      title: 'Income & Expense Tracking',
      duration: '7 minutes',
      description: 'Learn to track your financial inflows and outflows',
      icon: TrendingUp,
      color: 'purple',
      details: [
        'Add income from multiple sources',
        'Categorize expenses effectively',
        'Set up recurring transactions',
        'Use the interactive charts'
      ]
    },
    {
      id: 4,
      title: 'Budget Planning & Analysis',
      duration: '5 minutes',
      description: 'Create budgets and analyze spending patterns',
      icon: Target,
      color: 'indigo',
      details: [
        'Create monthly/yearly budgets',
        'Compare actual vs planned spending',
        'Use budget calendar view',
        'Analyze category breakdowns'
      ]
    },
    {
      id: 5,
      title: 'Debt & Asset Management',
      duration: '6 minutes',
      description: 'Track debts and assets for complete financial picture',
      icon: Calculator,
      color: 'orange',
      details: [
        'Add credit cards and loans',
        'Track asset appreciation',
        'Use AI debt reduction strategies',
        'Monitor credit utilization'
      ]
    },
    {
      id: 6,
      title: 'Advanced Features & Automation',
      duration: '4 minutes',
      description: 'Explore insurance, accounts, and AI-powered insights',
      icon: Zap,
      color: 'yellow',
      details: [
        'Manage insurance policies',
        'Secure account credentials',
        'Get AI financial insights',
        'Automate recurring transactions'
      ]
    }
  ]

  const features = [
    {
      category: 'Core Modules',
      items: [
        { name: 'Dashboard', description: 'Financial overview with AI insights and key metrics', icon: PieChart },
        { name: 'Income Tracking', description: 'Multi-category income with recurring support', icon: TrendingUp },
        { name: 'Expense Management', description: 'Comprehensive categorization and payment tracking', icon: DollarSign },
        { name: 'Bills Management', description: 'Due date tracking with auto-pay indicators', icon: Calendar },
        { name: 'Debt Portfolio', description: 'Multi-debt tracking with payoff calculations', icon: CreditCard },
        { name: 'Asset Tracking', description: 'Real estate, vehicles, investments analysis', icon: Building },
        { name: 'Budget System', description: 'Flexible frequency with actual vs budget comparison', icon: Target },
        { name: 'Debt Reduction', description: 'AI-powered strategies and payment recommendations', icon: Calculator },
        { name: 'Credit & Loans', description: 'Credit management with utilization tracking', icon: CreditCard },
        { name: 'Insurance', description: 'Policy management with coverage analysis', icon: Shield },
        { name: 'Accounts', description: 'Secure credential storage with password management', icon: Key }
      ]
    },
    {
      category: 'Data Visualization',
      items: [
        { name: '14 Interactive Charts', description: 'Recharts-powered visualizations across all modules', icon: BarChart3 },
        { name: 'Real-time Updates', description: 'Live data refresh and chart animations', icon: Clock },
        { name: 'Responsive Design', description: 'Mobile-first approach with collapsible sidebar', icon: FileText }
      ]
    }
  ]

  const faqs = [
    {
      question: 'How do I get started with FinanceFlow?',
      answer: 'Follow our Beginner\'s Guide starting with the Welcome & App Overview. The setup process takes about 10-15 minutes and walks you through connecting your database, adding initial financial data, and exploring the main features.'
    },
    {
      question: 'Can I track finances for multiple family members?',
      answer: 'Yes! FinanceFlow supports Personal, Spouse, and Family views across all modules. You can categorize income, expenses, debts, and assets by owner and view consolidated family reports.'
    },
    {
      question: 'What types of charts and analytics are available?',
      answer: 'FinanceFlow includes 14 interactive charts powered by Recharts: pie charts for category breakdowns, bar charts for comparisons, line charts for trends, and specialized charts like debt payoff projections and budget vs actual analysis.'
    },
    {
      question: 'How does the AI debt reduction feature work?',
      answer: 'The AI analyzes your debt portfolio and recommends optimal payment strategies using snowball vs avalanche methods. It calculates interest savings, suggests payment amounts, and projects payoff timelines.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Yes, FinanceFlow uses PostgreSQL for secure data storage with encrypted password fields. The Accounts module provides secure credential storage with masked display and password visibility controls.'
    },
    {
      question: 'Can I export my financial data?',
      answer: 'Currently, data is stored in PostgreSQL and can be exported through database queries. Future versions will include CSV/Excel export functionality.'
    },
    {
      question: 'What browsers are supported?',
      answer: 'FinanceFlow works on all modern browsers including Chrome, Firefox, Safari, and Edge. It\'s built with React and uses responsive design for mobile compatibility.'
    },
    {
      question: 'How do I backup my financial data?',
      answer: 'Create regular PostgreSQL database backups using pg_dump. The database schema and sample data scripts are provided in the backend/database/ directory.'
    }
  ]

  const userGuideTopics = [
    {
      section: 'Getting Started',
      topics: [
        'Installation and Setup',
        'Database Configuration',
        'First Login and Navigation',
        'Understanding the Interface'
      ]
    },
    {
      section: 'Financial Tracking',
      topics: [
        'Adding Income Sources',
        'Categorizing Expenses',
        'Setting Up Recurring Transactions',
        'Using Multiple Accounts'
      ]
    },
    {
      section: 'Planning & Analysis',
      topics: [
        'Creating Budgets',
        'Analyzing Spending Patterns',
        'Debt Management Strategies',
        'Asset Portfolio Tracking'
      ]
    },
    {
      section: 'Advanced Features',
      topics: [
        'AI-Powered Insights',
        'Insurance Management',
        'Secure Credential Storage',
        'Data Export and Backup'
      ]
    }
  ]

  const testGuideSteps = [
    {
      category: 'Frontend Testing',
      tests: [
        {
          name: 'Navigation Testing',
          duration: '5 minutes',
          steps: [
            'Test all sidebar navigation links',
            'Verify page routing works correctly',
            'Check responsive sidebar collapse',
            'Test dark theme consistency'
          ]
        },
        {
          name: 'Form Functionality',
          duration: '10 minutes',
          steps: [
            'Test add/edit forms in all modules',
            'Verify form validation works',
            'Check cancel/close button functionality',
            'Test Personal/Spouse/Family tabs'
          ]
        },
        {
          name: 'Chart Rendering',
          duration: '8 minutes',
          steps: [
            'Verify all 14 charts load correctly',
            'Test chart responsiveness',
            'Check data updates in real-time',
            'Test chart interactions and tooltips'
          ]
        },
        {
          name: 'CRUD Operations',
          duration: '15 minutes',
          steps: [
            'Test Create operations in all modules',
            'Test Read/display functionality',
            'Test Update/edit operations',
            'Test Delete with confirmation dialogs'
          ]
        }
      ]
    },
    {
      category: 'Backend Testing',
      tests: [
        {
          name: 'API Endpoints',
          duration: '10 minutes',
          steps: [
            'Test all GET endpoints return data',
            'Test POST endpoints create records',
            'Test PUT endpoints update records',
            'Test DELETE endpoints remove records'
          ]
        },
        {
          name: 'Database Integration',
          duration: '8 minutes',
          steps: [
            'Verify PostgreSQL connection',
            'Test data persistence',
            'Check foreign key relationships',
            'Test transaction rollbacks'
          ]
        }
      ]
    },
    {
      category: 'Integration Testing',
      tests: [
        {
          name: 'End-to-End Workflow',
          duration: '20 minutes',
          steps: [
            'Complete beginner workflow setup',
            'Add sample data across all modules',
            'Verify charts update with new data',
            'Test family member data segregation'
          ]
        }
      ]
    }
  ]

  const proTips = [
    {
      title: 'Efficient Data Entry',
      tips: [
        'Use bulk import for historical transactions',
        'Set up recurring items to save time',
        'Use keyboard shortcuts in forms',
        'Copy similar transactions for faster entry'
      ]
    },
    {
      title: 'Advanced Analysis',
      tips: [
        'Compare month-over-month trends in charts',
        'Use category filters for focused analysis',
        'Set budget alerts for overspending',
        'Track net worth growth over time'
      ]
    },
    {
      title: 'Security Best Practices',
      tips: [
        'Use strong passwords for account credentials',
        'Regularly backup your database',
        'Keep the application updated',
        'Use secure networks for access'
      ]
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-100',
      green: 'from-emerald-500 to-emerald-600 text-emerald-100',
      purple: 'from-purple-500 to-purple-600 text-purple-100',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-100',
      orange: 'from-orange-500 to-orange-600 text-orange-100',
      yellow: 'from-yellow-500 to-yellow-600 text-yellow-100'
    }
    return colors[color] || colors.blue
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'beginner':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Complete Beginner&apos;s Workflow Guide</h2>
              </div>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Step-by-step walkthrough for new users - from setup to your first successful financial tracking
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {beginnerSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="group relative">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:transform hover:scale-105">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 bg-gradient-to-r ${getColorClasses(step.color)} rounded-xl flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">Step {step.id}</h3>
                            <span className="text-sm text-gray-400">{step.duration}</span>
                          </div>
                          <h4 className="text-lg font-medium text-gray-200 mb-3">{step.title}</h4>
                          <p className="text-gray-400 mb-4">{step.description}</p>
                          <ul className="space-y-2">
                            {step.details.map((detail, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">FinanceFlow Features</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Comprehensive financial management with 11 modules and 69+ features
              </p>
            </div>

            {features.map((category, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((feature, i) => {
                    const Icon = feature.icon
                    return (
                      <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">{feature.name}</h4>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )

      case 'faq':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Common questions and answers about FinanceFlow
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )

      case 'userguide':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">User Guide</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Detailed documentation for all FinanceFlow features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {userGuideTopics.map((section, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">{section.section}</h3>
                  <div className="space-y-3">
                    {section.topics.map((topic, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-300">{topic}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'testguide':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                  <TestTube2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Comprehensive Test Guide</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Complete testing procedures for FinanceFlow application
              </p>
            </div>

            {testGuideSteps.map((category, index) => (
              <div key={index} className="space-y-6">
                <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {category.tests.map((test, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center gap-3 mb-4">
                        <h4 className="text-lg font-semibold text-white">{test.name}</h4>
                        <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">{test.duration}</span>
                      </div>
                      <div className="space-y-3">
                        {test.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                              {stepIndex + 1}
                            </div>
                            <span className="text-gray-300">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case 'protips':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Pro Tips</h2>
              </div>
              <p className="text-gray-300 text-lg">
                Advanced tips and tricks to get the most out of FinanceFlow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8">
              {proTips.map((section, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-6">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-gray-700/50">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <span className="text-gray-300">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">FinanceFlow Help Center</h1>
              <p className="text-blue-100 text-lg mt-2">Complete guide to personal finance management and optimization</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold">11</div>
              <div className="text-sm text-blue-100">Core Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">69+</div>
              <div className="text-sm text-blue-100">Features</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">AI</div>
              <div className="text-sm text-blue-100">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center gap-1 overflow-x-auto">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-8 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            Need additional help? Contact support or check our GitHub repository for updates.
          </p>
        </div>
      </div>
    </div>
  )
}

export default HelpCenter
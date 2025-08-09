import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  Building2, 
  Calculator, 
  Shield,
  PiggyBank,
  BarChart,
  RotateCcw,
  HelpCircle,
  Target,
  Repeat,
  MapPin,
  AlertTriangle,
  FolderLock,
  Scan,
  Mail,
  FileText,
  Scale,
  Banknote
} from 'lucide-react'

const SimpleSidebar = ({ children }) => {
  const location = useLocation()

  const menuSections = [
    {
      title: 'Core Finance',
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/income', icon: TrendingUp, label: 'Income' },
        { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
        { path: '/bills', icon: Receipt, label: 'Bills' },
        { path: '/budget', icon: Calculator, label: 'Budget' },
      ]
    },
    {
      title: 'Wealth Management',
      items: [
        { path: '/debts', icon: CreditCard, label: 'Debts' },
        { path: '/assets', icon: Building2, label: 'Assets' },
        { path: '/credit-loans', icon: CreditCard, label: 'Credit & Loans' },
        { path: '/insurance', icon: Shield, label: 'Insurance' },
        { path: '/stock-tracker', icon: BarChart, label: 'Stock Tracker' },
        { path: '/retirement-planner', icon: Target, label: 'Retirement Planner' },
      ]
    },
    {
      title: 'Advanced Tools',
      items: [
        { path: '/debt-reduction', icon: RotateCcw, label: 'Debt Reduction' },
        { path: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
        { path: '/travel-budgets', icon: MapPin, label: 'Travel Budgets' },
        { path: '/fee-tracker', icon: AlertTriangle, label: 'Fee Tracker' },
        { path: '/loan-comparison', icon: Calculator, label: 'Loan Comparison' },
      ]
    },
    {
      title: 'Documents & Data',
      items: [
        { path: '/document-vault', icon: FolderLock, label: 'Document Vault' },
        { path: '/receipt-scanner', icon: Scan, label: 'Receipt Scanner' },
        { path: '/email-receipt-processor', icon: Mail, label: 'Email Receipts' },
        { path: '/accounts', icon: PiggyBank, label: 'Accounts' },
      ]
    },
    {
      title: 'Legal & Planning',
      items: [
        { path: '/estate-planning', icon: FileText, label: 'Estate Planning' },
        { path: '/power-of-attorney', icon: Scale, label: 'Power of Attorney' },
      ]
    },
    {
      title: 'Support',
      items: [
        { path: '/help', icon: HelpCircle, label: 'Help Center' },
      ]
    }
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Simple Static Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">FinanceFlow</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 overflow-y-auto">
          <div className="px-4 space-y-6">
            {menuSections.map((section) => (
              <div key={section.title}>
                {/* Section Title */}
                <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
                
                {/* Section Items */}
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                          isActive(item.path)
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}

export default SimpleSidebar
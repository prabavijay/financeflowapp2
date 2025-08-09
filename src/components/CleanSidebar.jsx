import React, { useState } from 'react'
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
  Menu,
  X
} from 'lucide-react'

const CleanSidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const pathname = location.pathname

  const navigationGroups = [
    {
      id: 'core',
      title: 'Daily Finance',
      items: [
        { path: '/income', icon: TrendingUp, label: 'Income' },
        { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
        { path: '/bills', icon: Receipt, label: 'Bills' },
        { path: '/budget', icon: Calculator, label: 'Budget' },
        { path: '/debts', icon: CreditCard, label: 'Debts' },
        { path: '/credit-loans', icon: CreditCard, label: 'Credit & Loans' },
      ]
    },
    {
      id: 'wealth',
      title: 'Wealth Management',
      items: [
        { path: '/assets', icon: Building2, label: 'Assets' },
        { path: '/insurance', icon: Shield, label: 'Insurance' },
        { path: '/stock-tracker', icon: BarChart, label: 'Stock Tracker' },
        { path: '/retirement-planner', icon: Target, label: 'Retirement Planner' },
        { path: '/estate-planning', icon: FileText, label: 'Estate Planning' },
        { path: '/power-of-attorney', icon: Scale, label: 'Power of Attorney' },
      ]
    },
    {
      id: 'tools',
      title: 'Advanced Tools',
      items: [
        { path: '/debt-reduction', icon: RotateCcw, label: 'Debt Reduction' },
        { path: '/travel-budgets', icon: MapPin, label: 'Travel Budgets' },
        { path: '/fee-tracker', icon: AlertTriangle, label: 'Fee Tracker' },
        { path: '/loan-comparison', icon: Calculator, label: 'Loan Comparison' },
      ]
    },
    {
      id: 'documents',
      title: 'Documents & Data',
      items: [
        { path: '/document-vault', icon: FolderLock, label: 'Document Vault' },
        { path: '/receipt-scanner', icon: Scan, label: 'Receipt Scanner' },
        { path: '/email-receipt-processor', icon: Mail, label: 'Email Receipts' },
        { path: '/subscriptions', icon: Repeat, label: 'Subscriptions & Accounts' },
      ]
    }
  ]

  const isActive = (path) => pathname === path

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Clean Modern Sidebar */}
      <div className={`bg-slate-800 border-r border-slate-700 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-white">
                FinanceFlow
              </h1>
              <p className="text-sm text-slate-400">Personal Finance Manager</p>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
          
          {/* Dashboard */}
          <Link
            to="/"
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
            {!isCollapsed && <span>Dashboard</span>}
          </Link>
          
          {/* Navigation Groups */}
          {navigationGroups.map((section) => (
            <div key={section.id} className="space-y-1">
              {/* Group Header */}
              {!isCollapsed && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                    {section.title}
                  </h3>
                </div>
              )}
              
              {/* Group Items */}
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path) 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
          
          {/* Help Link */}
          <div className="pt-4 mt-4 border-t border-slate-700">
            <Link
              to="/help"
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/help') 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              {!isCollapsed && <span>Help Center</span>}
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-slate-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CleanSidebar
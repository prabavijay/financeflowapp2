import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
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
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react'

const ModernGreenSidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    'core': true, // Daily Finance expanded by default
    'wealth': false,
    'tools': false,
    'documents': false
  })
  
  const { isDarkMode, toggleTheme } = useTheme()
  const location = useLocation()
  const pathname = location.pathname

  const navigationGroups = [
    {
      id: 'core',
      title: 'Daily Finance',
      icon: TrendingUp,
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
      icon: BarChart,
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
      icon: Calculator,
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
      icon: FolderLock,
      items: [
        { path: '/document-vault', icon: FolderLock, label: 'Document Vault' },
        { path: '/receipt-scanner', icon: Scan, label: 'Receipt Scanner' },
        { path: '/email-receipt-processor', icon: Mail, label: 'Email Receipts' },
        { path: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
        { path: '/accounts', icon: Shield, label: 'My Accounts' },
      ]
    }
  ]

  const isActive = (path) => pathname === path

  const toggleSection = (sectionId) => {
    if (!isCollapsed) {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: !prev[sectionId]
      }))
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
    if (isCollapsed) {
      // When expanding, make sure Daily Finance is expanded
      setExpandedSections(prev => ({ ...prev, 'core': true }))
    }
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Modern Sidebar */}
      <div className={`ff-sidebar bg-slate-900 border-r border-slate-800/50 shadow-xl flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
          <div className={`flex items-center gap-3 transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img 
                src="/docs/wallet_logo.png" 
                alt="FinanceFlow Logo" 
                className="w-10 h-10 rounded-xl shadow-lg"
              />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-white font-semibold text-lg">FinanceFlow</h1>
                <p className="text-slate-400 text-xs">Personal Finance Suite</p>
              </div>
            )}
          </div>
          
          {/* Logo in collapsed state */}
          {isCollapsed && (
            <div className="flex-1 flex justify-center">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/docs/wallet_logo.png" 
                  alt="FinanceFlow Logo" 
                  className="w-10 h-10 rounded-xl shadow-lg"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          
          {/* Dashboard */}
          <div className="mb-4">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive('/') 
                  ? 'text-emerald-400 bg-emerald-500/10 border-l-2 border-emerald-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
              title={isCollapsed ? 'Dashboard' : ''}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </div>
          
          {/* Navigation Groups */}
          {navigationGroups.map((section) => {
            const sectionExpanded = expandedSections[section.id]
            const hasActiveItem = section.items.some(item => isActive(item.path))
            const ChevronIcon = sectionExpanded ? ChevronDown : ChevronRight
            
            return (
              <div key={section.id} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    hasActiveItem || sectionExpanded
                      ? 'text-white bg-slate-800/60 border border-slate-700/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                  title={isCollapsed ? section.title : ''}
                >
                  <section.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{section.title}</span>
                      <ChevronIcon className="w-4 h-4 flex-shrink-0" />
                    </>
                  )}
                  {hasActiveItem && (
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  )}
                </button>

                {/* Group Items */}
                {!isCollapsed && sectionExpanded && (
                  <div className="ml-6 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const itemIsActive = isActive(item.path)

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            itemIsActive
                              ? 'text-emerald-400 bg-emerald-500/10 border-l-2 border-emerald-400 font-medium'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-800/50 space-y-3">
          {/* Help Link */}
          <Link
            to="/help"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              isActive('/help')
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
            title={isCollapsed ? 'Help Center' : ''}
          >
            <HelpCircle className="w-4 h-4" />
            {!isCollapsed && <span>Help Center</span>}
          </Link>
          
          {/* Theme Toggle */}
          <div className="pt-2 border-t border-slate-800/50">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/40"
              title={isCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {!isCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-900">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ModernGreenSidebar
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
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Sun,
  Moon
} from 'lucide-react'

const ModernGreenSidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    'core': true,
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
        { path: '/subscriptions', icon: Repeat, label: 'Subscriptions & Accounts' },
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
      // When expanding, make sure first section is expanded
      setExpandedSections(prev => ({ ...prev, 'core': true }))
    }
  }

  // Remove the local toggleDarkMode function since we're using the context

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Modern Sidebar */}
      <div className={`ff-sidebar bg-gradient-to-b from-slate-900 via-gray-900 to-slate-900 border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col relative ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-slate-800/50 backdrop-blur-sm">
          <div className={`flex items-center gap-3 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            {/* Logo - always visible */}
            <div className="flex-shrink-0">
              <img 
                src="/docs/wallet_logo.png" 
                alt="FinanceFlow Logo" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
            
            {/* App name and tagline - only when expanded */}
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">
                  FinanceFlow
                </h1>
                <p className="text-xs text-gray-400 font-medium">Personal Finance Suite</p>
              </div>
            )}
          </div>
          
          {/* Logo in collapsed state */}
          {isCollapsed && (
            <div className="flex-1 flex justify-center">
              <img 
                src="/docs/wallet_logo.png" 
                alt="FinanceFlow Logo" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          
          {/* Dashboard */}
          <div className="mb-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 group relative border ${
                isActive('/') 
                  ? 'border-green-400 text-green-400 bg-green-400/10' 
                  : 'border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 mr-3 flex-shrink-0 transition-all duration-200 ${
                isActive('/') 
                  ? 'text-green-400' 
                  : 'text-gray-400 group-hover:text-green-400'
              }`} />
              
              {!isCollapsed && (
                <span className="transition-all duration-300 group-hover:translate-x-1">Dashboard</span>
              )}
            </Link>
          </div>
          
          {/* Navigation Groups */}
          {navigationGroups.map((section, sectionIndex) => {
            const sectionExpanded = expandedSections[section.id]
            
            return (
              <div key={section.id} className="mb-4">
                {/* Group Separator */}
                {sectionIndex > 0 && (
                  <div className="my-4 border-t border-gray-700/50"></div>
                )}
                
                {/* Group Header - Clickable and Collapsible */}
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-3 mb-2 rounded-lg hover:bg-gray-700/30 transition-all duration-200 group"
                  >
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      sectionExpanded ? 'rotate-180' : ''
                    }`} />
                  </button>
                )}
                
                {/* Section Items - Collapsible */}
                <div className={`space-y-1 transition-all duration-300 overflow-hidden ${
                  !isCollapsed && sectionExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 group relative border ${
                          isActive(item.path) 
                            ? 'border-green-400 text-green-400 bg-green-400/10' 
                            : 'border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-3 flex-shrink-0 transition-all duration-200 ${
                          isActive(item.path) 
                            ? 'text-green-400' 
                            : 'text-gray-400 group-hover:text-green-400'
                        }`} />
                        
                        {!isCollapsed && (
                          <span className="transition-all duration-300 group-hover:translate-x-1">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          {/* Help Link */}
          <div className="pt-4 mt-4 border-t border-gray-700/50">
            <Link
              to="/help"
              className={`flex items-center px-3 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 group relative border ${
                isActive('/help') 
                  ? 'border-green-400 text-green-400 bg-green-400/10' 
                  : 'border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400'
              }`}
            >
              <HelpCircle className={`w-4 h-4 mr-3 flex-shrink-0 transition-all duration-200 ${
                isActive('/help') 
                  ? 'text-green-400' 
                  : 'text-gray-400 group-hover:text-green-400'
              }`} />
              
              {!isCollapsed && (
                <span className="transition-all duration-300 group-hover:translate-x-1">Help Center</span>
              )}
            </Link>
          </div>

          {/* Dark/Light Mode Switcher */}
          <div className="pt-4 mt-4 border-t border-gray-700/50">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center px-3 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 group relative border ${
                'border-gray-600 text-gray-300 hover:border-emerald-400 hover:text-emerald-400'
              }`}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 mr-3 flex-shrink-0 transition-all duration-200 text-gray-400 group-hover:text-emerald-400" />
              ) : (
                <Moon className="w-4 h-4 mr-3 flex-shrink-0 transition-all duration-200 text-gray-400 group-hover:text-emerald-400" />
              )}
              
              {!isCollapsed && (
                <span className="transition-all duration-300 group-hover:translate-x-1">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </button>
          </div>
        </nav>
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
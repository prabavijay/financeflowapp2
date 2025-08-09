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
  X,
  ChevronDown,
  Search,
  Bell,
  Settings,
  User
} from 'lucide-react'

const TopNavLayout = ({ children }) => {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const pathname = location.pathname

  const navigationGroups = [
    {
      id: 'core',
      title: 'Daily Finance',
      icon: TrendingUp,
      color: 'blue',
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
      color: 'purple',
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
      color: 'green',
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
      color: 'orange',
      items: [
        { path: '/document-vault', icon: FolderLock, label: 'Document Vault' },
        { path: '/receipt-scanner', icon: Scan, label: 'Receipt Scanner' },
        { path: '/email-receipt-processor', icon: Mail, label: 'Email Receipts' },
        { path: '/subscriptions', icon: Repeat, label: 'Subscriptions & Accounts' },
      ]
    }
  ]

  const isActive = (path) => pathname === path
  
  const isGroupActive = (group) => {
    return group.items.some(item => isActive(item.path))
  }


  const getColorClasses = (color, isActive = false) => {
    const colors = {
      blue: {
        bg: isActive ? 'bg-transparent border border-blue-500' : 'hover:bg-transparent hover:border-blue-500/50 border border-transparent',
        text: 'text-blue-400',
        border: 'border-blue-500',
        ring: 'ring-blue-500/20'
      },
      purple: {
        bg: isActive ? 'bg-transparent border border-purple-500' : 'hover:bg-transparent hover:border-purple-500/50 border border-transparent',
        text: 'text-purple-400',
        border: 'border-purple-500',
        ring: 'ring-purple-500/20'
      },
      green: {
        bg: isActive ? 'bg-transparent border border-emerald-500' : 'hover:bg-transparent hover:border-emerald-500/50 border border-transparent',
        text: 'text-emerald-400',
        border: 'border-emerald-500',
        ring: 'ring-emerald-500/20'
      },
      orange: {
        bg: isActive ? 'bg-transparent border border-orange-500' : 'hover:bg-transparent hover:border-orange-500/50 border border-transparent',
        text: 'text-orange-400',
        border: 'border-orange-500',
        ring: 'ring-orange-500/20'
      }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    FinanceFlow
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">Personal Finance Suite</p>
                </div>
              </Link>
            </div>

            {/* Main Navigation Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Dashboard Link */}
              <Link
                to="/"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-blue-600 text-white shadow-lg scale-105' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>

              {/* Navigation Groups */}
              {navigationGroups.map((group) => {
                const GroupIcon = group.icon
                const isGroupActiveState = isGroupActive(group)
                const colorClasses = getColorClasses(group.color, isGroupActiveState)
                
                return (
                  <div 
                    key={group.id} 
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(group.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        isGroupActiveState || activeDropdown === group.id
                          ? `${colorClasses.bg} ${colorClasses.text} shadow-lg`
                          : `text-gray-300 hover:text-white hover:bg-gray-700/60`
                      }`}
                    >
                      <GroupIcon className="w-4 h-4 mr-2" />
                      {group.title}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        activeDropdown === group.id ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === group.id && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                        <div className="py-2">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon
                            const itemColorClasses = getColorClasses(group.color, isActive(item.path))
                            
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeDropdowns}
                                className={`flex items-center px-4 py-3 text-sm transition-all duration-200 ${
                                  isActive(item.path)
                                    ? `${itemColorClasses.bg} ${itemColorClasses.text} shadow-md mx-2 rounded-lg`
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                              >
                                <ItemIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                                <span className="font-medium">{item.label}</span>
                                {isActive(item.path) && (
                                  <div className="w-2 h-2 bg-current rounded-full ml-auto animate-pulse"></div>
                                )}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-48"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              {/* Help */}
              <Link
                to="/help"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </Link>

              {/* User Profile */}
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>


        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-4">
              
              {/* Mobile Dashboard Link */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </Link>

              {/* Mobile Navigation Groups */}
              {navigationGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span>{item.label}</span>
                        {isActive(item.path) && (
                          <div className="w-2 h-2 bg-blue-300 rounded-full ml-auto animate-pulse"></div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              ))}

              {/* Mobile Help Link */}
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <HelpCircle className="w-4 h-4 mr-3" />
                Help Center
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default TopNavLayout
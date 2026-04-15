import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Building2,
  Calculator,
  Shield,
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
  Moon,
  Search,
  Bell,
  Landmark,
  LogOut,
  User
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
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
      setExpandedSections(prev => ({ ...prev, 'core': true }))
    }
  }

  // Get current page title for breadcrumb
  const getCurrentPageTitle = () => {
    if (pathname === '/') return 'Dashboard'
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (item.path === pathname) return item.label
      }
    }
    if (pathname === '/help') return 'Help Center'
    return 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-[#1e293b]">
      {/* Sidebar */}
      <div className={`ff-sidebar bg-gradient-to-b from-[#2a3a52] via-[#253348] to-[#1f2c3e] border-r border-[rgba(140,170,220,0.12)] shadow-xl flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(100,150,255,0.08)]">
          <div className={`flex items-center gap-3 transition-opacity duration-200 ${
            isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">FinanceFlow</h1>
                <p className="text-slate-500 text-xs">Personal Finance Suite</p>
              </div>
            )}
          </div>

          {/* Logo in collapsed state */}
          {isCollapsed && (
            <div className="flex-1 flex justify-center">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg shadow-cyan-500/20">
                <Landmark className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[rgba(100,150,255,0.06)] text-slate-400 hover:text-white transition-all duration-200 hover:scale-105 flex-shrink-0"
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
                  ? 'text-cyan-400 bg-cyan-500/12 border-l-[3px] border-cyan-400'
                  : 'text-slate-400 hover:text-white hover:bg-[rgba(100,150,255,0.06)]'
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
                      ? 'text-white bg-[rgba(100,150,255,0.08)] border border-[rgba(100,150,255,0.1)]'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-[rgba(100,150,255,0.05)]'
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
                    <div className="w-2 h-2 bg-cyan-400 rounded-full" />
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
                              ? 'text-cyan-400 bg-cyan-500/12 border-l-[3px] border-cyan-400 font-medium'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(100,150,255,0.06)]'
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
        <div className="p-3 border-t border-[rgba(100,150,255,0.08)] space-y-3">
          {/* Help Link */}
          <Link
            to="/help"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              isActive('/help')
                ? 'text-cyan-400 bg-cyan-500/10'
                : 'text-slate-500 hover:text-slate-200 hover:bg-[rgba(100,150,255,0.06)]'
            }`}
            title={isCollapsed ? 'Help Center' : ''}
          >
            <HelpCircle className="w-4 h-4" />
            {!isCollapsed && <span>Help Center</span>}
          </Link>

          {/* Theme Toggle */}
          <div className="pt-2 border-t border-[rgba(100,150,255,0.08)]">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 text-slate-500 hover:text-white hover:bg-[rgba(100,150,255,0.06)]"
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
        {/* Top Navigation Bar */}
        <div className="h-14 bg-gradient-to-r from-[#2a3a52] to-[#253348] border-b border-[rgba(140,170,220,0.12)] flex items-center justify-between px-6 flex-shrink-0">
          {/* Left: Breadcrumb + User */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium gradient-text-primary">
              Welcome{user?.name ? `, ${user.name}` : ''}
            </span>
            <span className="text-slate-600">—</span>
            <span className="text-sm text-slate-400">{getCurrentPageTitle()}</span>
            {user?.email && (
              <>
                <span className="text-slate-600">|</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </>
            )}
          </div>

          {/* Right: Status + Search + Toggle + Notifications */}
          <div className="flex items-center gap-4">
            {/* Status badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-400">Online</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="w-48 h-8 pl-9 pr-3 rounded-lg bg-[rgba(30,41,59,0.5)] border border-[rgba(100,150,255,0.1)] text-sm text-slate-300 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none backdrop-blur-sm"
                placeholder="Search..."
              />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[rgba(100,150,255,0.06)] text-slate-400 hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification bell */}
            <button className="p-2 rounded-lg hover:bg-[rgba(100,150,255,0.06)] text-slate-400 hover:text-white relative transition-colors">
              <Bell className="w-4 h-4" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
            </button>

            {/* User avatar + Logout */}
            <div className="flex items-center gap-2 ml-1 pl-3 border-l border-[rgba(100,150,255,0.1)]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-auto bg-[#1e293b]">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ModernGreenSidebar

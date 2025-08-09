import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  Building2, 
  Calculator, 
  Target, 
  Banknote, 
  Shield, 
  Settings,
  HelpCircle,
  PiggyBank,
  BarChart,
  RotateCcw,
  MapPin,
  AlertTriangle,
  FolderLock,
  Wrench,
  DollarSign,
  FileText,
  Scan,
  Mail,
  Users,
  Scale,
  X
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useProfile } from '../contexts/ProfileContext'
import ThemeToggle from './ThemeToggle'

const Layout = ({ children }) => {
  const { selectedProfile, setSelectedProfile } = useProfile()
  const location = useLocation()
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  // Profile selection state
  const profileOptions = ["Personal", "Spouse", "Family"]

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close panel when route changes
  useEffect(() => {
    setSelectedGroup(null)
  }, [location.pathname])

  const selectGroup = (groupKey) => {
    setSelectedGroup(prev => prev === groupKey ? null : groupKey)
  }

  const closePanel = () => {
    setSelectedGroup(null)
  }

  // Reorganized by logical financial workflow groups
  const navigationGroups = {
    overview: {
      title: 'Overview',
      icon: LayoutDashboard,
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Family Dashboard', href: '/family-dashboard', icon: Users },
      ]
    },
    core: {
      title: 'Core Finances',
      icon: DollarSign,
      items: [
        { name: 'Income', href: '/income', icon: TrendingUp },
        { name: 'Bills', href: '/bills', icon: Receipt },
        { name: 'Expenses', href: '/expenses', icon: TrendingDown },
        { name: 'Budget', href: '/budget', icon: Calculator },
      ]
    },
    debt: {
      title: 'Debt Management',
      icon: CreditCard,
      items: [
        { name: 'Debts', href: '/debts', icon: CreditCard },
        { name: 'Credit & Loans', href: '/credit-loans', icon: Banknote },
        { name: 'Debt Payoff', href: '/debt-reduction', icon: Target },
        { name: 'Loan Comparison', href: '/loan-comparison', icon: Calculator },
      ]
    },
    services: {
      title: 'Services & Accounts',
      icon: RotateCcw,
      items: [
        { name: 'Subscriptions', href: '/subscriptions', icon: RotateCcw },
        { name: 'My Accounts', href: '/accounts', icon: Settings },
      ]
    },
    wealth: {
      title: 'Wealth Building',
      icon: TrendingUp,
      items: [
        { name: 'Assets', href: '/assets', icon: Building2 },
        { name: 'Investments', href: '/stock-tracker', icon: BarChart },
        { name: 'Retirement', href: '/retirement-planner', icon: PiggyBank },
        { name: 'Insurance', href: '/insurance', icon: Shield },
      ]
    },
    tools: {
      title: 'Smart Tools',
      icon: Wrench,
      items: [
        { name: 'Receipt Scanner', href: '/receipt-scanner', icon: Scan },
        { name: 'Email Receipts', href: '/email-receipt-processor', icon: Mail },
        { name: 'Travel Budgets', href: '/travel-budgets', icon: MapPin },
        { name: 'Document Vault', href: '/document-vault', icon: FolderLock },
        { name: 'Fee Tracker', href: '/fee-tracker', icon: AlertTriangle },
        { name: 'Legal Documents', href: '/estate-planning', icon: FileText },
        { name: 'Power of Attorney', href: '/power-of-attorney', icon: Scale },
      ]
    }
  }

  const bottomNavigation = [
    { name: 'Help & Support', href: '/help', icon: HelpCircle },
  ]

  const renderSlideOutPanel = () => {
    if (!selectedGroup || !navigationGroups[selectedGroup]) return null
    
    const group = navigationGroups[selectedGroup]
    
    return (
      <>
        {/* Backdrop for mobile */}
        {isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closePanel}
          />
        )}
        
        {/* Slide-out Panel */}
        <div className="fixed left-16 top-0 h-full w-64 bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out z-40">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{group.title}</h3>
              <button 
                onClick={closePanel}
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="py-2">
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border bg-transparent hover:bg-transparent ${
                    isActive
                      ? 'text-emerald-400 border-emerald-500/70'
                      : 'text-gray-300 border-transparent hover:text-emerald-400 hover:border-emerald-500/50'
                  }`}
                  onClick={closePanel}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar
        navigationGroups={navigationGroups}
        selectedGroup={selectedGroup}
        onGroupSelect={selectGroup}
        bottomNavigation={bottomNavigation}
        pathname={location.pathname}
      />

      {/* Slide-out Panel */}
      {renderSlideOutPanel()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={() => setSelectedGroup(selectedGroup ? null : 'daily')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-6 h-6" />
                </button>
              )}
              <h2 className="text-2xl font-semibold text-white">
                {(() => {
                  // Find current page name from all navigation groups
                  const allItems = Object.values(navigationGroups).flatMap(group => group.items).concat(bottomNavigation)
                  return allItems.find(item => item.href === location.pathname)?.name || 'Finance Flow'
                })()} <span className="ml-2 text-base font-medium text-purple-300">({selectedProfile})</span>
              </h2>
              {/* Profile Tabs */}
              <div className="flex gap-2 mt-2 sm:mt-0">
                {profileOptions.map((profile) => (
                  <button
                    key={profile}
                    onClick={() => setSelectedProfile(profile)}
                    className={`px-4 py-1.5 rounded-lg font-semibold border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm shadow-sm bg-transparent hover:bg-transparent ${
                      selectedProfile === profile
                        ? 'text-emerald-400 border-emerald-500/70 scale-105'
                        : 'text-gray-300 border-emerald-500/30 hover:text-emerald-400 hover:border-emerald-500/60'
                    }`}
                    style={{ minWidth: 90 }}
                  >
                    {profile}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">
                Backend: <span className="font-medium text-purple-400">Connected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
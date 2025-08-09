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
  ChevronRight,
  ChevronDown
} from 'lucide-react'

const ModernSidebar = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    'dashboard': true,
    'core': true,
    'wealth': false,
    'tools': false,
    'documents': false,
    'legal': false,
    'support': false
  })
  const location = useLocation()
  const pathname = location.pathname

  const menuSections = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      items: [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      ]
    },
    {
      id: 'core',
      title: 'Core Finance',
      icon: TrendingUp,
      items: [
        { path: '/income', icon: TrendingUp, label: 'Income' },
        { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
        { path: '/bills', icon: Receipt, label: 'Bills' },
        { path: '/budget', icon: Calculator, label: 'Budget' },
      ]
    },
    {
      id: 'wealth',
      title: 'Wealth Management',
      icon: BarChart,
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
      id: 'tools',
      title: 'Advanced Tools',
      icon: Calculator,
      items: [
        { path: '/debt-reduction', icon: RotateCcw, label: 'Debt Reduction' },
        { path: '/subscriptions', icon: Repeat, label: 'Subscriptions' },
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
        { path: '/accounts', icon: PiggyBank, label: 'Accounts' },
      ]
    },
    {
      id: 'legal',
      title: 'Legal & Planning',
      icon: Scale,
      items: [
        { path: '/estate-planning', icon: FileText, label: 'Estate Planning' },
        { path: '/power-of-attorney', icon: Scale, label: 'Power of Attorney' },
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: HelpCircle,
      items: [
        { path: '/help', icon: HelpCircle, label: 'Help Center' },
      ]
    }
  ]

  const isActive = (path) => pathname === path

  const isSectionActive = (section) => {
    return section.items.some(item => isActive(item.path))
  }

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Modern Collapsible Sidebar */}
      <div className={`bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? 'w-72' : 'w-16'
      }`}>
        
        {/* Header with Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FinanceFlow
                </h1>
                <div className="text-xs text-green-400 font-bold">Personal Finance Suite</div>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white transition-colors duration-200"
          >
            {isExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {menuSections.map((section) => {
              const SectionIcon = section.icon
              const sectionIsActive = isSectionActive(section)
              const sectionExpanded = expandedSections[section.id]
              
              return (
                <div key={section.id}>
                  {/* Section Header */}
                  <button
                    onClick={() => isExpanded && toggleSection(section.id)}
                    className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 group ${
                      sectionIsActive
                        ? 'bg-gray-800/40 text-gray-100 border-r-2 border-gray-500'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <SectionIcon className="w-5 h-5 flex-shrink-0" />
                    
                    {isExpanded && (
                      <>
                        <span className="ml-3 text-sm font-medium flex-1">
                          {section.title}
                        </span>
                        {section.items.length > 1 && (
                          <div className="transition-transform duration-200">
                            {sectionExpanded ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                          </div>
                        )}
                      </>
                    )}
                    
                    {!isExpanded && sectionIsActive && (
                      <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {section.title}
                      </div>
                    )}
                  </button>

                  {/* Section Items */}
                  {isExpanded && sectionExpanded && (
                    <div className="ml-4 space-y-1 border-l-2 border-gray-700">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-4 py-2 ml-2 text-sm rounded-r-lg transition-all duration-200 group ${
                              isActive(item.path)
                                ? 'bg-gray-700 text-white shadow-lg shadow-gray-700/25'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* Collapsed Section - Single Item Quick Access */}
                  {!isExpanded && section.items.length === 1 && (
                    <Link
                      href={section.items[0].path}
                      className={`block px-4 py-2 text-center transition-colors duration-200 group relative ${
                        isActive(section.items[0].path)
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {section.items[0].label}
                      </div>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {isExpanded ? (
            <div className="text-xs text-gray-500 text-center">
              <div className="font-medium">FinanceFlow v2.0</div>
              <div>Modern Financial Management</div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
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

export default ModernSidebar
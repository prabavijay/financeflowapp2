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

const CleanModernSidebar = ({ children }) => {
  // CRITICAL: Green theme must be visible - FORCE RENDER v3.0
  // Inject modern glassmorphism CSS
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
      }
      
      .fancy-sidebar {
        background: linear-gradient(135deg, 
          rgba(15, 23, 42, 0.95) 0%, 
          rgba(30, 41, 59, 0.98) 50%, 
          rgba(15, 23, 42, 0.95) 100%) !important;
        backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(148, 163, 184, 0.1) !important;
        box-shadow: 
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
      }
      
      .fancy-header {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.15) 0%, 
          rgba(147, 51, 234, 0.15) 100%) !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(59, 130, 246, 0.2) !important;
        box-shadow: 
          0 4px 15px rgba(59, 130, 246, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
      
      .fancy-brand {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4) !important;
        -webkit-background-clip: text !important;
        background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        animation: shimmer 3s infinite linear !important;
        background-size: 200% 100% !important;
      }
      
      .section-header {
        background: transparent !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border-radius: 12px !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .section-header:hover {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.1) 0%, 
          rgba(147, 51, 234, 0.1) 100%) !important;
        transform: translateX(4px) scale(1.02) !important;
        box-shadow: 
          0 8px 25px rgba(59, 130, 246, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
      
      .section-header.active {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.2) 0%, 
          rgba(147, 51, 234, 0.2) 100%) !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
        animation: pulse-glow 2s infinite !important;
      }
      
      .menu-link {
        background: transparent !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border-radius: 10px !important;
        position: relative !important;
        overflow: hidden !important;
        margin: 2px 0 !important;
      }
      
      .menu-link::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(59, 130, 246, 0.4), 
          transparent) !important;
        transition: left 0.6s ease !important;
      }
      
      .menu-link:hover {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.15) 0%, 
          rgba(147, 51, 234, 0.1) 100%) !important;
        transform: translateX(6px) !important;
        box-shadow: 
          0 8px 25px rgba(59, 130, 246, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        border-left: 3px solid rgba(59, 130, 246, 0.8) !important;
      }
      
      .menu-link:hover::before {
        left: 100% !important;
      }
      
      .menu-link.active {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.25) 0%, 
          rgba(147, 51, 234, 0.2) 100%) !important;
        border: 1px solid rgba(59, 130, 246, 0.4) !important;
        box-shadow: 
          0 8px 30px rgba(59, 130, 246, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
        transform: translateX(4px) !important;
      }
      
      .dashboard-link {
        background: linear-gradient(135deg, 
          rgba(34, 197, 94, 0.1) 0%, 
          rgba(59, 130, 246, 0.1) 100%) !important;
        border: 1px solid rgba(34, 197, 94, 0.2) !important;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border-radius: 12px !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .dashboard-link:hover {
        background: linear-gradient(135deg, 
          rgba(34, 197, 94, 0.2) 0%, 
          rgba(59, 130, 246, 0.2) 100%) !important;
        transform: translateX(6px) scale(1.02) !important;
        box-shadow: 
          0 12px 35px rgba(34, 197, 94, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      }
      
      .connection-line {
        background: linear-gradient(180deg, 
          rgba(59, 130, 246, 0.6), 
          rgba(147, 51, 234, 0.4)) !important;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.4) !important;
      }
      
      .connection-dot {
        background: linear-gradient(45deg, #3b82f6, #8b5cf6) !important;
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.6) !important;
        animation: pulse 2s infinite !important;
      }
      
      .fancy-footer {
        background: linear-gradient(135deg, 
          rgba(15, 23, 42, 0.8) 0%, 
          rgba(30, 41, 59, 0.9) 100%) !important;
        backdrop-filter: blur(10px) !important;
        border-top: 1px solid rgba(59, 130, 246, 0.2) !important;
        box-shadow: 
          0 -4px 15px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
      }
      
      .toggle-button {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.2) 0%, 
          rgba(147, 51, 234, 0.2) 100%) !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
        transition: all 0.3s ease !important;
        border-radius: 8px !important;
      }
      
      .toggle-button:hover {
        background: linear-gradient(135deg, 
          rgba(59, 130, 246, 0.3) 0%, 
          rgba(147, 51, 234, 0.3) 100%) !important;
        transform: scale(1.1) !important;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])
  const [isExpanded, setIsExpanded] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    'core': true,
    'wealth': false,
    'tools': false,
    'documents': false,
    'support': false
  })
  const location = useLocation()
  const pathname = location.pathname

  const menuSections = [
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
      {/* NEW Clean Sidebar */}
      <div className={`bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col ${
        isExpanded ? 'w-72' : 'w-16'
      }`} key="sidebar-forced-refresh-green-theme">
        
        {/* Header with Toggle - KEEPING THE DESIGN YOU LIKE */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={`transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            {isExpanded && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 via-green-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                  FinanceFlow
                </h1>
                <div className="text-xs text-green-400 font-bold tracking-wide">Personal Finance Suite</div>
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

        {/* Navigation - RESTORED ORIGINAL GROUPING WITH FANCY STYLING */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-2">
            {/* Dashboard - Standalone Item */}
            <div className="px-3">
              <Link
                to="/"
                className={`flex items-center px-3 py-3 text-sm rounded-xl transition-all duration-300 transform group ${
                  isActive('/') 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50 scale-[1.05] ring-4 ring-green-400/50 border-2 border-green-300' 
                    : 'text-gray-300 hover:bg-slate-700/60 hover:text-white hover:scale-[1.01] hover:shadow-lg hover:shadow-slate-500/10'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-3 flex-shrink-0" />
                {isExpanded && <span className="font-medium">Dashboard</span>}
              </Link>
            </div>
            
            {menuSections.map((section) => {
              const SectionIcon = section.icon
              const sectionIsActive = isSectionActive(section)
              const sectionExpanded = expandedSections[section.id]
              
              return (
                <div key={section.id} className="px-3">
                  {/* Section Header - Collapsible */}
                  <div
                    onClick={() => isExpanded && toggleSection(section.id)}
                    className={`cursor-pointer w-full flex items-center justify-between px-3 py-3 text-left text-sm font-bold rounded-lg transition-all duration-300 transform group mb-2 ${
                      sectionIsActive 
                        ? 'bg-green-600/20 text-white shadow-md border-l-4 border-green-400 ring-1 ring-green-400/30' 
                        : 'text-gray-300 hover:bg-slate-700/30 hover:text-white hover:border-l-4 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <SectionIcon className={`w-4 h-4 flex-shrink-0 ${sectionIsActive ? 'text-green-400' : 'text-gray-400'}`} />
                      {isExpanded && (
                        <span className="ml-3 text-xs uppercase tracking-widest font-bold">
                          {section.title}
                        </span>
                      )}
                    </div>
                    
                    {isExpanded && section.items.length > 1 && (
                      <div className="transition-transform duration-300">
                        {sectionExpanded ? 
                          <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    )}
                  </div>

                  {/* Section Items - Collapsible */}
                  {isExpanded && sectionExpanded && (
                    <div className="mt-1 space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-3 py-3 text-sm rounded-xl transition-all duration-300 transform group relative overflow-hidden ${
                              isActive(item.path) 
                                ? 'bg-green-600 text-white shadow-xl shadow-green-500/60 scale-[1.05] border-2 border-green-300 ring-4 ring-green-400/40 glow-green' 
                                : 'text-gray-300 hover:bg-slate-700/60 hover:text-white hover:scale-[1.01] hover:shadow-md hover:shadow-slate-500/10 hover:border hover:border-slate-600/20'
                            }`}
                          >
                            {/* Animated background shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                            
                            <div className="flex items-center z-10 relative">
                              <Icon className={`w-4 h-4 mr-3 flex-shrink-0 transition-all duration-300 ${
                                isActive(item.path) 
                                  ? 'text-white drop-shadow-sm' 
                                  : 'group-hover:text-green-300 group-hover:drop-shadow-sm'
                              }`} />
                              <span className="font-medium">{item.label}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2 z-10 relative">
                              {/* Badge with enhanced styling */}
                              {item.badge && (
                                <span className={`${item.badge.color} text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[20px] text-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                                  isActive(item.path) ? 'ring-2 ring-white/30' : ''
                                }`}>
                                  {item.badge.text}
                                </span>
                              )}
                              
                              {/* Stat with enhanced styling */}
                              {item.stat && (
                                <span className={`text-sm font-medium transition-colors duration-300 ${
                                  isActive(item.path) 
                                    ? 'text-green-100' 
                                    : 'text-gray-400 group-hover:text-gray-200'
                                }`}>
                                  {item.stat}
                                </span>
                              )}
                              
                              {/* Active indicator */}
                              {isActive(item.path) && (
                                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-sm shadow-green-300/50"></div>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
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

export default CleanModernSidebar
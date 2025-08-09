import React, { useState, useEffect } from 'react'
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
  Settings,
  X,
  DollarSign,
  Wrench,
  MapPin,
  AlertTriangle,
  FolderLock,
  Scan,
  Mail,
  FileText,
  Scale,
  HelpCircle,
  Banknote,
  Target
} from 'lucide-react'

const CleanLayout = ({ children, currentPath = '/' }) => {
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

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
  }, [currentPath])

  const selectGroup = (groupKey) => {
    setSelectedGroup(prev => prev === groupKey ? null : groupKey)
  }

  const closePanel = () => {
    setSelectedGroup(null)
  }

  const handleNavigation = (href) => {
    if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }

  // Reorganized by logical financial workflow groups
  const navigationGroups = {
    overview: {
      title: 'Overview',
      icon: LayoutDashboard,
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
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
        <div className="slide-out-panel fixed left-16 top-0 h-full w-64 bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out z-40">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{group.title}</h3>
              <div 
                onClick={closePanel}
                style={{
                  padding: '6px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff'
                  e.currentTarget.style.backgroundColor = '#374151'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af'
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
              
              return (
                <div
                  key={item.name}
                  onClick={() => {
                    handleNavigation(item.href)
                    closePanel()
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    color: isActive ? '#ffffff' : '#d1d5db',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderRight: isActive ? '2px solid #a855f7' : 'none',
                    backgroundColor: isActive ? '#374151' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#d1d5db'
                    }
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        /* NUCLEAR CSS OVERRIDE - Remove ALL green backgrounds and box styling */
        * {
          box-sizing: border-box;
        }
        
        /* Target ANY element that might have green background */
        *[style*="emerald"],
        *[style*="green"],
        *[style*="rgb(16, 185, 129)"],
        *[style*="rgb(5, 150, 105)"],
        *[style*="#10b981"],
        *[style*="#059669"],
        .bg-emerald-500,
        .bg-emerald-600,
        .bg-emerald-700,
        .bg-green-500,
        .bg-green-600,
        .bg-green-700,
        button[class*="bg-emerald"],
        button[class*="bg-green"],
        div[class*="bg-emerald"],
        div[class*="bg-green"] {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        
        /* Force slide-out panel buttons to be clean */
        .slide-out-panel,
        .slide-out-panel *,
        .slide-out-panel button,
        .slide-out-panel button *,
        .slide-out-panel div,
        .slide-out-panel div * {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        /* Clean button reset */
        .clean-button {
          all: unset !important;
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          padding: 12px 16px !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
          background: transparent !important;
          color: #d1d5db !important;
          font-size: 14px !important;
          font-weight: 500 !important;
        }
        
        .clean-button:hover {
          background-color: rgba(55, 65, 81, 0.5) !important;
          color: #ffffff !important;
        }
        
        .clean-button.active {
          background-color: #374151 !important;
          color: #ffffff !important;
          border-right: 2px solid #a855f7 !important;
        }
      `}</style>
      <div className="flex h-screen bg-gray-900">
      {/* Icon Sidebar */}
      <div style={{
        width: '64px',
        background: '#1f2937', // Dark gray sidebar
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 50
      }}>
        {/* Logo */}
        <div className="p-3 flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">F</span>
          </div>
        </div>

        {/* Group Icons */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {Object.entries(navigationGroups).map(([groupKey, group]) => {
            const GroupIcon = group.icon
            const hasActiveItem = group.items.some(item => {
              if (item.href === '/') {
                return currentPath === '/'
              }
              return currentPath.startsWith(item.href)
            })
            const isSelected = selectedGroup === groupKey

            return (
              <button
                key={groupKey}
                onClick={() => selectGroup(groupKey)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  background: (isSelected || hasActiveItem) ? '#8b5cf6 !important' : 'transparent !important',
                  backgroundColor: (isSelected || hasActiveItem) ? '#8b5cf6 !important' : 'transparent !important',
                  backgroundImage: 'none !important',
                  color: (isSelected || hasActiveItem) ? '#ffffff !important' : '#9ca3af !important',
                  cursor: 'pointer',
                  border: 'none !important',
                  boxShadow: (isSelected || hasActiveItem) ? '0 4px 12px rgba(139, 92, 246, 0.3) !important' : 'none !important'
                }}
                className=""
                onMouseEnter={(e) => {
                  if (!(isSelected || hasActiveItem)) {
                    e.currentTarget.style.setProperty('background', '#374151', 'important')
                    e.currentTarget.style.setProperty('background-color', '#374151', 'important')
                    e.currentTarget.style.setProperty('background-image', 'none', 'important')
                    e.currentTarget.style.setProperty('color', '#ffffff', 'important')
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(isSelected || hasActiveItem)) {
                    e.currentTarget.style.setProperty('background', 'transparent', 'important')
                    e.currentTarget.style.setProperty('background-color', 'transparent', 'important')
                    e.currentTarget.style.setProperty('background-image', 'none', 'important')
                    e.currentTarget.style.setProperty('color', '#9ca3af', 'important')
                  }
                }}
                title={group.title}
              >
                <GroupIcon className="w-5 h-5" />
                {hasActiveItem && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                )}
              </button>
            )
          })}
          
          {/* Bottom Navigation Icons */}
          <div className="pt-3 mt-3 border-t border-gray-700 space-y-1">
            {bottomNavigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    background: isActive ? '#8b5cf6' : 'transparent',
                    color: isActive ? '#ffffff' : '#9ca3af',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#374151'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#9ca3af'
                    }
                  }}
                  title={item.name}
                >
                  <Icon className="w-5 h-5" />
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Slide-out Panel */}
      {renderSlideOutPanel()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header removed - cleaner page layout */}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-900 main-content-area">
          {children}
        </main>
      </div>
      </div>
    </>
  )
}

export default CleanLayout
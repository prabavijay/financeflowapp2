import React, { useState } from 'react'
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
  PiggyBank,
  BarChart,
  RotateCcw,
  MapPin,
  AlertTriangle,
  FolderLock,
  Scan,
  Mail,
  Users,
  Scale,
  Sun,
  Moon,
  FileText
} from 'lucide-react'

const LayoutNextJS = ({ children, currentPath = '/' }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark')
    }
  }

  const handleNavigation = (href) => {
    if (typeof window !== 'undefined') {
      window.location.href = href
    }
  }

  const menuItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Income', href: '/income', icon: TrendingUp },
    { name: 'Expenses', href: '/expenses', icon: TrendingDown },
    { name: 'Bills', href: '/bills', icon: Receipt },
    { name: 'Budget', href: '/budget', icon: Calculator },
    { name: 'Debts', href: '/debts', icon: CreditCard },
    { name: 'Assets', href: '/assets', icon: Building2 },
    { name: 'Investments', href: '/stock-tracker', icon: BarChart },
    { name: 'Retirement', href: '/retirement-planner', icon: PiggyBank },
    { name: 'Insurance', href: '/insurance', icon: Shield },
    { name: 'Credit & Loans', href: '/credit-loans', icon: Banknote },
    { name: 'Subscriptions', href: '/subscriptions', icon: RotateCcw },
    { name: 'Travel Budgets', href: '/travel-budgets', icon: MapPin },
    { name: 'Document Vault', href: '/document-vault', icon: FolderLock },
    { name: 'Receipt Scanner', href: '/receipt-scanner', icon: Scan },
    { name: 'Email Receipts', href: '/email-receipt-processor', icon: Mail },
    { name: 'Fee Tracker', href: '/fee-tracker', icon: AlertTriangle },
    { name: 'Loan Comparison', href: '/loan-comparison', icon: Calculator },
    { name: 'Debt Payoff', href: '/debt-reduction', icon: Target },
    { name: 'My Account', href: '/accounts', icon: Settings },
    { name: 'Family Access', href: '/family-dashboard', icon: Users },
    { name: 'Legal Documents', href: '/estate-planning', icon: FileText },
    { name: 'Power of Attorney', href: '/power-of-attorney', icon: Scale },
  ]

  const isActive = (href) => {
    if (href === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(href)
  }

  // Force dark theme
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
    document.body.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <div className="flex h-screen" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #0c1420 50%, #0f172a 100%)',
      minHeight: '100vh'
    }}>
      {/* Simple Sidebar */}
      <div className="sidebar" style={{
        width: '280px',
        background: '#1e293b',
        borderRight: '1px solid #475569',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #475569',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            F
          </div>
          <span style={{
            color: '#f1f5f9',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Finance Flow
          </span>
        </div>

        {/* Menu Items */}
        <nav style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto'
        }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const itemIsActive = isActive(item.href)
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                data-active={itemIsActive}
                className="nav-menu-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: itemIsActive ? '#3b82f6' : '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: itemIsActive ? '600' : '400',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!itemIsActive) {
                    e.currentTarget.style.color = '#3b82f6'
                    e.currentTarget.style.background = '#334155'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!itemIsActive) {
                    e.currentTarget.style.color = '#e2e8f0'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Theme Toggle */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #475569'
        }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              width: '100%',
              textAlign: 'left'
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>Toggle Theme</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className={`flex-1 overflow-auto p-6 ${isDarkMode ? 'page-container dark' : 'page-container'}`}>
          {children}
        </main>
      </div>

      {/* Override green/emerald CSS for SIDEBAR ONLY */}
      <style jsx global>{`
        /* Force remove green backgrounds from SIDEBAR ONLY */
        .sidebar button,
        .sidebar button *,
        .sidebar .nav-menu-item,
        .sidebar .nav-menu-item * {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* Specific overrides for emerald/green classes in SIDEBAR ONLY */
        .sidebar button[class*="bg-emerald"],
        .sidebar button[class*="bg-green"],
        .sidebar div[class*="bg-emerald"],
        .sidebar div[class*="bg-green"] {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* Override hover states for SIDEBAR ONLY */
        .sidebar button[class*="bg-emerald"]:hover,
        .sidebar button[class*="bg-green"]:hover {
          background: #334155 !important;
          background-color: #334155 !important;
        }
        
        /* SIDEBAR text colors */
        .sidebar .nav-menu-item {
          color: #e2e8f0 !important;
        }
        
        /* SIDEBAR active states should be blue only */
        .sidebar button[data-active="true"],
        .sidebar .nav-menu-item[data-active="true"] {
          color: #3b82f6 !important;
          background: transparent !important;
          background-color: transparent !important;
        }
      `}</style>
    </div>
  )
}

export default LayoutNextJS
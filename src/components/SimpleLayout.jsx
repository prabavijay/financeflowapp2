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

const SimpleLayout = ({ children, currentPath = '/' }) => {
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

  const sidebarStyle = {
    width: '280px',
    background: '#1e293b',
    borderRight: '1px solid #475569',
    display: 'flex',
    flexDirection: 'column'
  }

  const logoStyle = {
    padding: '16px',
    borderBottom: '1px solid #475569',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }

  const logoIconStyle = {
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
  }

  const logoTextStyle = {
    color: '#f1f5f9',
    fontSize: '20px',
    fontWeight: '600'
  }

  const navStyle = {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto'
  }

  const getButtonStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isActive ? '#3b82f6' : '#e2e8f0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.2s ease'
  })

  const themeToggleStyle = {
    padding: '16px',
    borderTop: '1px solid #475569'
  }

  const themeButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
    textAlign: 'left'
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0c1420 50%, #0f172a 100%)',
      minHeight: '100vh'
    }}>
      <div style={sidebarStyle}>
        <div style={logoStyle}>
          <div style={logoIconStyle}>F</div>
          <span style={logoTextStyle}>Finance Flow</span>
        </div>

        <nav style={navStyle}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const itemIsActive = isActive(item.href)
            
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                style={getButtonStyle(itemIsActive)}
                onMouseEnter={(e) => {
                  if (!itemIsActive) {
                    e.currentTarget.style.color = '#3b82f6'
                    e.currentTarget.style.backgroundColor = '#334155'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!itemIsActive) {
                    e.currentTarget.style.color = '#e2e8f0'
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div style={themeToggleStyle}>
          <button onClick={toggleTheme} style={themeButtonStyle}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>Toggle Theme</span>
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default SimpleLayout
import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock all page components to avoid complex dependencies
jest.mock('../pages/Dashboard', () => {
  return function Dashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>
  }
})

jest.mock('../pages/Income', () => {
  return function Income() {
    return <div data-testid="income-page">Income Page</div>
  }
})

jest.mock('../pages/Expenses', () => {
  return function Expenses() {
    return <div data-testid="expenses-page">Expenses Page</div>
  }
})

jest.mock('../pages/Bills', () => {
  return function Bills() {
    return <div data-testid="bills-page">Bills Page</div>
  }
})

jest.mock('../pages/Debts', () => {
  return function Debts() {
    return <div data-testid="debts-page">Debts Page</div>
  }
})

jest.mock('../pages/Assets', () => {
  return function Assets() {
    return <div data-testid="assets-page">Assets Page</div>
  }
})

jest.mock('../pages/Budget', () => {
  return function Budget() {
    return <div data-testid="budget-page">Budget Page</div>
  }
})

jest.mock('../pages/DebtReduction', () => {
  return function DebtReduction() {
    return <div data-testid="debt-reduction-page">Debt Reduction Page</div>
  }
})

jest.mock('../pages/CreditLoans-safe', () => {
  return function CreditLoansSafe() {
    return <div data-testid="credit-loans-page">Credit Loans Page</div>
  }
})

jest.mock('../pages/Insurance', () => {
  return function Insurance() {
    return <div data-testid="insurance-page">Insurance Page</div>
  }
})

jest.mock('../pages/Accounts', () => {
  return function Accounts() {
    return <div data-testid="accounts-page">Accounts Page</div>
  }
})

jest.mock('../pages/HelpCenter', () => {
  return function HelpCenter() {
    return <div data-testid="help-center-page">Help Center Page</div>
  }
})

// Mock Layout component
jest.mock('../components/Layout', () => {
  return function Layout({ children }) {
    return (
      <div data-testid="layout">
        <nav data-testid="sidebar">
          <div>Finance Flow</div>
        </nav>
        <main data-testid="main-content">
          {children}
        </main>
      </div>
    )
  }
})

// Mock ThemeProvider
jest.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>
}))

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />)
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  test('renders dashboard by default', () => {
    render(<App />)
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  test('wraps app in ThemeProvider', () => {
    render(<App />)
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
  })

  test('includes Layout component', () => {
    render(<App />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('main-content')).toBeInTheDocument()
  })

  test('has proper component structure', () => {
    render(<App />)
    
    // ThemeProvider should be the outermost wrapper
    const themeProvider = screen.getByTestId('theme-provider')
    expect(themeProvider).toBeInTheDocument()
    
    // Layout should be inside ThemeProvider
    const layout = screen.getByTestId('layout')
    expect(layout).toBeInTheDocument()
    expect(themeProvider).toContainElement(layout)
    
    // Main content should be inside Layout
    const mainContent = screen.getByTestId('main-content')
    expect(mainContent).toBeInTheDocument()
    expect(layout).toContainElement(mainContent)
  })

  test('includes BrowserRouter for routing', () => {
    render(<App />)
    // The dashboard should render, which means routing is working
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  test('provides context to child components', () => {
    render(<App />)
    
    // All necessary providers should be available
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument()
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  test('renders Finance Flow branding', () => {
    render(<App />)
    expect(screen.getByText('Finance Flow')).toBeInTheDocument()
  })
})
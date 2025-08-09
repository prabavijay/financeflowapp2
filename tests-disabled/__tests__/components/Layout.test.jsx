import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Layout from '../../components/Layout'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Mock ThemeContext
const MockThemeProvider = ({ children }) => (
  <ThemeProvider>
    {children}
  </ThemeProvider>
)

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <MockThemeProvider>
        {component}
      </MockThemeProvider>
    </BrowserRouter>
  )
}

describe('Layout Component', () => {
  beforeEach(() => {
    // Mock useLocation to return dashboard path
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => ({
        pathname: '/'
      })
    }))
  })

  test('renders layout with sidebar and main content', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check if Finance Flow title is rendered
    expect(screen.getByText('Finance Flow')).toBeInTheDocument()
    expect(screen.getByText('Personal Finance Manager')).toBeInTheDocument()
    
    // Check if test content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  test('renders all navigation links', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Check if all navigation items are present
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Bills')).toBeInTheDocument()
    expect(screen.getByText('Debts')).toBeInTheDocument()
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByText('Debt Reduction')).toBeInTheDocument()
    expect(screen.getByText('Credit & Loans')).toBeInTheDocument()
    expect(screen.getByText('Insurance')).toBeInTheDocument()
    expect(screen.getByText('Accounts')).toBeInTheDocument()
    expect(screen.getByText('Help Center')).toBeInTheDocument()
  })

  test('shows backend connection status', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('Backend:')).toBeInTheDocument()
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  test('displays technology stack in footer', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    expect(screen.getByText('PostgreSQL + React')).toBeInTheDocument()
    expect(screen.getByText('Local Deployment')).toBeInTheDocument()
  })

  test('renders page title based on current route', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    )

    // Should show Dashboard since we mocked pathname as '/'
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Dashboard')
  })
})
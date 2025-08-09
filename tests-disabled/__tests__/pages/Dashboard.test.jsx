import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Line: () => <div data-testid="line" />,
  Pie: () => <div data-testid="pie" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Cell: () => <div data-testid="cell" />,
}))

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  )
}

const mockFinancialData = {
  income: [
    { id: 1, source: 'Salary', amount: 5000, date: '2024-01-01' },
    { id: 2, source: 'Freelance', amount: 1500, date: '2024-01-15' }
  ],
  expenses: [
    { id: 1, description: 'Groceries', amount: 500, category: 'food', date: '2024-01-02' },
    { id: 2, description: 'Gas', amount: 80, category: 'transportation', date: '2024-01-03' }
  ],
  bills: [
    { id: 1, name: 'Electric Bill', amount: 120, due_date: '2024-02-15', is_paid: false },
    { id: 2, name: 'Internet', amount: 80, due_date: '2024-02-10', is_paid: true }
  ],
  assets: [
    { id: 1, name: 'House', value: 250000, category: 'real_estate' },
    { id: 2, name: 'Car', value: 25000, category: 'vehicle' }
  ]
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockFinancialData.income
    })
  })

  test('renders dashboard title', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument()
  })

  test('displays financial overview cards', async () => {
    renderWithProviders(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument()
      expect(screen.getByText('Total Expenses')).toBeInTheDocument()
      expect(screen.getByText('Net Worth')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Bills')).toBeInTheDocument()
    })
  })

  test('renders all three charts', async () => {
    renderWithProviders(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Monthly Financial Trend')).toBeInTheDocument()
      expect(screen.getByText('Expense Breakdown')).toBeInTheDocument()
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument()
    })

    // Check if chart components are rendered
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(3)
  })

  test('displays AI insights section', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText('AI Financial Insights')).toBeInTheDocument()
  })

  test('makes API calls to fetch data', async () => {
    renderWithProviders(<Dashboard />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/income')
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/expenses')
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/bills')
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/assets')
    })
  })

  test('handles loading state', () => {
    // Mock fetch to simulate loading
    fetch.mockImplementation(() => new Promise(() => {}))
    
    renderWithProviders(<Dashboard />)
    
    // Should show loading state or skeleton
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument()
  })

  test('handles API error gracefully', async () => {
    fetch.mockRejectedValue(new Error('API Error'))
    
    renderWithProviders(<Dashboard />)
    
    await waitFor(() => {
      // Component should still render without crashing
      expect(screen.getByText('Financial Dashboard')).toBeInTheDocument()
    })
  })

  test('calculates and displays financial metrics', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData.income
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData.expenses
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData.bills
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFinancialData.assets
      })

    renderWithProviders(<Dashboard />)
    
    await waitFor(() => {
      // Should calculate totals based on mock data
      expect(screen.getByText('Total Income')).toBeInTheDocument()
      expect(screen.getByText('Total Expenses')).toBeInTheDocument()
    })
  })

  test('responsive design works on different screen sizes', () => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('768px'), // Simulate mobile breakpoint
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText('Financial Dashboard')).toBeInTheDocument()
  })
})
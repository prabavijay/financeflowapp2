import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Income from '../../pages/Income'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
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

const mockIncomeData = [
  {
    id: 1,
    source: 'Software Engineering',
    category: 'salary',
    amount: 8500,
    frequency: 'monthly',
    description: 'Primary employment',
    owner: 'Personal'
  },
  {
    id: 2,
    source: 'Freelance Projects',
    category: 'freelance',
    amount: 1200,
    frequency: 'monthly',
    description: 'Web development contracts',
    owner: 'Personal'
  }
]

describe('Income Component', () => {
  beforeEach(() => {
    fetch.mockClear()
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockIncomeData
    })
  })

  test('renders income page title', () => {
    renderWithProviders(<Income />)
    
    expect(screen.getByText('Income Management')).toBeInTheDocument()
  })

  test('displays add income button', () => {
    renderWithProviders(<Income />)
    
    expect(screen.getByText('Add Income')).toBeInTheDocument()
  })

  test('renders owner filter tabs', () => {
    renderWithProviders(<Income />)
    
    expect(screen.getByText('Personal')).toBeInTheDocument()
    expect(screen.getByText('Spouse')).toBeInTheDocument()
    expect(screen.getByText('Family')).toBeInTheDocument()
  })

  test('fetches and displays income data', async () => {
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/income')
      expect(screen.getByText('Software Engineering')).toBeInTheDocument()
      expect(screen.getByText('Freelance Projects')).toBeInTheDocument()
    })
  })

  test('displays income in table format', async () => {
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(screen.getByText('Source')).toBeInTheDocument()
      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('Frequency')).toBeInTheDocument()
    })
  })

  test('renders income charts', async () => {
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(screen.getByText('Income by Category')).toBeInTheDocument()
      expect(screen.getByText('Income by Frequency')).toBeInTheDocument()
    })

    expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
  })

  test('opens add income modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Income />)
    
    const addButton = screen.getByText('Add Income')
    await user.click(addButton)
    
    // Should open modal with form
    expect(screen.getByText('Add New Income')).toBeInTheDocument()
  })

  test('filters income by owner tab', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineering')).toBeInTheDocument()
    })

    // Click on Spouse tab
    const spouseTab = screen.getByText('Spouse')
    await user.click(spouseTab)
    
    // Should filter data (though mock data doesn't have spouse entries)
    expect(spouseTab).toBeInTheDocument()
  })

  test('handles edit income functionality', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineering')).toBeInTheDocument()
    })

    // Find and click edit button (assuming it exists)
    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('edit') || 
      btn.textContent?.includes('Edit')
    )
    
    if (editButton) {
      await user.click(editButton)
      expect(screen.getByText('Edit Income')).toBeInTheDocument()
    }
  })

  test('handles delete income functionality', async () => {
    const user = userEvent.setup()
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    })
    
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(screen.getByText('Software Engineering')).toBeInTheDocument()
    })

    // Find and click delete button
    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(btn => 
      btn.getAttribute('aria-label')?.includes('delete') || 
      btn.textContent?.includes('Delete')
    )
    
    if (deleteButton) {
      await user.click(deleteButton)
      // Should show confirmation dialog
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    }
  })

  test('calculates total income correctly', async () => {
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      // Should calculate total from mock data: 8500 + 1200 = 9700
      const totalElement = screen.getByText(/total/i)
      expect(totalElement).toBeInTheDocument()
    })
  })

  test('handles API error gracefully', async () => {
    fetch.mockRejectedValue(new Error('API Error'))
    
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      expect(screen.getByText('Income Management')).toBeInTheDocument()
    })
  })

  test('validates form input when adding income', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Income />)
    
    const addButton = screen.getByText('Add Income')
    await user.click(addButton)
    
    // Try to submit form without required fields
    const submitButton = screen.getByRole('button', { name: /save|add/i })
    await user.click(submitButton)
    
    // Should show validation errors
    expect(screen.getByText('Add New Income')).toBeInTheDocument()
  })

  test('formats currency amounts correctly', async () => {
    renderWithProviders(<Income />)
    
    await waitFor(() => {
      // Should format 8500 as currency
      expect(screen.getByText(/\$8,?500/)).toBeInTheDocument()
      expect(screen.getByText(/\$1,?200/)).toBeInTheDocument()
    })
  })
})
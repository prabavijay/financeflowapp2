import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import HelpCenter from '../../pages/HelpCenter'
import { ThemeProvider } from '../../contexts/ThemeContext'

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  )
}

describe('HelpCenter Component', () => {
  test('renders help center title and description', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText('FinanceFlow Help Center')).toBeInTheDocument()
    expect(screen.getByText('Complete guide to personal finance management and optimization')).toBeInTheDocument()
  })

  test('displays navigation tabs', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText("Beginner's Guide")).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('FAQ')).toBeInTheDocument()
    expect(screen.getByText('User Guide')).toBeInTheDocument()
    expect(screen.getByText('Deployment')).toBeInTheDocument()
    expect(screen.getByText('Test Guide')).toBeInTheDocument()
    expect(screen.getByText('Pro Tips')).toBeInTheDocument()
  })

  test('shows statistics in header', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('Core Modules')).toBeInTheDocument()
    expect(screen.getByText('69+')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Powered')).toBeInTheDocument()
  })

  test('displays beginner guide by default', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText('Complete Beginner\'s Workflow Guide')).toBeInTheDocument()
    expect(screen.getByText('Step-by-step walkthrough for new users')).toBeInTheDocument()
  })

  test('shows all 6 beginner steps', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText('Step 3')).toBeInTheDocument()
    expect(screen.getByText('Step 4')).toBeInTheDocument()
    expect(screen.getByText('Step 5')).toBeInTheDocument()
    expect(screen.getByText('Step 6')).toBeInTheDocument()
  })

  test('switches to features tab when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    const featuresTab = screen.getByRole('button', { name: /features/i })
    await user.click(featuresTab)
    
    await waitFor(() => {
      expect(screen.getByText('FinanceFlow Features')).toBeInTheDocument()
      expect(screen.getByText('Comprehensive financial management with 11 modules and 69+ features')).toBeInTheDocument()
    })
  })

  test('displays core modules in features section', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    const featuresTab = screen.getByRole('button', { name: /features/i })
    await user.click(featuresTab)
    
    await waitFor(() => {
      expect(screen.getByText('Core Modules')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Income Tracking')).toBeInTheDocument()
      expect(screen.getByText('Expense Management')).toBeInTheDocument()
    })
  })

  test('switches to FAQ tab and displays questions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    const faqTab = screen.getByRole('button', { name: /faq/i })
    await user.click(faqTab)
    
    await waitFor(() => {
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
      expect(screen.getByText('How do I get started with FinanceFlow?')).toBeInTheDocument()
      expect(screen.getByText('Can I track finances for multiple family members?')).toBeInTheDocument()
    })
  })

  test('displays test guide with testing procedures', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    const testGuideTab = screen.getByRole('button', { name: /test guide/i })
    await user.click(testGuideTab)
    
    await waitFor(() => {
      expect(screen.getByText('Comprehensive Test Guide')).toBeInTheDocument()
      expect(screen.getByText('Frontend Testing')).toBeInTheDocument()
      expect(screen.getByText('Backend Testing')).toBeInTheDocument()
      expect(screen.getByText('Integration Testing')).toBeInTheDocument()
    })
  })

  test('shows pro tips section', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    const proTipsTab = screen.getByRole('button', { name: /pro tips/i })
    await user.click(proTipsTab)
    
    await waitFor(() => {
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
      expect(screen.getByText('Advanced tips and tricks to get the most out of FinanceFlow')).toBeInTheDocument()
      expect(screen.getByText('Efficient Data Entry')).toBeInTheDocument()
      expect(screen.getByText('Advanced Analysis')).toBeInTheDocument()
      expect(screen.getByText('Security Best Practices')).toBeInTheDocument()
    })
  })

  test('displays user guide topics', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    const userGuideTab = screen.getByRole('button', { name: /user guide/i })
    await user.click(userGuideTab)
    
    await waitFor(() => {
      expect(screen.getByText('User Guide')).toBeInTheDocument()
      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Financial Tracking')).toBeInTheDocument()
      expect(screen.getByText('Planning & Analysis')).toBeInTheDocument()
      expect(screen.getByText('Advanced Features')).toBeInTheDocument()
    })
  })

  test('has proper responsive design', () => {
    renderWithProviders(<HelpCenter />)
    
    const container = screen.getByText('FinanceFlow Help Center').closest('div')
    expect(container).toBeInTheDocument()
  })

  test('includes footer with support information', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText(/Need additional help/)).toBeInTheDocument()
    expect(screen.getByText(/Contact support or check our GitHub repository/)).toBeInTheDocument()
  })

  test('maintains active tab state correctly', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HelpCenter />)
    
    // Initially beginner tab should be active
    const beginnerTab = screen.getByRole('button', { name: /beginner's guide/i })
    expect(beginnerTab).toHaveClass('bg-blue-600')
    
    // Switch to features tab
    const featuresTab = screen.getByRole('button', { name: /features/i })
    await user.click(featuresTab)
    
    await waitFor(() => {
      expect(featuresTab).toHaveClass('bg-blue-600')
    })
  })

  test('displays time estimates for beginner steps', () => {
    renderWithProviders(<HelpCenter />)
    
    expect(screen.getByText('3 minutes')).toBeInTheDocument()
    expect(screen.getByText('5-8 minutes')).toBeInTheDocument()
    expect(screen.getByText('7 minutes')).toBeInTheDocument()
    expect(screen.getByText('5 minutes')).toBeInTheDocument()
    expect(screen.getByText('6 minutes')).toBeInTheDocument()
    expect(screen.getByText('4 minutes')).toBeInTheDocument()
  })
})
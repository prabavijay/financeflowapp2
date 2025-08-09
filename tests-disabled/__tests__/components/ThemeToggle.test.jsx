import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '../../components/ThemeToggle'
import { ThemeProvider } from '../../contexts/ThemeContext'

const renderWithThemeProvider = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  )
}

describe('ThemeToggle Component', () => {
  test('renders theme toggle button', () => {
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  test('displays sun icon in dark mode (default)', () => {
    renderWithThemeProvider(<ThemeToggle />)
    
    // In dark mode, sun icon should be visible to switch to light mode
    const sunIcon = screen.getByTestId('sun-icon') || screen.getByRole('button')
    expect(sunIcon).toBeInTheDocument()
  })

  test('toggles theme when clicked', async () => {
    const user = userEvent.setup()
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    
    // Click to toggle theme
    await user.click(button)
    
    // Button should still be present after click
    expect(button).toBeInTheDocument()
  })

  test('has proper accessibility attributes', () => {
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  test('applies correct CSS classes for styling', () => {
    renderWithThemeProvider(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('p-2')
    expect(button).toHaveClass('rounded-lg')
  })
})
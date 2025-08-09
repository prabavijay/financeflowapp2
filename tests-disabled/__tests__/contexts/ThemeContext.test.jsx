import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext'

// Test component to use the theme context
const TestComponent = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  
  return (
    <div>
      <span data-testid="theme-mode">{isDarkMode ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  test('provides default dark mode state', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark')
  })

  test('toggles theme when toggleTheme is called', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    const themeMode = screen.getByTestId('theme-mode')

    // Initially dark mode
    expect(themeMode).toHaveTextContent('dark')

    // Toggle to light mode
    await user.click(toggleButton)
    expect(themeMode).toHaveTextContent('light')

    // Toggle back to dark mode
    await user.click(toggleButton)
    expect(themeMode).toHaveTextContent('dark')
  })

  test('persists theme preference in localStorage', async () => {
    const user = userEvent.setup()
    
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    }
    global.localStorage = localStorageMock

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    
    // Toggle theme
    await user.click(toggleButton)
    
    // Should attempt to save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  test('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow()
    
    consoleSpy.mockRestore()
  })

  test('loads initial theme from localStorage if available', () => {
    // Mock localStorage to return light mode
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue('false'), // false means light mode
      setItem: jest.fn(),
      clear: jest.fn()
    }
    global.localStorage = localStorageMock

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(localStorageMock.getItem).toHaveBeenCalledWith('financeflow-dark-mode')
  })
})
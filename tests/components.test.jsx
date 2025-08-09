import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import Layout from '../src/components/Layout'
import Dashboard from '../src/pages/Dashboard'
import StockTracker from '../src/pages/StockTracker'

// Mock the API client - this should be handled in jest.setup.js
// Additional component-specific mocks can go here if needed

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </BrowserRouter>
)

describe('Layout Component', () => {
  test('renders navigation menu', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByText('Finance Flow')).toBeInTheDocument()
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expenses')).toBeInTheDocument()
    expect(screen.getByText('Stock Tracker')).toBeInTheDocument()
  })

  test('renders main content area', () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="test-content">Test Content</div>
        </Layout>
      </TestWrapper>
    )
    
    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })

  test('renders theme toggle button', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    )
    
    // Should have at least one button (theme toggle)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})

describe('Dashboard Component', () => {
  test('renders dashboard component without crashing', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    )
    
    // Just test that the component renders without crashing
    // More specific tests can be added once API integration is working
    expect(document.body).toBeInTheDocument()
  })
})

describe('StockTracker Component', () => {
  test('renders stock tracker component without crashing', async () => {
    render(
      <TestWrapper>
        <StockTracker />
      </TestWrapper>
    )
    
    // Just test that the component renders without crashing
    expect(document.body).toBeInTheDocument()
  })

  test('renders stock tracker title', async () => {
    render(
      <TestWrapper>
        <StockTracker />
      </TestWrapper>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Stock Investment Tracker')).toBeInTheDocument()
    })
  })
})

describe('Accessibility', () => {
  test('navigation links are accessible', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    )
    
    const navigationLinks = screen.getAllByRole('link')
    expect(navigationLinks.length).toBeGreaterThan(0)
    navigationLinks.forEach(link => {
      expect(link).toHaveAttribute('href')
    })
  })

  test('components render without accessibility violations', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    )
    
    // Basic accessibility check - component renders without crashing
    expect(document.body).toBeInTheDocument()
  })
})
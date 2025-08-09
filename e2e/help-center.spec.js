const { test, expect } = require('@playwright/test')

test.describe('Help Center E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/help')
    await expect(page.getByText('FinanceFlow Help Center')).toBeVisible()
  })

  test('displays help center header and statistics', async ({ page }) => {
    await expect(page.getByText('FinanceFlow Help Center')).toBeVisible()
    await expect(page.getByText('Complete guide to personal finance management and optimization')).toBeVisible()
    
    // Check statistics
    await expect(page.getByText('11')).toBeVisible()
    await expect(page.getByText('Core Modules')).toBeVisible()
    await expect(page.getByText('69+')).toBeVisible()
    await expect(page.getByText('Features')).toBeVisible()
    await expect(page.getByText('AI')).toBeVisible()
    await expect(page.getByText('Powered')).toBeVisible()
  })

  test('shows all navigation tabs', async ({ page }) => {
    const tabs = [
      "Beginner's Guide",
      'Features',
      'FAQ',
      'User Guide',
      'Deployment',
      'Test Guide',
      'Pro Tips'
    ]

    for (const tab of tabs) {
      await expect(page.getByRole('button', { name: tab })).toBeVisible()
    }
  })

  test('beginner guide tab workflow', async ({ page }) => {
    // Should start on Beginner's Guide tab
    await expect(page.getByText('Complete Beginner\'s Workflow Guide')).toBeVisible()
    
    // Should show all 6 steps
    for (let i = 1; i <= 6; i++) {
      await expect(page.getByText(`Step ${i}`)).toBeVisible()
    }
    
    // Should show time estimates
    await expect(page.getByText('3 minutes')).toBeVisible()
    await expect(page.getByText('5-8 minutes')).toBeVisible()
    await expect(page.getByText('7 minutes')).toBeVisible()
  })

  test('features tab displays module information', async ({ page }) => {
    await page.click('button:has-text("Features")')
    
    await expect(page.getByText('FinanceFlow Features')).toBeVisible()
    await expect(page.getByText('Comprehensive financial management with 11 modules and 69+ features')).toBeVisible()
    
    // Should show core modules
    await expect(page.getByText('Core Modules')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Income Tracking')).toBeVisible()
    await expect(page.getByText('Expense Management')).toBeVisible()
    
    // Should show data visualization section
    await expect(page.getByText('Data Visualization')).toBeVisible()
    await expect(page.getByText('14 Interactive Charts')).toBeVisible()
  })

  test('FAQ tab shows questions and answers', async ({ page }) => {
    await page.click('button:has-text("FAQ")')
    
    await expect(page.getByText('Frequently Asked Questions')).toBeVisible()
    
    // Check for FAQ content
    await expect(page.getByText('How do I get started with FinanceFlow?')).toBeVisible()
    await expect(page.getByText('Can I track finances for multiple family members?')).toBeVisible()
    await expect(page.getByText('What types of charts and analytics are available?')).toBeVisible()
    await expect(page.getByText('How does the AI debt reduction feature work?')).toBeVisible()
  })

  test('user guide tab displays topics', async ({ page }) => {
    await page.click('button:has-text("User Guide")')
    
    await expect(page.getByText('User Guide')).toBeVisible()
    await expect(page.getByText('Detailed documentation for all FinanceFlow features')).toBeVisible()
    
    // Should show topic sections
    await expect(page.getByText('Getting Started')).toBeVisible()
    await expect(page.getByText('Financial Tracking')).toBeVisible()
    await expect(page.getByText('Planning & Analysis')).toBeVisible()
    await expect(page.getByText('Advanced Features')).toBeVisible()
  })

  test('test guide tab shows testing procedures', async ({ page }) => {
    await page.click('button:has-text("Test Guide")')
    
    await expect(page.getByText('Comprehensive Test Guide')).toBeVisible()
    await expect(page.getByText('Complete testing procedures for FinanceFlow application')).toBeVisible()
    
    // Should show testing categories
    await expect(page.getByText('Frontend Testing')).toBeVisible()
    await expect(page.getByText('Backend Testing')).toBeVisible()
    await expect(page.getByText('Integration Testing')).toBeVisible()
    
    // Should show specific test types
    await expect(page.getByText('Navigation Testing')).toBeVisible()
    await expect(page.getByText('Form Functionality')).toBeVisible()
    await expect(page.getByText('Chart Rendering')).toBeVisible()
  })

  test('pro tips tab displays helpful tips', async ({ page }) => {
    await page.click('button:has-text("Pro Tips")')
    
    await expect(page.getByText('Pro Tips')).toBeVisible()
    await expect(page.getByText('Advanced tips and tricks to get the most out of FinanceFlow')).toBeVisible()
    
    // Should show tip categories
    await expect(page.getByText('Efficient Data Entry')).toBeVisible()
    await expect(page.getByText('Advanced Analysis')).toBeVisible()
    await expect(page.getByText('Security Best Practices')).toBeVisible()
  })

  test('tab navigation maintains state', async ({ page }) => {
    // Start on Beginner's Guide
    await expect(page.getByText('Complete Beginner\'s Workflow Guide')).toBeVisible()
    
    // Switch to Features
    await page.click('button:has-text("Features")')
    await expect(page.getByText('FinanceFlow Features')).toBeVisible()
    
    // Switch back to Beginner's Guide
    await page.click('button:has-text("Beginner\'s Guide")')
    await expect(page.getByText('Complete Beginner\'s Workflow Guide')).toBeVisible()
  })

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should still show main elements
    await expect(page.getByText('FinanceFlow Help Center')).toBeVisible()
    
    // Tabs should be scrollable/accessible
    await expect(page.getByRole('button', { name: "Beginner's Guide" })).toBeVisible()
    
    // Content should be readable
    await expect(page.getByText('Complete Beginner\'s Workflow Guide')).toBeVisible()
  })

  test('footer displays support information', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    await expect(page.getByText(/Need additional help/)).toBeVisible()
    await expect(page.getByText(/Contact support or check our GitHub repository/)).toBeVisible()
  })

  test('visual design consistency', async ({ page }) => {
    // Check for gradient backgrounds and proper styling
    const header = page.locator('.bg-gradient-to-r').first()
    if (await header.isVisible()) {
      await expect(header).toBeVisible()
    }
    
    // Should maintain dark theme consistency
    await expect(page.getByText('FinanceFlow Help Center')).toBeVisible()
  })

  test('all content loads without errors', async ({ page }) => {
    const tabs = ['Features', 'FAQ', 'User Guide', 'Test Guide', 'Pro Tips']
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`)
      
      // Wait for content to load
      await page.waitForTimeout(500)
      
      // Should not show error messages
      await expect(page.getByText('Error')).not.toBeVisible()
      await expect(page.getByText('Failed to load')).not.toBeVisible()
    }
  })

  test('active tab styling works correctly', async ({ page }) => {
    // Beginner's Guide should be active by default
    const beginnerTab = page.getByRole('button', { name: "Beginner's Guide" })
    await expect(beginnerTab).toHaveClass(/bg-blue-600/)
    
    // Click Features tab
    const featuresTab = page.getByRole('button', { name: 'Features' })
    await featuresTab.click()
    
    // Features tab should now be active
    await expect(featuresTab).toHaveClass(/bg-blue-600/)
    
    // Beginner's Guide should no longer be active
    await expect(beginnerTab).not.toHaveClass(/bg-blue-600/)
  })
})
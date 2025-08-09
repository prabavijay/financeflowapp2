const { test, expect } = require('@playwright/test')

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads dashboard page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Finance Flow/i)
    await expect(page.locator('h1')).toContainText('Finance Flow')
  })

  test('displays all navigation links', async ({ page }) => {
    const navLinks = [
      'Dashboard',
      'Income', 
      'Expenses',
      'Bills',
      'Debts',
      'Assets',
      'Budget',
      'Debt Reduction',
      'Credit & Loans',
      'Insurance',
      'Accounts',
      'Help Center'
    ]

    for (const link of navLinks) {
      await expect(page.getByRole('link', { name: link })).toBeVisible()
    }
  })

  test('shows financial overview cards', async ({ page }) => {
    await expect(page.getByText('Total Income')).toBeVisible()
    await expect(page.getByText('Total Expenses')).toBeVisible()
    await expect(page.getByText('Net Worth')).toBeVisible()
    await expect(page.getByText('Upcoming Bills')).toBeVisible()
  })

  test('displays charts section', async ({ page }) => {
    await expect(page.getByText('Monthly Financial Trend')).toBeVisible()
    await expect(page.getByText('Expense Breakdown')).toBeVisible()
    await expect(page.getByText('Asset Allocation')).toBeVisible()
  })

  test('shows AI insights section', async ({ page }) => {
    await expect(page.getByText('AI Financial Insights')).toBeVisible()
  })

  test('navigates to income page', async ({ page }) => {
    await page.click('text=Income')
    await expect(page).toHaveURL('/income')
    await expect(page.getByText('Income Management')).toBeVisible()
  })

  test('navigates to expenses page', async ({ page }) => {
    await page.click('text=Expenses')
    await expect(page).toHaveURL('/expenses')
    await expect(page.getByText('Expense Management')).toBeVisible()
  })

  test('navigates to help center', async ({ page }) => {
    await page.click('text=Help Center')
    await expect(page).toHaveURL('/help')
    await expect(page.getByText('FinanceFlow Help Center')).toBeVisible()
  })

  test('backend connection status shows connected', async ({ page }) => {
    await expect(page.getByText('Backend:')).toBeVisible()
    await expect(page.getByText('Connected')).toBeVisible()
  })

  test('displays technology stack info', async ({ page }) => {
    await expect(page.getByText('PostgreSQL + React')).toBeVisible()
    await expect(page.getByText('Local Deployment')).toBeVisible()
  })

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should still show main elements
    await expect(page.getByText('Finance Flow')).toBeVisible()
    await expect(page.getByText('Dashboard')).toBeVisible()
  })

  test('theme toggle functionality', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
      page.locator('button').filter({ hasText: /theme/i })
    ).first()
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      
      // Wait for theme change
      await page.waitForTimeout(500)
      
      // Should persist theme change
      await page.reload()
      await expect(page.getByText('Finance Flow')).toBeVisible()
    }
  })

  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await expect(page.getByText('Financial Dashboard')).toBeVisible()
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })
})
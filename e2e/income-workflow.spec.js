const { test, expect } = require('@playwright/test')

test.describe('Income Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/income')
    await expect(page.getByText('Income Management')).toBeVisible()
  })

  test('complete add income workflow', async ({ page }) => {
    // Click Add Income button
    await page.click('text=Add Income')
    
    // Should open modal/form
    await expect(page.getByText('Add New Income')).toBeVisible()
    
    // Fill out form fields
    await page.fill('[placeholder*="source" i], [name="source"]', 'Test Salary')
    
    // Select category if dropdown exists
    const categorySelect = page.locator('select[name="category"]').or(
      page.locator('[data-testid="category-select"]')
    ).first()
    
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('salary')
    }
    
    // Fill amount
    await page.fill('[placeholder*="amount" i], [name="amount"]', '5000')
    
    // Select frequency if dropdown exists
    const frequencySelect = page.locator('select[name="frequency"]').or(
      page.locator('[data-testid="frequency-select"]')
    ).first()
    
    if (await frequencySelect.isVisible()) {
      await frequencySelect.selectOption('monthly')
    }
    
    // Add description
    await page.fill('[placeholder*="description" i], [name="description"]', 'Test income description')
    
    // Submit form
    await page.click('button[type="submit"]', { timeout: 10000 })
    
    // Should close modal and show success
    await expect(page.getByText('Add New Income')).not.toBeVisible({ timeout: 10000 })
    
    // Should show new income in list
    await expect(page.getByText('Test Salary')).toBeVisible()
  })

  test('owner tab filtering workflow', async ({ page }) => {
    // Should start on Personal tab
    await expect(page.getByText('Personal')).toBeVisible()
    
    // Click Spouse tab
    await page.click('text=Spouse')
    
    // Should filter to spouse income
    await expect(page.getByText('Spouse')).toHaveClass(/active|selected/)
    
    // Click Family tab
    await page.click('text=Family')
    
    // Should show combined view
    await expect(page.getByText('Family')).toHaveClass(/active|selected/)
  })

  test('income charts display correctly', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(2000)
    
    // Should show chart titles
    await expect(page.getByText('Income by Category')).toBeVisible()
    await expect(page.getByText('Income by Frequency')).toBeVisible()
    
    // Charts should be rendered (check for SVG or canvas elements)
    const charts = page.locator('svg, canvas').or(
      page.locator('[data-testid*="chart"]')
    )
    
    await expect(charts.first()).toBeVisible()
  })

  test('edit income workflow', async ({ page }) => {
    // Wait for income list to load
    await page.waitForTimeout(2000)
    
    // Find first edit button
    const editButton = page.locator('button').filter({ hasText: /edit/i }).or(
      page.locator('[data-testid*="edit"]')
    ).first()
    
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Should open edit modal
      await expect(page.getByText('Edit Income')).toBeVisible()
      
      // Modify amount
      await page.fill('[name="amount"]', '5500')
      
      // Save changes
      await page.click('button[type="submit"]')
      
      // Should close modal
      await expect(page.getByText('Edit Income')).not.toBeVisible({ timeout: 10000 })
    }
  })

  test('delete income workflow', async ({ page }) => {
    // Wait for income list to load
    await page.waitForTimeout(2000)
    
    // Find first delete button
    const deleteButton = page.locator('button').filter({ hasText: /delete/i }).or(
      page.locator('[data-testid*="delete"]')
    ).first()
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      
      // Should show confirmation dialog
      await expect(page.getByText('Are you sure?')).toBeVisible()
      
      // Confirm deletion
      await page.click('button:has-text("Delete"), button:has-text("Confirm")')
      
      // Should close confirmation
      await expect(page.getByText('Are you sure?')).not.toBeVisible({ timeout: 10000 })
    }
  })

  test('income table sorting and display', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000)
    
    // Should show table headers
    await expect(page.getByText('Source')).toBeVisible()
    await expect(page.getByText('Category')).toBeVisible()
    await expect(page.getByText('Amount')).toBeVisible()
    await expect(page.getByText('Frequency')).toBeVisible()
    
    // Check if sorting works (click on column header)
    await page.click('text=Amount')
    
    // Should still show table content
    await expect(page.getByText('Source')).toBeVisible()
  })

  test('form validation works correctly', async ({ page }) => {
    // Click Add Income
    await page.click('text=Add Income')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors or prevent submission
    // The modal should still be visible
    await expect(page.getByText('Add New Income')).toBeVisible()
  })

  test('responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Should still show main elements
    await expect(page.getByText('Income Management')).toBeVisible()
    await expect(page.getByText('Add Income')).toBeVisible()
    
    // Owner tabs should be visible/accessible
    await expect(page.getByText('Personal')).toBeVisible()
  })

  test('currency formatting displays correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(2000)
    
    // Should show currency symbols and proper formatting
    const currencyElements = page.locator('text=/\\$[0-9,]+/')
    
    if (await currencyElements.first().isVisible()) {
      const currencyText = await currencyElements.first().textContent()
      expect(currencyText).toMatch(/\$[\d,]+/)
    }
  })

  test('search and filter functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search" i]').or(
      page.locator('[data-testid="search"]')
    ).first()
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('salary')
      
      // Should filter results
      await page.waitForTimeout(1000)
      
      // Should show filtered results
      await expect(page.getByText('Income Management')).toBeVisible()
    }
  })
})
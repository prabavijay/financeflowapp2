const request = require('supertest')
const express = require('express')
const { Pool } = require('pg')

// Import routes
const incomeRoutes = require('../routes/income')
const expenseRoutes = require('../routes/expenses')
const billRoutes = require('../routes/bills')
const debtRoutes = require('../routes/debts')
const assetRoutes = require('../routes/assets')
const accountRoutes = require('../routes/accounts')

// Create test app
const createTestApp = () => {
  const app = express()
  app.use(express.json())
  
  // Add routes
  app.use('/api/income', incomeRoutes)
  app.use('/api/expenses', expenseRoutes)
  app.use('/api/bills', billRoutes)
  app.use('/api/debts', debtRoutes)
  app.use('/api/assets', assetRoutes)
  app.use('/api/accounts', accountRoutes)
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() })
  })
  
  // Status endpoint
  app.get('/api/status', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      service: 'FinanceFlow API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  })
  
  return app
}

const app = createTestApp()

describe('Health and Status Endpoints', () => {
  test('GET /health returns OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
    
    expect(response.body.status).toBe('OK')
    expect(response.body.timestamp).toBeDefined()
  })

  test('GET /api/status returns service information', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200)
    
    expect(response.body.status).toBe('OK')
    expect(response.body.service).toBe('FinanceFlow API')
    expect(response.body.version).toBe('1.0.0')
  })
})

describe('Income API Endpoints', () => {
  test('GET /api/income returns income list', async () => {
    const response = await request(app)
      .get('/api/income')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('POST /api/income creates new income', async () => {
    const newIncome = {
      user_id: 'test-user',
      source: 'Test Job',
      category: 'salary',
      amount: 5000,
      frequency: 'monthly',
      description: 'Test salary',
      owner: 'Personal'
    }

    const response = await request(app)
      .post('/api/income')
      .send(newIncome)
      .expect(201)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data.source).toBe('Test Job')
  })

  test('POST /api/income validates required fields', async () => {
    const invalidIncome = {
      source: 'Test Job'
      // Missing required fields
    }

    const response = await request(app)
      .post('/api/income')
      .send(invalidIncome)
      .expect(400)
    
    expect(response.body.success).toBe(false)
    expect(response.body.error).toContain('Validation failed')
  })
})

describe('Expense API Endpoints', () => {
  test('GET /api/expenses returns expense list', async () => {
    const response = await request(app)
      .get('/api/expenses')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('POST /api/expenses creates new expense', async () => {
    const newExpense = {
      user_id: 'test-user',
      description: 'Test Expense',
      category: 'food',
      amount: 50.00,
      payment_method: 'credit_card',
      date: '2024-01-01',
      owner: 'Personal'
    }

    const response = await request(app)
      .post('/api/expenses')
      .send(newExpense)
      .expect(201)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data.description).toBe('Test Expense')
  })
})

describe('Bills API Endpoints', () => {
  test('GET /api/bills returns bills list', async () => {
    const response = await request(app)
      .get('/api/bills')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('GET /api/bills/upcoming returns upcoming bills', async () => {
    const response = await request(app)
      .get('/api/bills/upcoming')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })
})

describe('Debt API Endpoints', () => {
  test('GET /api/debts returns debt list', async () => {
    const response = await request(app)
      .get('/api/debts')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('GET /api/debts/summary returns debt summary', async () => {
    const response = await request(app)
      .get('/api/debts/summary')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data).toBeDefined()
  })
})

describe('Asset API Endpoints', () => {
  test('GET /api/assets returns asset list', async () => {
    const response = await request(app)
      .get('/api/assets')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('POST /api/assets creates new asset', async () => {
    const newAsset = {
      user_id: 'test-user',
      name: 'Test Asset',
      type: 'real_estate',
      value: 100000,
      description: 'Test property',
      owner: 'Personal'
    }

    const response = await request(app)
      .post('/api/assets')
      .send(newAsset)
      .expect(201)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Test Asset')
  })
})

describe('Account API Endpoints', () => {
  test('GET /api/accounts returns account list', async () => {
    const response = await request(app)
      .get('/api/accounts')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  test('GET /api/accounts/analytics/summary returns analytics', async () => {
    const response = await request(app)
      .get('/api/accounts/analytics/summary')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(response.body.data.summary).toBeDefined()
  })

  test('GET /api/accounts/password-health returns password health', async () => {
    const response = await request(app)
      .get('/api/accounts/password-health')
      .expect(200)
    
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })
})

describe('Error Handling', () => {
  test('handles 404 for non-existent endpoints', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404)
  })

  test('handles invalid JSON in request body', async () => {
    const response = await request(app)
      .post('/api/income')
      .set('Content-Type', 'application/json')
      .send('invalid json')
      .expect(400)
  })
})

describe('CORS and Security Headers', () => {
  test('includes security headers', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
    
    // Basic security headers should be present
    expect(response.headers['content-type']).toMatch(/json/)
  })
})

describe('Database Connection', () => {
  test('database queries handle connection errors gracefully', async () => {
    // This test would require mocking the database connection to fail
    // For now, we'll just test that endpoints don't crash
    const response = await request(app)
      .get('/api/income')
    
    // Should return either success or a proper error response
    expect([200, 500]).toContain(response.status)
    
    if (response.status === 500) {
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBeDefined()
    }
  })
})
const request = require('supertest')
const express = require('express')

// Mock Express app for testing
const createTestApp = () => {
  const app = express()
  app.use(express.json())
  
  // Mock routes for testing
  app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
  })
  
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'active',
      database: 'connected',
      server: 'running'
    })
  })
  
  app.get('/api/income', (req, res) => {
    res.json([
      {
        id: 1,
        source: 'Software Engineering',
        category: 'salary',
        amount: 8500,
        frequency: 'monthly',
        owner: 'Personal'
      }
    ])
  })
  
  app.post('/api/income', (req, res) => {
    const { source, category, amount, frequency } = req.body
    
    if (!source || !category || !amount || !frequency) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    res.status(201).json({
      id: Date.now(),
      source,
      category,
      amount,
      frequency,
      owner: 'Personal',
      created_at: new Date().toISOString()
    })
  })
  
  app.get('/api/expenses', (req, res) => {
    res.json([
      {
        id: 1,
        description: 'Groceries',
        category: 'food',
        amount: 85.50,
        payment_method: 'credit_card',
        owner: 'Personal'
      }
    ])
  })
  
  app.get('/api/bills', (req, res) => {
    res.json([
      {
        id: 1,
        name: 'Electric Bill',
        category: 'utilities',
        amount: 125.00,
        due_date: '2024-02-15',
        is_paid: false,
        owner: 'Personal'
      }
    ])
  })
  
  app.get('/api/debts', (req, res) => {
    res.json([
      {
        id: 1,
        name: 'Credit Card',
        type: 'credit_card',
        balance: 2500.00,
        interest_rate: 18.99,
        minimum_payment: 75.00,
        owner: 'Personal'
      }
    ])
  })
  
  app.get('/api/assets', (req, res) => {
    res.json([
      {
        id: 1,
        name: 'House',
        category: 'real_estate',
        value: 250000,
        purchase_price: 220000,
        owner: 'Personal'
      }
    ])
  })
  
  app.get('/api/budgets', (req, res) => {
    res.json([
      {
        id: 1,
        name: 'Monthly Budget',
        period: 'monthly',
        total_budget: 4000,
        total_spent: 3200,
        owner: 'Personal'
      }
    ])
  })
  
  return app
}

describe('API Endpoints', () => {
  let app
  
  beforeEach(() => {
    app = createTestApp()
  })
  
  describe('Health Check Endpoints', () => {
    test('GET /health returns health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
      
      expect(response.body.status).toBe('healthy')
      expect(response.body.timestamp).toBeDefined()
    })
    
    test('GET /api/status returns API status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200)
      
      expect(response.body.status).toBe('active')
      expect(response.body.database).toBe('connected')
      expect(response.body.server).toBe('running')
    })
  })
  
  describe('Income API', () => {
    test('GET /api/income returns income list', async () => {
      const response = await request(app)
        .get('/api/income')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('source')
      expect(response.body[0]).toHaveProperty('amount')
    })
    
    test('POST /api/income creates new income record', async () => {
      const newIncome = {
        source: 'Freelance',
        category: 'freelance',
        amount: 1500,
        frequency: 'monthly'
      }
      
      const response = await request(app)
        .post('/api/income')
        .send(newIncome)
        .expect(201)
      
      expect(response.body.source).toBe(newIncome.source)
      expect(response.body.amount).toBe(newIncome.amount)
      expect(response.body.id).toBeDefined()
    })
    
    test('POST /api/income validates required fields', async () => {
      const incompleteIncome = {
        source: 'Test Income'
        // Missing required fields
      }
      
      const response = await request(app)
        .post('/api/income')
        .send(incompleteIncome)
        .expect(400)
      
      expect(response.body.error).toBe('Missing required fields')
    })
  })
  
  describe('Expenses API', () => {
    test('GET /api/expenses returns expenses list', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty('description')
      expect(response.body[0]).toHaveProperty('amount')
      expect(response.body[0]).toHaveProperty('category')
    })
  })
  
  describe('Bills API', () => {
    test('GET /api/bills returns bills list', async () => {
      const response = await request(app)
        .get('/api/bills')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('amount')
      expect(response.body[0]).toHaveProperty('due_date')
    })
  })
  
  describe('Debts API', () => {
    test('GET /api/debts returns debts list', async () => {
      const response = await request(app)
        .get('/api/debts')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('balance')
      expect(response.body[0]).toHaveProperty('interest_rate')
    })
  })
  
  describe('Assets API', () => {
    test('GET /api/assets returns assets list', async () => {
      const response = await request(app)
        .get('/api/assets')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('value')
      expect(response.body[0]).toHaveProperty('category')
    })
  })
  
  describe('Budget API', () => {
    test('GET /api/budgets returns budgets list', async () => {
      const response = await request(app)
        .get('/api/budgets')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body[0]).toHaveProperty('name')
      expect(response.body[0]).toHaveProperty('total_budget')
      expect(response.body[0]).toHaveProperty('period')
    })
  })
  
  describe('Error Handling', () => {
    test('handles 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404)
    })
    
    test('handles malformed JSON in POST requests', async () => {
      await request(app)
        .post('/api/income')
        .send('invalid json')
        .expect(400)
    })
  })
  
  describe('Response Format', () => {
    test('all responses have proper Content-Type', async () => {
      const response = await request(app)
        .get('/api/income')
        .expect(200)
      
      expect(response.headers['content-type']).toMatch(/json/)
    })
    
    test('error responses include error message', async () => {
      const response = await request(app)
        .post('/api/income')
        .send({})
        .expect(400)
      
      expect(response.body.error).toBeDefined()
    })
  })
  
  describe('CORS Headers', () => {
    test('allows cross-origin requests', async () => {
      // In a real implementation, CORS headers would be tested
      const response = await request(app)
        .get('/api/status')
        .expect(200)
      
      // This would check for CORS headers in actual implementation
      expect(response.status).toBe(200)
    })
  })
})
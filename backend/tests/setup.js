const { Pool } = require('pg')

// Test database configuration
const testDbConfig = {
  user: 'luxmiuser',
  host: 'localhost',
  database: 'finance_test',
  password: 'luxmi',
  port: 5432,
}

// Create test database pool
let testPool

beforeAll(async () => {
  // Create test database pool
  testPool = new Pool(testDbConfig)
  
  // Set environment to test
  process.env.NODE_ENV = 'test'
  process.env.DB_NAME = 'finance_test'
})

beforeEach(async () => {
  // Clean up test data before each test
  if (testPool) {
    await cleanTestDatabase()
  }
})

afterAll(async () => {
  // Close database connections
  if (testPool) {
    await testPool.end()
  }
})

// Helper function to clean test database
async function cleanTestDatabase() {
  const tables = [
    'budget_items',
    'budgets', 
    'accounts',
    'insurance_policies',
    'credit_products',
    'assets',
    'debts',
    'bills',
    'expenses',
    'income',
    'users'
  ]
  
  for (const table of tables) {
    try {
      await testPool.query(`DELETE FROM ${table}`)
    } catch (error) {
      // Table might not exist, continue
      console.warn(`Could not clean table ${table}:`, error.message)
    }
  }
}

// Helper function to create test user
async function createTestUser() {
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  }
  
  try {
    await testPool.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [testUser.id, testUser.email, testUser.name]
    )
  } catch (error) {
    console.warn('Could not create test user:', error.message)
  }
  
  return testUser
}

// Mock console methods in test environment
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

// Export test utilities
module.exports = {
  testPool,
  cleanTestDatabase,
  createTestUser,
  testDbConfig
}
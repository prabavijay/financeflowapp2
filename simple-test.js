// Simple standalone test to verify basic functionality
const request = require('supertest')
const express = require('express')

// Create a simple test app
const app = express()
app.use(express.json())

// Add basic endpoints
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' })
})

app.get('/api/test', (req, res) => {
  res.status(200).json({ success: true, data: 'Test successful' })
})

// Run tests
async function runTests() {
  console.log('🧪 Running Simple Test Suite...')
  
  try {
    // Test 1: Health endpoint
    const healthResponse = await request(app)
      .get('/health')
      .expect(200)
    
    console.log('✅ Health endpoint test passed')
    
    // Test 2: API endpoint
    const apiResponse = await request(app)
      .get('/api/test')
      .expect(200)
    
    if (apiResponse.body.success && apiResponse.body.data === 'Test successful') {
      console.log('✅ API endpoint test passed')
    } else {
      console.log('❌ API endpoint test failed')
      return false
    }
    
    console.log('🎉 All simple tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

// Run if called directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = { app, runTests }
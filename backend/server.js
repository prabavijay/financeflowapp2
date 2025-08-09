#!/usr/bin/env node

// Finance Flow Backend Server
// Node.js + Express + PostgreSQL
// Reference: ../ENVIRONMENT_NOTES.md for configuration

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

// Import routes
const incomeRoutes = require('./routes/income');
const expenseRoutes = require('./routes/expenses');
const billRoutes = require('./routes/bills');
const debtRoutes = require('./routes/debts');
const assetRoutes = require('./routes/assets');
const budgetRoutes = require('./routes/budgets');
const creditRoutes = require('./routes/credit');
const insuranceRoutes = require('./routes/insurance');
const accountRoutes = require('./routes/accounts');

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Allow frontend to embed resources
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Finance Flow Backend',
    version: '1.0.0',
    database: 'PostgreSQL',
    node_version: process.version
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Finance Flow API is running',
    environment: process.env.NODE_ENV || 'development',
    database: {
      host: process.env.DB_HOST || 'localhost',
      name: process.env.DB_NAME || 'finance',
      user: process.env.DB_USER || 'luxmiuser'
    },
    features: {
      authentication: 'JWT',
      database: 'PostgreSQL 17',
      entities: [
        'Income', 'Expense', 'Bill', 'Debt', 'Asset',
        'CreditCard', 'InsurancePolicy', 'BudgetItem', 'Budget', 'Account'
      ]
    }
  });
});

// API Routes
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/accounts', accountRoutes);

// Temporary mock endpoints (until database is set up)
app.get('/api/:entity', (req, res) => {
  const entity = req.params.entity;
  res.json({
    message: `${entity} endpoint ready`,
    data: [],
    total: 0,
    page: 1,
    limit: 50,
    note: 'Database connection and schemas needed - see Implementation_Todo_Plan.md'
  });
});

app.post('/api/:entity', (req, res) => {
  const entity = req.params.entity;
  res.status(201).json({
    message: `${entity} creation endpoint ready`,
    data: { id: 'temp-id', ...req.body },
    note: 'Database connection needed for actual data persistence'
  });
});

// Authentication endpoints (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // Mock response - replace with real authentication
  res.json({
    token: 'mock-jwt-token-replace-with-real-auth',
    user: {
      id: 'mock-user-id',
      email: email,
      name: 'Test User'
    },
    message: 'Mock login successful - implement real authentication'
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // Mock response - replace with real registration
  res.status(201).json({
    token: 'mock-jwt-token-replace-with-real-auth',
    user: {
      id: 'mock-user-id',
      email: email,
      name: name || 'New User'
    },
    message: 'Mock registration successful - implement real authentication'
  });
});

// 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    message: 'Check API documentation or implement this endpoint'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Finance Flow Backend API',
    version: '1.0.0',
    documentation: '/api/status',
    health: '/health',
    frontend: process.env.CORS_ORIGIN || 'http://localhost:5173'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log('\n🚀 Finance Flow Backend Server Started!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server URL: http://${HOST}:${PORT}`);
  console.log(`🌐 Frontend: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🗄️  Database: PostgreSQL (${process.env.DB_NAME || 'finance'})`);
  console.log(`👤 DB User: ${process.env.DB_USER || 'luxmiuser'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📖 API Status: http://${HOST}:${PORT}/api/status`);
  console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⏳ Next Steps:');
  console.log('   1. Setup PostgreSQL database schema');
  console.log('   2. Implement authentication with JWT');
  console.log('   3. Create entity CRUD endpoints');
  console.log('   4. Connect frontend to backend');
  console.log('\n📚 See Implementation_Todo_Plan.md for details\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
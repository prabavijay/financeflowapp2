const express = require('express')
const { z } = require('zod')
const { Pool } = require('pg')
const crypto = require('crypto')
const router = express.Router()

// Database connection
const pool = new Pool({
  user: 'luxmiuser',
  host: 'localhost',
  database: 'finance',
  password: 'luxmi',
  port: 5432,
})

// Add database to request object
router.use((req, res, next) => {
  req.db = pool
  next()
})

// Simple encryption for demonstration (in production, use proper encryption)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'finance-flow-demo-key-32-chars!!'
const ALGORITHM = 'aes-256-cbc'

function encrypt(text) {
  if (!text) return null
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text) {
  if (!text) return null
  try {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = textParts.join(':')
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

// Account schema
const accountSchema = z.object({
  purpose: z.string().min(1).max(255),
  account_name: z.string().min(1).max(255),
  url: z.string().url().optional().or(z.literal('')),
  login_name: z.string().min(1).max(255),
  password: z.string().min(1),
  category: z.enum(['financial', 'utility', 'subscription', 'government', 'healthcare', 'shopping', 'social', 'work', 'other']).default('other'),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  last_updated_password: z.string().optional(),
  password_reminder: z.string().max(500).optional(),
})

// GET /api/accounts - Get all accounts (passwords encrypted)
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query
    
    let query = `
      SELECT 
        id, purpose, account_name, url, login_name,
        encrypted_password, category, notes, status,
        last_updated_password, password_reminder,
        created_at, updated_at
      FROM accounts 
      WHERE 1=1
    `
    const values = []
    let paramCount = 0

    if (category) {
      paramCount++
      query += ` AND category = $${paramCount}`
      values.push(category)
    }

    if (status) {
      paramCount++
      query += ` AND status = $${paramCount}`
      values.push(status)
    }

    query += ` ORDER BY 
      CASE category
        WHEN 'financial' THEN 1
        WHEN 'utility' THEN 2
        WHEN 'work' THEN 3
        WHEN 'government' THEN 4
        WHEN 'healthcare' THEN 5
        ELSE 6
      END,
      account_name ASC
    `

    const result = await req.db.query(query, values)
    
    // Prepare data for frontend (don't decrypt passwords by default)
    const accounts = result.rows.map(account => ({
      ...account,
      password_masked: '••••••••',
      has_password: !!account.encrypted_password,
      url_domain: account.url ? new URL(account.url).hostname : null
    }))

    res.json({
      success: true,
      data: accounts,
      count: accounts.length
    })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts'
    })
  }
})

// GET /api/accounts/analytics/summary - Get accounts analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const summary = await req.db.query(`
      SELECT 
        COUNT(*) as total_accounts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_accounts,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_accounts,
        SUM(CASE WHEN last_updated_password < CURRENT_DATE - INTERVAL '90 days' THEN 1 ELSE 0 END) as passwords_need_update,
        SUM(CASE WHEN url IS NOT NULL AND url != '' THEN 1 ELSE 0 END) as accounts_with_urls
      FROM accounts
    `)

    const categoryBreakdown = await req.db.query(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM accounts 
      GROUP BY category
      ORDER BY count DESC
    `)

    res.json({
      success: true,
      data: {
        summary: summary.rows[0],
        breakdown: categoryBreakdown.rows
      }
    })
  } catch (error) {
    console.error('Error fetching accounts analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts analytics'
    })
  }
})

// GET /api/accounts/password-health - Get password health report
router.get('/password-health', async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT 
        id, purpose, account_name, last_updated_password,
        CASE 
          WHEN last_updated_password < CURRENT_DATE - INTERVAL '180 days' THEN 'urgent'
          WHEN last_updated_password < CURRENT_DATE - INTERVAL '90 days' THEN 'warning'
          ELSE 'good'
        END as password_health
      FROM accounts 
      WHERE status = 'active'
      ORDER BY last_updated_password ASC
    `)

    res.json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    console.error('Error fetching password health:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch password health'
    })
  }
})

// GET /api/accounts/:id - Get specific account
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.db.query(`
      SELECT * FROM accounts WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }

    const account = result.rows[0]
    
    // Return account with decrypted password (be careful with this in production)
    const decryptedAccount = {
      ...account,
      password: decrypt(account.encrypted_password)
    }
    delete decryptedAccount.encrypted_password

    res.json({
      success: true,
      data: decryptedAccount
    })
  } catch (error) {
    console.error('Error fetching account:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account'
    })
  }
})

// GET /api/accounts/:id/password - Get decrypted password for specific account
router.get('/:id/password', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.db.query(`
      SELECT encrypted_password FROM accounts WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }

    const decryptedPassword = decrypt(result.rows[0].encrypted_password)

    res.json({
      success: true,
      password: decryptedPassword
    })
  } catch (error) {
    console.error('Error fetching password:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch password'
    })
  }
})

// POST /api/accounts - Create new account
router.post('/', async (req, res) => {
  try {
    const validatedData = accountSchema.parse(req.body)
    
    // Encrypt the password
    const encryptedPassword = encrypt(validatedData.password)

    const result = await req.db.query(`
      INSERT INTO accounts (
        purpose, account_name, url, login_name, encrypted_password,
        category, notes, status, last_updated_password, password_reminder
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING id, purpose, account_name, url, login_name, category, notes, status, created_at, updated_at
    `, [
      validatedData.purpose,
      validatedData.account_name,
      validatedData.url || null,
      validatedData.login_name,
      encryptedPassword,
      validatedData.category,
      validatedData.notes,
      validatedData.status,
      validatedData.last_updated_password || new Date().toISOString().split('T')[0],
      validatedData.password_reminder
    ])

    res.status(201).json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    console.error('Error creating account:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create account'
    })
  }
})

// PUT /api/accounts/:id - Update account
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = accountSchema.partial().parse(req.body)

    // If password is being updated, encrypt it
    if (validatedData.password) {
      validatedData.encrypted_password = encrypt(validatedData.password)
      validatedData.last_updated_password = new Date().toISOString().split('T')[0]
      delete validatedData.password
    }

    const fields = Object.keys(validatedData)
    const values = Object.values(validatedData)
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    const result = await req.db.query(`
      UPDATE accounts 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING id, purpose, account_name, url, login_name, category, notes, status, updated_at
    `, [id, ...values])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      })
    }

    console.error('Error updating account:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update account'
    })
  }
})

// DELETE /api/accounts/:id - Delete account
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await req.db.query(
      'DELETE FROM accounts WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      })
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    })
  }
})

module.exports = router
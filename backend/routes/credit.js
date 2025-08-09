const express = require('express')
const { z } = require('zod')
const { Pool } = require('pg')
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

// Credit Product schema - handles credit cards, loans, mortgages
const creditProductSchema = z.object({
  type: z.enum(['credit_card', 'personal_loan', 'auto_loan', 'mortgage', 'student_loan', 'line_of_credit']),
  name: z.string().min(1).max(255),
  provider: z.string().min(1).max(255),
  account_number: z.string().optional(),
  
  // Common fields
  current_balance: z.number().min(0),
  interest_rate: z.number().min(0).max(100),
  monthly_payment: z.number().min(0),
  payment_due_date: z.number().int().min(1).max(31),
  
  // Credit Card specific
  credit_limit: z.number().min(0).optional(),
  available_credit: z.number().min(0).optional(),
  cash_advance_limit: z.number().min(0).optional(),
  rewards_program: z.string().optional(),
  annual_fee: z.number().min(0).optional(),
  
  // Loan specific
  original_loan_amount: z.number().min(0).optional(),
  loan_term_months: z.number().int().min(1).optional(),
  remaining_payments: z.number().int().min(0).optional(),
  loan_start_date: z.string().optional(),
  maturity_date: z.string().optional(),
  
  // Status and metadata
  status: z.enum(['active', 'closed', 'frozen', 'delinquent']).default('active'),
  auto_pay_enabled: z.boolean().default(false),
  owner: z.enum(['Personal', 'Spouse', 'Family']).default('Personal'),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

// GET /api/credit - Get all credit products
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query
    
    let query = `
      SELECT 
        id,
        type,
        name,
        provider,
        account_number,
        current_balance,
        interest_rate,
        monthly_payment,
        payment_due_date,
        credit_limit,
        available_credit,
        cash_advance_limit,
        rewards_program,
        annual_fee,
        original_loan_amount,
        loan_term_months,
        remaining_payments,
        loan_start_date,
        maturity_date,
        status,
        auto_pay_enabled,
        owner,
        notes,
        created_at,
        updated_at
      FROM credit_products 
      WHERE 1=1
    `
    const values = []
    let paramCount = 0

    if (type) {
      paramCount++
      query += ` AND type = $${paramCount}`
      values.push(type)
    }

    if (status) {
      paramCount++
      query += ` AND status = $${paramCount}`
      values.push(status)
    }

    query += ` ORDER BY 
      CASE type 
        WHEN 'credit_card' THEN 1 
        WHEN 'line_of_credit' THEN 2
        WHEN 'personal_loan' THEN 3
        WHEN 'auto_loan' THEN 4
        WHEN 'mortgage' THEN 5
        WHEN 'student_loan' THEN 6
        ELSE 7
      END,
      current_balance DESC
    `

    const result = await req.db.query(query, values)
    
    // Calculate additional metrics
    const enrichedData = result.rows.map(row => {
      const enriched = { ...row }
      
      // Credit utilization for credit products
      if (row.credit_limit > 0) {
        enriched.credit_utilization = ((row.current_balance / row.credit_limit) * 100).toFixed(1)
        enriched.available_credit = row.credit_limit - row.current_balance
      }
      
      // Payoff calculations for loans
      if (row.type !== 'credit_card' && row.monthly_payment > 0) {
        const monthlyRate = row.interest_rate / 100 / 12
        if (monthlyRate > 0) {
          const months = Math.ceil(Math.log(1 + (row.current_balance * monthlyRate) / row.monthly_payment) / Math.log(1 + monthlyRate))
          enriched.months_to_payoff = months
          enriched.total_interest_remaining = (row.monthly_payment * months) - row.current_balance
        }
      }
      
      // Risk assessment
      if (row.type === 'credit_card' && row.credit_limit > 0) {
        const utilization = (row.current_balance / row.credit_limit) * 100
        if (utilization > 80) enriched.risk_level = 'high'
        else if (utilization > 50) enriched.risk_level = 'medium'
        else enriched.risk_level = 'low'
      }
      
      return enriched
    })

    res.json({
      success: true,
      data: enrichedData,
      count: enrichedData.length
    })
  } catch (error) {
    console.error('Error fetching credit products:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit products'
    })
  }
})

// GET /api/credit/:id - Get specific credit product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.db.query(`
      SELECT * FROM credit_products WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Credit product not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching credit product:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit product'
    })
  }
})

// POST /api/credit - Create new credit product
router.post('/', async (req, res) => {
  try {
    const validatedData = creditProductSchema.parse(req.body)
    
    // Calculate available credit for credit cards
    if (validatedData.type === 'credit_card' && validatedData.credit_limit) {
      validatedData.available_credit = validatedData.credit_limit - validatedData.current_balance
    }

    const result = await req.db.query(`
      INSERT INTO credit_products (
        type, name, provider, account_number, current_balance, interest_rate,
        monthly_payment, payment_due_date, credit_limit, available_credit,
        cash_advance_limit, rewards_program, annual_fee, original_loan_amount,
        loan_term_months, remaining_payments, loan_start_date, maturity_date,
        status, auto_pay_enabled, owner, notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *
    `, [
      validatedData.type,
      validatedData.name,
      validatedData.provider,
      validatedData.account_number,
      validatedData.current_balance,
      validatedData.interest_rate,
      validatedData.monthly_payment,
      validatedData.payment_due_date,
      validatedData.credit_limit,
      validatedData.available_credit,
      validatedData.cash_advance_limit,
      validatedData.rewards_program,
      validatedData.annual_fee,
      validatedData.original_loan_amount,
      validatedData.loan_term_months,
      validatedData.remaining_payments,
      validatedData.loan_start_date,
      validatedData.maturity_date,
      validatedData.status,
      validatedData.auto_pay_enabled,
      validatedData.owner || 'Personal',
      validatedData.notes
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

    console.error('Error creating credit product:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create credit product'
    })
  }
})

// PUT /api/credit/:id - Update credit product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = creditProductSchema.partial().parse(req.body)

    // Calculate available credit if updating credit card balance or limit
    if (validatedData.type === 'credit_card' || req.body.credit_limit || req.body.current_balance) {
      const current = await req.db.query('SELECT credit_limit, current_balance FROM credit_products WHERE id = $1', [id])
      if (current.rows.length > 0) {
        const creditLimit = validatedData.credit_limit || current.rows[0].credit_limit
        const currentBalance = validatedData.current_balance || current.rows[0].current_balance
        if (creditLimit) {
          validatedData.available_credit = creditLimit - currentBalance
        }
      }
    }

    const fields = Object.keys(validatedData)
    const values = Object.values(validatedData)
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    const result = await req.db.query(`
      UPDATE credit_products 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [id, ...values])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Credit product not found'
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

    console.error('Error updating credit product:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update credit product'
    })
  }
})

// DELETE /api/credit/:id - Delete credit product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await req.db.query(
      'DELETE FROM credit_products WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Credit product not found'
      })
    }

    res.json({
      success: true,
      message: 'Credit product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting credit product:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete credit product'
    })
  }
})

// POST /api/credit/:id/payment - Make payment
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params
    const { amount, payment_date = new Date().toISOString().split('T')[0] } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid payment amount is required'
      })
    }

    // Update balance
    const result = await req.db.query(`
      UPDATE credit_products 
      SET current_balance = GREATEST(current_balance - $2, 0),
          available_credit = CASE 
            WHEN credit_limit IS NOT NULL 
            THEN credit_limit - GREATEST(current_balance - $2, 0)
            ELSE available_credit
          END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [id, amount])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Credit product not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Payment of $${amount} applied successfully`
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    })
  }
})

// GET /api/credit/analytics/summary - Get credit analytics summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT 
        COUNT(*) as total_accounts,
        SUM(current_balance) as total_debt,
        AVG(interest_rate) as avg_interest_rate,
        SUM(monthly_payment) as total_monthly_payments,
        SUM(CASE WHEN type = 'credit_card' THEN current_balance ELSE 0 END) as credit_card_debt,
        SUM(CASE WHEN type = 'credit_card' THEN credit_limit ELSE 0 END) as total_credit_limit,
        AVG(CASE WHEN type = 'credit_card' AND credit_limit > 0 
            THEN (current_balance / credit_limit) * 100 
            ELSE NULL END) as avg_credit_utilization
      FROM credit_products 
      WHERE status = 'active'
    `)

    const summary = result.rows[0]

    // Get breakdown by type
    const typeBreakdown = await req.db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(current_balance) as total_balance,
        AVG(interest_rate) as avg_rate
      FROM credit_products 
      WHERE status = 'active'
      GROUP BY type
      ORDER BY total_balance DESC
    `)

    res.json({
      success: true,
      data: {
        summary: {
          ...summary,
          avg_credit_utilization: summary.avg_credit_utilization ? parseFloat(summary.avg_credit_utilization).toFixed(1) : '0.0'
        },
        breakdown: typeBreakdown.rows
      }
    })
  } catch (error) {
    console.error('Error fetching credit analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit analytics'
    })
  }
})

module.exports = router
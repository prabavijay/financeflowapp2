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

// Insurance Policy schema
const insurancePolicySchema = z.object({
  type: z.enum(['auto', 'home', 'health', 'life', 'disability', 'travel', 'renters', 'umbrella', 'work_benefits']),
  name: z.string().min(1).max(255),
  provider: z.string().min(1).max(255),
  policy_number: z.string().min(1).max(100),
  
  // Coverage details
  coverage_amount: z.number().min(0).optional(),
  deductible: z.number().min(0).optional(),
  coverage_type: z.string().max(100).optional(),
  beneficiaries: z.string().optional(),
  
  // Financial details
  premium_amount: z.number().min(0),
  premium_frequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']).default('monthly'),
  premium_due_date: z.number().int().min(1).max(31).optional(),
  
  // Policy period
  effective_date: z.string(),
  expiration_date: z.string(),
  auto_renew: z.boolean().default(false),
  
  // Contact and agent info
  agent_name: z.string().max(255).optional(),
  agent_phone: z.string().max(20).optional(),
  agent_email: z.string().email().optional(),
  
  // Additional details
  status: z.enum(['active', 'expired', 'cancelled', 'pending']).default('active'),
  notes: z.string().optional(),
  
  // Auto-specific fields
  vehicle_make: z.string().max(50).optional(),
  vehicle_model: z.string().max(50).optional(),
  vehicle_year: z.number().int().min(1900).max(2030).optional(),
  vehicle_vin: z.string().max(17).optional(),
  
  // Home-specific fields
  property_address: z.string().max(500).optional(),
  property_value: z.number().min(0).optional(),
  
  // Health-specific fields
  network_type: z.string().max(100).optional(),
  copay_primary: z.number().min(0).optional(),
  copay_specialist: z.number().min(0).optional(),
  out_of_pocket_max: z.number().min(0).optional(),
  
  // Work benefits specific
  employer_name: z.string().max(255).optional(),
  employee_contribution: z.number().min(0).optional(),
  employer_contribution: z.number().min(0).optional(),
})

// GET /api/insurance - Get all insurance policies
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query
    
    let query = `
      SELECT 
        id, type, name, provider, policy_number,
        coverage_amount, deductible, coverage_type, beneficiaries,
        premium_amount, premium_frequency, premium_due_date,
        effective_date, expiration_date, auto_renew,
        agent_name, agent_phone, agent_email,
        status, notes,
        vehicle_make, vehicle_model, vehicle_year, vehicle_vin,
        property_address, property_value,
        network_type, copay_primary, copay_specialist, out_of_pocket_max,
        employer_name, employee_contribution, employer_contribution,
        created_at, updated_at
      FROM insurance_policies 
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
        WHEN 'health' THEN 1 
        WHEN 'auto' THEN 2
        WHEN 'home' THEN 3
        WHEN 'life' THEN 4
        WHEN 'work_benefits' THEN 5
        ELSE 6
      END,
      expiration_date ASC
    `

    const result = await req.db.query(query, values)
    
    // Enrich data with calculations
    const enrichedData = result.rows.map(policy => {
      const enriched = { ...policy }
      
      // Calculate days until expiration
      if (policy.expiration_date) {
        const expirationDate = new Date(policy.expiration_date)
        const today = new Date()
        const timeDiff = expirationDate.getTime() - today.getTime()
        enriched.days_until_expiration = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        // Determine expiration status
        if (enriched.days_until_expiration < 0) {
          enriched.expiration_status = 'expired'
        } else if (enriched.days_until_expiration <= 30) {
          enriched.expiration_status = 'expiring_soon'
        } else if (enriched.days_until_expiration <= 90) {
          enriched.expiration_status = 'renewal_due'
        } else {
          enriched.expiration_status = 'current'
        }
      }
      
      // Calculate annual premium cost
      const frequencyMultiplier = {
        'monthly': 12,
        'quarterly': 4,
        'semi_annual': 2,
        'annual': 1
      }
      
      enriched.annual_premium = policy.premium_amount * (frequencyMultiplier[policy.premium_frequency] || 12)
      
      // Add coverage adequacy assessment for different types
      if (policy.type === 'auto' && policy.coverage_amount) {
        if (policy.coverage_amount < 100000) enriched.coverage_adequacy = 'low'
        else if (policy.coverage_amount < 300000) enriched.coverage_adequacy = 'adequate'
        else enriched.coverage_adequacy = 'good'
      }
      
      if (policy.type === 'home' && policy.property_value && policy.coverage_amount) {
        const coverageRatio = policy.coverage_amount / policy.property_value
        if (coverageRatio < 0.8) enriched.coverage_adequacy = 'low'
        else if (coverageRatio < 1.0) enriched.coverage_adequacy = 'adequate'
        else enriched.coverage_adequacy = 'good'
      }
      
      return enriched
    })

    res.json({
      success: true,
      data: enrichedData,
      count: enrichedData.length
    })
  } catch (error) {
    console.error('Error fetching insurance policies:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insurance policies'
    })
  }
})

// GET /api/insurance/:id - Get specific insurance policy
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await req.db.query(`
      SELECT * FROM insurance_policies WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Insurance policy not found'
      })
    }

    res.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error) {
    console.error('Error fetching insurance policy:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insurance policy'
    })
  }
})

// POST /api/insurance - Create new insurance policy
router.post('/', async (req, res) => {
  try {
    const validatedData = insurancePolicySchema.parse(req.body)

    const result = await req.db.query(`
      INSERT INTO insurance_policies (
        type, name, provider, policy_number,
        coverage_amount, deductible, coverage_type, beneficiaries,
        premium_amount, premium_frequency, premium_due_date,
        effective_date, expiration_date, auto_renew,
        agent_name, agent_phone, agent_email,
        status, notes,
        vehicle_make, vehicle_model, vehicle_year, vehicle_vin,
        property_address, property_value,
        network_type, copay_primary, copay_specialist, out_of_pocket_max,
        employer_name, employee_contribution, employer_contribution
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
      ) RETURNING *
    `, [
      validatedData.type,
      validatedData.name,
      validatedData.provider,
      validatedData.policy_number,
      validatedData.coverage_amount,
      validatedData.deductible,
      validatedData.coverage_type,
      validatedData.beneficiaries,
      validatedData.premium_amount,
      validatedData.premium_frequency,
      validatedData.premium_due_date,
      validatedData.effective_date,
      validatedData.expiration_date,
      validatedData.auto_renew,
      validatedData.agent_name,
      validatedData.agent_phone,
      validatedData.agent_email,
      validatedData.status,
      validatedData.notes,
      validatedData.vehicle_make,
      validatedData.vehicle_model,
      validatedData.vehicle_year,
      validatedData.vehicle_vin,
      validatedData.property_address,
      validatedData.property_value,
      validatedData.network_type,
      validatedData.copay_primary,
      validatedData.copay_specialist,
      validatedData.out_of_pocket_max,
      validatedData.employer_name,
      validatedData.employee_contribution,
      validatedData.employer_contribution
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

    console.error('Error creating insurance policy:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create insurance policy'
    })
  }
})

// PUT /api/insurance/:id - Update insurance policy
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = insurancePolicySchema.partial().parse(req.body)

    const fields = Object.keys(validatedData)
    const values = Object.values(validatedData)
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')

    const result = await req.db.query(`
      UPDATE insurance_policies 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
      RETURNING *
    `, [id, ...values])

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Insurance policy not found'
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

    console.error('Error updating insurance policy:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update insurance policy'
    })
  }
})

// DELETE /api/insurance/:id - Delete insurance policy
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await req.db.query(
      'DELETE FROM insurance_policies WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Insurance policy not found'
      })
    }

    res.json({
      success: true,
      message: 'Insurance policy deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting insurance policy:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete insurance policy'
    })
  }
})

// GET /api/insurance/analytics/summary - Get insurance analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const summary = await req.db.query(`
      SELECT 
        COUNT(*) as total_policies,
        SUM(CASE WHEN type = 'auto' THEN 1 ELSE 0 END) as auto_policies,
        SUM(CASE WHEN type = 'home' THEN 1 ELSE 0 END) as home_policies,
        SUM(CASE WHEN type = 'health' THEN 1 ELSE 0 END) as health_policies,
        SUM(CASE WHEN type = 'life' THEN 1 ELSE 0 END) as life_policies,
        SUM(CASE WHEN type = 'work_benefits' THEN 1 ELSE 0 END) as work_benefit_policies,
        SUM(premium_amount * CASE premium_frequency 
          WHEN 'monthly' THEN 12 
          WHEN 'quarterly' THEN 4 
          WHEN 'semi_annual' THEN 2 
          ELSE 1 END) as total_annual_premiums,
        AVG(premium_amount * CASE premium_frequency 
          WHEN 'monthly' THEN 12 
          WHEN 'quarterly' THEN 4 
          WHEN 'semi_annual' THEN 2 
          ELSE 1 END) as avg_annual_premium,
        SUM(CASE WHEN expiration_date < CURRENT_DATE THEN 1 ELSE 0 END) as expired_policies,
        SUM(CASE WHEN expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 1 ELSE 0 END) as expiring_soon,
        SUM(coverage_amount) as total_coverage
      FROM insurance_policies 
      WHERE status = 'active'
    `)

    const typeBreakdown = await req.db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(premium_amount * CASE premium_frequency 
          WHEN 'monthly' THEN 12 
          WHEN 'quarterly' THEN 4 
          WHEN 'semi_annual' THEN 2 
          ELSE 1 END) as annual_premiums,
        AVG(coverage_amount) as avg_coverage
      FROM insurance_policies 
      WHERE status = 'active'
      GROUP BY type
      ORDER BY annual_premiums DESC
    `)

    res.json({
      success: true,
      data: {
        summary: summary.rows[0],
        breakdown: typeBreakdown.rows
      }
    })
  } catch (error) {
    console.error('Error fetching insurance analytics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insurance analytics'
    })
  }
})

// GET /api/insurance/expiring - Get policies expiring soon
router.get('/expiring/:days', async (req, res) => {
  try {
    const { days } = req.params
    const daysInt = parseInt(days) || 30

    const result = await req.db.query(`
      SELECT * FROM insurance_policies 
      WHERE status = 'active' 
      AND expiration_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${daysInt} days'
      ORDER BY expiration_date ASC
    `)

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Error fetching expiring policies:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expiring policies'
    })
  }
})

module.exports = router
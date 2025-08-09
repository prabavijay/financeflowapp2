const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { z } = require('zod');

// Database connection
const pool = new Pool({
  user: 'luxmiuser',
  host: 'localhost',
  database: 'finance',
  password: 'luxmi',
  port: 5432,
});

// Validation schemas
const debtSchema = z.object({
  name: z.string().min(1).max(255),
  balance: z.number().min(0),
  original_amount: z.number().positive().optional(),
  interest_rate: z.number().min(0),
  minimum_payment: z.number().positive(),
  due_date: z.string().optional(),
  type: z.enum(['credit_card', 'personal_loan', 'student_loan', 'mortgage', 'auto_loan', 'other']),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  owner: z.enum(['Personal', 'Spouse', 'Family']).default('Personal'),
  notes: z.string().optional(),
});

const updateDebtSchema = debtSchema.partial();

// Helper functions
const calculateMonthsToPayoff = (balance, minPayment, interestRate) => {
  if (balance <= 0 || minPayment <= 0) return 0;
  if (interestRate === 0) return Math.ceil(balance / minPayment);
  
  const monthlyRate = interestRate / 100 / 12;
  const numerator = Math.log(1 + (balance * monthlyRate) / minPayment);
  const denominator = Math.log(1 + monthlyRate);
  
  return Math.ceil(numerator / denominator);
};

const calculateTotalInterest = (balance, minPayment, interestRate) => {
  if (balance <= 0 || minPayment <= 0 || interestRate === 0) return 0;
  
  const months = calculateMonthsToPayoff(balance, minPayment, interestRate);
  return (months * minPayment) - balance;
};

// GET /api/debts - List user debts with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, priority, sort = 'due_date', order = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, balance, original_amount, interest_rate, minimum_payment, 
             due_date, type, priority, owner, notes, created_at, updated_at
      FROM debts 
      WHERE user_id = $1
    `;
    
    const queryParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f']; // Existing user UUID
    let paramCount = 1;
    
    // Add filters
    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      queryParams.push(type);
    }
    
    if (priority) {
      paramCount++;
      query += ` AND priority = $${paramCount}`;
      queryParams.push(priority);
    }
    
    // Add sorting
    const validSortFields = ['balance', 'interest_rate', 'minimum_payment', 'due_date', 'name', 'created_at'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toUpperCase())) {
      query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      query += ` ORDER BY due_date ASC`;
    }
    
    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);
    
    const result = await pool.query(query, queryParams);
    
    // Calculate additional metrics for each debt
    const debtsWithMetrics = result.rows.map(debt => ({
      ...debt,
      balance: parseFloat(debt.balance),
      original_amount: debt.original_amount ? parseFloat(debt.original_amount) : null,
      interest_rate: parseFloat(debt.interest_rate),
      minimum_payment: parseFloat(debt.minimum_payment),
      months_to_payoff: calculateMonthsToPayoff(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      ),
      total_interest: calculateTotalInterest(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      )
    }));
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM debts WHERE user_id = $1';
    const countParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f'];
    
    if (type) {
      countQuery += ' AND type = $2';
      countParams.push(type);
    }
    if (priority) {
      const paramIndex = countParams.length + 1;
      countQuery += ` AND priority = $${paramIndex}`;
      countParams.push(priority);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      success: true,
      data: debtsWithMetrics,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching debts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debt records',
      error: error.message
    });
  }
});

// POST /api/debts - Create new debt record
router.post('/', async (req, res) => {
  try {
    const validatedData = debtSchema.parse(req.body);
    
    const query = `
      INSERT INTO debts (
        user_id, name, balance, original_amount, interest_rate, minimum_payment,
        due_date, type, priority, owner, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f', // Existing user UUID
      validatedData.name,
      validatedData.balance,
      validatedData.original_amount || null,
      validatedData.interest_rate,
      validatedData.minimum_payment,
      validatedData.due_date || null,
      validatedData.type,
      validatedData.priority,
      validatedData.owner || 'Personal',
      validatedData.notes || null
    ];
    
    const result = await pool.query(query, values);
    
    // Add calculated metrics to response
    const debt = result.rows[0];
    const debtWithMetrics = {
      ...debt,
      balance: parseFloat(debt.balance),
      original_amount: debt.original_amount ? parseFloat(debt.original_amount) : null,
      interest_rate: parseFloat(debt.interest_rate),
      minimum_payment: parseFloat(debt.minimum_payment),
      months_to_payoff: calculateMonthsToPayoff(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      ),
      total_interest: calculateTotalInterest(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      )
    };
    
    res.status(201).json({
      success: true,
      message: 'Debt record created successfully',
      data: debtWithMetrics
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error creating debt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create debt record',
      error: error.message
    });
  }
});

// PUT /api/debts/:id - Update debt record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateDebtSchema.parse(req.body);
    
    // Check if debt exists and belongs to user
    const existingQuery = 'SELECT * FROM debts WHERE id = $1 AND user_id = $2';
    const existingResult = await pool.query(existingQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Debt record not found'
      });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    
    Object.keys(validatedData).forEach(field => {
      if (validatedData[field] !== undefined) {
        paramCount++;
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(validatedData[field]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    // Add updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date().toISOString());
    
    // Add WHERE conditions
    paramCount++;
    updateValues.push(id);
    paramCount++;
    updateValues.push('c905f9c7-9fce-4ac9-8e59-514701257b3f'); // User UUID
    
    const updateQuery = `
      UPDATE debts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    
    // Add calculated metrics to response
    const debt = result.rows[0];
    const debtWithMetrics = {
      ...debt,
      balance: parseFloat(debt.balance),
      original_amount: debt.original_amount ? parseFloat(debt.original_amount) : null,
      interest_rate: parseFloat(debt.interest_rate),
      minimum_payment: parseFloat(debt.minimum_payment),
      months_to_payoff: calculateMonthsToPayoff(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      ),
      total_interest: calculateTotalInterest(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      )
    };
    
    res.json({
      success: true,
      message: 'Debt record updated successfully',
      data: debtWithMetrics
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error updating debt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update debt record',
      error: error.message
    });
  }
});

// POST /api/debts/:id/payment - Make a payment towards debt
router.post('/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, payment_date } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than 0'
      });
    }
    
    // Check if debt exists and belongs to user
    const existingQuery = 'SELECT * FROM debts WHERE id = $1 AND user_id = $2';
    const existingResult = await pool.query(existingQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Debt record not found'
      });
    }
    
    const debt = existingResult.rows[0];
    const newBalance = Math.max(0, parseFloat(debt.balance) - parseFloat(amount));
    
    // Update debt balance
    const updateQuery = `
      UPDATE debts 
      SET balance = $1, updated_at = $2
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [
      newBalance,
      new Date().toISOString(),
      id,
      'c905f9c7-9fce-4ac9-8e59-514701257b3f'
    ]);
    
    // Add calculated metrics to response
    const updatedDebt = result.rows[0];
    const debtWithMetrics = {
      ...updatedDebt,
      balance: parseFloat(updatedDebt.balance),
      original_amount: updatedDebt.original_amount ? parseFloat(updatedDebt.original_amount) : null,
      interest_rate: parseFloat(updatedDebt.interest_rate),
      minimum_payment: parseFloat(updatedDebt.minimum_payment),
      months_to_payoff: calculateMonthsToPayoff(
        parseFloat(updatedDebt.balance), 
        parseFloat(updatedDebt.minimum_payment), 
        parseFloat(updatedDebt.interest_rate)
      ),
      total_interest: calculateTotalInterest(
        parseFloat(updatedDebt.balance), 
        parseFloat(updatedDebt.minimum_payment), 
        parseFloat(updatedDebt.interest_rate)
      )
    };
    
    res.json({
      success: true,
      message: `Payment of $${amount} applied successfully`,
      data: debtWithMetrics,
      payment_applied: parseFloat(amount),
      previous_balance: parseFloat(debt.balance),
      new_balance: newBalance
    });
  } catch (error) {
    console.error('Error processing debt payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

// DELETE /api/debts/:id - Delete debt record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Debt record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Debt record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting debt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete debt record',
      error: error.message
    });
  }
});

// GET /api/debts/analytics - Debt analytics and insights
router.get('/analytics', async (req, res) => {
  try {
    // Basic debt summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_debts,
        SUM(balance) as total_balance,
        SUM(minimum_payment) as total_min_payments,
        AVG(interest_rate) as avg_interest_rate,
        MAX(interest_rate) as highest_rate,
        MIN(interest_rate) as lowest_rate
      FROM debts 
      WHERE user_id = $1 AND balance > 0
    `;
    
    const summaryResult = await pool.query(summaryQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Debt breakdown by type
    const typeQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(balance) as total_balance,
        SUM(minimum_payment) as total_min_payment,
        AVG(interest_rate) as avg_interest_rate
      FROM debts 
      WHERE user_id = $1 AND balance > 0
      GROUP BY type
      ORDER BY total_balance DESC
    `;
    
    const typeResult = await pool.query(typeQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Priority breakdown
    const priorityQuery = `
      SELECT 
        priority,
        COUNT(*) as count,
        SUM(balance) as total_balance,
        AVG(interest_rate) as avg_interest_rate
      FROM debts 
      WHERE user_id = $1 AND balance > 0
      GROUP BY priority
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END
    `;
    
    const priorityResult = await pool.query(priorityQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Debt payoff projections (using debt avalanche method)
    const debtListQuery = `
      SELECT name, balance, minimum_payment, interest_rate, type, priority
      FROM debts 
      WHERE user_id = $1 AND balance > 0
      ORDER BY interest_rate DESC
    `;
    
    const debtListResult = await pool.query(debtListQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Calculate payoff strategies
    const debts = debtListResult.rows.map(debt => ({
      ...debt,
      balance: parseFloat(debt.balance),
      minimum_payment: parseFloat(debt.minimum_payment),
      interest_rate: parseFloat(debt.interest_rate),
      months_to_payoff: calculateMonthsToPayoff(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      ),
      total_interest: calculateTotalInterest(
        parseFloat(debt.balance), 
        parseFloat(debt.minimum_payment), 
        parseFloat(debt.interest_rate)
      )
    }));
    
    res.json({
      success: true,
      data: {
        summary: {
          total_debts: parseInt(summaryResult.rows[0].total_debts) || 0,
          total_balance: parseFloat(summaryResult.rows[0].total_balance) || 0,
          total_min_payments: parseFloat(summaryResult.rows[0].total_min_payments) || 0,
          avg_interest_rate: parseFloat(summaryResult.rows[0].avg_interest_rate) || 0,
          highest_rate: parseFloat(summaryResult.rows[0].highest_rate) || 0,
          lowest_rate: parseFloat(summaryResult.rows[0].lowest_rate) || 0
        },
        by_type: typeResult.rows.map(row => ({
          type: row.type,
          count: parseInt(row.count),
          total_balance: parseFloat(row.total_balance),
          total_min_payment: parseFloat(row.total_min_payment),
          avg_interest_rate: parseFloat(row.avg_interest_rate)
        })),
        by_priority: priorityResult.rows.map(row => ({
          priority: row.priority,
          count: parseInt(row.count),
          total_balance: parseFloat(row.total_balance),
          avg_interest_rate: parseFloat(row.avg_interest_rate)
        })),
        payoff_analysis: {
          avalanche_order: debts,
          total_months: debts.reduce((max, debt) => Math.max(max, debt.months_to_payoff), 0),
          total_interest: debts.reduce((sum, debt) => sum + debt.total_interest, 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching debt analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debt analytics',
      error: error.message
    });
  }
});

module.exports = router;
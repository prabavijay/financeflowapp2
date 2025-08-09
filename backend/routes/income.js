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
const incomeSchema = z.object({
  source: z.string().min(1).max(255),
  category: z.enum(['salary', 'freelance', 'investment', 'rental', 'business', 'other']),
  amount: z.number().positive(),
  frequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']),
  description: z.string().optional(),
  date_received: z.string().optional(),
  is_recurring: z.boolean().default(false),
  owner: z.enum(['Personal', 'Spouse', 'Family']).default('Personal'),
});

const updateIncomeSchema = incomeSchema.partial();

// Helper functions
const calculateNextPayment = (date, frequency) => {
  const currentDate = new Date(date);
  
  switch (frequency) {
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + 7);
      break;
    case 'bi-weekly':
      currentDate.setDate(currentDate.getDate() + 14);
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + 1);
      break;
    case 'quarterly':
      currentDate.setMonth(currentDate.getMonth() + 3);
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    case 'one-time':
      return null;
    default:
      return null;
  }
  
  return currentDate.toISOString();
};

const calculateMonthlyAmount = (amount, frequency) => {
  switch (frequency) {
    case 'weekly': return amount * 4.33;
    case 'bi-weekly': return amount * 2.17;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'yearly': return amount / 12;
    case 'one-time': return 0;
    default: return amount;
  }
};

// GET /api/income - List user income with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, frequency, sort = 'date', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, source, category, amount, frequency, description, date_received, 
             is_recurring, owner, created_at, updated_at
      FROM income 
      WHERE user_id = $1
    `;
    
    const queryParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f']; // Existing user UUID
    let paramCount = 1;
    
    // Add filters
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      queryParams.push(category);
    }
    
    if (frequency) {
      paramCount++;
      query += ` AND frequency = $${paramCount}`;
      queryParams.push(frequency);
    }
    
    // Add sorting
    const validSortFields = ['date_received', 'amount', 'source', 'created_at'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toUpperCase())) {
      query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      query += ` ORDER BY date_received DESC`;
    }
    
    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);
    
    const result = await pool.query(query, queryParams);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM income WHERE user_id = $1';
    const countParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f'];
    
    if (category) {
      countQuery += ' AND category = $2';
      countParams.push(category);
    }
    if (frequency) {
      const paramIndex = countParams.length + 1;
      countQuery += ` AND frequency = $${paramIndex}`;
      countParams.push(frequency);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      success: true,
      data: result.rows,
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
    console.error('Error fetching income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income records',
      error: error.message
    });
  }
});

// POST /api/income - Create new income record
router.post('/', async (req, res) => {
  try {
    const validatedData = incomeSchema.parse(req.body);
    
    // Set default date if not provided
    const date = validatedData.date || new Date().toISOString();
    
    // Calculate next payment if recurring
    const nextPayment = validatedData.is_recurring !== false ? 
      calculateNextPayment(date, validatedData.frequency) : null;
    
    const query = `
      INSERT INTO income (
        user_id, source, category, amount, frequency, description, 
        date_received, is_recurring, owner
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    // Set default date if not provided
    const dateReceived = validatedData.date_received || new Date().toISOString().split('T')[0];
    
    const values = [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f', // Mock user UUID
      validatedData.source,
      validatedData.category,
      validatedData.amount,
      validatedData.frequency,
      validatedData.description || null,
      dateReceived,
      validatedData.is_recurring,
      validatedData.owner || 'Personal'
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Income record created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error creating income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create income record',
      error: error.message
    });
  }
});

// PUT /api/income/:id - Update income record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateIncomeSchema.parse(req.body);
    
    // Check if income exists and belongs to user
    const existingQuery = 'SELECT * FROM income WHERE id = $1 AND user_id = $2';
    const existingResult = await pool.query(existingQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }
    
    const existing = existingResult.rows[0];
    
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
    
    // Note: next_payment column does not exist in current schema
    // Removed next_payment calculation to match actual table structure
    
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
    updateValues.push('c905f9c7-9fce-4ac9-8e59-514701257b3f'); // Mock user UUID
    
    const updateQuery = `
      UPDATE income 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    
    res.json({
      success: true,
      message: 'Income record updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error updating income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update income record',
      error: error.message
    });
  }
});

// DELETE /api/income/:id - Delete income record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM income WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Income record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete income record',
      error: error.message
    });
  }
});

// GET /api/income/analytics - Income analytics and charts data
router.get('/analytics', async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    
    // Monthly totals for the year
    const monthlyQuery = `
      SELECT 
        DATE_TRUNC('month', date_received) as month,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        category
      FROM income 
      WHERE user_id = $1 
        AND EXTRACT(YEAR FROM date_received) = $2
      GROUP BY DATE_TRUNC('month', date_received), category
      ORDER BY month, category
    `;
    
    const monthlyResult = await pool.query(monthlyQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f', year]);
    
    // Category breakdown
    const categoryQuery = `
      SELECT 
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count,
        AVG(amount) as avg_amount
      FROM income 
      WHERE user_id = $1 
        AND date_received >= date_trunc('year', CURRENT_DATE)
      GROUP BY category
      ORDER BY total_amount DESC
    `;
    
    const categoryResult = await pool.query(categoryQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Monthly recurring income calculation
    const recurringQuery = `
      SELECT 
        SUM(CASE 
          WHEN frequency = 'weekly' THEN amount * 4.33
          WHEN frequency = 'bi-weekly' THEN amount * 2.17
          WHEN frequency = 'monthly' THEN amount
          WHEN frequency = 'quarterly' THEN amount / 3
          WHEN frequency = 'yearly' THEN amount / 12
          ELSE 0
        END) as monthly_recurring_total
      FROM income 
      WHERE user_id = $1 AND is_recurring = true
    `;
    
    const recurringResult = await pool.query(recurringQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Frequency distribution
    const frequencyQuery = `
      SELECT 
        frequency,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM income 
      WHERE user_id = $1
      GROUP BY frequency
      ORDER BY count DESC
    `;
    
    const frequencyResult = await pool.query(frequencyQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Year over year comparison
    const yoyQuery = `
      SELECT 
        EXTRACT(YEAR FROM date_received) as year,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM income 
      WHERE user_id = $1 
        AND date_received >= date_trunc('year', CURRENT_DATE - INTERVAL '1 year')
      GROUP BY EXTRACT(YEAR FROM date_received)
      ORDER BY year
    `;
    
    const yoyResult = await pool.query(yoyQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    res.json({
      success: true,
      data: {
        monthly: monthlyResult.rows,
        categories: categoryResult.rows,
        monthlyRecurringTotal: parseFloat(recurringResult.rows[0]?.monthly_recurring_total || 0),
        frequencies: frequencyResult.rows,
        yearOverYear: yoyResult.rows,
        summary: {
          totalIncome: categoryResult.rows.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0),
          totalTransactions: categoryResult.rows.reduce((sum, cat) => sum + parseInt(cat.transaction_count), 0),
          averageIncomePerTransaction: categoryResult.rows.length > 0 ? 
            categoryResult.rows.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0) / 
            categoryResult.rows.reduce((sum, cat) => sum + parseInt(cat.transaction_count), 0) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching income analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch income analytics',
      error: error.message
    });
  }
});

module.exports = router;
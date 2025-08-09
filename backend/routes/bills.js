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
const billSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['utilities', 'rent', 'mortgage', 'insurance', 'phone', 'internet', 'streaming', 'subscription', 'other']),
  amount: z.number().positive(),
  due_date: z.string(),
  frequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  auto_pay: z.boolean().default(false),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  is_recurring: z.boolean().default(true),
  notes: z.string().optional(),
  owner: z.enum(['Personal', 'Spouse', 'Family']).default('Personal'),
});

const updateBillSchema = billSchema.partial();

// Helper functions
const calculateNextDueDate = (dueDate, frequency) => {
  const currentDate = new Date(dueDate);
  
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
    default:
      return null;
  }
  
  return currentDate.toISOString().split('T')[0];
};

// GET /api/bills - List user bills with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, is_paid, overdue_only, sort = 'due_date', order = 'ASC' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, category, amount, due_date, frequency, auto_pay, 
             status, is_recurring, notes, owner, created_at, updated_at
      FROM bills 
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
    
    if (is_paid !== undefined) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      queryParams.push(is_paid === 'true' ? 'paid' : 'pending');
    }
    
    if (overdue_only === 'true') {
      query += ` AND due_date < CURRENT_DATE AND status = 'pending'`;
    }
    
    // Add sorting
    const validSortFields = ['due_date', 'amount', 'name', 'created_at'];
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
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM bills WHERE user_id = $1';
    const countParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f'];
    
    if (category) {
      countQuery += ' AND category = $2';
      countParams.push(category);
    }
    if (is_paid !== undefined) {
      const paramIndex = countParams.length + 1;
      countQuery += ` AND status = $${paramIndex}`;
      countParams.push(is_paid === 'true' ? 'paid' : 'pending');
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
    console.error('Error fetching bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill records',
      error: error.message
    });
  }
});

// POST /api/bills - Create new bill record
router.post('/', async (req, res) => {
  try {
    const validatedData = billSchema.parse(req.body);
    
    const query = `
      INSERT INTO bills (
        user_id, name, category, amount, due_date, frequency, 
        auto_pay, status, is_recurring, notes, owner
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f', // Existing user UUID
      validatedData.name,
      validatedData.category,
      validatedData.amount,
      validatedData.due_date,
      validatedData.frequency,
      validatedData.auto_pay,
      validatedData.status,
      validatedData.is_recurring,
      validatedData.notes || null,
      validatedData.owner || 'Personal'
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Bill record created successfully',
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
    
    console.error('Error creating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bill record',
      error: error.message
    });
  }
});

// PUT /api/bills/:id - Update bill record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateBillSchema.parse(req.body);
    
    // Check if bill exists and belongs to user
    const existingQuery = 'SELECT * FROM bills WHERE id = $1 AND user_id = $2';
    const existingResult = await pool.query(existingQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill record not found'
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
      UPDATE bills 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    
    res.json({
      success: true,
      message: 'Bill record updated successfully',
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
    
    console.error('Error updating bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bill record',
      error: error.message
    });
  }
});

// POST /api/bills/:id/pay - Mark bill as paid
router.post('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_date } = req.body;
    
    // Check if bill exists and belongs to user
    const existingQuery = 'SELECT * FROM bills WHERE id = $1 AND user_id = $2';
    const existingResult = await pool.query(existingQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill record not found'
      });
    }
    
    const bill = existingResult.rows[0];
    
    // Mark as paid and calculate next due date if recurring
    let nextDueDate = null;
    if (bill.frequency) {
      nextDueDate = calculateNextDueDate(bill.due_date, bill.frequency);
    }
    
    let updateQuery;
    let updateValues;
    
    if (nextDueDate) {
      // If recurring, create a new bill record for next payment and mark current as paid
      updateQuery = `
        UPDATE bills 
        SET status = 'paid', updated_at = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      updateValues = [new Date().toISOString(), id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f'];
      
      const result = await pool.query(updateQuery, updateValues);
      
      // Create next bill record
      const nextBillQuery = `
        INSERT INTO bills (
          user_id, name, category, amount, due_date, frequency, 
          auto_pay, status, is_recurring, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const nextBillValues = [
        'c905f9c7-9fce-4ac9-8e59-514701257b3f',
        bill.name,
        bill.category,
        bill.amount,
        nextDueDate,
        bill.frequency,
        bill.auto_pay,
        'pending',
        bill.is_recurring,
        bill.notes
      ];
      
      await pool.query(nextBillQuery, nextBillValues);
      
      res.json({
        success: true,
        message: 'Bill marked as paid and next bill created',
        data: result.rows[0]
      });
    } else {
      // One-time bill, just mark as paid
      updateQuery = `
        UPDATE bills 
        SET status = 'paid', updated_at = $1
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;
      updateValues = [new Date().toISOString(), id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f'];
      
      const result = await pool.query(updateQuery, updateValues);
      
      res.json({
        success: true,
        message: 'Bill marked as paid',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bill as paid',
      error: error.message
    });
  }
});

// DELETE /api/bills/:id - Delete bill record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM bills WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bill record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Bill record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill record',
      error: error.message
    });
  }
});

// GET /api/bills/upcoming - Get upcoming bills for dashboard
router.get('/upcoming', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const query = `
      SELECT id, name, category, amount, due_date, auto_pay, status
      FROM bills 
      WHERE user_id = $1 
        AND status = 'pending'
        AND due_date <= CURRENT_DATE + INTERVAL '${parseInt(days)} days'
      ORDER BY due_date ASC
      LIMIT 10
    `;
    
    const result = await pool.query(query, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching upcoming bills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming bills',
      error: error.message
    });
  }
});

// GET /api/bills/analytics - Bills analytics
router.get('/analytics', async (req, res) => {
  try {
    // Category breakdown
    const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM bills 
      WHERE user_id = $1
      GROUP BY category
      ORDER BY total_amount DESC
    `;
    
    const categoryResult = await pool.query(categoryQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Payment status overview
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM bills 
      WHERE user_id = $1
      GROUP BY status
    `;
    
    const statusResult = await pool.query(statusQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Overdue bills
    const overdueQuery = `
      SELECT COUNT(*) as overdue_count, COALESCE(SUM(amount), 0) as overdue_amount
      FROM bills 
      WHERE user_id = $1 AND due_date < CURRENT_DATE AND status = 'pending'
    `;
    
    const overdueResult = await pool.query(overdueQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Auto-pay summary
    const autoPayQuery = `
      SELECT 
        auto_pay,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM bills 
      WHERE user_id = $1
      GROUP BY auto_pay
    `;
    
    const autoPayResult = await pool.query(autoPayQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    res.json({
      success: true,
      data: {
        categories: categoryResult.rows,
        paymentStatus: statusResult.rows,
        overdue: overdueResult.rows[0],
        autoPay: autoPayResult.rows,
        summary: {
          totalBills: categoryResult.rows.reduce((sum, cat) => sum + parseInt(cat.count), 0),
          totalAmount: categoryResult.rows.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0),
          averageBillAmount: categoryResult.rows.length > 0 ? 
            categoryResult.rows.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0) / 
            categoryResult.rows.reduce((sum, cat) => sum + parseInt(cat.count), 0) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bills analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills analytics',
      error: error.message
    });
  }
});

module.exports = router;
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
const budgetSchema = z.object({
  name: z.string().min(1).max(255),
  start_date: z.string(),
  end_date: z.string(),
  notes: z.string().optional(),
  owner: z.enum(['Personal', 'Spouse', 'Family']).default('Personal'),
});

const budgetItemSchema = z.object({
  budget_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  category: z.string().min(1).max(100),
  frequency: z.enum(['weekly', 'bi-weekly', 'semi-monthly', 'monthly', 'yearly']),
  start_date: z.string(),
  day_of_month_1: z.number().int().min(1).max(31).optional(),
  day_of_month_2: z.number().int().min(1).max(31).optional(),
});

// Helper functions
const calculateMonthlyAmount = (amount, frequency) => {
  switch (frequency) {
    case 'weekly': return amount * 52 / 12;
    case 'bi-weekly': return amount * 26 / 12;
    case 'semi-monthly': return amount * 2;
    case 'monthly': return amount;
    case 'yearly': return amount / 12;
    default: return amount;
  }
};

const getProjectedEvents = (budgetItems, month, year) => {
  const events = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  budgetItems.forEach(item => {
    const monthlyAmount = calculateMonthlyAmount(item.amount, item.frequency);
    
    // Simple event generation based on frequency
    if (item.frequency === 'monthly' && item.day_of_month_1) {
      const eventDate = Math.min(item.day_of_month_1, daysInMonth);
      events.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(eventDate).padStart(2, '0')}`,
        name: item.name,
        amount: item.type === 'income' ? item.amount : -item.amount,
        type: item.type
      });
    } else if (item.frequency === 'bi-weekly' && item.day_of_month_1) {
      // Add two events for bi-weekly
      const firstDate = Math.min(item.day_of_month_1, daysInMonth);
      const secondDate = Math.min(item.day_of_month_1 + 14, daysInMonth);
      
      events.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(firstDate).padStart(2, '0')}`,
        name: item.name,
        amount: item.type === 'income' ? item.amount : -item.amount,
        type: item.type
      });
      
      if (secondDate <= daysInMonth && secondDate !== firstDate) {
        events.push({
          date: `${year}-${String(month).padStart(2, '0')}-${String(secondDate).padStart(2, '0')}`,
          name: item.name,
          amount: item.type === 'income' ? item.amount : -item.amount,
          type: item.type
        });
      }
    } else {
      // Default to 1st of month for other frequencies
      events.push({
        date: `${year}-${String(month).padStart(2, '0')}-01`,
        name: item.name,
        amount: item.type === 'income' ? monthlyAmount : -monthlyAmount,
        type: item.type
      });
    }
  });
  
  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
};

// GET /api/budgets - List user budgets
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = `
      SELECT b.*, b.owner, 
        COUNT(bi.id) as item_count,
        SUM(CASE WHEN bi.type = 'income' THEN bi.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN bi.type = 'expense' THEN bi.amount ELSE 0 END) as total_expenses
      FROM budgets b
      LEFT JOIN budget_items bi ON b.id = bi.budget_id
      WHERE b.user_id = $1
    `;
    
    const queryParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f'];
    
    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM b.start_date) = $2 AND EXTRACT(YEAR FROM b.start_date) = $3`;
      queryParams.push(parseInt(month), parseInt(year));
    }
    
    query += ` GROUP BY b.id ORDER BY b.created_at DESC`;
    
    const result = await pool.query(query, queryParams);
    
    const budgets = result.rows.map(budget => ({
      ...budget,
      total_income: parseFloat(budget.total_income) || 0,
      total_expenses: parseFloat(budget.total_expenses) || 0,
      projected_net: (parseFloat(budget.total_income) || 0) - (parseFloat(budget.total_expenses) || 0),
      item_count: parseInt(budget.item_count) || 0
    }));
    
    res.json({
      success: true,
      data: budgets
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message
    });
  }
});

// GET /api/budgets/:id - Get specific budget with items
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;
    
    // Get budget details
    const budgetQuery = 'SELECT *, owner FROM budgets WHERE id = $1 AND user_id = $2';
    const budgetResult = await pool.query(budgetQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (budgetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    // Get budget items
    const itemsQuery = `
      SELECT * FROM budget_items 
      WHERE budget_id = $1 AND user_id = $2 
      ORDER BY type, category, name
    `;
    const itemsResult = await pool.query(itemsQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    const budget = budgetResult.rows[0];
    const items = itemsResult.rows.map(item => ({
      ...item,
      amount: parseFloat(item.amount),
      monthly_amount: calculateMonthlyAmount(parseFloat(item.amount), item.frequency)
    }));
    
    // Calculate totals
    const totalIncome = items
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + item.monthly_amount, 0);
    
    const totalExpenses = items
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.monthly_amount, 0);
    
    // Generate projected events if month/year provided
    let projectedEvents = [];
    if (month && year) {
      projectedEvents = getProjectedEvents(items, parseInt(month), parseInt(year));
    }
    
    res.json({
      success: true,
      data: {
        ...budget,
        items,
        summary: {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          projected_net: totalIncome - totalExpenses
        },
        projected_events: projectedEvents
      }
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget',
      error: error.message
    });
  }
});

// POST /api/budgets - Create new budget
router.post('/', async (req, res) => {
  try {
    const validatedData = budgetSchema.parse(req.body);
    
    const query = `
      INSERT INTO budgets (user_id, name, start_date, end_date, notes, owner)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f',
      validatedData.name,
      validatedData.start_date,
      validatedData.end_date,
      validatedData.notes || null,
      validatedData.owner || 'Personal'
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
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
    
    console.error('Error creating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create budget',
      error: error.message
    });
  }
});

// POST /api/budgets/:id/items - Add budget item
router.post('/:id/items', async (req, res) => {
  try {
    const { id: budgetId } = req.params;
    const validatedData = budgetItemSchema.parse({ ...req.body, budget_id: budgetId });
    
    // Verify budget exists and belongs to user
    const budgetCheck = await pool.query(
      'SELECT id FROM budgets WHERE id = $1 AND user_id = $2',
      [budgetId, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']
    );
    
    if (budgetCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    const query = `
      INSERT INTO budget_items (
        user_id, budget_id, name, type, amount, category, frequency, 
        start_date, day_of_month_1, day_of_month_2
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f',
      validatedData.budget_id,
      validatedData.name,
      validatedData.type,
      validatedData.amount,
      validatedData.category,
      validatedData.frequency,
      validatedData.start_date,
      validatedData.day_of_month_1 || null,
      validatedData.day_of_month_2 || null
    ];
    
    const result = await pool.query(query, values);
    
    const item = result.rows[0];
    const itemWithCalculations = {
      ...item,
      amount: parseFloat(item.amount),
      monthly_amount: calculateMonthlyAmount(parseFloat(item.amount), item.frequency)
    };
    
    res.status(201).json({
      success: true,
      message: 'Budget item added successfully',
      data: itemWithCalculations
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error adding budget item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add budget item',
      error: error.message
    });
  }
});

// DELETE /api/budgets/items/:itemId - Delete budget item
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const query = 'DELETE FROM budget_items WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [itemId, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Budget item deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget item',
      error: error.message
    });
  }
});

// GET /api/budgets/:id/comparison/:month/:year - Compare budget vs actual
router.get('/:id/comparison/:month/:year', async (req, res) => {
  try {
    const { id: budgetId, month, year } = req.params;
    
    // Get budget items
    const budgetQuery = `
      SELECT * FROM budget_items 
      WHERE budget_id = $1 AND user_id = $2
    `;
    const budgetResult = await pool.query(budgetQuery, [budgetId, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Get actual expenses for the month
    const actualExpensesQuery = `
      SELECT category, SUM(amount) as actual_amount
      FROM expenses 
      WHERE user_id = $1 
        AND EXTRACT(MONTH FROM date) = $2 
        AND EXTRACT(YEAR FROM date) = $3
      GROUP BY category
    `;
    const actualExpensesResult = await pool.query(actualExpensesQuery, [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f',
      parseInt(month),
      parseInt(year)
    ]);
    
    // Get actual income for the month
    const actualIncomeQuery = `
      SELECT category, SUM(amount) as actual_amount
      FROM income 
      WHERE user_id = $1 
        AND EXTRACT(MONTH FROM date_received) = $2 
        AND EXTRACT(YEAR FROM date_received) = $3
      GROUP BY category
    `;
    const actualIncomeResult = await pool.query(actualIncomeQuery, [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f',
      parseInt(month),
      parseInt(year)
    ]);
    
    // Create comparison data
    const budgetItems = budgetResult.rows.map(item => ({
      ...item,
      amount: parseFloat(item.amount),
      monthly_amount: calculateMonthlyAmount(parseFloat(item.amount), item.frequency)
    }));
    
    const actualExpensesMap = new Map();
    actualExpensesResult.rows.forEach(row => {
      actualExpensesMap.set(row.category, parseFloat(row.actual_amount));
    });
    
    const actualIncomeMap = new Map();
    actualIncomeResult.rows.forEach(row => {
      actualIncomeMap.set(row.category, parseFloat(row.actual_amount));
    });
    
    const comparison = {
      budget_total: budgetItems.reduce((sum, item) => 
        sum + (item.type === 'expense' ? item.monthly_amount : 0), 0),
      actual_total: Array.from(actualExpensesMap.values()).reduce((sum, val) => sum + val, 0),
      remaining: 0
    };
    
    comparison.remaining = comparison.budget_total - comparison.actual_total;
    
    res.json({
      success: true,
      data: {
        comparison,
        budget_items: budgetItems,
        actual_expenses: Object.fromEntries(actualExpensesMap),
        actual_income: Object.fromEntries(actualIncomeMap)
      }
    });
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget comparison',
      error: error.message
    });
  }
});

module.exports = router;
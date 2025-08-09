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
const assetSchema = z.object({
  name: z.string().min(1).max(255),
  value: z.number().min(0),
  purchase_price: z.number().min(0).optional(),
  purchase_date: z.string().optional(),
  category: z.enum(['real_estate', 'vehicle', 'investment', 'savings', 'retirement', 'other']),
  description: z.string().optional(),
  location: z.string().max(255).optional(),
  appreciation_rate: z.number().optional(),
});

const updateAssetSchema = assetSchema.partial();

// Helper functions
const calculateAppreciation = (purchasePrice, currentValue) => {
  if (!purchasePrice || purchasePrice === 0) return 0;
  return ((currentValue - purchasePrice) / purchasePrice) * 100;
};

const calculateAnnualAppreciation = (purchasePrice, currentValue, purchaseDate) => {
  if (!purchasePrice || !purchaseDate || purchasePrice === 0) return 0;
  
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const yearsOwned = (now - purchase) / (1000 * 60 * 60 * 24 * 365.25);
  
  if (yearsOwned <= 0) return 0;
  
  const totalAppreciation = calculateAppreciation(purchasePrice, currentValue);
  return totalAppreciation / yearsOwned;
};

// GET /api/assets - List user assets with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, sort = 'value', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, value, purchase_price, purchase_date, category, 
             description, location, appreciation_rate, created_at, updated_at
      FROM assets 
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
    
    // Add sorting
    const validSortFields = ['value', 'purchase_price', 'purchase_date', 'name', 'created_at'];
    const validOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toUpperCase())) {
      query += ` ORDER BY ${sort} ${order.toUpperCase()}`;
    } else {
      query += ` ORDER BY value DESC`;
    }
    
    // Add pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    queryParams.push(parseInt(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    queryParams.push(offset);
    
    const result = await pool.query(query, queryParams);
    
    // Calculate additional metrics for each asset
    const assetsWithMetrics = result.rows.map(asset => ({
      ...asset,
      value: parseFloat(asset.value),
      purchase_price: asset.purchase_price ? parseFloat(asset.purchase_price) : null,
      appreciation_rate: asset.appreciation_rate ? parseFloat(asset.appreciation_rate) : null,
      appreciation_amount: asset.purchase_price ? 
        parseFloat(asset.value) - parseFloat(asset.purchase_price) : null,
      appreciation_percent: asset.purchase_price ? 
        calculateAppreciation(parseFloat(asset.purchase_price), parseFloat(asset.value)) : null,
      annual_appreciation: asset.purchase_price && asset.purchase_date ? 
        calculateAnnualAppreciation(
          parseFloat(asset.purchase_price), 
          parseFloat(asset.value), 
          asset.purchase_date
        ) : null
    }));
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM assets WHERE user_id = $1';
    const countParams = ['c905f9c7-9fce-4ac9-8e59-514701257b3f'];
    
    if (category) {
      countQuery += ' AND category = $2';
      countParams.push(category);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      success: true,
      data: assetsWithMetrics,
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
    console.error('Error fetching assets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset records',
      error: error.message
    });
  }
});

// POST /api/assets - Create new asset record
router.post('/', async (req, res) => {
  try {
    const validatedData = assetSchema.parse(req.body);
    
    const query = `
      INSERT INTO assets (
        user_id, name, value, purchase_price, purchase_date, category,
        description, location, appreciation_rate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      'c905f9c7-9fce-4ac9-8e59-514701257b3f', // Existing user UUID
      validatedData.name,
      validatedData.value,
      validatedData.purchase_price || null,
      validatedData.purchase_date || null,
      validatedData.category,
      validatedData.description || null,
      validatedData.location || null,
      validatedData.appreciation_rate || null
    ];
    
    const result = await pool.query(query, values);
    
    // Add calculated metrics to response
    const asset = result.rows[0];
    const assetWithMetrics = {
      ...asset,
      value: parseFloat(asset.value),
      purchase_price: asset.purchase_price ? parseFloat(asset.purchase_price) : null,
      appreciation_rate: asset.appreciation_rate ? parseFloat(asset.appreciation_rate) : null,
      appreciation_amount: asset.purchase_price ? 
        parseFloat(asset.value) - parseFloat(asset.purchase_price) : null,
      appreciation_percent: asset.purchase_price ? 
        calculateAppreciation(parseFloat(asset.purchase_price), parseFloat(asset.value)) : null,
      annual_appreciation: asset.purchase_price && asset.purchase_date ? 
        calculateAnnualAppreciation(
          parseFloat(asset.purchase_price), 
          parseFloat(asset.value), 
          asset.purchase_date
        ) : null
    };
    
    res.status(201).json({
      success: true,
      message: 'Asset record created successfully',
      data: assetWithMetrics
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error creating asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create asset record',
      error: error.message
    });
  }
});

// PUT /api/assets/:id - Update asset record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateAssetSchema.parse(req.body);
    
    // Check if asset exists and belongs to user
    const existingQuery = 'SELECT * FROM assets WHERE id = $1 AND user_id = $2';
    const existingResult = await pool.query(existingQuery, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset record not found'
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
      UPDATE assets 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, updateValues);
    
    // Add calculated metrics to response
    const asset = result.rows[0];
    const assetWithMetrics = {
      ...asset,
      value: parseFloat(asset.value),
      purchase_price: asset.purchase_price ? parseFloat(asset.purchase_price) : null,
      appreciation_rate: asset.appreciation_rate ? parseFloat(asset.appreciation_rate) : null,
      appreciation_amount: asset.purchase_price ? 
        parseFloat(asset.value) - parseFloat(asset.purchase_price) : null,
      appreciation_percent: asset.purchase_price ? 
        calculateAppreciation(parseFloat(asset.purchase_price), parseFloat(asset.value)) : null,
      annual_appreciation: asset.purchase_price && asset.purchase_date ? 
        calculateAnnualAppreciation(
          parseFloat(asset.purchase_price), 
          parseFloat(asset.value), 
          asset.purchase_date
        ) : null
    };
    
    res.json({
      success: true,
      message: 'Asset record updated successfully',
      data: assetWithMetrics
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    console.error('Error updating asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update asset record',
      error: error.message
    });
  }
});

// DELETE /api/assets/:id - Delete asset record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM assets WHERE id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(query, [id, 'c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Asset record not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Asset record deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset record',
      error: error.message
    });
  }
});

// GET /api/assets/analytics - Asset analytics and insights
router.get('/analytics', async (req, res) => {
  try {
    // Basic asset summary
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_assets,
        SUM(value) as total_value,
        SUM(CASE WHEN purchase_price IS NOT NULL THEN purchase_price ELSE 0 END) as total_purchase_price,
        AVG(value) as avg_value,
        MAX(value) as highest_value,
        MIN(value) as lowest_value
      FROM assets 
      WHERE user_id = $1
    `;
    
    const summaryResult = await pool.query(summaryQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Asset breakdown by category
    const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(value) as total_value,
        AVG(value) as avg_value,
        SUM(CASE WHEN purchase_price IS NOT NULL THEN purchase_price ELSE 0 END) as total_purchase_price
      FROM assets 
      WHERE user_id = $1
      GROUP BY category
      ORDER BY total_value DESC
    `;
    
    const categoryResult = await pool.query(categoryQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Top appreciating assets
    const appreciationQuery = `
      SELECT 
        name, category, value, purchase_price,
        CASE 
          WHEN purchase_price IS NOT NULL AND purchase_price > 0 
          THEN ((value - purchase_price) / purchase_price) * 100 
          ELSE 0 
        END as appreciation_percent
      FROM assets 
      WHERE user_id = $1 AND purchase_price IS NOT NULL AND purchase_price > 0
      ORDER BY appreciation_percent DESC
      LIMIT 5
    `;
    
    const appreciationResult = await pool.query(appreciationQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Asset allocation by value
    const allocationQuery = `
      SELECT 
        category,
        SUM(value) as category_value,
        (SUM(value) / (SELECT SUM(value) FROM assets WHERE user_id = $1)) * 100 as allocation_percent
      FROM assets 
      WHERE user_id = $1
      GROUP BY category
      ORDER BY category_value DESC
    `;
    
    const allocationResult = await pool.query(allocationQuery, ['c905f9c7-9fce-4ac9-8e59-514701257b3f']);
    
    // Calculate total appreciation
    const summary = summaryResult.rows[0];
    const totalPurchasePrice = parseFloat(summary.total_purchase_price) || 0;
    const totalCurrentValue = parseFloat(summary.total_value) || 0;
    const totalAppreciation = totalPurchasePrice > 0 ? 
      ((totalCurrentValue - totalPurchasePrice) / totalPurchasePrice) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        summary: {
          total_assets: parseInt(summary.total_assets) || 0,
          total_value: totalCurrentValue,
          total_purchase_price: totalPurchasePrice,
          total_appreciation: totalCurrentValue - totalPurchasePrice,
          total_appreciation_percent: totalAppreciation,
          avg_value: parseFloat(summary.avg_value) || 0,
          highest_value: parseFloat(summary.highest_value) || 0,
          lowest_value: parseFloat(summary.lowest_value) || 0
        },
        by_category: categoryResult.rows.map(row => ({
          category: row.category,
          count: parseInt(row.count),
          total_value: parseFloat(row.total_value),
          avg_value: parseFloat(row.avg_value),
          total_purchase_price: parseFloat(row.total_purchase_price) || 0,
          appreciation: parseFloat(row.total_value) - (parseFloat(row.total_purchase_price) || 0)
        })),
        top_appreciating: appreciationResult.rows.map(row => ({
          name: row.name,
          category: row.category,
          value: parseFloat(row.value),
          purchase_price: parseFloat(row.purchase_price),
          appreciation_percent: parseFloat(row.appreciation_percent)
        })),
        allocation: allocationResult.rows.map(row => ({
          category: row.category,
          value: parseFloat(row.category_value),
          allocation_percent: parseFloat(row.allocation_percent)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching asset analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asset analytics',
      error: error.message
    });
  }
});

module.exports = router;
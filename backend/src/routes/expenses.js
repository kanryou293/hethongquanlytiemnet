import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all expenses with category and staff info
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        oe.*,
        ec.category_name,
        s.full_name as staff_name
      FROM operating_expenses oe
      JOIN expense_categories ec ON oe.category_id = ec.category_id
      JOIN staff s ON oe.staff_id = s.staff_id
      ORDER BY oe.expense_date DESC, oe.expense_id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT
        oe.*,
        ec.category_name,
        s.full_name as staff_name
      FROM operating_expenses oe
      JOIN expense_categories ec ON oe.category_id = ec.category_id
      JOIN staff s ON oe.staff_id = s.staff_id
      WHERE oe.expense_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all expense categories
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expense_categories ORDER BY category_name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { category_id, staff_id, amount, description, expense_date } = req.body;

    if (!category_id || !staff_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(`
      INSERT INTO operating_expenses (category_id, staff_id, amount, description, expense_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [category_id, staff_id, amount, description, expense_date || new Date().toISOString().split('T')[0]]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, description, expense_date } = req.body;

    const result = await pool.query(`
      UPDATE operating_expenses
      SET
        category_id = COALESCE($1, category_id),
        amount = COALESCE($2, amount),
        description = COALESCE($3, description),
        expense_date = COALESCE($4, expense_date)
      WHERE expense_id = $5
      RETURNING *
    `, [category_id, amount, description, expense_date, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM operating_expenses WHERE expense_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expenses by date range
router.get('/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
    const result = await pool.query(`
      SELECT
        oe.*,
        ec.category_name,
        s.full_name as staff_name
      FROM operating_expenses oe
      JOIN expense_categories ec ON oe.category_id = ec.category_id
      JOIN staff s ON oe.staff_id = s.staff_id
      WHERE oe.expense_date BETWEEN $1 AND $2
      ORDER BY oe.expense_date DESC, oe.expense_id DESC
    `, [start, end]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses by range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get expenses summary by category
router.get('/summary/by-category', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ec.category_name,
        ec.category_id,
        COUNT(oe.expense_id) as count,
        COALESCE(SUM(oe.amount), 0) as total_amount
      FROM expense_categories ec
      LEFT JOIN operating_expenses oe ON ec.category_id = oe.category_id
      GROUP BY ec.category_id, ec.category_name
      ORDER BY total_amount DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all menu items
router.get('/', async (req, res) => {
  try {
    const { category, available } = req.query;

    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (available !== undefined) {
      params.push(available === 'true');
      query += ` AND available = $${params.length}`;
    }

    query += ' ORDER BY item_id ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single menu item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE item_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create menu item
router.post('/', async (req, res) => {
  try {
    const { item_name, price, category, current_cost, quantity, available } = req.body;

    const result = await pool.query(
      `INSERT INTO menu_items (item_name, price, category, current_cost, quantity, available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [item_name, price, category, current_cost || 0, quantity || 0, available !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update menu item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, price, category, current_cost, quantity, available } = req.body;

    const result = await pool.query(
      `UPDATE menu_items
       SET item_name = $1, price = $2, category = $3, current_cost = $4, quantity = $5, available = $6
       WHERE item_id = $7
       RETURNING *`,
      [item_name, price, category, current_cost, quantity, available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM menu_items WHERE item_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET categories
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM menu_items ORDER BY category'
    );
    res.json(result.rows.map(r => r.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

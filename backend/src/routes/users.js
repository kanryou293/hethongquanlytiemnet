import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const router = express.Router();

// GET all users with membership info
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, m.tier_name, m.discount_rate, m.min_balance
       FROM users u
       LEFT JOIN memberships m ON u.membership_id = m.membership_id
       ORDER BY u.user_id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.*, m.tier_name, m.discount_rate, m.min_balance
       FROM users u
       LEFT JOIN memberships m ON u.membership_id = m.membership_id
       WHERE u.user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { username, full_name, number_phone, password, membership_id, balance } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, full_name, number_phone, password, membership_id, balance)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, username, full_name, number_phone, membership_id, balance, created_at`,
      [username.toLowerCase(), full_name, number_phone, hashedPassword, membership_id || 1, balance || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Username or phone number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, number_phone, membership_id, balance } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET username = $1, full_name = $2, number_phone = $3, membership_id = $4, balance = $5
       WHERE user_id = $6
       RETURNING user_id, username, full_name, number_phone, membership_id, balance, created_at`,
      [username.toLowerCase(), full_name, number_phone, membership_id, balance, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or phone number already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check for active sessions
    const sessionCheck = await pool.query(
      'SELECT session_id FROM sessions WHERE user_id = $1 AND endtime IS NULL',
      [id]
    );

    if (sessionCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete user with active session' });
    }

    // Check balance
    const userCheck = await pool.query(
      'SELECT balance FROM users WHERE user_id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userCheck.rows[0].balance > 0) {
      return res.status(400).json({ error: 'Cannot delete user with remaining balance' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE user_id = $1 RETURNING user_id, username, full_name',
      [id]
    );

    res.json({ message: 'User deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET user sessions history
router.get('/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*, w.machine_name
       FROM sessions s
       LEFT JOIN workstations w ON s.machine_id = w.machine_id
       WHERE s.user_id = $1
       ORDER BY s.starttime DESC
       LIMIT 50`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET user orders history
router.get('/:id/orders', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT o.*,
       json_agg(json_build_object(
         'item_name', mi.item_name,
         'quantity', od.quantity,
         'unit_price', od.unit_price
       )) as items
       FROM orders o
       LEFT JOIN order_details od ON o.order_id = od.order_id
       LEFT JOIN menu_items mi ON od.item_id = mi.item_id
       WHERE o.user_id = $1
       GROUP BY o.order_id
       ORDER BY o.order_time DESC
       LIMIT 50`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET user top-up history
router.get('/:id/topups', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*, s.full_name as staff_name
       FROM top_up_transactions t
       LEFT JOIN staff s ON t.staff_id = s.staff_id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user topups:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

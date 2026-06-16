import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const router = express.Router();

// GET all staff
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT staff_id, full_name, role, created_at FROM staff ORDER BY staff_id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single staff
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT staff_id, full_name, role, created_at FROM staff WHERE staff_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create staff
router.post('/', async (req, res) => {
  try {
    const { full_name, role, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO staff (full_name, role, password)
       VALUES ($1, $2, $3)
       RETURNING staff_id, full_name, role, created_at`,
      [full_name, role, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role } = req.body;

    const result = await pool.query(
      `UPDATE staff
       SET full_name = $1, role = $2
       WHERE staff_id = $3
       RETURNING staff_id, full_name, role, created_at`,
      [full_name, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT reset password
router.put('/:id/password', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'UPDATE staff SET password = $1 WHERE staff_id = $2 RETURNING staff_id',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({ message: 'Password updated' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM staff WHERE staff_id = $1 RETURNING staff_id, full_name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({ message: 'Staff deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

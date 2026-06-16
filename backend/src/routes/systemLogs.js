import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all system logs
router.get('/', async (req, res) => {
  try {
    const { action, staff_id, limit } = req.query;

    let query = `
      SELECT l.*,
             s.full_name as staff_name,
             s.role as staff_role
      FROM system_logs l
      LEFT JOIN staff s ON l.staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      params.push(action);
      query += ` AND l.action = $${params.length}`;
    }

    if (staff_id) {
      params.push(staff_id);
      query += ` AND l.staff_id = $${params.length}`;
    }

    query += ' ORDER BY l.logged_at DESC';

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
    } else {
      query += ' LIMIT 100';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create log entry
router.post('/', async (req, res) => {
  try {
    const { staff_id, action, target_type, target_id } = req.body;

    const result = await pool.query(
      `INSERT INTO system_logs (staff_id, action, target_type, target_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [staff_id, action, target_type, target_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating log entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET logs by date range
router.get('/range', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date required' });
    }

    const result = await pool.query(
      `SELECT l.*,
              s.full_name as staff_name,
              s.role as staff_role
       FROM system_logs l
       LEFT JOIN staff s ON l.staff_id = s.staff_id
       WHERE l.logged_at BETWEEN $1 AND $2
       ORDER BY l.logged_at DESC`,
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching logs by range:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

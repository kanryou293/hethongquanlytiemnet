import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all memberships
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM memberships ORDER BY membership_id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

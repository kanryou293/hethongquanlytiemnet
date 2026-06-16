import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all workstations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM workstations ORDER BY machine_id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workstations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single workstation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM workstations WHERE machine_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workstation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching workstation:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create workstation
router.post('/', async (req, res) => {
  try {
    const { machine_name, ip, mac, hourly, status } = req.body;

    const result = await pool.query(
      `INSERT INTO workstations (machine_name, ip, mac, hourly, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [machine_name, ip, mac.toUpperCase(), hourly || 3000, status || 'OFFLINE']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating workstation:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Machine name, IP, or MAC already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT update workstation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { machine_name, ip, mac, hourly, status } = req.body;

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (machine_name !== undefined) {
      updates.push(`machine_name = $${paramCount++}`);
      values.push(machine_name);
    }
    if (ip !== undefined) {
      updates.push(`ip = $${paramCount++}`);
      values.push(ip);
    }
    if (mac !== undefined) {
      updates.push(`mac = $${paramCount++}`);
      values.push(mac.toUpperCase());
    }
    if (hourly !== undefined) {
      updates.push(`hourly = $${paramCount++}`);
      values.push(hourly);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE workstations
       SET ${updates.join(', ')}
       WHERE machine_id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workstation not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating workstation:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Machine name, IP, or MAC already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE workstation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check for active sessions
    const sessionCheck = await pool.query(
      'SELECT session_id FROM sessions WHERE machine_id = $1 AND endtime IS NULL',
      [id]
    );

    if (sessionCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete machine with active session' });
    }

    const result = await pool.query(
      'DELETE FROM workstations WHERE machine_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workstation not found' });
    }

    res.json({ message: 'Workstation deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting workstation:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH bulk update hourly rate
router.patch('/bulk/hourly', async (req, res) => {
  try {
    const { hourly } = req.body;

    if (!hourly || hourly < 1000 || hourly > 50000) {
      return res.status(400).json({ error: 'Invalid hourly rate' });
    }

    const result = await pool.query(
      'UPDATE workstations SET hourly = $1 RETURNING *',
      [hourly]
    );

    res.json({
      message: `Updated ${result.rows.length} machines`,
      data: result.rows
    });
  } catch (error) {
    console.error('Error bulk updating hourly rate:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

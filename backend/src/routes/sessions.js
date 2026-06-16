import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all sessions with user and machine info
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;

    let query = `
      SELECT s.*,
             s.hourly_rate,
             u.username, u.full_name, u.balance,
             w.machine_name, w.hourly as current_hourly,
             m.tier_name, m.discount_rate
      FROM sessions s
      LEFT JOIN users u ON s.user_id = u.user_id
      LEFT JOIN workstations w ON s.machine_id = w.machine_id
      LEFT JOIN memberships m ON u.membership_id = m.membership_id
    `;

    if (active === 'true') {
      query += ' WHERE s.endtime IS NULL';
    }

    query += ' ORDER BY s.starttime DESC';

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single session
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.*,
              s.hourly_rate,
              u.username, u.full_name, u.balance,
              w.machine_name, w.hourly as current_hourly,
              m.tier_name, m.discount_rate
       FROM sessions s
       LEFT JOIN users u ON s.user_id = u.user_id
       LEFT JOIN workstations w ON s.machine_id = w.machine_id
       LEFT JOIN memberships m ON u.membership_id = m.membership_id
       WHERE s.session_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create session (start session)
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { user_id, machine_id, is_walk_in, time_package } = req.body;

    // Check if machine is available and get hourly rate
    const machineCheck = await client.query(
      'SELECT status, hourly FROM workstations WHERE machine_id = $1',
      [machine_id]
    );

    if (machineCheck.rows.length === 0) {
      throw new Error('Machine not found');
    }

    if (machineCheck.rows[0].status !== 'OFFLINE') {
      throw new Error('Machine is not available');
    }

    const hourlyRate = machineCheck.rows[0].hourly;

    // Create session with hourly_rate snapshot (no prepayment)
    const sessionResult = await client.query(
      `INSERT INTO sessions (user_id, machine_id, is_walk_in, time_package, hourly_rate, starttime)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [user_id, machine_id, is_walk_in || false, time_package, hourlyRate]
    );

    // Update machine status to ONLINE
    await client.query(
      'UPDATE workstations SET status = $1 WHERE machine_id = $2',
      ['ONLINE', machine_id]
    );

    await client.query('COMMIT');

    res.status(201).json(sessionResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT end session
router.put('/:id/end', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get session details with hourly_rate from session (not workstation)
    const sessionResult = await client.query(
      `SELECT s.*, s.hourly_rate, m.discount_rate, w.machine_id
       FROM sessions s
       LEFT JOIN workstations w ON s.machine_id = w.machine_id
       LEFT JOIN users u ON s.user_id = u.user_id
       LEFT JOIN memberships m ON u.membership_id = m.membership_id
       WHERE s.session_id = $1 AND s.endtime IS NULL`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error('Active session not found');
    }

    const session = sessionResult.rows[0];
    const startTime = new Date(session.starttime);
    const endTime = new Date();
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    // Use hourly_rate from session (locked at start time), not from workstation
    const cost = Math.round(hours * session.hourly_rate * (1 - (session.discount_rate || 0)));

    // Update session with actual cost
    const updateResult = await client.query(
      `UPDATE sessions
       SET endtime = NOW(), cost = $1
       WHERE session_id = $2
       RETURNING *`,
      [cost, id]
    );

    // Deduct actual cost from user balance if not walk-in
    if (session.user_id && !session.is_walk_in) {
      await client.query(
        'UPDATE users SET balance = balance - $1 WHERE user_id = $2',
        [cost, session.user_id]
      );
    }

    // Update machine status to OFFLINE
    await client.query(
      'UPDATE workstations SET status = $1 WHERE machine_id = $2',
      ['OFFLINE', session.machine_id]
    );

    await client.query('COMMIT');

    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error ending session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// DELETE session (admin only - emergency)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get session machine_id
    const sessionResult = await client.query(
      'SELECT machine_id FROM sessions WHERE session_id = $1',
      [id]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error('Session not found');
    }

    const machineId = sessionResult.rows[0].machine_id;

    // Delete session
    await client.query('DELETE FROM sessions WHERE session_id = $1', [id]);

    // Update machine status to OFFLINE
    await client.query(
      'UPDATE workstations SET status = $1 WHERE machine_id = $2',
      ['OFFLINE', machineId]
    );

    await client.query('COMMIT');

    res.json({ message: 'Session deleted' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET session orders
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
       WHERE o.session_id = $1
       GROUP BY o.order_id
       ORDER BY o.order_time DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching session orders:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

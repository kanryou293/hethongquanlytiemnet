import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all top-up transactions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
              u.full_name as user_name,
              u.username,
              s.full_name as staff_name
       FROM top_up_transactions t
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN staff s ON t.staff_id = s.staff_id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching top-up transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single transaction
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT t.*,
              u.full_name as user_name,
              u.username,
              s.full_name as staff_name
       FROM top_up_transactions t
       LEFT JOIN users u ON t.user_id = u.user_id
       LEFT JOIN staff s ON t.staff_id = s.staff_id
       WHERE t.tut_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create top-up transaction
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { user_id, staff_id, amount, paymentmethod } = req.body;

    // Validate amount
    if (!amount || amount < 1000) {
      throw new Error('Invalid amount');
    }

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO top_up_transactions (user_id, staff_id, amount, paymentmethod)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, staff_id, amount, paymentmethod]
    );

    // Update user balance
    await client.query(
      'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
      [amount, user_id]
    );

    await client.query('COMMIT');

    res.status(201).json(transactionResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating top-up transaction:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// DELETE transaction (void - admin only, within 24h)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get transaction details
    const transactionResult = await client.query(
      'SELECT * FROM top_up_transactions WHERE tut_id = $1',
      [id]
    );

    if (transactionResult.rows.length === 0) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionResult.rows[0];

    // Check if within 24 hours
    const createdAt = new Date(transaction.created_at);
    const now = new Date();
    const hoursDiff = (now - createdAt) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      throw new Error('Cannot void transaction older than 24 hours');
    }

    // Deduct from user balance
    await client.query(
      'UPDATE users SET balance = balance - $1 WHERE user_id = $2',
      [transaction.amount, transaction.user_id]
    );

    // Delete transaction
    await client.query('DELETE FROM top_up_transactions WHERE tut_id = $1', [id]);

    await client.query('COMMIT');

    res.json({ message: 'Transaction voided', data: transaction });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error voiding transaction:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;

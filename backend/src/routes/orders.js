import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
              u.full_name as user_name,
              s.machine_id,
              w.machine_name,
              json_agg(json_build_object(
                'item_id', od.item_id,
                'item_name', mi.item_name,
                'quantity', od.quantity,
                'unit_price', od.unit_price
              )) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       LEFT JOIN sessions s ON o.session_id = s.session_id
       LEFT JOIN workstations w ON s.machine_id = w.machine_id
       LEFT JOIN order_details od ON o.order_id = od.order_id
       LEFT JOIN menu_items mi ON od.item_id = mi.item_id
       GROUP BY o.order_id, u.full_name, s.machine_id, w.machine_name
       ORDER BY o.order_time DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT o.*,
              u.full_name as user_name,
              json_agg(json_build_object(
                'item_id', od.item_id,
                'item_name', mi.item_name,
                'quantity', od.quantity,
                'unit_price', od.unit_price
              )) as items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.user_id
       LEFT JOIN order_details od ON o.order_id = od.order_id
       LEFT JOIN menu_items mi ON od.item_id = mi.item_id
       WHERE o.order_id = $1
       GROUP BY o.order_id, u.full_name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create order
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { user_id, session_id, items, total_amount } = req.body;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, session_id, total_amount, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING *`,
      [user_id, session_id, total_amount]
    );

    const orderId = orderResult.rows[0].order_id;

    // Create order details and update inventory
    for (const item of items) {
      // Check stock
      const stockCheck = await client.query(
        'SELECT quantity FROM menu_items WHERE item_id = $1',
        [item.item_id]
      );

      if (stockCheck.rows.length === 0) {
        throw new Error(`Item ${item.item_id} not found`);
      }

      if (stockCheck.rows[0].quantity < item.quantity) {
        throw new Error(`Insufficient stock for item ${item.item_id}`);
      }

      // Insert order detail
      await client.query(
        `INSERT INTO order_details (order_id, item_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.item_id, item.quantity, item.unit_price]
      );

      // Update inventory
      await client.query(
        'UPDATE menu_items SET quantity = quantity - $1 WHERE item_id = $2',
        [item.quantity, item.item_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE order (cancel and restock)
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Get order details
    const orderDetails = await client.query(
      'SELECT item_id, quantity FROM order_details WHERE order_id = $1',
      [id]
    );

    // Restock items
    for (const detail of orderDetails.rows) {
      await client.query(
        'UPDATE menu_items SET quantity = quantity + $1 WHERE item_id = $2',
        [detail.quantity, detail.item_id]
      );
    }

    // Delete order (cascade will delete order_details)
    const result = await client.query(
      'DELETE FROM orders WHERE order_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Order not found');
    }

    await client.query('COMMIT');

    res.json({ message: 'Order cancelled and items restocked', data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting order:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;

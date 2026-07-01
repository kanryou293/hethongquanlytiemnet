import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// GET all inventory imports
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ii.*, s.full_name AS staff_name, mi.item_name
       FROM inventory_imports ii
       LEFT JOIN staff s ON ii.staff_id = s.staff_id
       LEFT JOIN menu_items mi ON ii.item_id = mi.item_id
       ORDER BY ii.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory imports:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single inventory import
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ii.*, s.full_name AS staff_name, mi.item_name
       FROM inventory_imports ii
       LEFT JOIN staff s ON ii.staff_id = s.staff_id
       LEFT JOIN menu_items mi ON ii.item_id = mi.item_id
       WHERE ii.import_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Inventory import not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching inventory import:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST create inventory import
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { staff_id, item_id, quantity, import_price } = req.body;

    if (!staff_id || !item_id || !quantity || !import_price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const total_amount = parseInt(quantity, 10) * parseInt(import_price, 10);

    const insertResult = await client.query(
      `INSERT INTO inventory_imports (staff_id, item_id, quantity, import_price, total_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [staff_id, item_id, quantity, import_price, total_amount]
    );

    await client.query(
      `UPDATE menu_items
       SET quantity = quantity + $1,
           current_cost = $2
       WHERE item_id = $3`,
      [quantity, import_price, item_id]
    );

    await client.query('COMMIT');

    res.status(201).json(insertResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating inventory import:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// PUT update inventory import
router.put('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { staff_id, item_id, quantity, import_price } = req.body;

    const existingResult = await client.query(
      'SELECT * FROM inventory_imports WHERE import_id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Inventory import not found' });
    }

    const existing = existingResult.rows[0];
    const newQuantity = quantity !== undefined ? parseInt(quantity, 10) : existing.quantity;
    const newImportPrice = import_price !== undefined ? parseInt(import_price, 10) : existing.import_price;
    const newStaffId = staff_id !== undefined ? staff_id : existing.staff_id;
    const newItemId = item_id !== undefined ? item_id : existing.item_id;
    const total_amount = newQuantity * newImportPrice;

    if (newItemId === existing.item_id) {
      const quantityDiff = newQuantity - existing.quantity;
      await client.query(
        'UPDATE menu_items SET quantity = quantity + $1, current_cost = $2 WHERE item_id = $3',
        [quantityDiff, newImportPrice, newItemId]
      );
    } else {
      await client.query(
        'UPDATE menu_items SET quantity = quantity - $1 WHERE item_id = $2',
        [existing.quantity, existing.item_id]
      );
      await client.query(
        `UPDATE menu_items
         SET quantity = quantity + $1,
             current_cost = $2
         WHERE item_id = $3`,
        [newQuantity, newImportPrice, newItemId]
      );
    }

    const updateResult = await client.query(
      `UPDATE inventory_imports
       SET staff_id = $1,
           item_id = $2,
           quantity = $3,
           import_price = $4,
           total_amount = $5
       WHERE import_id = $6
       RETURNING *`,
      [newStaffId, newItemId, newQuantity, newImportPrice, total_amount, id]
    );

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating inventory import:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// DELETE inventory import
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const existingResult = await client.query(
      'SELECT * FROM inventory_imports WHERE import_id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Inventory import not found' });
    }

    const existing = existingResult.rows[0];
    const adjustResult = await client.query(
      `UPDATE menu_items
       SET quantity = quantity - $1
       WHERE item_id = $2
       RETURNING quantity`,
      [existing.quantity, existing.item_id]
    );

    if (adjustResult.rows.length === 0) {
      throw new Error('Menu item not found');
    }

    if (adjustResult.rows[0].quantity < 0) {
      throw new Error('Cannot delete import because stock would go negative');
    }

    const deleteResult = await client.query(
      'DELETE FROM inventory_imports WHERE import_id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Inventory import deleted', data: deleteResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting inventory import:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

export default router;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import workstationsRoutes from './routes/workstations.js';
import sessionsRoutes from './routes/sessions.js';
import usersRoutes from './routes/users.js';
import membershipsRoutes from './routes/memberships.js';
import menuItemsRoutes from './routes/menuItems.js';
import ordersRoutes from './routes/orders.js';
import topUpRoutes from './routes/topUp.js';
import staffRoutes from './routes/staff.js';
import systemLogsRoutes from './routes/systemLogs.js';
import expensesRoutes from './routes/expenses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: result.rows[0].now,
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// API Routes
app.use('/api/workstations', workstationsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/memberships', membershipsRoutes);
app.use('/api/menu-items', menuItemsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/top-up', topUpRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/system-logs', systemLogsRoutes);
app.use('/api/expenses', expensesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});

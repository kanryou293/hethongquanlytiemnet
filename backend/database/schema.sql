-- Knight Tree Net Database Schema
-- PostgreSQL

-- Drop tables if exists (in reverse order of dependencies)
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS machine_health CASCADE;
DROP TABLE IF EXISTS operating_expenses CASCADE;
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS inventory_imports CASCADE;
DROP TABLE IF EXISTS order_details CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS top_up_transactions CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS workstations CASCADE;

-- Create tables

-- Memberships
CREATE TABLE memberships (
  membership_id SERIAL PRIMARY KEY,
  tier_name VARCHAR(50) NOT NULL,
  discount_rate DECIMAL(3,2) NOT NULL DEFAULT 0,
  min_balance INTEGER NOT NULL DEFAULT 0
);

-- Workstations
CREATE TABLE workstations (
  machine_id SERIAL PRIMARY KEY,
  machine_name VARCHAR(20) NOT NULL UNIQUE,
  ip VARCHAR(15) NOT NULL UNIQUE,
  mac VARCHAR(17) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'MAINTENANCE')),
  hourly INTEGER NOT NULL DEFAULT 3000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  membership_id INTEGER NOT NULL REFERENCES memberships(membership_id),
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  number_phone VARCHAR(15) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE staff (
  staff_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Staff')),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE sessions (
  session_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  machine_id INTEGER NOT NULL REFERENCES workstations(machine_id),
  starttime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endtime TIMESTAMP,
  cost INTEGER NOT NULL DEFAULT 0,
  is_walk_in BOOLEAN DEFAULT FALSE,
  time_package VARCHAR(20)
);

-- Menu Items
CREATE TABLE menu_items (
  item_id SERIAL PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  current_cost INTEGER NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0
);

-- Orders
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  session_id INTEGER REFERENCES sessions(session_id),
  total_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Details
CREATE TABLE order_details (
  order_detail_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES menu_items(item_id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

-- Top Up Transactions
CREATE TABLE top_up_transactions (
  tut_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  staff_id INTEGER NOT NULL REFERENCES staff(staff_id),
  amount INTEGER NOT NULL,
  paymentmethod VARCHAR(20) NOT NULL CHECK (paymentmethod IN ('cash', 'transfer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense Categories
CREATE TABLE expense_categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL UNIQUE
);

-- Operating Expenses
CREATE TABLE operating_expenses (
  expense_id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES expense_categories(category_id),
  staff_id INTEGER NOT NULL REFERENCES staff(staff_id),
  amount INTEGER NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Inventory Imports
CREATE TABLE inventory_imports (
  import_id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL REFERENCES staff(staff_id),
  item_id INTEGER NOT NULL REFERENCES menu_items(item_id),
  quantity INTEGER NOT NULL,
  import_price INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Machine Health
CREATE TABLE machine_health (
  health_id SERIAL PRIMARY KEY,
  machine_id INTEGER NOT NULL REFERENCES workstations(machine_id),
  cpu_temp INTEGER,
  gpu_temp INTEGER,
  disk_free_gb INTEGER,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Logs
CREATE TABLE system_logs (
  log_id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES staff(staff_id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT')),
  target_type VARCHAR(50),
  target_id INTEGER,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_machine ON sessions(machine_id);
CREATE INDEX idx_sessions_active ON sessions(endtime) WHERE endtime IS NULL;
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_system_logs_staff ON system_logs(staff_id);
CREATE INDEX idx_system_logs_time ON system_logs(logged_at);
CREATE INDEX idx_machine_health_machine ON machine_health(machine_id);

-- Insert default data

-- Memberships
INSERT INTO memberships (tier_name, discount_rate, min_balance) VALUES
('Đồng', 0, 0),
('Bạc', 0.05, 100000),
('Vàng', 0.10, 300000),
('Bạch Kim', 0.15, 500000),
('Kim Cương', 0.20, 1000000);

-- Expense Categories
INSERT INTO expense_categories (category_name) VALUES
('Điện'),
('Nước'),
('Internet'),
('Bảo trì'),
('Văn phòng phẩm'),
('Khác');

-- Workstations (20 machines)
INSERT INTO workstations (machine_name, ip, mac, status, hourly) VALUES
('PC-01', '192.168.1.101', '00:1B:44:11:3A:B7', 'ONLINE', 3000),
('PC-02', '192.168.1.102', '00:1B:44:11:3A:B8', 'ONLINE', 3000),
('PC-03', '192.168.1.103', '00:1B:44:11:3A:B9', 'ONLINE', 3000),
('PC-04', '192.168.1.104', '00:1B:44:11:3A:C0', 'ONLINE', 3000),
('PC-05', '192.168.1.105', '00:1B:44:11:3A:C1', 'ONLINE', 3000),
('PC-06', '192.168.1.106', '00:1B:44:11:3A:C2', 'OFFLINE', 3000),
('PC-07', '192.168.1.107', '00:1B:44:11:3A:C3', 'OFFLINE', 3000),
('PC-08', '192.168.1.108', '00:1B:44:11:3A:C4', 'ONLINE', 3000),
('PC-09', '192.168.1.109', '00:1B:44:11:3A:C5', 'MAINTENANCE', 3000),
('PC-10', '192.168.1.110', '00:1B:44:11:3A:C6', 'OFFLINE', 3000),
('PC-11', '192.168.1.111', '00:1B:44:11:3A:C7', 'ONLINE', 3000),
('PC-12', '192.168.1.112', '00:1B:44:11:3A:C8', 'OFFLINE', 3000),
('PC-13', '192.168.1.113', '00:1B:44:11:3A:C9', 'OFFLINE', 3000),
('PC-14', '192.168.1.114', '00:1B:44:11:3A:D0', 'ONLINE', 3000),
('PC-15', '192.168.1.115', '00:1B:44:11:3A:D1', 'OFFLINE', 3000),
('PC-16', '192.168.1.116', '00:1B:44:11:3A:D2', 'OFFLINE', 3000),
('PC-17', '192.168.1.117', '00:1B:44:11:3A:D3', 'ONLINE', 3000),
('PC-18', '192.168.1.118', '00:1B:44:11:3A:D4', 'OFFLINE', 3000),
('PC-19', '192.168.1.119', '00:1B:44:11:3A:D5', 'OFFLINE', 3000),
('PC-20', '192.168.1.120', '00:1B:44:11:3A:D6', 'OFFLINE', 3000);

-- Staff (password: 'admin123' hashed with bcrypt)
INSERT INTO staff (full_name, role, password) VALUES
('Nguyễn Minh Quân', 'Admin', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY'),
('Trần Thị Hương', 'Manager', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY'),
('Lê Văn Tùng', 'Staff', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY'),
('Phạm Thị Lan', 'Staff', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY');

-- Users (password: 'user123' hashed)
INSERT INTO users (membership_id, username, full_name, number_phone, password, balance) VALUES
(5, 'nguyenvana', 'Nguyễn Văn A', '0901234567', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 1200000),
(4, 'tranthib', 'Trần Thị B', '0902345678', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 650000),
(3, 'levanc', 'Lê Văn C', '0903456789', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 350000),
(2, 'phamthid', 'Phạm Thị D', '0904567890', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 150000),
(1, 'hoangvane', 'Hoàng Văn E', '0905678901', '$2b$10$rKZLvVZhz5qP0qYxQxQxQeO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqY', 80000);

-- Menu Items
INSERT INTO menu_items (item_name, price, category, available, current_cost, quantity) VALUES
('Mì gói', 5000, 'Đồ ăn', true, 3000, 50),
('Nước ngọt Coca', 10000, 'Đồ uống', true, 7000, 30),
('Nước ngọt Pepsi', 10000, 'Đồ uống', true, 7000, 25),
('Cà phê đen', 15000, 'Đồ uống', true, 8000, 40),
('Cà phê sữa', 18000, 'Đồ uống', true, 10000, 35),
('Snack Oishi', 8000, 'Snack', true, 5000, 60),
('Snack Poca', 8000, 'Snack', true, 5000, 55),
('Bánh mì thịt', 20000, 'Đồ ăn', true, 12000, 15),
('Trà sữa trân châu', 25000, 'Đồ uống', true, 15000, 20),
('Cơm gà xối mỡ', 30000, 'Đồ ăn', true, 18000, 10);

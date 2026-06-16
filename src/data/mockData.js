// Mock data for Knight Tree Net

// Membership tiers
export const memberships = [
  { membership_id: 1, tier_name: 'Đồng', discount_rate: 0, min_balance: 0 },
  { membership_id: 2, tier_name: 'Bạc', discount_rate: 0.05, min_balance: 100000 },
  { membership_id: 3, tier_name: 'Vàng', discount_rate: 0.10, min_balance: 300000 },
  { membership_id: 4, tier_name: 'Bạch Kim', discount_rate: 0.15, min_balance: 500000 },
  { membership_id: 5, tier_name: 'Kim Cương', discount_rate: 0.20, min_balance: 1000000 },
];

// Workstations
export const workstations = [
  { machine_id: 1, machine_name: 'PC-01', ip: '192.168.1.101', mac: '00:1B:44:11:3A:B7', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 2, machine_name: 'PC-02', ip: '192.168.1.102', mac: '00:1B:44:11:3A:B8', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 3, machine_name: 'PC-03', ip: '192.168.1.103', mac: '00:1B:44:11:3A:B9', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 4, machine_name: 'PC-04', ip: '192.168.1.104', mac: '00:1B:44:11:3A:C0', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 5, machine_name: 'PC-05', ip: '192.168.1.105', mac: '00:1B:44:11:3A:C1', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 6, machine_name: 'PC-06', ip: '192.168.1.106', mac: '00:1B:44:11:3A:C2', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 7, machine_name: 'PC-07', ip: '192.168.1.107', mac: '00:1B:44:11:3A:C3', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 8, machine_name: 'PC-08', ip: '192.168.1.108', mac: '00:1B:44:11:3A:C4', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 9, machine_name: 'PC-09', ip: '192.168.1.109', mac: '00:1B:44:11:3A:C5', status: 'MAINTENANCE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 10, machine_name: 'PC-10', ip: '192.168.1.110', mac: '00:1B:44:11:3A:C6', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 11, machine_name: 'PC-11', ip: '192.168.1.111', mac: '00:1B:44:11:3A:C7', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 12, machine_name: 'PC-12', ip: '192.168.1.112', mac: '00:1B:44:11:3A:C8', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 13, machine_name: 'PC-13', ip: '192.168.1.113', mac: '00:1B:44:11:3A:C9', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 14, machine_name: 'PC-14', ip: '192.168.1.114', mac: '00:1B:44:11:3A:D0', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 15, machine_name: 'PC-15', ip: '192.168.1.115', mac: '00:1B:44:11:3A:D1', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 16, machine_name: 'PC-16', ip: '192.168.1.116', mac: '00:1B:44:11:3A:D2', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 17, machine_name: 'PC-17', ip: '192.168.1.117', mac: '00:1B:44:11:3A:D3', status: 'ONLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 18, machine_name: 'PC-18', ip: '192.168.1.118', mac: '00:1B:44:11:3A:D4', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 19, machine_name: 'PC-19', ip: '192.168.1.119', mac: '00:1B:44:11:3A:D5', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
  { machine_id: 20, machine_name: 'PC-20', ip: '192.168.1.120', mac: '00:1B:44:11:3A:D6', status: 'OFFLINE', hourly: 3000, created_at: '2024-01-15T08:00:00' },
];

// Users
export const users = [
  { user_id: 1, membership_id: 5, username: 'nguyenvana', full_name: 'Nguyễn Văn A', number_phone: '0901234567', password: 'hashed', balance: 1200000, created_at: '2024-02-01T10:00:00' },
  { user_id: 2, membership_id: 4, username: 'tranthib', full_name: 'Trần Thị B', number_phone: '0902345678', password: 'hashed', balance: 650000, created_at: '2024-02-05T11:30:00' },
  { user_id: 3, membership_id: 3, username: 'levanc', full_name: 'Lê Văn C', number_phone: '0903456789', password: 'hashed', balance: 350000, created_at: '2024-02-10T14:20:00' },
  { user_id: 4, membership_id: 2, username: 'phamthid', full_name: 'Phạm Thị D', number_phone: '0904567890', password: 'hashed', balance: 150000, created_at: '2024-02-15T09:45:00' },
  { user_id: 5, membership_id: 1, username: 'hoangvane', full_name: 'Hoàng Văn E', number_phone: '0905678901', password: 'hashed', balance: 80000, created_at: '2024-02-20T16:10:00' },
  { user_id: 6, membership_id: 3, username: 'vuthif', full_name: 'Vũ Thị F', number_phone: '0906789012', password: 'hashed', balance: 420000, created_at: '2024-03-01T08:30:00' },
  { user_id: 7, membership_id: 2, username: 'dovanh', full_name: 'Đỗ Văn H', number_phone: '0907890123', password: 'hashed', balance: 180000, created_at: '2024-03-05T13:15:00' },
  { user_id: 8, membership_id: 4, username: 'buithii', full_name: 'Bùi Thị I', number_phone: '0908901234', password: 'hashed', balance: 720000, created_at: '2024-03-10T10:50:00' },
  { user_id: 9, membership_id: 1, username: 'dangvank', full_name: 'Đặng Văn K', number_phone: '0909012345', password: 'hashed', balance: 60000, created_at: '2024-03-15T15:25:00' },
  { user_id: 10, membership_id: 3, username: 'ngothil', full_name: 'Ngô Thị L', number_phone: '0910123456', password: 'hashed', balance: 390000, created_at: '2024-03-20T12:40:00' },
  { user_id: 11, membership_id: 5, username: 'duongvanm', full_name: 'Dương Văn M', number_phone: '0911234567', password: 'hashed', balance: 1500000, created_at: '2024-04-01T09:00:00' },
  { user_id: 12, membership_id: 2, username: 'lythin', full_name: 'Lý Thị N', number_phone: '0912345678', password: 'hashed', balance: 120000, created_at: '2024-04-05T14:30:00' },
  { user_id: 13, membership_id: 1, username: 'maivano', full_name: 'Mai Văn O', number_phone: '0913456789', password: 'hashed', balance: 45000, created_at: '2024-04-10T11:20:00' },
  { user_id: 14, membership_id: 4, username: 'tathip', full_name: 'Tạ Thị P', number_phone: '0914567890', password: 'hashed', balance: 580000, created_at: '2024-04-15T16:45:00' },
  { user_id: 15, membership_id: 3, username: 'truongvanq', full_name: 'Trương Văn Q', number_phone: '0915678901', password: 'hashed', balance: 310000, created_at: '2024-04-20T10:15:00' },
  { user_id: 16, membership_id: 2, username: 'phanthir', full_name: 'Phan Thị R', number_phone: '0916789012', password: 'hashed', balance: 140000, created_at: '2024-05-01T13:50:00' },
  { user_id: 17, membership_id: 1, username: 'tovans', full_name: 'Tô Văn S', number_phone: '0917890123', password: 'hashed', balance: 70000, created_at: '2024-05-05T09:30:00' },
  { user_id: 18, membership_id: 5, username: 'dinhthit', full_name: 'Đinh Thị T', number_phone: '0918901234', password: 'hashed', balance: 1350000, created_at: '2024-05-10T15:10:00' },
  { user_id: 19, membership_id: 3, username: 'caovanu', full_name: 'Cao Văn U', number_phone: '0919012345', password: 'hashed', balance: 280000, created_at: '2024-05-15T11:40:00' },
  { user_id: 20, membership_id: 4, username: 'hathiv', full_name: 'Hà Thị V', number_phone: '0920123456', password: 'hashed', balance: 690000, created_at: '2024-05-20T14:20:00' },
];

// Staff
export const staff = [
  { staff_id: 1, full_name: 'Nguyễn Minh Quân', role: 'Admin', password: 'hashed', created_at: '2024-01-01T08:00:00' },
  { staff_id: 2, full_name: 'Trần Thị Hương', role: 'Manager', password: 'hashed', created_at: '2024-01-01T08:00:00' },
  { staff_id: 3, full_name: 'Lê Văn Tùng', role: 'Staff', password: 'hashed', created_at: '2024-01-10T08:00:00' },
  { staff_id: 4, full_name: 'Phạm Thị Lan', role: 'Staff', password: 'hashed', created_at: '2024-01-10T08:00:00' },
  { staff_id: 5, full_name: 'Hoàng Văn Nam', role: 'Staff', password: 'hashed', created_at: '2024-02-01T08:00:00' },
  { staff_id: 6, full_name: 'Vũ Thị Mai', role: 'Manager', password: 'hashed', created_at: '2024-02-01T08:00:00' },
  { staff_id: 7, full_name: 'Đỗ Văn Hải', role: 'Staff', password: 'hashed', created_at: '2024-03-01T08:00:00' },
  { staff_id: 8, full_name: 'Bùi Thị Nga', role: 'Staff', password: 'hashed', created_at: '2024-03-01T08:00:00' },
];

// Menu items
export const menuItems = [
  { item_id: 1, item_name: 'Mì gói', price: 5000, category: 'Đồ ăn', available: true, current_cost: 3000, quantity: 50 },
  { item_id: 2, item_name: 'Nước ngọt Coca', price: 10000, category: 'Đồ uống', available: true, current_cost: 7000, quantity: 30 },
  { item_id: 3, item_name: 'Nước ngọt Pepsi', price: 10000, category: 'Đồ uống', available: true, current_cost: 7000, quantity: 25 },
  { item_id: 4, item_name: 'Cà phê đen', price: 15000, category: 'Đồ uống', available: true, current_cost: 8000, quantity: 40 },
  { item_id: 5, item_name: 'Cà phê sữa', price: 18000, category: 'Đồ uống', available: true, current_cost: 10000, quantity: 35 },
  { item_id: 6, item_name: 'Snack Oishi', price: 8000, category: 'Snack', available: true, current_cost: 5000, quantity: 60 },
  { item_id: 7, item_name: 'Snack Poca', price: 8000, category: 'Snack', available: true, current_cost: 5000, quantity: 55 },
  { item_id: 8, item_name: 'Bánh mì thịt', price: 20000, category: 'Đồ ăn', available: true, current_cost: 12000, quantity: 15 },
  { item_id: 9, item_name: 'Trà sữa trân châu', price: 25000, category: 'Đồ uống', available: true, current_cost: 15000, quantity: 20 },
  { item_id: 10, item_name: 'Cơm gà xối mỡ', price: 30000, category: 'Đồ ăn', available: true, current_cost: 18000, quantity: 10 },
  { item_id: 11, item_name: 'Cơm sườn', price: 35000, category: 'Đồ ăn', available: true, current_cost: 20000, quantity: 8 },
  { item_id: 12, item_name: 'Nước suối', price: 5000, category: 'Đồ uống', available: true, current_cost: 3000, quantity: 100 },
  { item_id: 13, item_name: 'Sting dâu', price: 12000, category: 'Đồ uống', available: true, current_cost: 8000, quantity: 45 },
  { item_id: 14, item_name: 'Red Bull', price: 15000, category: 'Đồ uống', available: true, current_cost: 10000, quantity: 30 },
  { item_id: 15, item_name: 'Bánh tráng trộn', price: 10000, category: 'Snack', available: true, current_cost: 6000, quantity: 25 },
];

// Active sessions (will be updated with live timers)
export const initialSessions = [
  { session_id: 1, user_id: 1, machine_id: 1, starttime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 2, user_id: 3, machine_id: 2, starttime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 3, user_id: 6, machine_id: 3, starttime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 4, user_id: 8, machine_id: 4, starttime: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 5, user_id: 11, machine_id: 5, starttime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 6, user_id: 14, machine_id: 8, starttime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 7, user_id: 18, machine_id: 11, starttime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
  { session_id: 8, user_id: 20, machine_id: 14, starttime: new Date(Date.now() - 0.75 * 60 * 60 * 1000).toISOString(), endtime: null, cost: 0 },
];

// Expense categories
export const expenseCategories = [
  { category_id: 1, category_name: 'Điện' },
  { category_id: 2, category_name: 'Nước' },
  { category_id: 3, category_name: 'Internet' },
  { category_id: 4, category_name: 'Bảo trì' },
  { category_id: 5, category_name: 'Thuê mặt bằng' },
  { category_id: 6, category_name: 'Lương nhân viên' },
  { category_id: 7, category_name: 'Khác' },
];

// Recent orders
export const initialOrders = [
  { order_id: 1, user_id: 1, item_id: 2, quantity: 2, total_amount: 20000, status: 'COMPLETED', created_at: '2026-05-26T02:30:00' },
  { order_id: 2, user_id: 3, item_id: 1, quantity: 1, total_amount: 5000, status: 'COMPLETED', created_at: '2026-05-26T02:45:00' },
  { order_id: 3, user_id: 6, item_id: 4, quantity: 1, total_amount: 15000, status: 'COMPLETED', created_at: '2026-05-26T01:20:00' },
  { order_id: 4, user_id: 8, item_id: 9, quantity: 1, total_amount: 25000, status: 'PENDING', created_at: '2026-05-26T03:00:00' },
];

// Order details
export const orderDetails = [
  { order_detail_id: 1, order_id: 1, item_id: 2, quantity: 2, unit_price: 10000 },
  { order_detail_id: 2, order_id: 2, item_id: 1, quantity: 1, unit_price: 5000 },
  { order_detail_id: 3, order_id: 3, item_id: 4, quantity: 1, unit_price: 15000 },
  { order_detail_id: 4, order_id: 4, item_id: 9, quantity: 1, unit_price: 25000 },
];

// Top-up transactions
export const topUpTransactions = [
  { tut_id: 1, user_id: 1, staff_id: 3, amount: 200000, paymentmethod: 'cash', created_at: '2026-05-25T10:00:00' },
  { tut_id: 2, user_id: 5, staff_id: 4, amount: 50000, paymentmethod: 'transfer', created_at: '2026-05-25T14:30:00' },
  { tut_id: 3, user_id: 11, staff_id: 3, amount: 500000, paymentmethod: 'cash', created_at: '2026-05-26T09:15:00' },
];

// Inventory imports
export const inventoryImports = [
  { import_id: 1, staff_id: 2, item_id: 1, quantity: 50, import_price: 3000, total_amount: 150000, created_at: '2026-05-20T08:00:00' },
  { import_id: 2, staff_id: 2, item_id: 2, quantity: 30, import_price: 7000, total_amount: 210000, created_at: '2026-05-20T08:15:00' },
  { import_id: 3, staff_id: 6, item_id: 6, quantity: 60, import_price: 5000, total_amount: 300000, created_at: '2026-05-22T10:00:00' },
];

// Operating expenses
export const operatingExpenses = [
  { expense_id: 1, category_id: 1, staff_id: 1, amount: 3500000, description: 'Tiền điện tháng 5', expense_date: '2026-05-01' },
  { expense_id: 2, category_id: 2, staff_id: 1, amount: 500000, description: 'Tiền nước tháng 5', expense_date: '2026-05-01' },
  { expense_id: 3, category_id: 3, staff_id: 1, amount: 800000, description: 'Cước Internet tháng 5', expense_date: '2026-05-01' },
  { expense_id: 4, category_id: 5, staff_id: 1, amount: 15000000, description: 'Thuê mặt bằng tháng 5', expense_date: '2026-05-01' },
  { expense_id: 5, category_id: 4, staff_id: 2, amount: 1200000, description: 'Sửa PC-09', expense_date: '2026-05-15' },
];

// Machine health
export const machineHealth = [
  { health_id: 1, machine_id: 1, cpu_temp: 55, gpu_temp: 62, disk_free_gb: 45, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 2, machine_id: 2, cpu_temp: 58, gpu_temp: 65, disk_free_gb: 38, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 3, machine_id: 3, cpu_temp: 52, gpu_temp: 60, disk_free_gb: 50, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 4, machine_id: 4, cpu_temp: 48, gpu_temp: 55, disk_free_gb: 60, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 5, machine_id: 5, cpu_temp: 72, gpu_temp: 78, disk_free_gb: 25, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 6, machine_id: 8, cpu_temp: 50, gpu_temp: 58, disk_free_gb: 42, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 7, machine_id: 9, cpu_temp: 85, gpu_temp: 90, disk_free_gb: 8, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 8, machine_id: 11, cpu_temp: 54, gpu_temp: 61, disk_free_gb: 35, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 9, machine_id: 14, cpu_temp: 49, gpu_temp: 56, disk_free_gb: 48, recorded_at: '2026-05-26T03:00:00' },
  { health_id: 10, machine_id: 17, cpu_temp: 63, gpu_temp: 70, disk_free_gb: 18, recorded_at: '2026-05-26T03:00:00' },
];

// System logs
export const systemLogs = [
  { log_id: 1, staff_id: 3, action: 'LOGIN', target_type: 'staff', target_id: 3, logged_at: '2026-05-26T02:00:00' },
  { log_id: 2, staff_id: 3, action: 'CREATE', target_type: 'session', target_id: 8, logged_at: '2026-05-26T02:15:00' },
  { log_id: 3, staff_id: 3, action: 'PAYMENT', target_type: 'top_up', target_id: 3, logged_at: '2026-05-26T02:20:00' },
  { log_id: 4, staff_id: 4, action: 'LOGIN', target_type: 'staff', target_id: 4, logged_at: '2026-05-26T02:30:00' },
  { log_id: 5, staff_id: 4, action: 'CREATE', target_type: 'order', target_id: 4, logged_at: '2026-05-26T03:00:00' },
  { log_id: 6, staff_id: 3, action: 'UPDATE', target_type: 'workstation', target_id: 9, logged_at: '2026-05-26T01:45:00' },
  { log_id: 7, staff_id: 2, action: 'CREATE', target_type: 'expense', target_id: 5, logged_at: '2026-05-25T15:00:00' },
  { log_id: 8, staff_id: 1, action: 'LOGIN', target_type: 'staff', target_id: 1, logged_at: '2026-05-26T00:00:00' },
  { log_id: 9, staff_id: 3, action: 'UPDATE', target_type: 'session', target_id: 6, logged_at: '2026-05-26T02:45:00' },
  { log_id: 10, staff_id: 4, action: 'CREATE', target_type: 'order', target_id: 3, logged_at: '2026-05-26T01:20:00' },
];

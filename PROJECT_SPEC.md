# Knight Tree Net - Cybercafe Management System

## Project Overview
You are building a full-stack cybercafe management web application called "Knight Tree Net" 
using React + Tailwind CSS. The app uses the following exact database schema:

---

## DATABASE SCHEMA

### TABLE: workstations
- `machine_id` - Unique identifier for each machine
- `machine_name` - Display name (e.g., PC-01)
- `ip` - IP address
- `mac` - MAC address
- `status` - ONLINE | OFFLINE | MAINTENANCE
- `hourly` - Hourly rate in VNĐ
- `created_at` - Timestamp

### TABLE: sessions
- `session_id` - Unique session identifier
- `user_id` - Foreign key to users
- `machine_id` - Foreign key to workstations
- `starttime` - Session start timestamp
- `endtime` - Session end timestamp (null if active)
- `cost` - Final cost in VNĐ

### TABLE: users
- `user_id` - Unique user identifier
- `membership_id` - Foreign key to memberships
- `username` - Login username
- `full_name` - Full Vietnamese name
- `number_phone` - Phone number
- `password` - Hashed password
- `balance` - Account balance in VNĐ
- `created_at` - Registration timestamp

### TABLE: memberships
- `membership_id` - Unique membership tier ID
- `tier_name` - Tier name (Đồng, Bạc, Vàng, Bạch Kim, Kim Cương)
- `discount_rate` - Discount percentage (0-20%)
- `min_balance` - Minimum balance requirement

### TABLE: orders
- `order_id` - Unique order identifier
- `user_id` - Foreign key to users
- `item_id` - Foreign key to menu_items
- `quantity` - Number of items
- `total_amount` - Total cost in VNĐ
- `status` - PENDING | COMPLETED | CANCELLED
- `created_at` - Order timestamp

### TABLE: order_details
- `order_detail_id` - Unique detail record ID
- `order_id` - Foreign key to orders
- `item_id` - Foreign key to menu_items
- `quantity` - Item quantity
- `unit_price` - Price per unit at time of order

### TABLE: menu_items
- `item_id` - Unique item identifier
- `item_name` - Vietnamese item name
- `price` - Selling price in VNĐ
- `category` - Category (Đồ ăn, Đồ uống, Snack, etc.)
- `available` - Boolean availability flag
- `current_cost` - Current cost/import price
- `quantity` - Stock quantity

### TABLE: top_up_transactions
- `tut_id` - Unique transaction ID
- `user_id` - Foreign key to users
- `staff_id` - Foreign key to staff
- `amount` - Top-up amount in VNĐ
- `paymentmethod` - cash | transfer
- `created_at` - Transaction timestamp

### TABLE: inventory_imports
- `import_id` - Unique import record ID
- `staff_id` - Foreign key to staff
- `item_id` - Foreign key to menu_items
- `quantity` - Imported quantity
- `import_price` - Price per unit
- `total_amount` - Total import cost
- `created_at` - Import timestamp

### TABLE: operating_expenses
- `expense_id` - Unique expense ID
- `category_id` - Foreign key to expense_categories
- `staff_id` - Foreign key to staff
- `amount` - Expense amount in VNĐ
- `description` - Expense description
- `expense_date` - Date of expense

### TABLE: expense_categories
- `category_id` - Unique category ID
- `category_name` - Category name (Điện, Nước, Internet, Bảo trì, etc.)

### TABLE: staff
- `staff_id` - Unique staff identifier
- `full_name` - Full Vietnamese name
- `role` - Admin | Manager | Staff
- `password` - Hashed password
- `created_at` - Registration timestamp

### TABLE: system_logs
- `log_id` - Unique log entry ID
- `staff_id` - Foreign key to staff
- `action` - LOGIN | CREATE | UPDATE | DELETE | PAYMENT
- `target_type` - Type of target (user, session, order, etc.)
- `target_id` - ID of affected record
- `logged_at` - Log timestamp

### TABLE: machine_health
- `health_id` - Unique health record ID
- `machine_id` - Foreign key to workstations
- `cpu_temp` - CPU temperature in °C
- `gpu_temp` - GPU temperature in °C
- `disk_free_gb` - Free disk space in GB
- `recorded_at` - Recording timestamp

---

## DESIGN THEME

### Dark Cyberpunk + Medieval Knight Fusion Aesthetic

**Color Palette:**
- Background: `#0a0e14` (near black)
- Primary accent: `#00ff88` (neon green) for active/online states
- Secondary accent: `#00b4ff` (electric blue) for info/data
- Danger: `#ff3d5a` (neon red) for alerts/offline
- Warning: `#ffaa00` (amber) for maintenance/warnings
- Card background: `#111827`
- Card border: `#1f2937`

**Typography:**
- **Orbitron** - Headings and logo (futuristic, bold)
- **Rajdhani** - UI labels and body text (clean, technical)
- **JetBrains Mono** - Numbers, IDs, timers (monospace, precise)

**Visual Effects:**
- Grid scan-line texture overlay on sidebar
- Neon glow effects on active elements
- Pulse animations for status indicators

---

## NAVIGATION SIDEBAR

Collapsible left sidebar with icon + label. Sections:

1. 🏠 **Dashboard** (Tổng Quan)
2. 🖥️ **Máy Tính** (Workstations) — from `workstations` table
3. 👥 **Phiên Chơi** (Sessions) — from `sessions` table
4. 👤 **Khách Hàng** (Users) — from `users` + `memberships`
5. 💰 **Nạp Tiền** (Top-Up) — from `top_up_transactions`
6. 🛒 **Đặt Món** (Orders) — from `orders` + `order_details` + `menu_items`
7. 🍔 **Thực Đơn** (Menu) — from `menu_items`
8. 📦 **Nhập Kho** (Inventory) — from `inventory_imports`
9. 💸 **Chi Phí** (Expenses) — from `operating_expenses` + `expense_categories`
10. 👨‍💼 **Nhân Viên** (Staff) — from `staff`
11. 🩺 **Sức Khỏe Máy** (Machine Health) — from `machine_health`
12. 📋 **Nhật Ký** (System Logs) — from `system_logs`
13. 📊 **Báo Cáo** (Reports)

---

## PAGE DETAILS

### 1. DASHBOARD (Tổng Quan)

**Top Stat Cards Row:**
- **Máy đang dùng / Tổng máy** - Count from `workstations.status = 'ONLINE'`
- **Doanh thu hôm nay** - Sum of `sessions.cost` + `orders.total_amount` for today
- **Khách đang online** - Count of active sessions (where `endtime IS NULL`)
- **Số đơn hàng hôm nay** - Count of orders created today

**Workstation Live Grid (20 machines):**
Each card displays:
- `machine_name` (e.g., PC-01)
- Current user (join `sessions` → `users`)
- Elapsed time (calculated: `now - starttime`)
- Cost accruing (live calculation)
- Status badge with color coding

**Status Colors:**
- `ONLINE` = `#00ff88` with glow effect
- `OFFLINE` = dim gray
- `MAINTENANCE` = `#ffaa00` with pulse animation

**Click Action:** Open session modal with details

**Recent Activity Feed:**
Display last 10 entries from `system_logs` table

---

### 2. MÁY TÍNH (Workstations)

**Table Columns:**
- `machine_id`
- `machine_name`
- `ip`
- `mac`
- `status` (badge)
- `hourly` rate (formatted in VNĐ)
- `created_at`

**Actions per Row:**
- **Bật phiên** (Start Session)
- **Bảo trì** (Maintenance)
- **Xem lịch sử** (View History)

**Modal - Mở phiên mới (Start New Session):**
- Select user (search by `username` or `number_phone` from `users` table)
- Auto-fill display:
  - User balance
  - Membership tier
  - Discount rate
- Show estimated cost preview
- **Submit** → Creates new `sessions` record:
  - `starttime = now`
  - `endtime = null`
  - Links `user_id` and `machine_id`

---

### 3. PHIÊN CHƠI (Sessions)

**Table of Active Sessions:**

**Columns:**
- `session_id`
- `machine_name` (join `workstations`)
- `username` (join `users`)
- `starttime`
- **Elapsed** (live timer using `setInterval`)
- **Cost** (live calculation: `elapsed_hours * hourly_rate * (1 - discount_rate)`)

**Actions:**
- **Kết thúc phiên** (End Session) →
  - Sets `endtime = now`
  - Calculates final `cost`
  - Deducts from `users.balance`
  - Updates `sessions` record

**Filters:**
- Active only
- All sessions
- By date range

---

### 4. KHÁCH HÀNG (Users)

**Search Bar:**
Search by `username`, `full_name`, or `number_phone`

**Table Columns:**
- `user_id`
- `username`
- `full_name`
- `number_phone`
- Membership tier (join `memberships.tier_name`)
- `balance` (formatted in VNĐ)
- `created_at`

**Balance Color Coding:**
- Green if `balance > memberships.min_balance`
- Red if below minimum

**Click User → Detail Panel:**
Shows:
- Profile information
- Session history (from `sessions` table)
- Order history (from `orders` table)
- Top-up history (from `top_up_transactions` table)
- Current membership benefits (`memberships.discount_rate`)

---

### 5. NẠP TIỀN (Top-Up)

**Form Fields:**
- Select user (dropdown/search)
- Amount (VNĐ input)
- Payment method (cash | transfer)
- `staff_id` = current logged-in staff

**Action:**
- Inserts into `top_up_transactions`
- Updates `users.balance` (adds amount)

**Recent Transactions Table:**
- `tut_id`
- User (join `users.full_name`)
- `amount` (formatted VNĐ)
- `paymentmethod`
- Staff (join `staff.full_name`)
- `created_at`

---

### 6. ĐẶT MÓN (Orders)

**Two-Panel Layout:**

**LEFT PANEL:** Active Sessions List
- Click to select machine/user for order

**RIGHT PANEL:** Menu Grid by Category
- Filter by category from `menu_items` where `available = true`
- Item cards display:
  - `item_name`
  - `price` (formatted VNĐ)
  - Category badge
  - `quantity` (stock level)
- Click item → Add to cart with quantity selector

**Cart Summary:**
- List of items
- Subtotal
- Membership discount applied
- Total amount

**Submit Action:**
- Creates `orders` record
- Creates `order_details` records for each item
- Updates `menu_items.quantity` (decrements stock)

---

### 7. THỰC ĐƠN (Menu Management)

**View Toggle:** Grid view / Table view

**Filter:** By category

**Table Columns:**
- `item_id`
- `item_name`
- `price` (VNĐ)
- `category`
- `available` (toggle switch)
- `current_cost` (import price)
- `quantity` (stock)

**Actions:**
- Add new menu item
- Edit existing item
- Delete item

**Low Stock Warning:**
- If `quantity < 5` → Display amber badge

---

### 8. NHẬP KHO (Inventory Imports)

**Table Columns:**
- `import_id`
- Item name (join `menu_items.item_name`)
- `quantity`
- `import_price` (per unit)
- `total_amount` (calculated)
- Staff (join `staff.full_name`)
- `created_at`

**Add Import Modal:**
- Select item (dropdown)
- Enter quantity
- Enter import price
- Auto-calculate `total_amount = quantity * import_price`
- **Submit** →
  - Inserts into `inventory_imports`
  - Updates `menu_items.current_cost`
  - Updates `menu_items.quantity` (adds imported quantity)

**Summary Card:**
Total spent on imports this month

---

### 9. CHI PHÍ (Operating Expenses)

**Table Columns:**
- `expense_id`
- Category name (join `expense_categories.category_name`)
- Staff (join `staff.full_name`)
- `amount` (VNĐ)
- `description`
- `expense_date`

**Filters:**
- By category
- By date range

**Add Expense Modal:**
- Category dropdown (from `expense_categories`)
- Amount input
- Description textarea
- Date picker

**Monthly Expense Chart:**
Bar chart grouped by `expense_categories.category_name`

**Summary Card:**
Total expenses this month

---

### 10. NHÂN VIÊN (Staff)

**Table Columns:**
- `staff_id`
- `full_name`
- `role` badge (Admin | Manager | Staff)
- `created_at`

**Role Badge Colors:**
- Admin = `#ff3d5a` (red)
- Manager = `#00b4ff` (blue)
- Staff = `#00ff88` (green)

**Actions:**
- Add new staff
- Edit staff details
- Reset password (no password display)

**Additional Info:**
Each staff member's recent actions from `system_logs`

---

### 11. SỨC KHỎE MÁY (Machine Health)

**Grid Layout:** Matching workstations

**Each Card Shows Latest `machine_health` Record:**
- Machine name
- **CPU temp:**
  - Red if > 80°C
  - Yellow if > 60°C
  - Green if normal
- **GPU temp:** (same thresholds)
- **Disk free:**
  - Red if < 10GB
  - Yellow if < 20GB
  - Green if normal
- Timestamp of `recorded_at`

**Line Chart:**
Temperature history for selected machine (click to view)

---

### 12. NHẬT KÝ (System Logs)

**Chronological Table:**
- `log_id`
- Staff (join `staff.full_name`)
- `action`
- `target_type`
- `target_id`
- `logged_at`

**Action Type Color Coding:**
- `LOGIN` = blue
- `CREATE` = green
- `UPDATE` = yellow
- `DELETE` = red
- `PAYMENT` = teal

**Filters:**
- By staff member
- By action type
- By date range

---

### 13. BÁO CÁO (Reports)

**Date Range Picker:**
- Today
- This week
- This month
- Custom range

**Summary Cards:**
- Total revenue
- Total sessions
- Average session duration
- Top selling item

**Charts (using recharts):**

1. **Line Chart:** Daily revenue
   - `sessions.cost` + `orders.total_amount` grouped by date

2. **Bar Chart:** Revenue by hour of day
   - Peak hours analysis

3. **Pie Chart:** Revenue split
   - Giờ máy (Session revenue) vs Đồ ăn (Food/drink revenue)

4. **Bar Chart:** Top 5 menu items
   - By quantity sold (from `order_details`)

5. **Bar Chart:** Expenses by category
   - This month (from `operating_expenses`)

**Table:** Top 10 khách hàng
- Ranked by total spending (sum of sessions + orders)

---

## MOCK DATA

### Generate Realistic Vietnamese Mock Data:

**Workstations:**
- 20 machines: PC-01 to PC-20
- Hourly rate: 3,000đ/hour
- Mix of ONLINE, OFFLINE, MAINTENANCE statuses

**Membership Tiers:**
1. Đồng (Bronze) - 0% discount
2. Bạc (Silver) - 5% discount
3. Vàng (Gold) - 10% discount
4. Bạch Kim (Platinum) - 15% discount
5. Kim Cương (Diamond) - 20% discount

**Users:**
- 30 users with Vietnamese names
- Various membership tiers
- Realistic balances (50,000đ - 500,000đ)

**Staff:**
- 8 staff members
- Mix of Admin, Manager, Staff roles
- Vietnamese names

**Menu Items:**
- Mì gói (Instant noodles) - 5,000đ
- Nước ngọt (Soft drink) - 10,000đ
- Cà phê (Coffee) - 15,000đ
- Snack - 8,000đ
- Bánh mì (Sandwich) - 20,000đ
- Trà sữa (Milk tea) - 25,000đ
- Cơm (Rice meal) - 30,000đ

**Active Sessions:**
- Simulate 5-8 active sessions
- Use `setInterval` for live timers
- Real-time cost calculation

**Transactions:**
- Recent orders
- Top-up transactions
- Expenses with realistic VNĐ amounts

---

## CURRENCY FORMAT

All money displayed in Vietnamese Dong (VNĐ).

**Format Function:**
```javascript
const formatVND = (n) => n.toLocaleString('vi-VN') + 'đ'
```

**Example:**
- Input: `125000`
- Output: `"125,000đ"`

---

## TECH STACK

**Frontend Framework:**
- React (with Hooks: `useState`, `useEffect`, `useCallback`)

**Styling:**
- Tailwind CSS for layout and spacing
- Custom CSS for cyberpunk effects

**Charts:**
- recharts library for all data visualizations

**Icons:**
- lucide-react (supplementary icons)

**Fonts:**
- Google Fonts:
  - Orbitron (headings/logo)
  - Rajdhani (UI labels)
  - JetBrains Mono (numbers/IDs/timers)

**Language:**
- All UI labels and text in Vietnamese

**Responsive Design:**
- Fully responsive
- Sidebar collapses on mobile devices

**Data Management:**
- No backend required
- All mock data managed in React state
- Use `localStorage` for persistence (optional)

---

## IMPLEMENTATION NOTES

### Live Timers
Use `setInterval` to update:
- Session elapsed time
- Real-time cost calculation
- Machine status indicators

### State Management
Organize state by feature:
- `workstations` state
- `sessions` state
- `users` state
- `orders` state
- etc.

### Responsive Breakpoints
- Mobile: < 768px (sidebar collapsed)
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Performance
- Memoize expensive calculations
- Use `React.memo` for list items
- Debounce search inputs

---

## DEVELOPMENT CHECKLIST

- [ ] Set up React project with Tailwind CSS
- [ ] Import Google Fonts (Orbitron, Rajdhani, JetBrains Mono)
- [ ] Create sidebar navigation component
- [ ] Implement routing (React Router)
- [ ] Generate mock data for all tables
- [ ] Build Dashboard page with live stats
- [ ] Build Workstations page with session modal
- [ ] Build Sessions page with live timers
- [ ] Build Users page with detail panel
- [ ] Build Top-Up page with transaction form
- [ ] Build Orders page with two-panel layout
- [ ] Build Menu Management page
- [ ] Build Inventory Imports page
- [ ] Build Operating Expenses page
- [ ] Build Staff Management page
- [ ] Build Machine Health page with charts
- [ ] Build System Logs page
- [ ] Build Reports page with all charts
- [ ] Add responsive mobile layout
- [ ] Test all CRUD operations
- [ ] Polish UI with cyberpunk effects

---

## FUTURE ENHANCEMENTS

- Backend API integration (Node.js + PostgreSQL)
- Real-time WebSocket updates
- User authentication and authorization
- Print receipts functionality
- SMS notifications for low balance
- Loyalty points system
- Multi-location support
- Advanced analytics and forecasting

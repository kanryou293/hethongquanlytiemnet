# Knight Tree Net - Backend API

Backend API server cho hệ thống quản lý tiệm net Knight Tree Net.

## Yêu cầu

- Node.js >= 18
- PostgreSQL >= 14

## Cài đặt

### 1. Cài đặt PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Tải và cài đặt từ: https://www.postgresql.org/download/windows/

### 2. Tạo Database

```bash
# Đăng nhập PostgreSQL
sudo -u postgres psql

# Tạo database
CREATE DATABASE knight_tree_net;

# Tạo user (optional)
CREATE USER knight_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE knight_tree_net TO knight_admin;

# Thoát
\q
```

### 3. Import Schema

```bash
# Từ thư mục backend
psql -U postgres -d knight_tree_net -f database/schema.sql

# Hoặc nếu dùng user khác
psql -U knight_admin -d knight_tree_net -f database/schema.sql
```

### 4. Cấu hình Environment

```bash
# Copy file .env.example
cp .env.example .env

# Chỉnh sửa .env với thông tin database của bạn
nano .env
```

Nội dung file `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=knight_tree_net

PORT=5000
NODE_ENV=development

CORS_ORIGIN=http://localhost:5173
```

### 5. Cài đặt Dependencies

```bash
npm install
```

### 6. Chạy Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: http://localhost:5000

## API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra kết nối database

### Workstations (Máy)
- `GET /api/workstations` - Lấy danh sách tất cả máy
- `GET /api/workstations/:id` - Lấy thông tin 1 máy
- `POST /api/workstations` - Tạo máy mới
- `PUT /api/workstations/:id` - Cập nhật máy
- `DELETE /api/workstations/:id` - Xóa máy
- `PATCH /api/workstations/bulk/hourly` - Đổi giá tất cả máy

### Users (Khách hàng)
- `GET /api/users` - Lấy danh sách khách hàng
- `GET /api/users/:id` - Lấy thông tin 1 khách hàng
- `POST /api/users` - Tạo khách hàng mới
- `PUT /api/users/:id` - Cập nhật khách hàng
- `DELETE /api/users/:id` - Xóa khách hàng
- `GET /api/users/:id/sessions` - Lịch sử phiên chơi
- `GET /api/users/:id/orders` - Lịch sử đơn hàng
- `GET /api/users/:id/topups` - Lịch sử nạp tiền

### Sessions (Phiên chơi)
- `GET /api/sessions` - Lấy danh sách phiên (query: ?active=true)
- `GET /api/sessions/:id` - Lấy thông tin 1 phiên
- `POST /api/sessions` - Tạo phiên mới (mở máy)
- `PUT /api/sessions/:id/end` - Kết thúc phiên
- `DELETE /api/sessions/:id` - Xóa phiên (admin)
- `GET /api/sessions/:id/orders` - Đơn hàng trong phiên

### Memberships (Hạng thành viên)
- `GET /api/memberships` - Lấy danh sách hạng

### Menu Items (Thực đơn)
- `GET /api/menu-items` - Lấy danh sách món (query: ?category=&available=)
- `GET /api/menu-items/:id` - Lấy thông tin 1 món
- `POST /api/menu-items` - Tạo món mới
- `PUT /api/menu-items/:id` - Cập nhật món
- `DELETE /api/menu-items/:id` - Xóa món
- `GET /api/menu-items/meta/categories` - Lấy danh sách categories

### Orders (Đơn hàng)
- `GET /api/orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Lấy thông tin 1 đơn
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái
- `DELETE /api/orders/:id` - Hủy đơn (restock)

### Top-Up (Nạp tiền)
- `GET /api/top-up` - Lấy danh sách giao dịch
- `GET /api/top-up/:id` - Lấy thông tin 1 giao dịch
- `POST /api/top-up` - Tạo giao dịch nạp tiền
- `DELETE /api/top-up/:id` - Void giao dịch (24h)

### Staff (Nhân viên)
- `GET /api/staff` - Lấy danh sách nhân viên
- `GET /api/staff/:id` - Lấy thông tin 1 nhân viên
- `POST /api/staff` - Tạo nhân viên mới
- `PUT /api/staff/:id` - Cập nhật nhân viên
- `PUT /api/staff/:id/password` - Đổi mật khẩu
- `DELETE /api/staff/:id` - Xóa nhân viên

### System Logs (Nhật ký)
- `GET /api/system-logs` - Lấy danh sách logs (query: ?action=&staff_id=&limit=)
- `POST /api/system-logs` - Tạo log entry
- `GET /api/system-logs/range` - Lấy logs theo khoảng thời gian

## Request/Response Examples

### Tạo máy mới
```bash
curl -X POST http://localhost:5000/api/workstations \
  -H "Content-Type: application/json" \
  -d '{
    "machine_name": "PC-21",
    "ip": "192.168.1.121",
    "mac": "00:1B:44:11:3A:D7",
    "hourly": 3000,
    "status": "OFFLINE"
  }'
```

### Tạo khách hàng mới
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "full_name": "Nguyễn Test",
    "number_phone": "0999999999",
    "password": "password123",
    "membership_id": 1,
    "balance": 50000
  }'
```

### Mở phiên chơi
```bash
curl -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "machine_id": 6,
    "is_walk_in": false,
    "time_package": "2h"
  }'
```

### Kết thúc phiên
```bash
curl -X PUT http://localhost:5000/api/sessions/1/end
```

## Troubleshooting

### Lỗi kết nối database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Giải pháp:** Kiểm tra PostgreSQL đã chạy chưa
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Lỗi authentication
```
Error: password authentication failed
```
**Giải pháp:** Kiểm tra lại thông tin trong file `.env`

### Port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Giải pháp:** Đổi PORT trong `.env` hoặc kill process đang dùng port 5000
```bash
lsof -ti:5000 | xargs kill -9
```

## Development

### Database Migrations
Khi thay đổi schema, chạy lại:
```bash
psql -U postgres -d knight_tree_net -f database/schema.sql
```

### Testing API
Dùng Postman hoặc curl để test các endpoints.

## Production Deployment

1. Set `NODE_ENV=production` trong `.env`
2. Sử dụng process manager như PM2:
```bash
npm install -g pm2
pm2 start src/server.js --name knight-tree-api
pm2 save
pm2 startup
```

## License
ISC

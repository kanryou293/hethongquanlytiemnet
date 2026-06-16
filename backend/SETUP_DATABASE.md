# Hướng dẫn Setup Database - Knight Tree Net

## Bước 1: Cấu hình PostgreSQL Authentication

### Chỉnh sửa file pg_hba.conf

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Tìm dòng:
```
local   all             postgres                                peer
```

Đổi thành:
```
local   all             postgres                                md5
```

Lưu file (Ctrl+O, Enter, Ctrl+X)

### Khởi động lại PostgreSQL

```bash
sudo systemctl restart postgresql
```

## Bước 2: Đặt mật khẩu cho user postgres

```bash
sudo -u postgres psql
```

Trong psql, chạy:
```sql
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

## Bước 3: Tạo Database

```bash
psql -U postgres -h localhost
```
Nhập password: `postgres`

Trong psql:
```sql
CREATE DATABASE knight_tree_net;
\c knight_tree_net
\q
```

## Bước 4: Import Schema

```bash
cd /home/khoa/quan-ly-tiem-net/backend
psql -U postgres -h localhost -d knight_tree_net -f database/schema.sql
```

Nhập password: `postgres`

## Bước 5: Kiểm tra Database

```bash
psql -U postgres -h localhost -d knight_tree_net -c "SELECT COUNT(*) FROM workstations;"
```

Nếu thấy kết quả `20` là thành công!

## Bước 6: Chạy Backend Server

```bash
cd /home/khoa/quan-ly-tiem-net/backend
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

Test health check:
```bash
curl http://localhost:5000/api/health
```

## Nếu gặp lỗi "Peer authentication failed"

Chạy lệnh này để sửa:
```bash
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql
```

## Nếu PostgreSQL chưa chạy

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Kiểm tra port PostgreSQL

```bash
sudo netstat -plnt | grep 5432
```

Hoặc:
```bash
sudo ss -plnt | grep 5432
```

---

## Quick Setup (Copy-paste toàn bộ)

```bash
# 1. Cấu hình authentication
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/' /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# 2. Đặt password (nhập 'postgres' khi được hỏi)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 3. Tạo database
PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE knight_tree_net;"

# 4. Import schema
cd /home/khoa/quan-ly-tiem-net/backend
PGPASSWORD=postgres psql -U postgres -h localhost -d knight_tree_net -f database/schema.sql

# 5. Kiểm tra
PGPASSWORD=postgres psql -U postgres -h localhost -d knight_tree_net -c "SELECT COUNT(*) FROM workstations;"

# 6. Chạy server
npm run dev
```

Sau khi chạy xong, mở browser: http://localhost:5000/api/health

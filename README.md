# Hệ Thống Quản Lý Tiệm Nét (quan-ly-tiem-net)

Dự án quản lý phòng máy (Cyber Game), bao gồm quản lý tài khoản thành viên, phiên máy trạm, nạp tiền, doanh thu và nhật ký hệ thống.

---

## 🛠 Yêu Cầu Hệ Thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
* **Node.js** (Phiên bản 18.x hoặc 20.x trở lên)
* **PostgreSQL** (Hệ quản trị cơ sở dữ liệu)
* **Git**

---

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết

Thực hiện theo các bước sau để thiết lập dự án trên môi trường máy cục bộ (Local):

### Bước 1: Clone dự án về máy
Mở terminal và chạy lệnh sau để tải mã nguồn:
```bash
git clone [https://github.com/kanryou293/hethongquanlytiemnet.git](https://github.com/kanryou293/hethongquanlytiemnet.git)
cd quan-ly-tiem-net

1. Cài đặt cho Thư mục gốc (Frontend / Cấu hình chung):

npm install

2. Cài đặt cho Thư mục Backend:

cd backend
npm install
cd ..

Bước 3: Cấu hình môi trường (.env)

    Vào thư mục backend/.

    Tạo một file mới tên là .env (hoặc copy từ file .env.example nếu có).

    Cấu hình các thông số Database và Cổng chạy Server phù hợp với máy của bạn. Ví dụ:

    # Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=knight_tree_net

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

Bước 4: Khởi tạo Cơ sở dữ liệu (Database)

Mở PostgreSQL (pgAdmin hoặc terminal) và tạo một database trống tên là knight_tree_net.

Khởi tạo cấu trúc bảng và nạp dữ liệu mẫu (Seed data 30 ngày) bằng cách chạy script đã chuẩn bị sẵn (hoặc import trực tiếp các file SQL trong thư mục backend/database/):

# Di chuyển vào backend và chạy script setup database (nếu có script .sh)
cd backend
bash setup_db.sh

🏃‍♂️ Khởi Chạy Ứng Dụng

1. Chạy Backend Server

cd backend
npm run dev
# Hoặc: node src/server.js (tùy thuộc vào cấu hình script trong package.json)

2. Chạy Frontend (Vite)

npm run dev

📁 Cấu Trúc Thư Mục Chính

quan-ly-tiem-net/
├── backend/               # Mã nguồn Server (Node.js/Express)
│   ├── src/               # Thư mục chứa Logic (Controllers, Models, Routes)
│   │   ├── config/        # Cấu hình kết nối DB
│   │   └── server.js      # File chạy chính của Backend
│   └── database/          # File thiết kế DB (.sql) và dữ liệu mẫu
├── src/                   # Mã nguồn Frontend (Vite/React/JS)
├── package.json           # Quản lý thư viện gốc
└── .gitignore             # File cấu hình bỏ chặn các thư viện nặng khi push Git
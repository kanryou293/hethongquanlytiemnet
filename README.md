# 🖥️ Hệ Thống Quản Lý Tiệm Nét

Ứng dụng quản lý phòng máy (Cyber Game) toàn diện, bao gồm các chức năng: quản lý tài khoản thành viên, phiên máy trạm, nạp tiền, theo dõi doanh thu và nhật ký hệ thống.

---

## 🛠️ Yêu Cầu Hệ Thống

Đảm bảo máy tính đã cài đặt các công cụ sau trước khi bắt đầu:

| Công cụ | Phiên bản yêu cầu |
|---|---|
| [Node.js](https://nodejs.org/) | 18.x hoặc 20.x trở lên |
| [PostgreSQL](https://www.postgresql.org/) | 14.x trở lên |
| [Git](https://git-scm.com/) | Bất kỳ phiên bản ổn định |

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1 — Clone dự án về máy

```bash
git clone https://github.com/kanryou293/hethongquanlytiemnet.git
cd quan-ly-tiem-net
```

### Bước 2 — Cài đặt dependencies

Cài đặt lần lượt cho thư mục gốc (Frontend) và thư mục Backend:

```bash
# Cài đặt dependencies cho Frontend (thư mục gốc)
npm install

# Cài đặt dependencies cho Backend
cd backend
npm install
cd ..
```

### Bước 3 — Cấu hình môi trường (.env)

1. Di chuyển vào thư mục `backend/`.
2. Tạo file `.env` mới (hoặc sao chép từ `.env.example` nếu có).
3. Điền các thông số phù hợp với môi trường máy của bạn:

```env
# ── Cấu hình Database ─────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=knight_tree_net

# ── Cấu hình Server ───────────────────────────────
PORT=5000
NODE_ENV=development

# ── Cấu hình CORS ─────────────────────────────────
CORS_ORIGIN=http://localhost:5173
```

### Bước 4 — Khởi tạo Cơ sở dữ liệu

1. Mở **pgAdmin** hoặc **psql terminal** và tạo database trống:

```sql
CREATE DATABASE knight_tree_net;
```

2. Chạy script khởi tạo cấu trúc bảng và dữ liệu mẫu (seed data 30 ngày):

```bash
cd backend
bash setup_db.sh
```

> **Lưu ý:** Nếu không có file `setup_db.sh`, bạn có thể import thủ công các file `.sql` trong thư mục `backend/database/` bằng pgAdmin hoặc lệnh `psql`.

---

## ▶️ Khởi Chạy Ứng Dụng

Mở **hai terminal riêng biệt** và chạy lần lượt:

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```bash
npm run dev
```

Sau khi khởi động thành công:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 📁 Cấu Trúc Thư Mục

```
quan-ly-tiem-net/
├── backend/                  # Mã nguồn Server (Node.js / Express)
│   ├── src/                  # Logic nghiệp vụ chính
│   │   ├── config/           # Cấu hình kết nối Database
│   │   ├── controllers/      # Xử lý request/response
│   │   ├── models/           # Tương tác với Database
│   │   ├── routes/           # Định nghĩa API endpoints
│   │   └── server.js         # Điểm khởi động Backend
│   ├── database/             # Schema SQL và dữ liệu mẫu
│   ├── .env                  # Biến môi trường (không commit lên Git)
│   └── package.json
├── src/                      # Mã nguồn Frontend (Vite / React)
│   ├── components/           # Các component giao diện
│   ├── pages/                # Các trang chính
│   └── main.jsx              # Điểm khởi động Frontend
├── package.json              # Dependencies Frontend
├── vite.config.js            # Cấu hình Vite
├── .gitignore
└── README.md
```

---

## ✨ Tính Năng Chính

- **Quản lý thành viên** — Đăng ký, nạp tiền, tra cứu lịch sử tài khoản
- **Quản lý phiên máy** — Mở/đóng phiên, tính tiền theo thời gian thực
- **Doanh thu** — Báo cáo theo ngày, tuần, tháng
- **Nhật ký hệ thống** — Ghi lại toàn bộ thao tác quan trọng

---

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m "feat: mô tả ngắn"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 📄 Giấy Phép

Dự án được phân phối theo giấy phép [MIT](LICENSE).
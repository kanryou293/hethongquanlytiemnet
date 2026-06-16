# Hướng dẫn Kết nối Frontend với Backend

## Tổng quan

Dự án Knight Tree Net bây giờ có:
- **Frontend**: React + Vite (port 5173)
- **Backend**: Node.js + Express + PostgreSQL (port 5000)

## Bước 1: Setup Backend

### 1.1. Cấu hình PostgreSQL

```bash
# Sửa authentication method
sudo sed -i 's/local   all             postgres                                peer/local   all             postgres                                md5/' /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

# Đặt password cho user postgres
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
```

### 1.2. Tạo Database và Import Schema

```bash
# Tạo database
PGPASSWORD=postgres psql -U postgres -h localhost -c "CREATE DATABASE knight_tree_net;"

# Import schema
cd /home/khoa/quan-ly-tiem-net/backend
PGPASSWORD=postgres psql -U postgres -h localhost -d knight_tree_net -f database/schema.sql

# Kiểm tra
PGPASSWORD=postgres psql -U postgres -h localhost -d knight_tree_net -c "SELECT COUNT(*) FROM workstations;"
```

Kết quả phải là: `20` (20 máy)

### 1.3. Chạy Backend Server

```bash
cd /home/khoa/quan-ly-tiem-net/backend
npm run dev
```

Server chạy tại: **http://localhost:5000**

Test health check:
```bash
curl http://localhost:5000/api/health
```

Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2026-05-26T...",
  "database": "connected"
}
```

## Bước 2: Cập nhật Frontend để dùng API

### 2.1. Cấu trúc đã tạo

- ✅ `/src/services/api.js` - API service layer
- ✅ `/.env` - Environment config
- ✅ `/backend/` - Backend server hoàn chỉnh

### 2.2. Cách sử dụng API trong Frontend

**Ví dụ: Cập nhật useCRUD hook để dùng API thật**

Mở file `/src/hooks/useCRUD.js` và thay đổi:

```javascript
// Thêm import
import api from '../services/api';

// Ví dụ cho workstations
export function useWorkstations(initialData) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // Fetch data từ API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.workstations.getAll();
        setData(result);
      } catch (error) {
        console.error('Error fetching workstations:', error);
        toast.error('Lỗi tải dữ liệu máy');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const create = async (newItem) => {
    const tempId = `temp_${Date.now()}`;
    const item = { ...newItem, _pending: true, _tempId: tempId };
    
    // Optimistic update
    setData(prev => [item, ...prev]);
    const loadingToast = toast.loading('Đang lưu...');
    
    try {
      const result = await api.workstations.create(newItem);
      setData(prev => prev.map(x => x._tempId === tempId ? result : x));
      toast.success('Đã thêm máy thành công!', { id: loadingToast });
      return result;
    } catch (error) {
      setData(prev => prev.filter(x => x._tempId !== tempId));
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  const update = async (id, updates) => {
    const oldData = [...data];
    
    // Optimistic update
    setData(prev => prev.map(x => x.machine_id === id ? { ...x, ...updates } : x));
    const loadingToast = toast.loading('Đang cập nhật...');
    
    try {
      const result = await api.workstations.update(id, updates);
      setData(prev => prev.map(x => x.machine_id === id ? result : x));
      toast.success('Đã cập nhật thành công!', { id: loadingToast });
      return result;
    } catch (error) {
      setData(oldData); // Rollback
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  const remove = async (id) => {
    const oldData = [...data];
    
    // Optimistic update
    setData(prev => prev.filter(x => x.machine_id !== id));
    const loadingToast = toast.loading('Đang xóa...');
    
    try {
      await api.workstations.delete(id);
      toast.success('Đã xóa thành công!', { id: loadingToast });
    } catch (error) {
      setData(oldData); // Rollback
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  const bulkUpdate = async (ids, updates) => {
    const oldData = [...data];
    
    // Optimistic update
    setData(prev => prev.map(x => ids.includes(x.machine_id) ? { ...x, ...updates } : x));
    const loadingToast = toast.loading('Đang cập nhật...');
    
    try {
      const result = await api.workstations.bulkUpdateHourly(updates.hourly);
      setData(result.data);
      toast.success(`Đã cập nhật ${result.data.length} máy!`, { id: loadingToast });
      return result;
    } catch (error) {
      setData(oldData); // Rollback
      toast.error(`Lỗi: ${error.message}`, { id: loadingToast });
      throw error;
    }
  };

  return { data, loading, create, update, remove, bulkUpdate };
}
```

### 2.3. Test API từ Frontend

1. Chạy backend: `cd backend && npm run dev`
2. Chạy frontend: `npm run dev`
3. Mở browser: http://localhost:5173
4. Thử các chức năng CRUD

## Bước 3: Chạy cả Frontend và Backend

### Terminal 1 - Backend
```bash
cd /home/khoa/quan-ly-tiem-net/backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd /home/khoa/quan-ly-tiem-net
npm run dev
```

## API Endpoints có sẵn

### Workstations
- `GET /api/workstations` - Lấy tất cả máy
- `POST /api/workstations` - Tạo máy mới
- `PUT /api/workstations/:id` - Cập nhật máy
- `DELETE /api/workstations/:id` - Xóa máy
- `PATCH /api/workstations/bulk/hourly` - Đổi giá tất cả

### Users
- `GET /api/users` - Lấy tất cả khách hàng
- `POST /api/users` - Tạo khách hàng mới
- `PUT /api/users/:id` - Cập nhật khách hàng
- `DELETE /api/users/:id` - Xóa khách hàng

### Sessions
- `GET /api/sessions?active=true` - Lấy phiên đang chơi
- `POST /api/sessions` - Mở phiên mới
- `PUT /api/sessions/:id/end` - Kết thúc phiên

### Menu Items
- `GET /api/menu-items` - Lấy thực đơn
- `POST /api/menu-items` - Thêm món mới
- `PUT /api/menu-items/:id` - Cập nhật món
- `DELETE /api/menu-items/:id` - Xóa món

### Orders
- `GET /api/orders` - Lấy đơn hàng
- `POST /api/orders` - Tạo đơn mới

### Top-Up
- `GET /api/top-up` - Lấy giao dịch nạp tiền
- `POST /api/top-up` - Nạp tiền

## Troubleshooting

### CORS Error
Nếu gặp lỗi CORS, kiểm tra:
1. Backend đang chạy tại port 5000
2. File `backend/.env` có `CORS_ORIGIN=http://localhost:5173`

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Giải pháp:** Backend chưa chạy, chạy `npm run dev` trong thư mục backend

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Giải pháp:** PostgreSQL chưa chạy
```bash
sudo systemctl start postgresql
```

### Authentication Failed
```
Error: password authentication failed
```
**Giải pháp:** Kiểm tra lại password trong `backend/.env`

## Next Steps

1. ✅ Backend API hoàn chỉnh
2. ✅ API service layer cho frontend
3. ⏳ Cập nhật các hooks để dùng API thật
4. ⏳ Test tất cả CRUD operations
5. ⏳ Thêm loading states và error handling

## Cấu trúc Project

```
quan-ly-tiem-net/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── config/            # Database config
│   │   └── server.js          # Express server
│   ├── database/
│   │   └── schema.sql         # Database schema
│   ├── .env                   # Backend config
│   └── package.json
│
├── src/                       # Frontend React
│   ├── services/
│   │   └── api.js            # API service layer
│   ├── hooks/
│   │   └── useCRUD.js        # CRUD hooks
│   ├── pages/                # React pages
│   └── components/           # React components
│
├── .env                      # Frontend config
└── package.json
```

## Tài liệu tham khảo

- Backend README: `/backend/README.md`
- Database Setup: `/backend/SETUP_DATABASE.md`
- API Documentation: Xem các file trong `/backend/src/routes/`

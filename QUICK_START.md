# 🚀 Quick Start - Hệ Thống Admin

Hướng dẫn nhanh để khởi động hệ thống admin.

---

## 1️⃣ Cài Đặt Dependencies

```bash
npm install
```

### Dependencies sử dụng:
- **React:** ^19.2.5 - UI library
- **React Router DOM:** ^7.14.2 - Routing
- **Vite:** ^8.0.10 - Build tool

---

## 2️⃣ Cấu Trúc Thư Mục

```
src/
├── pages/admin/              # Tất cả admin pages
│   ├── components/           # Admin components
│   │   ├── AdminLayout.jsx
│   │   ├── AdminLayout.css
│   │   └── index.js
│   ├── pages/                # Admin pages
│   │   ├── Dashboard.jsx
│   │   ├── ProductManagement.jsx
│   │   ├── UserManagement.jsx
│   │   ├── OrderManagement.jsx
│   │   └── index.js
│   └── index.jsx             # Admin routes
├── services/
│   ├── http.js               # HTTP client
│   ├── admin.js              # Admin API services ✨ NEW
│   └── env.js                # Environment config
├── routes/
│   └── index.jsx             # Route configuration (updated)
├── app/
│   ├── App.jsx               # Main app (updated)
│   └── App.css
└── main.jsx                  # Entry point (updated)
```

---

## 3️⃣ Khởi Động Dev Server

```bash
npm run dev
```

Truy cập: `http://localhost:5173/admin/dashboard`

---

## 4️⃣ Build Production

```bash
npm run build
```

---

## 🔌 Kết Nối Backend

### Bước 1: Cấu Hình API Base URL

File: `src/config/env.js`

```javascript
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",
};
```

### Bước 2: Tạo `.env` file

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### Bước 3: Cấu Hình CORS (Backend)

```javascript
// Nếu dùng Express
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

---

## 📡 API Endpoints Required

Backend cần cung cấp các endpoints sau:

### Dashboard
```
GET  /api/admin/dashboard/statistics
GET  /api/admin/dashboard/activities?limit=10
GET  /api/admin/dashboard/sales?period=month
```

### Products
```
GET    /api/admin/products?page=1&limit=10
GET    /api/admin/products/:id
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/batch/delete
```

### Users
```
GET    /api/admin/users?page=1&limit=10
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/ban
POST   /api/admin/users/:id/unban
GET    /api/admin/users/statistics
```

### Orders
```
GET    /api/admin/orders?page=1&limit=10
GET    /api/admin/orders/:id
PUT    /api/admin/orders/:id/status
POST   /api/admin/orders/:id/cancel
GET    /api/admin/orders/statistics
GET    /api/admin/orders/export?format=csv
```

📖 Chi tiết xem: **API_REQUIREMENTS.md**

---

## 🔐 Authentication

Admin system hiện tại không có built-in auth. Bạn cần:

### 1. Thêm Login Page

```javascript
// src/pages/admin/pages/Login.jsx
export function AdminLogin() {
  // Implement login logic
  // Save token to localStorage
}
```

### 2. Protect Routes

```javascript
// src/routes/index.jsx
import { adminRoutes } from "@/pages/admin";

// Add auth check middleware
const protectedRoutes = adminRoutes.map(route => ({
  ...route,
  element: <RequireAuth>{route.element}</RequireAuth>
}));
```

### 3. Add Auth Header

File: `src/services/http.js` (Already done! ✅)

```javascript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
  ...
}
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Dashboard loads with statistics
- [ ] Can add new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Can search products
- [ ] Can view user details
- [ ] Can ban/unban user
- [ ] Can view order details
- [ ] Can change order status
- [ ] Can export orders

### API Testing

Sử dụng Postman hoặc curl:

```bash
# Test dashboard
curl -X GET http://localhost:3000/api/admin/dashboard/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test create product
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Product",
    "price": 100000,
    "stock": 10,
    "category": "test"
  }'
```

---

## 🐛 Troubleshooting

### Problem: API calls failing

**Solution:**
1. Kiểm tra `VITE_API_BASE_URL` trong `.env`
2. Kiểm tra CORS headers từ backend
3. Kiểm tra network tab trong DevTools
4. Xem console errors

### Problem: Layout không hiển thị

**Solution:**
1. Kiểm tra CSS files được import đúng
2. Kiểm tra sidebar visibility
3. Kiểm tra responsive design

### Problem: Data không load

**Solution:**
1. Kiểm tra API endpoints chính xác
2. Kiểm tra authentication token
3. Kiểm tra backend logs
4. Kiểm tra response format

---

## 📚 File Documentation

- **ADMIN_GUIDE.md** - Hướng dẫn chi tiết sử dụng admin
- **API_REQUIREMENTS.md** - Chi tiết API endpoints
- **src/services/admin.js** - API service methods

---

## 🎯 Next Steps

1. ✅ Setup frontend (DONE)
2. ⏳ Implement backend endpoints
3. ⏳ Create login page
4. ⏳ Add authentication
5. ⏳ Connect to database
6. ⏳ Test all features
7. ⏳ Deploy

---

## 💡 Tips

1. **Hot Module Replacement (HMR):** Vite tự reload khi save
2. **Responsive:** Có thể test responsive bằng F12 → Toggle device
3. **Performance:** Network tab hiển thị API calls
4. **Console:** Xem errors và warnings

---

## 📞 Support

Cần giúp?

1. Kiểm tra console (F12)
2. Kiểm tra network requests
3. Đọc error messages
4. Xem documentation files

---

**Happy Coding! 🎉**

Created: 2026-05-09  
Version: 1.0

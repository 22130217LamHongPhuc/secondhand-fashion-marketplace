# Hệ Thống Admin - Tài Liệu Hướng Dẫn

## 📋 Giới Thiệu
Hệ thống Admin cho phép quản lý toàn bộ nền tảng marketplace, bao gồm quản lý sản phẩm, người dùng và đơn hàng.

## 🗂️ Cấu Trúc Dự Án

```
src/
├── pages/
│   └── admin/
│       ├── components/
│       │   ├── AdminLayout.jsx       # Layout chính cho admin
│       │   ├── AdminLayout.css       # Style cho layout
│       │   └── index.js              # Export components
│       ├── pages/
│       │   ├── Dashboard.jsx         # Trang dashboard
│       │   ├── Dashboard.css
│       │   ├── ProductManagement.jsx # Quản lý sản phẩm
│       │   ├── ProductManagement.css
│       │   ├── UserManagement.jsx    # Quản lý người dùng
│       │   ├── UserManagement.css
│       │   ├── OrderManagement.jsx   # Quản lý đơn hàng
│       │   ├── OrderManagement.css
│       │   └── index.js              # Export pages
│       └── index.jsx                 # Export admin routes
├── services/
│   └── admin.js                      # API services cho admin
└── routes/
    └── index.jsx                     # Route configuration
```

## 🚀 Các Chức Năng

### 1. Dashboard
- **Đường dẫn:** `/admin/dashboard`
- **Chức năng:**
  - Xem tổng số sản phẩm, người dùng, đơn hàng
  - Xem doanh thu tổng cộng
  - Hiển thị đơn hàng gần đây
  - Xem hoạt động gần đây

### 2. Quản Lý Sản Phẩm
- **Đường dẫn:** `/admin/products`
- **Chức năng:**
  - Xem danh sách sản phẩm (có phân trang)
  - Thêm sản phẩm mới
  - Chỉnh sửa sản phẩm
  - Xóa sản phẩm
  - Tìm kiếm sản phẩm
  - Xem chi tiết sản phẩm

**Dữ liệu sản phẩm:**
```javascript
{
  id: number,
  name: string,
  description: string,
  price: number,
  stock: number,
  category: string,
  image: string (URL),
  createdAt: date
}
```

### 3. Quản Lý Người Dùng
- **Đường dẫn:** `/admin/users`
- **Chức năng:**
  - Xem danh sách người dùng
  - Xem chi tiết người dùng
  - Cấm người dùng (với lý do)
  - Gỡ cấm người dùng
  - Xóa tài khoản người dùng
  - Tìm kiếm người dùng
  - Chọn nhiều người dùng

**Dữ liệu người dùng:**
```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  address: string,
  avatar: string (URL),
  status: 'active' | 'banned',
  totalOrders: number,
  totalSpent: number,
  createdAt: date
}
```

### 4. Quản Lý Đơn Hàng
- **Đường dẫn:** `/admin/orders`
- **Chức năng:**
  - Xem danh sách đơn hàng
  - Lọc đơn hàng theo trạng thái
  - Xem chi tiết đơn hàng
  - Cập nhật trạng thái đơn hàng
  - Hủy đơn hàng (với lý do)
  - Xuất đơn hàng (CSV/PDF)

**Dữ liệu đơn hàng:**
```javascript
{
  id: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  shippingAddress: string,
  shippingCity: string,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  subtotal: number,
  shipping: number,
  discount: number,
  total: number,
  items: [
    {
      productName: string,
      price: number,
      quantity: number
    }
  ],
  createdAt: date
}
```

## 📡 API Services

### Product Service
```javascript
import { productService } from '@/services/admin';

// Lấy danh sách sản phẩm
await productService.getAll(page, limit, filters);

// Lấy sản phẩm theo ID
await productService.getById(id);

// Tạo sản phẩm
await productService.create(data);

// Cập nhật sản phẩm
await productService.update(id, data);

// Xóa sản phẩm
await productService.delete(id);

// Xóa nhiều sản phẩm
await productService.batchDelete(ids);
```

### User Service
```javascript
import { userService } from '@/services/admin';

// Lấy danh sách người dùng
await userService.getAll(page, limit, filters);

// Lấy người dùng theo ID
await userService.getById(id);

// Cập nhật người dùng
await userService.update(id, data);

// Xóa người dùng
await userService.delete(id);

// Cấm người dùng
await userService.ban(id, reason);

// Gỡ cấm người dùng
await userService.unban(id);

// Lấy thống kê người dùng
await userService.getStatistics();
```

### Order Service
```javascript
import { orderService } from '@/services/admin';

// Lấy danh sách đơn hàng
await orderService.getAll(page, limit, filters);

// Lấy đơn hàng theo ID
await orderService.getById(id);

// Cập nhật trạng thái
await orderService.updateStatus(id, status);

// Hủy đơn hàng
await orderService.cancel(id, reason);

// Lấy thống kê đơn hàng
await orderService.getStatistics();

// Xuất đơn hàng
await orderService.export(format); // 'csv' hoặc 'pdf'
```

### Dashboard Service
```javascript
import { dashboardService } from '@/services/admin';

// Lấy thống kê dashboard
await dashboardService.getStatistics();

// Lấy hoạt động gần đây
await dashboardService.getRecentActivities(limit);

// Lấy dữ liệu doanh số
await dashboardService.getSalesData(period);
```

## 🎨 Giao Diện

### Sidebar Navigation
- **Dashboard:** Xem tổng quan
- **Sản phẩm:** Quản lý sản phẩm
- **Người dùng:** Quản lý người dùng
- **Đơn hàng:** Quản lý đơn hàng
- **Đăng xuất:** Thoát khỏi admin

### Color Scheme
- **Primary:** #3498db (Xanh dương)
- **Danger:** #e74c3c (Đỏ)
- **Success:** #27ae60 (Xanh lá)
- **Warning:** #f39c12 (Vàng)
- **Dark:** #2c3e50 (Xám đen)
- **Light:** #ecf0f1 (Xám nhạt)

## 🔒 Tính Năng Bảo Mật

1. **Authentication Token:** Lưu trữ trong localStorage
2. **Authorization:** Kiểm tra quyền admin
3. **Input Validation:** Validate dữ liệu trước khi gửi
4. **Error Handling:** Xử lý lỗi toàn diện

## 📱 Responsive Design

- **Desktop:** Giao diện đầy đủ
- **Tablet:** Sidebar tự động ẩn/hiện
- **Mobile:** Tối ưu hóa cho màn hình nhỏ

## 🔄 Luồng Dữ Liệu

```
Component --> Service --> API (Backend)
                    ↓
              HTTP Request
                    ↓
           Process Response
                    ↓
              Update State
                    ↓
            Re-render Component
```

## 🚨 Error Handling

Tất cả các hoạt động có xử lý lỗi:
- Toast notification cho thành công/lỗi
- Loading state trong khi xử lý
- Retry button nếu lỗi mạng
- Validation message rõ ràng

## 📝 Cách Sử Dụng

### Khởi động dự án
```bash
npm install
npm run dev
```

### Truy cập Admin
- Truy cập: `http://localhost:5173/admin/dashboard`
- Hoặc: `http://localhost:5173/` (sẽ redirect tới dashboard)

### Thêm sản phẩm
1. Vào "Sản phẩm"
2. Nhấn "+ Thêm sản phẩm"
3. Điền thông tin
4. Nhấn "Thêm"

### Quản lý người dùng
1. Vào "Người dùng"
2. Tìm kiếm hoặc cuộn danh sách
3. Nhấn 👁️ để xem chi tiết
4. Nhấn 🚫 để cấm hoặc ✅ để gỡ cấm
5. Nhấn 🗑️ để xóa

### Quản lý đơn hàng
1. Vào "Đơn hàng"
2. Lọc theo trạng thái (tùy chọn)
3. Nhấn 👁️ để xem chi tiết
4. Cập nhật trạng thái từ dropdown
5. Nhấn ❌ để hủy đơn hàng
6. Xuất dữ liệu qua CSV/PDF

## 🛠️ Maintenance

### Cập nhật API endpoints
- Chỉnh sửa file: `src/services/admin.js`
- Thay đổi URL endpoints
- Cập nhật parameters nếu cần

### Thêm chức năng mới
1. Tạo component mới trong `pages/`
2. Thêm service method trong `admin.js`
3. Thêm route trong `index.jsx`
4. Import và đăng ký route trong `routes/index.jsx`

## 📞 Support

Nếu gặp lỗi:
1. Kiểm tra console (F12)
2. Kiểm tra network tab
3. Xem server logs
4. Kiểm tra lại API endpoints

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-09  
**Developed by:** Admin Team

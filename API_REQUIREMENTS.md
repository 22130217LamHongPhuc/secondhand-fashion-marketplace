# Backend API Requirements - Admin System

Tài liệu này mô tả các endpoint API mà backend cần cung cấp cho hệ thống admin.

## Base URL
```
/api/admin
```

---

## 📊 Dashboard API

### GET `/dashboard/statistics`
Lấy thống kê dashboard

**Response:**
```json
{
  "totalProducts": 150,
  "totalUsers": 280,
  "totalOrders": 1250,
  "totalRevenue": 50000000,
  "recentOrders": [
    {
      "id": 1,
      "customerName": "Nguyễn A",
      "total": 500000,
      "status": "pending"
    }
  ]
}
```

### GET `/dashboard/activities?limit=10`
Lấy hoạt động gần đây

**Response:**
```json
[
  {
    "timestamp": "2026-05-09T10:30:00Z",
    "description": "Khách hàng Nguyễn A tạo đơn hàng #123"
  }
]
```

### GET `/dashboard/sales?period=month`
Lấy dữ liệu doanh số (period: day, week, month, year)

**Response:**
```json
{
  "period": "month",
  "data": [
    { "date": "2026-05-01", "sales": 5000000 },
    { "date": "2026-05-02", "sales": 6000000 }
  ]
}
```

---

## 📦 Product Management API

### GET `/products?page=1&limit=10&search=...&category=...`
Lấy danh sách sản phẩm

**Query Parameters:**
- `page` (number): Trang hiện tại
- `limit` (number): Số item mỗi trang
- `search` (string): Tìm kiếm theo tên
- `category` (string): Lọc theo danh mục

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Áo sơ mi",
      "description": "Áo sơ mi trắng",
      "price": 200000,
      "stock": 50,
      "category": "áo",
      "image": "https://...",
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10,
  "totalPages": 15
}
```

### GET `/products/:id`
Lấy chi tiết sản phẩm

**Response:**
```json
{
  "id": 1,
  "name": "Áo sơ mi",
  "description": "Áo sơ mi trắng",
  "price": 200000,
  "stock": 50,
  "category": "áo",
  "image": "https://...",
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-09T10:00:00Z"
}
```

### POST `/products`
Tạo sản phẩm mới

**Body:**
```json
{
  "name": "Áo sơ mi",
  "description": "Áo sơ mi trắng",
  "price": 200000,
  "stock": 50,
  "category": "áo",
  "image": "https://..."
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "name": "Áo sơ mi",
  "description": "Áo sơ mi trắng",
  "price": 200000,
  "stock": 50,
  "category": "áo",
  "image": "https://...",
  "createdAt": "2026-05-09T10:00:00Z"
}
```

### PUT `/products/:id`
Cập nhật sản phẩm

**Body:** (Tất cả fields tùy chọn)
```json
{
  "name": "Áo sơ mi cải tiến",
  "price": 250000,
  "stock": 45
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Áo sơ mi cải tiến",
  "description": "Áo sơ mi trắng",
  "price": 250000,
  "stock": 45,
  "category": "áo",
  "image": "https://...",
  "updatedAt": "2026-05-09T10:30:00Z"
}
```

### DELETE `/products/:id`
Xóa sản phẩm

**Response:** (204 No Content)

### POST `/products/batch/delete`
Xóa nhiều sản phẩm

**Body:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response:**
```json
{
  "deleted": 3,
  "message": "Xóa thành công 3 sản phẩm"
}
```

---

## 👥 User Management API

### GET `/users?page=1&limit=10&search=...&status=...`
Lấy danh sách người dùng

**Query Parameters:**
- `page` (number): Trang hiện tại
- `limit` (number): Số item mỗi trang
- `search` (string): Tìm kiếm theo tên/email
- `status` (string): Lọc theo trạng thái (active, banned)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Nguyễn A",
      "email": "nguyena@example.com",
      "phone": "0912345678",
      "address": "123 Đường A, TP HCM",
      "avatar": "https://...",
      "status": "active",
      "totalOrders": 5,
      "totalSpent": 2500000,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 280,
  "page": 1,
  "limit": 10,
  "totalPages": 28
}
```

### GET `/users/:id`
Lấy chi tiết người dùng

**Response:**
```json
{
  "id": 1,
  "name": "Nguyễn A",
  "email": "nguyena@example.com",
  "phone": "0912345678",
  "address": "123 Đường A, TP HCM",
  "avatar": "https://...",
  "status": "active",
  "totalOrders": 5,
  "totalSpent": 2500000,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

### PUT `/users/:id`
Cập nhật thông tin người dùng

**Body:**
```json
{
  "name": "Nguyễn A Cập nhật",
  "phone": "0987654321"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Nguyễn A Cập nhật",
  "email": "nguyena@example.com",
  "phone": "0987654321",
  "updatedAt": "2026-05-09T10:30:00Z"
}
```

### DELETE `/users/:id`
Xóa người dùng

**Response:** (204 No Content)

### POST `/users/:id/ban`
Cấm người dùng

**Body:**
```json
{
  "reason": "Vi phạm điều khoản sử dụng"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "banned",
  "bannedReason": "Vi phạm điều khoản sử dụng",
  "bannedAt": "2026-05-09T10:30:00Z"
}
```

### POST `/users/:id/unban`
Gỡ cấm người dùng

**Response:**
```json
{
  "id": 1,
  "status": "active",
  "unbannedAt": "2026-05-09T10:35:00Z"
}
```

### GET `/users/statistics`
Lấy thống kê người dùng

**Response:**
```json
{
  "totalUsers": 280,
  "activeUsers": 250,
  "bannedUsers": 30,
  "newUsersThisMonth": 15
}
```

---

## 📋 Order Management API

### GET `/orders?page=1&limit=10&status=...`
Lấy danh sách đơn hàng

**Query Parameters:**
- `page` (number): Trang hiện tại
- `limit` (number): Số item mỗi trang
- `status` (string): Lọc theo trạng thái (pending, confirmed, shipped, delivered, cancelled)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "customerName": "Nguyễn A",
      "customerEmail": "nguyena@example.com",
      "customerPhone": "0912345678",
      "shippingAddress": "123 Đường A",
      "shippingCity": "TP HCM",
      "status": "pending",
      "subtotal": 500000,
      "shipping": 50000,
      "discount": 0,
      "total": 550000,
      "createdAt": "2026-05-09T10:00:00Z"
    }
  ],
  "total": 1250,
  "page": 1,
  "limit": 10,
  "totalPages": 125
}
```

### GET `/orders/:id`
Lấy chi tiết đơn hàng

**Response:**
```json
{
  "id": 1,
  "customerName": "Nguyễn A",
  "customerEmail": "nguyena@example.com",
  "customerPhone": "0912345678",
  "shippingAddress": "123 Đường A",
  "shippingCity": "TP HCM",
  "status": "pending",
  "items": [
    {
      "productName": "Áo sơ mi",
      "price": 200000,
      "quantity": 2
    }
  ],
  "subtotal": 400000,
  "shipping": 50000,
  "discount": 0,
  "total": 450000,
  "createdAt": "2026-05-09T10:00:00Z"
}
```

### PUT `/orders/:id/status`
Cập nhật trạng thái đơn hàng

**Body:**
```json
{
  "status": "confirmed"
}
```

**Valid statuses:** pending, confirmed, shipped, delivered, cancelled

**Response:**
```json
{
  "id": 1,
  "status": "confirmed",
  "updatedAt": "2026-05-09T10:30:00Z"
}
```

### POST `/orders/:id/cancel`
Hủy đơn hàng

**Body:**
```json
{
  "reason": "Khách hàng yêu cầu hủy"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "cancelled",
  "cancelReason": "Khách hàng yêu cầu hủy",
  "cancelledAt": "2026-05-09T10:30:00Z"
}
```

### GET `/orders/statistics`
Lấy thống kê đơn hàng

**Response:**
```json
{
  "totalOrders": 1250,
  "pendingOrders": 45,
  "confirmedOrders": 120,
  "shippedOrders": 300,
  "deliveredOrders": 750,
  "cancelledOrders": 35,
  "totalRevenue": 50000000
}
```

### GET `/orders/export?format=csv`
Xuất đơn hàng

**Query Parameters:**
- `format` (string): csv hoặc pdf

**Response:** (Binary file)

---

## 🔐 Authentication

Tất cả requests phải include header:
```
Authorization: Bearer {token}
```

Token được lấy từ localStorage sau khi đăng nhập.

---

## 📝 Error Response Format

```json
{
  "error": true,
  "message": "Mô tả lỗi",
  "code": "ERROR_CODE",
  "status": 400
}
```

---

## ✅ Status Codes

- `200 OK` - Thành công
- `201 Created` - Tạo mới thành công
- `204 No Content` - Xóa thành công
- `400 Bad Request` - Dữ liệu không hợp lệ
- `401 Unauthorized` - Không xác thực
- `403 Forbidden` - Không có quyền
- `404 Not Found` - Không tìm thấy
- `500 Internal Server Error` - Lỗi server

---

## 🔍 Validation Rules

### Product
- `name` - Bắt buộc, string, 1-255 ký tự
- `price` - Bắt buộc, number, >= 0
- `stock` - Bắt buộc, number, >= 0
- `category` - String, 1-100 ký tự
- `description` - String, <= 2000 ký tự

### User
- `email` - Bắt buộc, valid email format
- `name` - Bắt buộc, string, 1-100 ký tự
- `phone` - String, 10-15 ký tự
- `status` - active, banned

### Order
- `status` - pending, confirmed, shipped, delivered, cancelled
- `customerEmail` - Bắt buộc, valid email
- `shippingAddress` - Bắt buộc, string

---

**API Version:** 1.0  
**Last Updated:** 2026-05-09

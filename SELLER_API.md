# Seller API Documentation

Tai lieu nay duoc tong hop tu cac controller hien tai:

- `SellerProductController`
- `SellerOrderController`
- `SellerStatisticController`

Base response thanh cong:

```json
{
  "data": {},
  "message": "..."
}
```

Base response loi:

```json
{
  "timestamp": "2026-05-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/seller/products",
  "errors": {
    "fieldName": "error message"
  }
}
```

## Product APIs

### 1. Lay danh sach san pham

```http
GET /api/seller/products?lastId=0&page=0
```

Query params:

| Ten | Kieu | Bat buoc | Mac dinh | Ghi chu |
|---|---:|---:|---:|---|
| `lastId` | long | Khong | `0` | Cursor id |
| `page` | int | Khong | `0` | Page index |

Response:

```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "name": "Ao khoac denim",
        "description": "Hang secondhand",
        "brand": "Levi's",
        "originCountry": "Japan",
        "condition": "GOOD",
        "basePrice": 300000,
        "salePrice": 250000,
        "stockQuantity": 2,
        "ratingAvg": 0,
        "totalReviews": 0,
        "isActive": true,
        "createdAt": "2026-05-15T10:00:00",
        "updatedAt": "2026-05-15T10:00:00",
        "images": [
          {
            "id": 1,
            "url": "https://cdn.example.com/image.jpg",
            "sortOrder": 0,
            "isPrimary": true
          }
        ]
      }
    ],
    "pageable": {},
    "totalPages": 1,
    "totalElements": 1,
    "last": true,
    "size": 5,
    "number": 0,
    "first": true,
    "numberOfElements": 1,
    "empty": false
  },
  "message": "Get product list successfully"
}
```

Ghi chu: page size hien tai la `5`.

### 2. Lay chi tiet san pham

```http
GET /api/seller/products/{id}
```

Path params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `id` | long | Co |

Response:

```json
{
  "data": {
    "id": 1,
    "name": "Ao khoac denim",
    "description": "Hang secondhand",
    "brand": "Levi's",
    "originCountry": "Japan",
    "condition": "GOOD",
    "basePrice": 300000,
    "salePrice": 250000,
    "stockQuantity": 2,
    "ratingAvg": 0,
    "totalReviews": 0,
    "isActive": true,
    "createdAt": "2026-05-15T10:00:00",
    "updatedAt": "2026-05-15T10:00:00",
    "images": []
  },
  "message": "Get product details successfully"
}
```

### 3. Lay danh sach san pham theo trang thai

```http
GET /api/seller/products/status?isActive=true&lastId=0&page=0
```

Query params:

| Ten | Kieu | Bat buoc | Mac dinh |
|---|---:|---:|---:|
| `isActive` | boolean | Co | Khong co |
| `lastId` | long | Khong | `0` |
| `page` | int | Khong | `0` |

Response giong API lay danh sach san pham.

Message:

```text
Get product list by status successfully
```

### 4. Tao san pham

```http
POST /api/seller/products
Content-Type: multipart/form-data
```

Request form-data:

| Ten | Kieu | Bat buoc | Validate |
|---|---:|---:|---|
| `categoryId` | long | Khong |  |
| `name` | string | Co | Khong blank, max 255 |
| `description` | string | Khong | Max 5000 |
| `brand` | string | Khong | Max 100 |
| `originCountry` | string | Khong | Max 100 |
| `condition` | enum | Khong | `NEW`, `LIKE_NEW`, `GOOD`, `FAIR`; mac dinh service la `GOOD` |
| `basePrice` | decimal | Co | > 0 |
| `salePrice` | decimal | Khong | > 0 va <= `basePrice` |
| `stockQuantity` | int | Co | >= 0 |
| `images` | array | Khong | Toi da 20 anh |
| `images[].file` | file | Co neu co item anh | Khong null/empty |
| `images[].sortOrder` | int | Khong | >= 0, mac dinh service la `0` |
| `images[].isPrimary` | boolean | Khong | Mac dinh service la `false` |
| `attributes` | array | Khong | Toi da 30 |
| `attributes[].attrKey` | string | Co neu co item | Khong blank, max 100 |
| `attributes[].attrValue` | string | Co neu co item | Khong blank, max 255 |
| `tags` | array string | Khong | Toi da 20, moi tag khong blank, max 100 |

Vi du form-data key:

```text
categoryId=1
name=Ao khoac denim
description=Hang secondhand con tot
brand=Levi's
originCountry=Japan
condition=GOOD
basePrice=300000
salePrice=250000
stockQuantity=2
images[0].file=<file>
images[0].sortOrder=0
images[0].isPrimary=true
attributes[0].attrKey=size
attributes[0].attrValue=M
tags[0]=denim
tags[1]=vintage
```

Response:

```json
{
  "data": {
    "id": 1,
    "name": "Ao khoac denim",
    "description": "Hang secondhand con tot",
    "brand": "Levi's",
    "originCountry": "Japan",
    "condition": "GOOD",
    "basePrice": 300000,
    "salePrice": 250000,
    "stockQuantity": 2,
    "ratingAvg": 0,
    "totalReviews": 0,
    "isActive": true,
    "createdAt": "2026-05-15T10:00:00",
    "updatedAt": "2026-05-15T10:00:00",
    "images": [
      {
        "id": 1,
        "url": "https://cdn.example.com/image.jpg",
        "sortOrder": 0,
        "isPrimary": true
      }
    ]
  },
  "message": "Create product successfully"
}
```

Luu y: `attributes`, `tags`, `shop`, `category`, `reviews`, `comments`, `orderItems` dang bi `@JsonIgnore`, nen khong xuat hien trong response `Product`.

### 5. Cap nhat san pham

```http
PUT /api/seller/products/{id}
Content-Type: application/json
```

Path params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `id` | long | Co |

Request body:

```json
{
  "categoryId": 1,
  "name": "Ao khoac denim updated",
  "description": "Mo ta moi",
  "brand": "Levi's",
  "originCountry": "Japan",
  "condition": "LIKE_NEW",
  "basePrice": 300000,
  "salePrice": 250000,
  "stockQuantity": 3,
  "isActive": true,
  "images": [
    {
      "file": null,
      "sortOrder": 0,
      "isPrimary": true
    }
  ],
  "attributes": [
    {
      "attrKey": "size",
      "attrValue": "M"
    }
  ],
  "tags": ["denim", "vintage"]
}
```

Validate giong create, nhung phan lon field la optional. Neu field nao `null` thi service khong cap nhat field do.

Quan trong: DTO update hien khai bao `images[].file` la `MultipartFile`, nhung endpoint lai nhan `@RequestBody` JSON. JSON khong upload duoc file kieu `MultipartFile`, nen phan cap nhat anh co kha nang khong dung duoc neu gui anh moi qua JSON.

Response:

```json
{
  "data": {
    "id": 1,
    "name": "Ao khoac denim updated",
    "description": "Mo ta moi",
    "brand": "Levi's",
    "originCountry": "Japan",
    "condition": "LIKE_NEW",
    "basePrice": 300000,
    "salePrice": 250000,
    "stockQuantity": 3,
    "ratingAvg": 0,
    "totalReviews": 0,
    "isActive": true,
    "createdAt": "2026-05-15T10:00:00",
    "updatedAt": "2026-05-15T10:30:00",
    "images": []
  },
  "message": "Update product successfully"
}
```

### 6. Xoa san pham

```http
DELETE /api/seller/products/{id}
```

Path params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `id` | long | Co |

Response neu thanh cong theo controller:

```json
{
  "data": null,
  "message": "Delete product successfully"
}
```

Nhung hien tai service dang throw:

```text
UnsupportedOperationException("Not implemented yet")
```

Nen response thuc te hien tai la HTTP `501 Not Implemented`:

```json
{
  "timestamp": "2026-05-15T10:30:00",
  "status": 501,
  "error": "Not Implemented",
  "message": "Not implemented yet",
  "path": "/api/seller/products/1",
  "errors": {}
}
```

## Order APIs

### 1. Lay danh sach don hang

```http
GET /api/seller/orders?lastId=0&page=0
```

Query params:

| Ten | Kieu | Bat buoc | Mac dinh |
|---|---:|---:|---:|
| `lastId` | long | Khong | Neu null thi service dung `0` |
| `page` | int | Khong | `0` |

Response:

```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "orderCode": "ORD-001",
        "shippingAddress": {
          "id": 1,
          "fullName": "Nguyen Van A",
          "phone": "0900000000",
          "province": "Ho Chi Minh",
          "district": "Quan 1",
          "ward": "Ben Nghe",
          "addressDetail": "123 Le Loi",
          "isDefault": true,
          "createdAt": "2026-05-15T09:00:00"
        },
        "subtotal": 250000,
        "shippingFee": 30000,
        "status": "PENDING",
        "paymentMethod": "WALLET",
        "paymentStatus": "UNPAID",
        "cancelReason": null,
        "paidAt": null,
        "deliveredAt": null,
        "createdAt": "2026-05-15T10:00:00",
        "updatedAt": "2026-05-15T10:00:00"
      }
    ],
    "pageable": {},
    "totalPages": 1,
    "totalElements": 1,
    "last": true,
    "size": 5,
    "number": 0,
    "first": true,
    "numberOfElements": 1,
    "empty": false
  },
  "message": "Get order list successfully"
}
```

Ghi chu: page size hien tai la `5`.

Enum:

```text
OrderStatus: PENDING, CONFIRMED, SHIPPING, CANCELLED, DONE
PaymentMethod: WALLET, COD, BANK_TRANSFER
PaymentStatus: UNPAID, PAID, REFUNDED
```

### 2. Lay chi tiet don hang

```http
GET /api/seller/orders/{id}
```

Path params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `id` | long | Co |

Response:

```json
{
  "data": {
    "id": 1,
    "orderCode": "ORD-001",
    "shippingAddress": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "phone": "0900000000",
      "province": "Ho Chi Minh",
      "district": "Quan 1",
      "ward": "Ben Nghe",
      "addressDetail": "123 Le Loi",
      "isDefault": true,
      "createdAt": "2026-05-15T09:00:00"
    },
    "subtotal": 250000,
    "shippingFee": 30000,
    "status": "PENDING",
    "paymentMethod": "WALLET",
    "paymentStatus": "UNPAID",
    "cancelReason": null,
    "paidAt": null,
    "deliveredAt": null,
    "createdAt": "2026-05-15T10:00:00",
    "updatedAt": "2026-05-15T10:00:00"
  },
  "message": "Get order details successfully"
}
```

Luu y: `customer`, `shop`, `items`, `statusLogs`, `reviews`, `walletTransactions` dang bi `@JsonIgnore`, nen khong xuat hien trong response `Order`.

### 3. Lay danh sach don hang theo trang thai

```http
GET /api/seller/orders/status?status=PENDING&lastId=0&page=0
```

Query params:

| Ten | Kieu | Bat buoc | Gia tri |
|---|---:|---:|---|
| `status` | enum | Co | `PENDING`, `CONFIRMED`, `SHIPPING`, `CANCELLED`, `DONE` |
| `lastId` | long | Khong | Cursor id |
| `page` | int | Khong | Mac dinh `0` |

Response giong API lay danh sach don hang.

Message:

```text
Get order list by status successfully
```

### 4. Lay danh sach don hang thang hien tai

```http
GET /api/seller/orders/current-month?page=0
```

Query params:

| Ten | Kieu | Bat buoc | Mac dinh |
|---|---:|---:|---:|
| `page` | int | Khong | `0` |

Response giong API lay danh sach don hang.

Message:

```text
Get current month order list successfully
```

### 5. Xac nhan don hang

```http
PUT /api/seller/orders/{id}/confirm
```

Path params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `id` | long | Co |

Request body: khong co.

Response:

```json
{
  "data": {
    "id": 1,
    "orderCode": "ORD-001",
    "status": "CONFIRMED",
    "paymentMethod": "WALLET",
    "paymentStatus": "UNPAID",
    "cancelReason": null,
    "paidAt": null,
    "deliveredAt": null,
    "createdAt": "2026-05-15T10:00:00",
    "updatedAt": "2026-05-15T10:20:00"
  },
  "message": "Confirm order successfully"
}
```

Rule trang thai:

```text
PENDING -> CONFIRMED
```

### 6. Bat dau giao hang

```http
PUT /api/seller/orders/{id}/delivery
```

Request body: khong co.

Response message:

```text
Start delivery successfully
```

Rule trang thai:

```text
CONFIRMED -> SHIPPING
```

### 7. Hoan tat don hang

```http
PUT /api/seller/orders/{id}/complete
```

Request body: khong co.

Response message:

```text
Complete order successfully
```

Rule trang thai:

```text
SHIPPING -> DONE
```

### 8. Huy don hang

```http
PUT /api/seller/orders/{id}/cancel?reason=Khach%20huy%20don
```

Path params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `id` | long | Co |

Query params:

| Ten | Kieu | Bat buoc |
|---|---:|---:|
| `reason` | string | Khong |

Request body: khong co.

Response:

```json
{
  "data": {
    "id": 1,
    "orderCode": "ORD-001",
    "status": "CANCELLED",
    "cancelReason": "Khach huy don",
    "paymentMethod": "WALLET",
    "paymentStatus": "UNPAID",
    "paidAt": null,
    "deliveredAt": null,
    "createdAt": "2026-05-15T10:00:00",
    "updatedAt": "2026-05-15T10:20:00"
  },
  "message": "Cancel order successfully"
}
```

Rule trang thai:

```text
PENDING -> CANCELLED
SHIPPING -> CANCELLED
```

Neu chuyen trang thai khong hop le, response la HTTP `409 Conflict`:

```json
{
  "timestamp": "2026-05-15T10:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Unsuitable status",
  "path": "/api/seller/orders/1/complete",
  "errors": {}
}
```

## Statistic APIs

Controller hien tai co base path:

```http
/api/seller/stat
```

Nhung `SellerStatisticController` chua co endpoint nao, nen chua co API request/response thuc te.

# Phân Tích & Đặc Tả API Cho Trang Seller Dashboard & Seller Analytics

Tài liệu này tổng hợp kết quả phân tích mã nguồn giao diện (Frontend React) của hai trang:
1. **Seller Dashboard** (`DashboardPage.jsx`)
2. **Seller Analytics** (`AnalyticsPage.jsx`)

Từ cấu trúc mock data và các thành phần giao diện hiện tại của dự án **Secondhand Fashion Marketplace**, tài liệu này đề xuất và thiết kế chi tiết các endpoint API bổ sung cho **`SellerStatisticController`** (Base path: `/api/seller/stat`) để cung cấp toàn bộ dữ liệu động cần thiết.

---

## PHẦN 1: PHÂN TÍCH GIAO DIỆN & MOCK DATA HIỆN TẠI

### 1.1. Seller Dashboard (`DashboardPage.jsx`)
Giao diện hiện tại hiển thị các thông tin sau bằng Mock Data cứng:
*   **Thẻ Chỉ Số (Stat Cards):**
    *   *Doanh thu tổng:* `12.450.000đ` (Tăng `+12.5%` so với kỳ trước), kèm danh sách dữ liệu vẽ biểu đồ mini dạng cột tuần suất: `[35, 38, 42, 48, 80, 50, 55]`.
    *   *Đơn hàng mới:* `08` đơn chưa xử lý kèm danh sách avatar khách hàng gần đây.
    *   *Sản phẩm đang bán:* Tổng số `42` sản phẩm, hiển thị biểu đồ Donut chia ra: `Hoạt động (32)` và `Chờ duyệt (10)`.
*   **Biểu Đồ Doanh Thu Theo Thời Gian:**
    *   Nhóm theo thời gian (ví dụ: 30 ngày qua, 7 ngày qua, 90 ngày qua).
    *   Biểu đồ cột đôi biểu thị doanh thu tuần (so sánh Doanh thu Thực tế và Mục tiêu/Kỳ trước):
        *   Tuần 1: 50 và 72
        *   Tuần 2: 68 và 153
        *   Tuần 3: 55 và 100
        *   Tuần 4: 45 và 85
*   **Thông Báo Mới Nhất:** Danh sách các hoạt động vừa diễn ra:
    *   Đơn hàng mới `#TC1204` (Khách hàng Lan Anh đặt "Váy Vintage Hoa Nhí" - 10 phút trước).
    *   Câu hỏi khách hàng (Khách hàng Minh Tú hỏi "Áo len này có bị xù lông không shop ơi?" - 2 giờ trước).
*   **Doanh Thu Theo Danh Mục:** Tỷ lệ doanh thu các mặt hàng thời trang secondhand:
    *   Áo: `40%`
    *   Quần: `30%`
    *   Váy: `20%`
    *   Phụ kiện: `10%`

---

### 1.2. Seller Analytics (`AnalyticsPage.jsx`)
Giao diện hiện tại tập trung hiển thị điểm Uy Tín (Reputation/Trust Score) của cửa hàng:
*   **Điểm Uy Tín Cửa Hàng (Score Hero Section):**
    *   *Điểm hiện tại:* `1250` trên thang điểm tối đa `2000`.
    *   *Hạng cửa hàng:* `HẠNG BẠC` (Silver Rank).
    *   *Mục tiêu tiếp theo:* Cần thêm `750` điểm để lên hạng `VÀNG` (Gold Rank).
*   **Các Chỉ Số Đo Lường Vận Hành (Operational Metrics):**
    *   *Tỷ lệ thành công:* `98.5%` (Tăng `+2.1%`).
    *   *Đánh giá trung bình:* `4.8` / `5.0`.
    *   *Thời gian phản hồi:* `< 15` phút (Trạng thái: "Cải thiện").
    *   *Tỷ lệ hoàn hàng:* `1.2%`.
*   **Bảng Lịch Sử Điểm Uy Tín (Trust Points History):**
    *   `24/10/2023`: Hoàn thành đơn `#12345` (`+10` điểm, tích lũy `1250`).
    *   `23/10/2023`: Nhận đánh giá 5 sao (`+5` điểm, tích lũy `1240`).
    *   `20/10/2023`: Hủy đơn do hết hàng (`-15` điểm, tích lũy `1235`).
    *   `18/10/2023`: Hoàn thành đơn `#12340` (`+10` điểm, tích lũy `1250`).

---

## PHẦN 2: THIẾT KẾ CÁC ENDPOINT API BỔ SUNG

Để hỗ trợ hai trang này hoạt động động hoàn toàn, chúng ta bổ sung **2 API chính** vào `SellerStatisticController` (`/api/seller/stat`):

### 2.1. API Lấy Dữ Liệu Trang Chủ Dashboard
*   **Endpoint:** `GET /api/seller/stat/dashboard`
*   **Mô tả:** Trả về toàn bộ các số liệu thống kê tổng hợp, biểu đồ doanh thu theo thời gian, tỷ lệ danh mục sản phẩm và các thông báo vận hành gần đây của shop người bán.
*   **Headers:**
    ```http
    Authorization: Bearer <token>
    Accept: application/json
    ```
*   **Query Parameters:**
    | Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
    | :--- | :---: | :---: | :---: | :--- |
    | `revenuePeriod` | String | Không | `30_DAYS` | Khoảng thời gian biểu đồ doanh thu (`7_DAYS`, `30_DAYS`, `90_DAYS`) |

*   **Response mẫu thành công (HTTP `200 OK`):**
```json
{
  "data": {
    "summary": {
      "totalRevenue": 12450000,
      "revenueGrowthPercentage": 12.5,
      "revenueTrend": [35, 38, 42, 48, 80, 50, 55],
      "pendingOrdersCount": 8,
      "recentCustomerAvatars": [
        "https://i.pravatar.cc/32?img=12",
        "https://i.pravatar.cc/32?img=25",
        "https://i.pravatar.cc/32?img=33"
      ],
      "extraOrdersCount": 5,
      "totalProducts": 42,
      "activeProductsCount": 32,
      "pendingProductsCount": 10
    },
    "revenueChart": [
      { "label": "TUẦN 1", "light": 50, "dark": 72 },
      { "label": "TUẦN 2", "light": 68, "dark": 153 },
      { "label": "TUẦN 3", "light": 55, "dark": 100 },
      { "label": "TUẦN 4", "light": 45, "dark": 85 }
    ],
    "categoryBreakdown": [
      { "label": "Áo", "percent": 40, "color": "#c75c2e" },
      { "label": "Quần", "percent": 30, "color": "#d4724a" },
      { "label": "Váy", "percent": 20, "color": "#f5c9a8" },
      { "label": "Phụ kiện", "percent": 10, "color": "#e8e5de" }
    ],
    "recentNotifications": [
      {
        "id": 1,
        "type": "ORDER",
        "title": "Đơn hàng #TC1204 mới!",
        "desc": "Lan Anh vừa đặt \"Váy Vintage Hoa Nhí\". Cần xác nhận ngay.",
        "time": "10 phút trước"
      },
      {
        "id": 2,
        "type": "MESSAGE",
        "title": "Câu hỏi khách hàng",
        "desc": "\"Áo len này có bị xù lông không shop ơi?\" từ Minh Tú.",
        "time": "2 giờ trước"
      }
    ]
  },
  "message": "Get seller dashboard data successfully"
}
```

---

### 2.2. API Lấy Dữ Liệu Phân Tích Điểm Uy Tín & Vận Hành (Analytics)
*   **Endpoint:** `GET /api/seller/stat/analytics`
*   **Mô tả:** Trả về điểm uy tín hiện tại, xếp hạng, các mục tiêu nâng hạng tiếp theo, chỉ số vận hành chi tiết (tỷ lệ thành công, đánh giá, thời gian phản hồi, tỷ lệ hoàn hàng) và lịch sử biến động điểm uy tín.
*   **Headers:**
    ```http
    Authorization: Bearer <token>
    Accept: application/json
    ```
*   **Query Parameters:**
    | Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
    | :--- | :---: | :---: | :---: | :--- |
    | `page` | Integer | Không | `0` | Chỉ mục trang lịch sử điểm uy tín |
    | `size` | Integer | Không | `10` | Số lượng dòng lịch sử mỗi trang |

*   **Response mẫu thành công (HTTP `200 OK`):**
```json
{
  "data": {
    "reputation": {
      "currentScore": 1250,
      "maxScore": 2000,
      "currentRank": "HẠNG BẠC",
      "nextRank": "HẠNG VÀNG",
      "pointsNeededForNextRank": 750,
      "statusMessage": "Tuyệt vời! Cửa hàng đang hoạt động rất tốt."
    },
    "metrics": {
      "successRate": {
        "value": "98.5%",
        "growth": "+2.1%",
        "status": "GOOD"
      },
      "averageRating": {
        "value": "4.8",
        "suffix": "/ 5.0",
        "status": "EXCELLENT"
      },
      "responseTime": {
        "value": "< 15",
        "suffix": "phút",
        "status": "IMPROVED"
      },
      "returnRate": {
        "value": "1.2%",
        "status": "LOW"
      }
    },
    "reputationHistory": {
      "content": [
        {
          "date": "24/10/2023",
          "event": "Hoàn thành đơn #12345",
          "pointsChange": "+10",
          "pointsType": "positive",
          "totalAccumulated": 1250
        },
        {
          "date": "23/10/2023",
          "event": "Nhận đánh giá 5 sao",
          "pointsChange": "+5",
          "pointsType": "positive",
          "totalAccumulated": 1240
        },
        {
          "date": "20/10/2023",
          "event": "Hủy đơn do hết hàng",
          "pointsChange": "-15",
          "pointsType": "negative",
          "totalAccumulated": 1235
        },
        {
          "date": "18/10/2023",
          "event": "Hoàn thành đơn #12340",
          "pointsChange": "+10",
          "pointsType": "positive",
          "totalAccumulated": 1250
        }
      ],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 10
      },
      "totalPages": 1,
      "totalElements": 4,
      "last": true
    }
  },
  "message": "Get seller analytics data successfully"
}
```

---

## TỔNG KẾT & KIẾN NGHỊ TÍCH HỢP

1.  **Frontend Integration:**
    *   Tạo file `sellerStatisticApi.js` trong thư mục `src/pages/seller/api/` kế thừa cấu trúc của `sellerOrderApi.js` để gọi hai endpoint trên.
    *   Sử dụng React Query hoặc Hooks tùy chỉnh để thay thế mock data hiện tại trong `DashboardPage.jsx` và `AnalyticsPage.jsx` bằng dữ liệu trả về từ API.
2.  **Backend Implementation:**
    *   Hiện tại `SellerStatisticController` đã có base mapping `/api/seller/stat` nhưng chưa định nghĩa phương thức nào.
    *   Cần khai báo hai phương thức `@GetMapping("/dashboard")` và `@GetMapping("/analytics")` ánh xạ vào `SellerStatisticService` để tính toán doanh thu từ `Order` (trạng thái `DONE`), lượng sản phẩm từ `Product`, và lịch sử điểm uy tín từ thực thể điểm/bảng logs.

# Kế hoạch triển khai: Phát triển API Seller Dashboard & Seller Analytics

Kế hoạch này chi tiết hóa việc thực thi phát triển các API thống kê hiệu suất cho phân hệ Người bán (Seller) trong dự án **Secondhand Fashion Marketplace**, tuân thủ nghiêm ngặt theo mô hình kiến trúc tùy chỉnh của bạn.

---

## 1. Kiến trúc & Quy chuẩn Phát triển

Để đảm bảo hiệu năng tối ưu và tính sạch sẽ của mã nguồn, chúng ta sẽ áp dụng các tiêu chí kiến trúc sau:
1.  **Spring Boot Backend**:
    *   **Repository Layer**: Tạo mới `SellerStatisticRepository.java`. Tất cả các câu truy vấn thống kê dữ liệu phức tạp sẽ sử dụng **native SQL thuần** với `@Query(value = "...", nativeQuery = true)`.
    *   **Interface Projection**: Định nghĩa các Interface Projection (ví dụ: `IWeeklyRevenueProjection`, `IReputationStatProjection`) trong Java để nhận kết quả từ câu truy vấn native.
    *   **Service Layer**: Thực hiện gọi JPA, hứng kết quả dạng Interface Projection và ánh xạ (mapping) thủ công sang các đối tượng DTO dạng Record. Nếu không tìm thấy Shop hoặc không có dữ liệu phù hợp, Service sẽ trả về `null`.
    *   **DTO Layer**: Sử dụng Java **`record`** thay cho `class` thông thường để làm các DTO Request và Response.
    *   **Controller Layer**: Gọi Service để nhận DTO Record. Kiểm tra:
        *   Nếu kết quả trả về `!= null`: Trả về `200 OK` bọc trong `ApiResponse.success(data, "...")`.
        *   Nếu kết quả trả về `== null`: Trả về `404 Not Found` qua `ResponseEntity.notFound().build()`.
    *   **Shop Context**: Trích xuất `seller_id` / `shop_id` từ Spring Security Authentication context. Hỗ trợ fallback lấy Shop đầu tiên trong DB khi truy cập dưới dạng Anonymous để phục vụ môi trường phát triển (permitAll).
2.  **React Frontend**:
    *   Tạo file `sellerStatisticApi.js` call các API Backend mới.
    *   Tạo Custom Hooks `useSellerDashboard` và `useSellerAnalytics` để kết nối dữ liệu qua React Query v5.
    *   Đổ dữ liệu động vào `DashboardPage.jsx` và `AnalyticsPage.jsx`, gỡ bỏ hoàn toàn dữ liệu mockup tĩnh.

---

## 2. Đặc tả các thành phần sửa đổi & tạo mới

### A. BACKEND (Spring Boot)

#### [NEW] [SellerStatisticRepository.java](file:///D:/IT/secondhand_fashion_marketplace/be/secondhand-fashion-marketplace-be/src/main/java/com/be/repository/SellerStatisticRepository.java)
Chứa các câu truy vấn SQL Native với các Interface Projection tương ứng để hứng dữ liệu:
*   *Doanh thu tổng hợp & sản phẩm stats*: Truy vấn lấy tổng doanh thu từ đơn `DONE`, đếm đơn `PENDING`, đếm sản phẩm `active` và `pending` của shop.
*   *Biểu đồ doanh thu so sánh*: So sánh doanh thu theo từng tuần của tháng hiện tại với tháng trước.
*   *Tỷ lệ doanh thu danh mục*: Truy vấn tính phần trăm đóng góp doanh thu của các danh mục sản phẩm (Áo, Quần, Váy, Phụ kiện) trong các đơn hàng đã hoàn thành của shop.
*   *Bảng lịch sử điểm uy tín*: Lấy lịch sử biến động điểm uy tín từ `OrderStatusLog` (Cộng 10 điểm cho đơn `DONE`, trừ 15 điểm cho đơn `CANCELLED` mà người hủy là chủ shop - so sánh `changed_by` với `seller_id`).

#### [NEW] [Các DTO Record](file:///D:/IT/secondhand_fashion_marketplace/be/secondhand-fashion-marketplace-be/src/main/java/com/be/dto/response/seller/)
*   `SellerDashboardResponse.java` (Record): Chứa cấu trúc dữ liệu trả về cho màn hình Dashboard.
*   `SellerAnalyticsResponse.java` (Record): Chứa cấu trúc dữ liệu trả về cho màn hình Analytics.

#### [MODIFY] [SellerStatisticService.java](file:///D:/IT/secondhand_fashion_marketplace/be/secondhand-fashion-marketplace-be/src/main/java/com/be/service/seller/SellerStatisticService.java)
Định nghĩa 2 hàm chính:
```java
SellerDashboardResponse getDashboardData(Long shopId);
SellerAnalyticsResponse getAnalyticsData(Long shopId, int page, int size);
```

#### [NEW] [SellerStatisticServiceImpl.java](file:///D:/IT/secondhand_fashion_marketplace/be/secondhand-fashion-marketplace-be/src/main/java/com/be/service/seller/impl/SellerStatisticServiceImpl.java)
Triển khai nghiệp vụ Service:
*   Lấy Shop ID từ tài khoản đăng nhập hoặc fallback nếu cần.
*   Gọi Repository lấy dữ liệu Projection.
*   Tính toán tỷ lệ tăng trưởng doanh thu kỳ này so với kỳ trước.
*   Lọc logic trừ điểm uy tín trong `OrderStatusLog`: Chỉ tính log hủy đơn khi `changed_by_id = seller_id`.
*   Map toàn bộ thông tin sang DTO Record tương ứng. Trả về `null` nếu không tìm thấy Shop.

#### [MODIFY] [SellerStatisticController.java](file:///D:/IT/secondhand_fashion_marketplace/be/secondhand-fashion-marketplace-be/src/main/java/com/be/controller/seller/SellerStatisticController.java)
Mở 2 endpoint và xử lý logic HTTP Response:
```java
@GetMapping("/dashboard")
public ResponseEntity<ApiResponse<SellerDashboardResponse>> getDashboard(...) {
    SellerDashboardResponse data = sellerStatisticService.getDashboardData(...);
    if (data == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(ApiResponse.success(data, "Get dashboard data successfully"));
}

@GetMapping("/analytics")
public ResponseEntity<ApiResponse<SellerAnalyticsResponse>> getAnalytics(...) {
    SellerAnalyticsResponse data = sellerStatisticService.getAnalyticsData(...);
    if (data == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(ApiResponse.success(data, "Get analytics data successfully"));
}
```

---

### B. FRONTEND (React)

#### [NEW] [sellerStatisticApi.js](file:///D:/IT/secondhand_fashion_marketplace/fe/secondhand-fashion-marketplace/src/pages/seller/api/sellerStatisticApi.js)
Khai báo gọi API bằng axiosInstance:
*   `getDashboard()` -> `GET /api/seller/stat/dashboard`
*   `getAnalytics(params)` -> `GET /api/seller/stat/analytics`

#### [NEW] [useSellerStatistics.js](file:///D:/IT/secondhand_fashion_marketplace/fe/secondhand-fashion-marketplace/src/pages/seller/hooks/useSellerStatistics.js)
Cung cấp Custom Hooks dùng React Query v5 để quản lý state và caching.

#### [MODIFY] [DashboardPage.jsx](file:///D:/IT/secondhand_fashion_marketplace/fe/secondhand-fashion-marketplace/src/pages/seller/pages/Dashboard/DashboardPage.jsx)
Sử dụng hook `useSellerDashboard()`, hiển thị màn hình loading/error nếu cần, và gán toàn bộ số liệu/biểu đồ động.

#### [MODIFY] [AnalyticsPage.jsx](file:///D:/IT/secondhand_fashion_marketplace/fe/secondhand-fashion-marketplace/src/pages/seller/pages/Analytics/AnalyticsPage.jsx)
Sử dụng hook `useSellerAnalytics()`, gán điểm uy tín, biểu đồ tròn và bảng lịch sử uy tín phân trang.

---

## 3. Kế hoạch xác thực & kiểm thử (Verification Plan)

### Kiểm thử tự động & thủ công
1.  **Chạy Seeder**:
    *   Chạy `SellerSeeder` để nạp dữ liệu đơn hàng (`DONE`, `CANCELLED` do khách, `CANCELLED` do shop) và sản phẩm mẫu vào cơ sở dữ liệu.
2.  **Kiểm thử API (Postman / Curl)**:
    *   Gọi thử `/api/seller/stat/dashboard` và `/api/seller/stat/analytics` để kiểm tra cấu trúc JSON phản hồi và mã HTTP trả về (200 khi có shop, 404 khi shop không tồn tại).
3.  **Kiểm thử tích hợp UI**:
    *   Khởi chạy dự án Frontend, truy cập trang Seller Dashboard và Seller Analytics để đảm bảo biểu đồ hoạt động trơn tru và dữ liệu hiển thị trùng khớp với DB.

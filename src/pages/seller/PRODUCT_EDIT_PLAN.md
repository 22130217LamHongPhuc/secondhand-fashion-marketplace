# Product Edit Flow — Implementation Plan

## Mục tiêu

Kết nối nút Edit trên trang danh sách sản phẩm (ProductsPage) sang trang chỉnh sửa (ProductDetailPage).
Trang edit tái sử dụng đúng form tạo sản phẩm, nhưng:
- Gán dữ liệu sẵn từ API `GET /api/seller/products/{id}`
- Lưu snapshot dữ liệu gốc (originalData) để so sánh
- Khi submit, chỉ gửi các field bị thay đổi qua `PUT /api/seller/products/{id}`
- Nút submit hiển thị "Cập nhật" thay vì "Đăng sản phẩm"

---

## Phân tích hiện trạng

### Routing ✅ Đã có sẵn
```
Route: products/new  → <ProductDetailPage />  (tạo mới)
Route: products/:id  → <ProductDetailPage />  (chỉnh sửa)
```
File: `src/pages/seller/routes/SellerRoutes.jsx` (line 17-18)

### ProductDetailPage ✅ Đã có cơ bản
- Đã có `useParams()` lấy `id`, `isEdit = Boolean(id)`
- Đã có `fetchProductById(id)` load dữ liệu vào form
- Đã có `updateProduct(id, data)` gọi PUT API
- **Vấn đề**: Hiện gửi toàn bộ formData khi update, chưa tính diff

### ProductsPage ❌ Thiếu
- Nút Pencil (line 189-191) là `<button>` thuần, chưa có `onClick` navigate

### API Constraint (SELLER_API.md line 282)
> "Neu field nao `null` thi service khong cap nhat field do"

→ Chỉ cần gửi field thay đổi, field không đổi gửi `null` hoặc bỏ qua.

### API Constraint - Image (SELLER_API.md line 284)
> "DTO update khai bao images[].file la MultipartFile nhung endpoint nhan @RequestBody JSON"

→ Không thể upload ảnh mới qua PUT. Chỉ có thể cập nhật text fields.

---

## Files cần thay đổi

| # | File | Action | Mô tả |
|---|------|--------|-------|
| 1 | `pages/Products/ProductsPage.jsx` | MODIFY | Thêm navigate cho nút Edit |
| 2 | `pages/Products/ProductDetailPage.jsx` | MODIFY | Lưu originalData, tính diff khi submit |

> ⚠️ Tất cả thay đổi chỉ trong `src/pages/seller/`. Không tác động file ngoài.

---

## Chi tiết thay đổi

### 1. ProductsPage.jsx — Thêm navigate cho nút Edit

**Hiện tại** (line 189-191):
```jsx
<button className="flex h-8 w-8 ...">
  <Pencil size={16} />
</button>
```

**Sau khi sửa**:
```jsx
<button onClick={() => navigate(`/seller/products/${p.id}`)} className="flex h-8 w-8 ...">
  <Pencil size={16} />
</button>
```

Cần thêm:
- Import `useNavigate` từ `react-router-dom`
- Khai báo `const navigate = useNavigate()` trong component

---

### 2. ProductDetailPage.jsx — Lưu originalData + Tính diff

#### 2a. Thêm state `originalData` để snapshot dữ liệu gốc

```jsx
const [originalData, setOriginalData] = useState(null);
```

#### 2b. Trong useEffect fetch, lưu cả originalData

```jsx
useEffect(() => {
  if (isEdit) {
    fetchProductById(id).then(data => {
      if (data) {
        const formValues = {
          name: data.name || '',
          basePrice: data.basePrice || '',
          salePrice: data.salePrice || '',
          brand: data.brand || '',
          condition: data.condition || 'GOOD',
          description: data.description || '',
          stockQuantity: data.stockQuantity || 1,
          originCountry: data.originCountry || '',
          isActive: data.isActive ?? true,
        };
        setFormData(formValues);
        setOriginalData(formValues); // ← snapshot gốc
        // ...preview urls
      }
    });
  }
}, [id, isEdit]);
```

#### 2c. Hàm tính diff — chỉ lấy fields thay đổi

```jsx
const getChangedFields = () => {
  if (!originalData) return formData;
  
  const changes = {};
  for (const key of Object.keys(formData)) {
    if (String(formData[key]) !== String(originalData[key])) {
      changes[key] = formData[key];
    }
  }
  return changes;
};
```

Logic so sánh dùng `String()` vì input HTML trả về string cho number fields.

#### 2d. handleSubmit — dùng diff cho edit mode

```jsx
const handleSubmit = async () => {
  if (!formData.name || !formData.basePrice) {
    alert("Vui lòng điền các trường bắt buộc");
    return;
  }

  try {
    if (isEdit) {
      const changedFields = getChangedFields();
      if (Object.keys(changedFields).length === 0) {
        alert("Không có thay đổi nào.");
        return;
      }
      await updateProduct(id, changedFields);
      alert("Cập nhật thành công!");
      navigate("/seller/products");
    } else {
      await createProduct({ productData: formData, images });
      alert("Thêm sản phẩm thành công!");
      navigate("/seller/products");
    }
  } catch (e) {
    alert("Thất bại: " + e);
  }
};
```

#### 2e. Thêm thêm fields vào form: originCountry, isActive

Form hiện tại thiếu 2 fields mà API hỗ trợ update:
- `originCountry` — Xuất xứ
- `isActive` — Trạng thái hiển thị (toggle ẩn/hiện)

Thêm vào form section "Chi tiết cơ bản".

---

## Flow tổng thể

```
ProductsPage                   ProductDetailPage
┌───────────┐                  ┌──────────────────────────┐
│ Danh sách │  click Edit(id)  │ isEdit = true            │
│ sản phẩm  │ ───navigate───→  │                          │
│           │  /seller/        │ 1. fetchProductById(id)  │
│  [Pencil] │  products/:id    │ 2. setFormData(data)     │
│           │                  │ 3. setOriginalData(data) │ ← snapshot
└───────────┘                  │                          │
                               │ User chỉnh sửa form...  │
                               │                          │
                               │ 4. getChangedFields()    │ ← tính diff
                               │ 5. updateProduct(id, diff)│
                               │ 6. navigate back         │
                               └──────────────────────────┘
```

---

## Verification

1. Từ trang Products, click icon Pencil → Chuyển sang `/seller/products/{id}`
2. Form được gán dữ liệu sẵn từ API
3. Sửa 1 field (ví dụ: tên) → Submit → Kiểm tra network tab chỉ gửi field đã thay đổi
4. Không sửa gì → Submit → Hiện thông báo "Không có thay đổi nào"
5. Nút submit hiển thị "Lưu thay đổi" (không phải "Đăng sản phẩm")

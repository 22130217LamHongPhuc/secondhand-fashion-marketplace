import { Link } from "react-router-dom";

export function Profile() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Tài khoản</h1>
      <p>Trang này là placeholder để wiring router.</p>
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/product/1">Xem sản phẩm</Link>
      </div>
    </div>
  );
}

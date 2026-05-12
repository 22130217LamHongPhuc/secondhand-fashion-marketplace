import { Link } from "react-router-dom";

export function Login() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Đăng nhập</h1>
      <p>Trang này là placeholder để wiring router.</p>
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <Link to="/register">Đăng ký</Link>
        <Link to="/profile">Tài khoản</Link>
        <Link to="/product/1">Xem sản phẩm</Link>
      </div>
    </div>
  );
}

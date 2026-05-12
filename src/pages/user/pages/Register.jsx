import { Link } from "react-router-dom";

export function Register() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Đăng ký</h1>
      <p>Trang này là placeholder để wiring router.</p>
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <Link to="/login">Đăng nhập</Link>
        <Link to="/profile">Tài khoản</Link>
      </div>
    </div>
  );
}

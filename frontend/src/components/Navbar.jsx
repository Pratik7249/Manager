// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      background: "#222",
      color: "#fff",
      padding: "0 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "60px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        <h2 style={{ margin: 0 }}>MyApp</h2>
        {/* Links from old Sidebar */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: "20px" }}>
          <li><Link to="/dashboard" style={{ color: "#fff", textDecoration: "none" }}>Dashboard</Link></li>
          <li><Link to="/profile" style={{ color: "#fff", textDecoration: "none" }}>Profile</Link></li>
        </ul>
      </div>

      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span>{user.name || user.email}</span>
          <button
            onClick={logout}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 5,
              cursor: "pointer"
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
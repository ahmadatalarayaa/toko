import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">Toko</span>
          <span className="brand-tagline">BUKU STOK &amp; PENJUALAN</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/products"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Produk
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/products"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              Kelola Produk
            </NavLink>
          )}

          {isAuthenticated && (
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              Profil
            </NavLink>
          )}
        </nav>

        <div className="nav-user">
          {isAuthenticated ? (
            <>
              <span>{user.name}</span>
              {isAdmin && <span className="role-badge">ADMIN</span>}
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-secondary btn-sm">
                Masuk
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Daftar
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

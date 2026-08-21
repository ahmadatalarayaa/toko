import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="empty-state">
      <h3>Halaman tidak ditemukan</h3>
      <p style={{ marginBottom: 20 }}>Halaman yang kamu cari tidak tersedia.</p>
      <Link to="/products" className="btn btn-primary">
        Kembali ke Daftar Produk
      </Link>
    </div>
  );
}

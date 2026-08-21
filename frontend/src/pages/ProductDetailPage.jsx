import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProductById } from "../api/productApi";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getProductById(id)
      .then(setProduct)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading-text">Memuat produk...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!product) return null;

  return (
    <div>
      <Link to="/products" className="nav-link" style={{ display: "inline-block", marginBottom: 20 }}>
        ← Kembali ke daftar produk
      </Link>

      <div className="detail-card">
        <span className="eyebrow">Produk</span>
        <h1 style={{ marginTop: 6 }}>{product.name}</h1>
        <div className="detail-price">{formatRupiah(product.price)}</div>

        <p style={{ color: "var(--color-ink-soft)", lineHeight: 1.6 }}>
          {product.description}
        </p>

        <div className="detail-row">
          <span className="eyebrow">Stok Tersedia</span>
          <span className="mono">{product.stock} unit</span>
        </div>
        <div className="detail-row">
          <span className="eyebrow">Ditambahkan</span>
          <span className="mono">{formatDate(product.createdAt)}</span>
        </div>
        <div className="detail-row">
          <span className="eyebrow">Diperbarui</span>
          <span className="mono">{formatDate(product.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}

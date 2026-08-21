import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { searchProducts } from "../api/productApi";

const PAGE_SIZE = 10;

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function ProductsPage() {
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [page, setPage] = useState(0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const timeout = setTimeout(() => {
      searchProducts({ keyword, sortBy, direction, page, size: PAGE_SIZE })
        .then((res) => {
          if (!cancelled) setData(res);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [keyword, sortBy, direction, page]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Daftar Produk</h1>
          <p className="page-subtitle">Cari, urutkan, dan lihat stok produk.</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Cari nama produk..."
          value={keyword}
          onChange={(e) => {
            setPage(0);
            setKeyword(e.target.value);
          }}
        />

        <select
          value={sortBy}
          onChange={(e) => {
            setPage(0);
            setSortBy(e.target.value);
          }}
        >
          <option value="createdAt">Terbaru</option>
          <option value="name">Nama</option>
          <option value="price">Harga</option>
          <option value="stock">Stok</option>
        </select>

        <select
          value={direction}
          onChange={(e) => {
            setPage(0);
            setDirection(e.target.value);
          }}
        >
          <option value="asc">Naik</option>
          <option value="desc">Turun</option>
        </select>
      </div>

      {loading && <p className="loading-text">Memuat produk...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && data && (
        <>
          <div className="ledger">
            <div className="ledger-row header-row">
              <span className="eyebrow">Produk</span>
              <span className="eyebrow" style={{ textAlign: "right" }}>Harga</span>
              <span className="eyebrow" style={{ textAlign: "right" }}>Stok</span>
              <span></span>
            </div>

            {data.content.length === 0 && (
              <div className="empty-state">
                <h3>Belum ada produk</h3>
                <p>Coba ubah kata kunci pencarian, atau tambah produk baru.</p>
              </div>
            )}

            {data.content.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`} className="ledger-row">
                <div>
                  <div className="ledger-name">{product.name}</div>
                  <div className="ledger-desc">{product.description}</div>
                </div>
                <div className="ledger-price">{formatRupiah(product.price)}</div>
                <div className={`ledger-stock ${product.stock <= 5 ? "stock-low" : ""}`}>
                  {product.stock}
                </div>
                <div />
              </Link>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← Sebelumnya
              </button>
              <span>
                Halaman {data.pageNumber + 1} / {data.totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={data.isLast}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

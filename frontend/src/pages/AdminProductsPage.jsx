import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  searchProducts,
  updateProduct,
} from "../api/productApi";

const emptyForm = { name: "", description: "", price: "", stock: "" };

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function loadProducts() {
    setLoading(true);
    searchProducts({ size: 50, sortBy: "createdAt", direction: "desc" })
      .then((res) => setProducts(res.content))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function showToast(message, isError = false) {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        showToast("Produk berhasil diperbarui");
      } else {
        await createProduct(payload);
        showToast("Produk berhasil ditambahkan");
      }
      cancelEdit();
      loadProducts();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Hapus produk "${product.name}"?`)) return;

    try {
      await deleteProduct(product.id);
      showToast("Produk berhasil dihapus");
      loadProducts();
    } catch (err) {
      showToast(err.message || "Gagal menghapus produk", true);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Kelola Produk</h1>
          <p className="page-subtitle">Tambah, ubah, atau hapus produk.</p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <h3 style={{ marginBottom: 16 }}>
          {editingId ? "Edit Produk" : "Tambah Produk Baru"}
        </h3>

        {formError && <div className="form-error-banner">{formError}</div>}

        <div className="form-field">
          <label htmlFor="name">Nama Produk</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            minLength={3}
          />
        </div>

        <div className="form-field">
          <label htmlFor="description">Deskripsi</label>
          <input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <div className="admin-form-grid">
          <div className="form-field">
            <label htmlFor="price">Harga (Rp)</label>
            <input
              id="price"
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="stock">Stok</label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Produk"}
          </button>
          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Batal
            </button>
          )}
        </div>
      </form>

      {loading && <p className="loading-text">Memuat produk...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="ledger">
          <div className="ledger-row header-row">
            <span className="eyebrow">Produk</span>
            <span className="eyebrow" style={{ textAlign: "right" }}>Harga</span>
            <span className="eyebrow" style={{ textAlign: "right" }}>Stok</span>
            <span></span>
          </div>

          {products.length === 0 && (
            <div className="empty-state">
              <h3>Belum ada produk</h3>
              <p>Tambahkan produk pertamamu lewat form di atas.</p>
            </div>
          )}

          {products.map((product) => (
            <div key={product.id} className="ledger-row">
              <div>
                <div className="ledger-name">{product.name}</div>
                <div className="ledger-desc">{product.description}</div>
              </div>
              <div className="ledger-price">{formatRupiah(product.price)}</div>
              <div className={`ledger-stock ${product.stock <= 5 ? "stock-low" : ""}`}>
                {product.stock}
              </div>
              <div className="ledger-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => startEdit(product)}>
                  Ubah
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product)}>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.isError ? "error" : ""}`}>{toast.message}</div>
      )}
    </div>
  );
}

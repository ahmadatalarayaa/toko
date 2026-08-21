import { apiFetch } from "./client";

export function searchProducts(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const qs = query.toString();
  return apiFetch(`/api/products${qs ? `?${qs}` : ""}`);
}

export function getProductById(id) {
  return apiFetch(`/api/products/${id}`);
}

export function createProduct(payload) {
  return apiFetch("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id, payload) {
  return apiFetch(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return apiFetch(`/api/products/${id}`, { method: "DELETE" });
}

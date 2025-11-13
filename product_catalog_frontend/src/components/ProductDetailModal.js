import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export default function ProductDetailModal({ product, onClose }) {
  /** Accessible modal dialog for product details */
  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Details for ${product.name}`}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close details">✕</button>
        <div className="modal-content">
          <div className="modal-media">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="modal-body">
            <h2 className="modal-title">{product.name}</h2>
            <div className="modal-sub">
              <span className="brand">{product.brand}</span>
              <span className="dot">•</span>
              <span className="category">{product.category}</span>
            </div>
            <p className="modal-desc">{product.description}</p>
            <div className="modal-attrs">
              {product.attributes &&
                Object.entries(product.attributes).map(([k, v]) => (
                  <div key={k} className="attr">
                    <span className="attr-k">{k}</span>
                    <span className="attr-v">{String(v)}</span>
                  </div>
                ))}
            </div>
            <div className="modal-footer">
              <div className="price">${product.price.toFixed(2)}</div>
              <div className="right">
                <span className={`stock ${product.stock > 0 ? "ok" : "no"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
                <button className="btn btn-primary" disabled={product.stock === 0}>
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

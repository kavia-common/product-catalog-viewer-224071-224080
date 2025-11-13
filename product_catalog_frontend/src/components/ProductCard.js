import React from "react";

// PUBLIC_INTERFACE
export default function ProductCard({ product, onOpen }) {
  /** Card item for product grid */
  return (
    <article className="card" role="button" tabIndex={0} onClick={() => onOpen(product)} onKeyDown={(e) => e.key === "Enter" && onOpen(product)} aria-label={`Open details for ${product.name}`}>
      <div className="card-media">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.stock === 0 && <span className="badge badge-error">Out of stock</span>}
      </div>
      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
        <div className="card-sub">
          <span className="brand">{product.brand}</span>
          <span className="dot">•</span>
          <span className="category">{product.category}</span>
        </div>
        <div className="card-footer">
          <div className="price">${product.price.toFixed(2)}</div>
          <div className="rating" aria-label={`Rating ${product.rating} of 5`}>
            ⭐ {product.rating}
          </div>
        </div>
      </div>
    </article>
  );
}

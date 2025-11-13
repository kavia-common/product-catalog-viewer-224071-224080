import React from "react";
import ProductCard from "./ProductCard";

// PUBLIC_INTERFACE
export default function ProductGrid({ items, onOpen }) {
  /** Responsive grid for products */
  if (!items?.length) {
    return (
      <div className="empty">
        <div className="empty-title">No products found</div>
        <div className="empty-sub">Try adjusting your filters or search terms.</div>
      </div>
    );
  }

  return (
    <div className="grid">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} />
      ))}
    </div>
  );
}

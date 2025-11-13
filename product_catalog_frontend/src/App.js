import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./styles.css";
import { applyCssVars } from "./theme";
import { fetchFacetOptions, fetchProducts } from "./api/client";
import SidebarFilters from "./components/SidebarFilters";
import ProductGrid from "./components/ProductGrid";
import ProductDetailModal from "./components/ProductDetailModal";
import { Pagination } from "./components/Controls";

/**
 * PUBLIC_INTERFACE
 * App - Product Catalog Viewer
 * - Ocean Professional layout
 * - Sidebar with search and filters
 * - Main area with product grid and pagination
 * - Product detail modal
 */
function App() {
  // Theme variables
  useEffect(() => {
    applyCssVars();
  }, []);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 1000 });
  const [priceValues, setPriceValues] = useState({ min: "", max: "" });

  // Data state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [items, setItems] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Modal
  const [active, setActive] = useState(null);

  // Facets
  useEffect(() => {
    let mounted = true;
    fetchFacetOptions()
      .then((facets) => {
        if (!mounted) return;
        setPriceBounds({ min: facets?.price?.min ?? 0, max: facets?.price?.max ?? 1000 });
      })
      .catch(() => {
        // ignore - bounds fall back is in state
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Build query params for API
  const query = useMemo(
    () => ({
      search: search.trim(),
      categories: selectedCategories,
      brands: selectedBrands,
      priceMin: priceValues.min === "" ? undefined : Number(priceValues.min),
      priceMax: priceValues.max === "" ? undefined : Number(priceValues.max),
      page,
      pageSize,
    }),
    [search, selectedCategories, selectedBrands, priceValues, page, pageSize]
  );

  // Fetch products on query change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError("");
    fetchProducts(query)
      .then((res) => {
        if (!mounted) return;
        setItems(res.results || []);
        setPage(res.page || 1);
        setPages(res.pages || 1);
        setTotal(res.total || 0);
      })
      .catch((err) => {
        if (!mounted) return;
        setLoadError(err?.message || "Failed to load products");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [query]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceValues({ min: "", max: "" });
    setPage(1);
  };

  return (
    <div className="ocn-app">
      <header className="ocn-header">
        <div className="brand">
          <div className="logo">🛍️</div>
          <div className="brand-text">
            <div className="title">Product Catalog</div>
            <div className="subtitle">Ocean Professional</div>
          </div>
        </div>
      </header>

      <main className="ocn-main">
        <SidebarFilters
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          categories={[...new Set(items.map((i) => i.category))]}
          selectedCategories={selectedCategories}
          onCategories={(v) => {
            setSelectedCategories(v);
            setPage(1);
          }}
          brands={[...new Set(items.map((i) => i.brand))]}
          selectedBrands={selectedBrands}
          onBrands={(v) => {
            setSelectedBrands(v);
            setPage(1);
          }}
          priceBounds={priceBounds}
          priceValues={priceValues}
          onPrice={({ min, max }) => {
            setPriceValues({ min, max });
            setPage(1);
          }}
          onClear={clearFilters}
        />

        <section className="ocn-content">
          <div className="content-bar">
            <div className="stats">
              {loading ? "Loading…" : `${total} results`}
            </div>
            <div className="actions">
              {/* Placeholder for view toggles/sort if needed */}
            </div>
          </div>

          {loadError && (
            <div className="alert alert-error" role="alert">
              <span>{loadError}</span>
            </div>
          )}

          {loading ? (
            <div className="skeleton-grid">
              {Array.from({ length: pageSize }).map((_, i) => (
                <div className="skeleton-card" key={i} />
              ))}
            </div>
          ) : (
            <ProductGrid items={items} onOpen={setActive} />
          )}

          <div className="content-footer">
            <Pagination page={page} pages={pages} onChange={setPage} />
          </div>
        </section>
      </main>

      <footer className="ocn-footer">
        <div>© {new Date().getFullYear()} Catalog Viewer</div>
      </footer>

      <ProductDetailModal product={active} onClose={() => setActive(null)} />
    </div>
  );
}

export default App;

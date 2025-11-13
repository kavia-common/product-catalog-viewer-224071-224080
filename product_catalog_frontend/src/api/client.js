//
// API Client to fetch products. Uses env REACT_APP_API_BASE.
// Falls back to mock data if feature flag REACT_APP_FEATURE_FLAGS includes "mock_api".
//

const DEFAULT_PAGE_SIZE = 12;

const env = {
  API_BASE: process.env.REACT_APP_API_BASE,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL,
  WS_URL: process.env.REACT_APP_WS_URL,
  NODE_ENV: process.env.REACT_APP_NODE_ENV,
  FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || "info",
};

const flags = new Set(
  env.FEATURE_FLAGS
    .split(",")
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean)
);

const useMock = flags.has("mock_api") || !env.API_BASE;

/** Minimal logger without leaking sensitive data */
const logger = {
  info: (...args) => {
    if (env.LOG_LEVEL === "info" || env.LOG_LEVEL === "debug") {
      // eslint-disable-next-line no-console
      console.log("[INFO]", ...args);
    }
  },
  warn: (...args) => {
    if (["info", "debug", "warn"].includes(env.LOG_LEVEL)) {
      // eslint-disable-next-line no-console
      console.warn("[WARN]", ...args);
    }
  },
  error: (...args) => {
    // eslint-disable-next-line no-console
    console.error("[ERROR]", ...args);
  },
};

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
  });
  return q.toString();
}

const mockCatalog = (() => {
  const cats = ["Electronics", "Home", "Outdoors", "Fashion", "Toys"];
  const brands = ["Acme", "Globex", "Umbrella", "Soylent", "Initech", "Hooli"];
  const items = Array.from({ length: 120 }).map((_, i) => {
    const category = cats[i % cats.length];
    const brand = brands[i % brands.length];
    const price = Number((Math.random() * 500 + 10).toFixed(2));
    const rating = Number((Math.random() * 5).toFixed(1));
    return {
      id: String(i + 1),
      name: `${brand} ${category} Item ${i + 1}`,
      brand,
      category,
      price,
      rating,
      image: `https://picsum.photos/seed/${i + 1}/400/300`,
      description:
        "High-quality product with modern design and excellent performance characteristics.",
      stock: Math.floor(Math.random() * 100),
      attributes: {
        color: ["Black", "Silver", "Blue", "Amber"][i % 4],
        weight: `${(Math.random() * 3 + 0.2).toFixed(1)} kg`,
        warranty: `${(i % 3) + 1} years`,
      },
    };
  });

  return {
    items,
    categories: cats,
    brands,
  };
})();

function filterAndPaginate({
  search,
  categories,
  brands,
  priceMin,
  priceMax,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  let filtered = mockCatalog.items;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s)
    );
  }
  if (categories?.length) {
    const set = new Set(categories);
    filtered = filtered.filter((p) => set.has(p.category));
  }
  if (brands?.length) {
    const set = new Set(brands);
    filtered = filtered.filter((p) => set.has(p.brand));
  }
  if (priceMin !== undefined) {
    filtered = filtered.filter((p) => p.price >= Number(priceMin));
  }
  if (priceMax !== undefined) {
    filtered = filtered.filter((p) => p.price <= Number(priceMax));
  }

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize);

  return { results, page, pageSize, total, pages };
}

// PUBLIC_INTERFACE
export async function fetchProducts(params = {}) {
  /**
   * Fetch products list with filters and pagination.
   * Params:
   * - search: string
   * - categories: string[] (repeatable or comma-separated)
   * - brands: string[]
   * - priceMin: number
   * - priceMax: number
   * - page: number
   * - pageSize: number
   * Returns: { results: Product[], page, pageSize, total, pages }
   */
  if (useMock) {
    logger.info("Using mock API for fetchProducts");
    return new Promise((resolve) =>
      setTimeout(() => resolve(filterAndPaginate(params)), 300)
    );
  }

  const qs = buildQuery({
    search: params.search,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    page: params.page || 1,
    pageSize: params.pageSize || DEFAULT_PAGE_SIZE,
    ...(params.categories?.length && { categories: params.categories.join(",") }),
    ...(params.brands?.length && { brands: params.brands.join(",") }),
  });
  const url = `${env.API_BASE.replace(/\/+$/, "")}/products?${qs}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    logger.error("fetchProducts failed - falling back to mock", err?.message);
    return filterAndPaginate(params);
  }
}

// PUBLIC_INTERFACE
export async function fetchFacetOptions() {
  /** Get categories and brands for filters */
  if (useMock) {
    return {
      categories: mockCatalog.categories,
      brands: mockCatalog.brands,
      price: { min: 0, max: 1000 },
    };
  }
  const url = `${env.API_BASE.replace(/\/+$/, "")}/facets`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      categories: mockCatalog.categories,
      brands: mockCatalog.brands,
      price: { min: 0, max: 1000 },
    };
  }
}

// PUBLIC_INTERFACE
export async function fetchProductById(id) {
  /** Fetch single product detail by id */
  if (useMock) {
    const item = mockCatalog.items.find((p) => p.id === String(id));
    if (!item) throw new Error("Not found");
    return item;
  }
  const url = `${env.API_BASE.replace(/\/+$/, "")}/products/${encodeURIComponent(
    id
  )}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

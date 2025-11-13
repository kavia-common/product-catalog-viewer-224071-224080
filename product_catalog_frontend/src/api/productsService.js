//
// Products data service with multi-source strategy:
// 1) Supabase (if configured)
// 2) Existing REST API (REACT_APP_API_BASE)
// 3) Built-in mock (feature flag "mock_api" or as graceful fallback)
//
import { getSupabaseClient, getSupabaseConfig } from "./supabaseClient";
import { fetchProducts as httpFetchProducts, fetchProductById as httpFetchProductById, fetchFacetOptions as httpFetchFacetOptions } from "./client";

const DEFAULT_PAGE_SIZE = 12;

// Simple non-sensitive logger
const LOG_LEVEL = process.env.REACT_APP_LOG_LEVEL || "info";
const logger = {
  info: (...a) => {
    if (LOG_LEVEL === "info" || LOG_LEVEL === "debug") console.log("[INFO]", ...a);
  },
  warn: (...a) => {
    if (["info", "debug", "warn"].includes(LOG_LEVEL)) console.warn("[WARN]", ...a);
  },
  error: (...a) => console.error("[ERROR]", ...a),
};

// PUBLIC_INTERFACE
export async function listProducts(params = {}) {
  /**
   * List products with filters and pagination from Supabase if available.
   *
   * Params:
   * - search: string
   * - categories: string[]
   * - brands: string[]
   * - priceMin: number
   * - priceMax: number
   * - page: number
   * - pageSize: number
   *
   * Returns: { results, page, pageSize, total, pages }
   */
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase();
  const forceMock = flags.split(",").map((s) => s.trim()).includes("mock_api");
  const sb = getSupabaseClient();

  // If mock flag is on or Supabase not configured, defer to existing HTTP client which already has mock fallback.
  if (forceMock || !sb) {
    logger.info("listProducts: using HTTP client (mock or backend) due to flag/config");
    return httpFetchProducts(params);
  }

  try {
    const page = Number(params.page || 1);
    const pageSize = Number(params.pageSize || DEFAULT_PAGE_SIZE);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build Supabase query
    let query = sb.from("products").select("*", { count: "exact" });

    // Full-text-like search over name/brand/category
    if (params.search) {
      const s = `%${params.search}%`;
      query = query.or(`name.ilike.${s},brand.ilike.${s},category.ilike.${s}`);
    }
    if (params.categories?.length) {
      query = query.in("category", params.categories);
    }
    if (params.brands?.length) {
      query = query.in("brand", params.brands);
    }
    if (params.priceMin !== undefined) {
      query = query.gte("price", Number(params.priceMin));
    }
    if (params.priceMax !== undefined) {
      query = query.lte("price", Number(params.priceMax));
    }

    query = query.order("name", { ascending: true }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = typeof count === "number" ? count : (data?.length || 0);
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const results = (data || []).map(normalizeProductRow);

    return { results, page, pageSize, total, pages };
  } catch (err) {
    logger.error("listProducts Supabase failed - falling back to HTTP", err?.message);
    // Fallback to existing HTTP client (which itself falls back to mock)
    return httpFetchProducts(params);
  }
}

// PUBLIC_INTERFACE
export async function getProductById(id) {
  /**
   * Retrieve a single product by id from Supabase if available.
   * Returns a normalized product object.
   */
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase();
  const forceMock = flags.split(",").map((s) => s.trim()).includes("mock_api");
  const sb = getSupabaseClient();

  if (forceMock || !sb) {
    return httpFetchProductById(id);
  }

  try {
    const { data, error } = await sb.from("products").select("*").eq("id", id).single();
    if (error) throw error;
    return normalizeProductRow(data);
  } catch (err) {
    logger.error("getProductById Supabase failed - falling back to HTTP", err?.message);
    return httpFetchProductById(id);
  }
}

// PUBLIC_INTERFACE
export async function getFacetOptions() {
  /**
   * Fetch distinct categories/brands and price bounds from Supabase if available.
   * Returns: { categories: string[], brands: string[], price: {min, max} }
   */
  const flags = (process.env.REACT_APP_FEATURE_FLAGS || "").toLowerCase();
  const forceMock = flags.split(",").map((s) => s.trim()).includes("mock_api");
  const sb = getSupabaseClient();

  if (forceMock || !sb) {
    return httpFetchFacetOptions();
  }

  try {
    const [{ data: catData, error: catErr }] = await Promise.all([
      sb.from("products").select("category").not("category", "is", null),
    ]);
    if (catErr) throw catErr;

    const categories = Array.from(new Set((catData || []).map((r) => r.category))).filter(Boolean);

    const { data: brandData, error: brandErr } = await sb
      .from("products")
      .select("brand")
      .not("brand", "is", null);
    if (brandErr) throw brandErr;
    const brands = Array.from(new Set((brandData || []).map((r) => r.brand))).filter(Boolean);

    const { data: minData, error: minErr } = await sb.rpc("min_price");
    if (minErr) throw minErr;
    const { data: maxData, error: maxErr } = await sb.rpc("max_price");
    if (maxErr) throw maxErr;

    const price = {
      min: typeof minData === "number" ? minData : 0,
      max: typeof maxData === "number" ? maxData : 1000,
    };

    return { categories, brands, price };
  } catch (err) {
    logger.warn("getFacetOptions Supabase failed - falling back to HTTP", err?.message);
    return httpFetchFacetOptions();
  }
}

// Normalize/shape DB rows to UI's expected structure
function normalizeProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: Number(row.price ?? 0),
    rating: Number(row.rating ?? 0),
    image: row.image || row.image_url || `https://picsum.photos/seed/${row.id}/400/300`,
    description: row.description || "",
    stock: Number(row.stock ?? 0),
    attributes: row.attributes || {},
  };
}

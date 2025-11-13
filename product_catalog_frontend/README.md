# Product Catalog Viewer (React)

A modern React frontend to browse and search a product catalog, styled with the Ocean Professional theme.

## Features
- Sidebar filters: search, categories, brands, price range
- Product grid with pagination
- Product detail modal with attributes and stock status
- Supabase integration for live data (preferred)
- Backward-compatible REST API client (REACT_APP_API_BASE)
- Graceful fallback to mock data via feature flag (REACT_APP_FEATURE_FLAGS=mock_api)
- Zero hardcoded secrets

## Quick Start
1. Copy environment example:
   cp .env.example .env
2. Configure one of the data sources:
   - Supabase (recommended):
     - Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
     - Ensure your Supabase project has a "products" table with columns:
       id (text/uuid/int), name (text), brand (text), category (text), price (numeric),
       rating (numeric), image (text), description (text), stock (int), attributes (jsonb)
     - Optional RPCs for price range (recommended): create SQL functions min_price() and max_price() that return numeric
   - REST API:
     - Set REACT_APP_API_BASE (e.g., http://localhost:8080/api) to use an HTTP backend
   - Mock data:
     - Set REACT_APP_FEATURE_FLAGS=mock_api to force built-in mock
3. Install and start:
   npm install
   npm start

Open http://localhost:3000

## Environment Variables
- REACT_APP_SUPABASE_URL: Supabase project URL
- REACT_APP_SUPABASE_ANON_KEY: Supabase anon key (public)
- REACT_APP_API_BASE: Base URL for backend API (fallback path)
- REACT_APP_FEATURE_FLAGS: Comma-separated flags. Include "mock_api" to force mock data.
- REACT_APP_LOG_LEVEL: debug | info | warn (default: info)
- Other optional vars supported by the template: REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_EXPERIMENTS_ENABLED

## Data Source Resolution
The app chooses a data source in this order:
1) Supabase (if REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set)
2) REST API (REACT_APP_API_BASE) via existing HTTP client
3) Mock data (automatically if mock flag or as final fallback)

## API Contracts (REST path)
- GET /products?search=&categories=&brands=&priceMin=&priceMax=&page=&pageSize=
  Returns: { results: Product[], page, pageSize, total, pages }
- GET /facets
  Returns: { categories: string[], brands: string[], price: { min: number, max: number } }
If unavailable, the app automatically uses Supabase (if configured) or mock data (or set REACT_APP_FEATURE_FLAGS=mock_api).

## Scripts
- npm start – dev server
- npm test – unit tests
- npm run build – production build

## Security
- No secrets are hardcoded. Ensure required variables are supplied via environment.
- Avoid logging sensitive data. Logging is minimal and level-controlled.

## Supabase Notes
- The Supabase anon key is safe for client-side use but still treat it as a secret to rotate if needed.
- You may need to enable Row Level Security (RLS) policies to allow read access to products for anon role.
- Example SQL for price range RPCs:
  create or replace function public.min_price() returns numeric language sql as $$ select min(price) from products $$;
  create or replace function public.max_price() returns numeric language sql as $$ select max(price) from products $$;

# Product Catalog Viewer (React)

A modern React frontend to browse and search a product catalog, styled with the Ocean Professional theme.

## Features
- Sidebar filters: search, categories, brands, price range
- Product grid with pagination
- Product detail modal with attributes and stock status
- API client using environment variables (REACT_APP_API_BASE)
- Graceful fallback to mock data via feature flag (REACT_APP_FEATURE_FLAGS=mock_api)
- Zero hardcoded secrets

## Quick Start
1. Copy environment example:
   cp .env.example .env
2. Adjust REACT_APP_API_BASE in .env to your backend base URL.
3. Install and start:
   npm install
   npm start

Open http://localhost:3000

## Environment Variables
- REACT_APP_API_BASE: Base URL for backend API (e.g., http://localhost:8080/api)
- REACT_APP_FEATURE_FLAGS: Comma-separated flags. Include "mock_api" to use built-in mock data when backend is unavailable.
- Other optional vars supported by the template: REACT_APP_BACKEND_URL, REACT_APP_FRONTEND_URL, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_ENABLE_SOURCE_MAPS, REACT_APP_PORT, REACT_APP_TRUST_PROXY, REACT_APP_LOG_LEVEL, REACT_APP_HEALTHCHECK_PATH, REACT_APP_EXPERIMENTS_ENABLED

## API Contracts
- GET /products?search=&categories=&brands=&priceMin=&priceMax=&page=&pageSize=
  Returns: { results: Product[], page, pageSize, total, pages }
- GET /facets
  Returns: { categories: string[], brands: string[], price: { min: number, max: number } }
If unavailable, the app automatically uses mock data (or set REACT_APP_FEATURE_FLAGS=mock_api).

## Scripts
- npm start – dev server
- npm test – unit tests
- npm run build – production build

## Security
- No secrets are hardcoded. Ensure required variables are supplied via environment.
- Avoid logging sensitive data. Logging is minimal and level-controlled.

